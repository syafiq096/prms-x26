import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { EnvironmentVariables } from '../../config/environment';
import {
  ApplicationSettingEntity,
  ApplicationSettingKey,
  AuditActorType,
  CrewLeadEntity,
  SystemState,
} from '../../database/entities';
import {
  DomainError,
  normalizeCode,
  normalizeEmail,
  normalizeWhitespace,
} from '../../domain/normalization';
import { AuditWriterService } from '../audit/audit-writer.service';
import { CrewLeadProfile } from '../shared/actors';

@Injectable()
export class SystemSetupService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly config: ConfigService<EnvironmentVariables, true>,
    private readonly audits: AuditWriterService,
  ) {}

  async initialize(
    setupSecret: string,
    profiles: readonly CrewLeadProfile[],
  ): Promise<void> {
    if (setupSecret !== this.config.get('PRMS_SETUP_SECRET', { infer: true }))
      throw new DomainError('SETUP_SECRET_INVALID', 'Setup secret is invalid');
    if (profiles.length !== 3)
      throw new DomainError(
        'VALIDATION_ERROR',
        'Exactly three Crew Lead profiles are required',
      );
    const normalized = profiles.map((profile) => ({
      id: profile.id,
      missionCode: normalizeCode(profile.missionCode, 'missionCode'),
      fullName: normalizeWhitespace(profile.fullName, 'fullName', 120),
      email: normalizeEmail(profile.email),
    }));
    if (
      new Set(normalized.map((profile) => profile.missionCode)).size !== 3 ||
      new Set(normalized.map((profile) => profile.email).filter(Boolean))
        .size !== normalized.filter((profile) => profile.email).length
    )
      throw new DomainError(
        'CONFLICT',
        'Crew Lead identities must be distinct',
      );
    await this.dataSource.transaction(async (manager) => {
      const settings = manager.getRepository(ApplicationSettingEntity);
      const state = await settings
        .createQueryBuilder('setting')
        .setLock('pessimistic_write')
        .where('setting.key = :key', {
          key: ApplicationSettingKey.SYSTEM_STATE,
        })
        .getOneOrFail();
      if (state.textValue !== SystemState.UNINITIALIZED)
        throw new DomainError(
          'SETUP_ALREADY_COMPLETED',
          'Setup has already completed',
        );
      const crew = manager.getRepository(CrewLeadEntity);
      const created = await crew.save(
        normalized.map((profile) => crew.create(profile)),
      );
      state.textValue = SystemState.OPERATIONAL;
      await settings.save(state);
      await this.audits.write(manager, {
        actorType: AuditActorType.SYSTEM,
        eventType: 'SYSTEM_INITIALIZED',
        result: 'SUCCESS',
        applicationSettingSubjectKey: ApplicationSettingKey.SYSTEM_STATE,
        metadata: { crewLeadIds: created.map((lead) => lead.id) },
      });
    });
  }
}
