import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
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
import { CrewLeadActor, CrewLeadProfile } from '../shared/actors';
import { requireActiveCrewLead } from '../shared/active-crew-lead';

@Injectable()
export class CrewLeadsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly audits: AuditWriterService,
  ) {}

  async updateOwnProfile(
    actor: CrewLeadActor,
    input: Pick<CrewLeadProfile, 'fullName' | 'email'>,
    expectedVersion: number,
  ): Promise<CrewLeadEntity> {
    return this.dataSource.transaction(async (manager) => {
      const crewLead = await manager
        .getRepository(CrewLeadEntity)
        .createQueryBuilder('crewLead')
        .setLock('pessimistic_write')
        .where('crewLead.id = :id AND crewLead.active = true', { id: actor.id })
        .getOne();
      if (!crewLead)
        throw new DomainError('UNAUTHORIZED', 'An active Crew Lead is required');
      assertVersion(crewLead.version, expectedVersion);
      const before = { fullName: crewLead.fullName, email: crewLead.email };
      const fullName = normalizeWhitespace(input.fullName, 'fullName', 120);
      const email = normalizeEmail(input.email);
      if (fullName === crewLead.fullName && email === crewLead.email)
        throw new DomainError('NO_CHANGES', 'Profile update has no changes');
      crewLead.fullName = fullName;
      crewLead.email = email;
      const saved = await manager.getRepository(CrewLeadEntity).save(crewLead);
      await this.audits.write(manager, {
        actorType: AuditActorType.CREW_LEAD,
        crewLeadActorId: actor.id,
        eventType: 'CREW_LEAD_PROFILE_UPDATED',
        result: 'SUCCESS',
        crewLeadSubjectId: saved.id,
        metadata: {
          before,
          after: { fullName: saved.fullName, email: saved.email },
        },
      });
      return saved;
    });
  }

  async replace(
    actor: CrewLeadActor,
    outgoingId: string,
    replacement: CrewLeadProfile,
    reason: string,
    expectedVersion: number,
  ): Promise<CrewLeadEntity> {
    if (actor.id === outgoingId)
      throw new DomainError(
        'SELF_REPLACEMENT_FORBIDDEN',
        'Crew Leads cannot replace themselves',
      );
    const normalizedReason = normalizeWhitespace(reason, 'reason', 500);
    return this.dataSource.transaction(async (manager) => {
      const setting = await manager
        .getRepository(ApplicationSettingEntity)
        .createQueryBuilder('setting')
        .setLock('pessimistic_write')
        .where('setting.key = :key', {
          key: ApplicationSettingKey.SYSTEM_STATE,
        })
        .getOneOrFail();
      if (setting.textValue !== SystemState.OPERATIONAL)
        throw new DomainError(
          'SYSTEM_NOT_OPERATIONAL',
          'System setup is not complete',
        );
      await requireActiveCrewLead(manager, actor.id);
      const crew = manager.getRepository(CrewLeadEntity);
      const outgoing = await crew
        .createQueryBuilder('crew')
        .setLock('pessimistic_write')
        .where('crew.id = :id AND crew.active = true', { id: outgoingId })
        .getOne();
      if (!outgoing)
        throw new DomainError('NOT_FOUND', 'Active Crew Lead was not found');
      assertVersion(outgoing.version, expectedVersion);
      const incoming = await crew.save(
        crew.create({
          missionCode: normalizeCode(replacement.missionCode, 'missionCode'),
          fullName: normalizeWhitespace(replacement.fullName, 'fullName', 120),
          email: normalizeEmail(replacement.email),
          replacesCrewLeadId: outgoing.id,
        }),
      );
      outgoing.active = false;
      outgoing.deactivatedAt = new Date();
      outgoing.deactivationReason = normalizedReason;
      await crew.save(outgoing);
      if ((await crew.count({ where: { active: true } })) !== 3)
        throw new DomainError(
          'CREW_LEAD_COUNT_INVALID',
          'Operational PRMS requires exactly three active Crew Leads',
        );
      await this.audits.write(manager, {
        actorType: AuditActorType.CREW_LEAD,
        crewLeadActorId: actor.id,
        eventType: 'CREW_LEAD_REPLACED',
        result: 'SUCCESS',
        crewLeadSubjectId: outgoing.id,
        metadata: {
          replacementCrewLeadId: incoming.id,
          reason: normalizedReason,
        },
      });
      return incoming;
    });
  }
}

function assertVersion(currentVersion: number, expectedVersion: number): void {
  if (currentVersion !== expectedVersion)
    throw new DomainError(
      'VERSION_CONFLICT',
      `Version conflict: expected ${expectedVersion}, current ${currentVersion}`,
      { expectedVersion, currentVersion },
    );
}
