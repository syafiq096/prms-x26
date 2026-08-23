import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  AuditActorType,
  ResourceCategory,
  ResourceEntity,
} from '../../database/entities';
import { MembershipLevel } from '../../domain/access-policy';
import {
  DomainError,
  normalizeCode,
  normalizeWhitespace,
} from '../../domain/normalization';
import { AuditWriterService } from '../audit/audit-writer.service';
import { CrewLeadActor } from '../shared/actors';
import { requireActiveCrewLead } from '../shared/active-crew-lead';

export type ResourceInput = {
  id?: string;
  code: string;
  displayName: string;
  category: ResourceCategory;
  minimumMembershipLevel?: MembershipLevel;
};
export type ResourceUpdate = {
  displayName?: string;
  minimumMembershipLevel?: MembershipLevel;
};

@Injectable()
export class ResourcesService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly audits: AuditWriterService,
  ) {}

  async create(
    actor: CrewLeadActor,
    input: ResourceInput,
  ): Promise<ResourceEntity> {
    return this.dataSource.transaction(async (manager) => {
      await requireActiveCrewLead(manager, actor.id);
      const resources = manager.getRepository(ResourceEntity);
      const resource = await resources.save(
        resources.create({
          id: input.id,
          code: normalizeCode(input.code, 'code'),
          displayName: normalizeWhitespace(
            input.displayName,
            'displayName',
            120,
          ),
          category: input.category,
          minimumMembershipLevel:
            input.minimumMembershipLevel ?? MembershipLevel.SILVER,
        }),
      );
      await this.audits.write(manager, {
        actorType: AuditActorType.CREW_LEAD,
        crewLeadActorId: actor.id,
        eventType: 'RESOURCE_CREATED',
        result: 'SUCCESS',
        resourceSubjectId: resource.id,
      });
      return resource;
    });
  }

  async update(
    actor: CrewLeadActor,
    resourceId: string,
    input: ResourceUpdate,
  ): Promise<ResourceEntity> {
    return this.dataSource.transaction(async (manager) => {
      await requireActiveCrewLead(manager, actor.id);
      const resources = manager.getRepository(ResourceEntity);
      const resource = await resources.findOne({ where: { id: resourceId } });
      if (!resource)
        throw new DomainError('NOT_FOUND', 'Resource was not found');
      if (resource.status === 'DECOMMISSIONED')
        throw new DomainError(
          'RESOURCE_DECOMMISSIONED',
          'Decommissioned Resources are read-only',
        );
      const before = {
        displayName: resource.displayName,
        minimumMembershipLevel: resource.minimumMembershipLevel,
      };
      if (input.displayName !== undefined)
        resource.displayName = normalizeWhitespace(
          input.displayName,
          'displayName',
          120,
        );
      if (input.minimumMembershipLevel !== undefined)
        resource.minimumMembershipLevel = input.minimumMembershipLevel;
      const saved = await resources.save(resource);
      await this.audits.write(manager, {
        actorType: AuditActorType.CREW_LEAD,
        crewLeadActorId: actor.id,
        eventType: 'RESOURCE_UPDATED',
        result: 'SUCCESS',
        resourceSubjectId: saved.id,
        metadata: {
          before,
          after: {
            displayName: saved.displayName,
            minimumMembershipLevel: saved.minimumMembershipLevel,
          },
        },
      });
      return saved;
    });
  }

  async transition(
    actor: CrewLeadActor,
    resourceId: string,
    status: ResourceEntity['status'],
    reason: string,
  ): Promise<ResourceEntity> {
    const normalizedReason = normalizeWhitespace(reason, 'reason', 500);
    return this.dataSource.transaction(async (manager) => {
      await requireActiveCrewLead(manager, actor.id);
      const resources = manager.getRepository(ResourceEntity);
      const resource = await resources
        .createQueryBuilder('resource')
        .setLock('pessimistic_write')
        .where('resource.id = :id', { id: resourceId })
        .getOne();
      if (!resource)
        throw new DomainError('NOT_FOUND', 'Resource was not found');
      const valid =
        (resource.status === 'ACTIVE' && status === 'OUT_OF_SERVICE') ||
        (resource.status === 'OUT_OF_SERVICE' &&
          (status === 'ACTIVE' || status === 'DECOMMISSIONED'));
      if (!valid)
        throw new DomainError(
          'INVALID_RESOURCE_TRANSITION',
          'Resource status transition is not allowed',
        );
      resource.status = status;
      resource.statusChangeReason = normalizedReason;
      resource.decommissionedAt =
        status === 'DECOMMISSIONED' ? new Date() : null;
      await resources.save(resource);
      await this.audits.write(manager, {
        actorType: AuditActorType.CREW_LEAD,
        crewLeadActorId: actor.id,
        eventType: 'RESOURCE_STATUS_CHANGED',
        result: 'SUCCESS',
        resourceSubjectId: resource.id,
        metadata: { status, reason: normalizedReason },
      });
      return resource;
    });
  }
}
