import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  AuditActorType,
  PassengerEntity,
  ResourceEntity,
  ResourceUsageEntity,
} from '../../database/entities';
import { decideResourceAccess } from '../../domain/access-policy';
import { DomainError } from '../../domain/normalization';
import { AuditWriterService } from '../audit/audit-writer.service';
import { PassengerActor } from '../shared/actors';

export type ResourceUsageResult =
  | { allowed: true; usage: ResourceUsageEntity }
  | { allowed: false; reason: string };

@Injectable()
export class ResourceUsageService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly audits: AuditWriterService,
  ) {}

  async record(
    actor: PassengerActor,
    resourceId: string,
    idempotencyKey: string,
  ): Promise<ResourceUsageResult> {
    return this.dataSource.transaction(async (manager) => {
      const usages = manager.getRepository(ResourceUsageEntity);
      const existing = await usages.findOne({ where: { idempotencyKey } });
      if (existing) return this.existingResult(existing, actor.id, resourceId);
      const passenger = await manager
        .getRepository(PassengerEntity)
        .createQueryBuilder('passenger')
        .setLock('pessimistic_write')
        .where('passenger.id = :id', { id: actor.id })
        .getOne();
      const resource = await manager
        .getRepository(ResourceEntity)
        .createQueryBuilder('resource')
        .setLock('pessimistic_write')
        .where('resource.id = :id', { id: resourceId })
        .getOne();
      if (!passenger || !resource)
        throw new DomainError(
          'NOT_FOUND',
          'Passenger or Resource was not found',
        );
      const completedWhileWaiting = await usages.findOne({
        where: { idempotencyKey },
      });
      if (completedWhileWaiting)
        return this.existingResult(completedWhileWaiting, actor.id, resourceId);
      const decision = decideResourceAccess({
        passengerActive: passenger.active,
        passengerLevel: passenger.membershipLevel,
        resourceStatus: resource.status,
        resourceMinimumLevel: resource.minimumMembershipLevel,
      });
      if (!decision.allowed) {
        await this.audits.write(manager, {
          actorType: AuditActorType.PASSENGER,
          passengerActorId: passenger.id,
          eventType: 'RESOURCE_ACCESS_DENIED',
          result: 'DENIED',
          reasonCode: decision.reason,
          passengerSubjectId: passenger.id,
          contextualResourceId: resource.id,
          passengerMissionCodeSnapshot: passenger.missionCode,
          passengerMembershipLevelSnapshot: passenger.membershipLevel,
          resourceCodeSnapshot: resource.code,
          resourceDisplayNameSnapshot: resource.displayName,
          resourceCategorySnapshot: resource.category,
          resourceMinimumMembershipLevelSnapshot:
            resource.minimumMembershipLevel,
          resourceStatusSnapshot: resource.status,
        });
        return { allowed: false, reason: decision.reason };
      }
      const usage = await usages.save(
        usages.create({
          idempotencyKey,
          passengerId: passenger.id,
          resourceId: resource.id,
          passengerMissionCode: passenger.missionCode,
          passengerMembershipLevel: passenger.membershipLevel,
          resourceCode: resource.code,
          resourceDisplayName: resource.displayName,
          resourceCategory: resource.category,
          resourceMinimumMembershipLevel: resource.minimumMembershipLevel,
          resourceStatus: resource.status,
        }),
      );
      await this.audits.write(manager, {
        actorType: AuditActorType.PASSENGER,
        passengerActorId: passenger.id,
        eventType: 'RESOURCE_USED',
        result: 'ALLOWED',
        resourceUsageSubjectId: usage.id,
        resourceUsageId: usage.id,
      });
      return { allowed: true, usage };
    });
  }

  private existingResult(
    usage: ResourceUsageEntity,
    passengerId: string,
    resourceId: string,
  ): ResourceUsageResult {
    if (usage.passengerId !== passengerId || usage.resourceId !== resourceId)
      throw new DomainError(
        'IDEMPOTENCY_CONFLICT',
        'Idempotency key belongs to another operation',
      );
    return { allowed: true, usage };
  }
}
