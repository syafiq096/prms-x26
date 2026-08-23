import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ResourceEntity } from '../../database/entities';
import { MembershipLevel, membershipRank } from '../../domain/access-policy';
import { DomainError } from '../../domain/normalization';
import { PassengerQueryService } from '../passengers/passenger-query.service';
import { Connection, Page, paginateByCode, requireNonEmptyArray, normalizeQueryText } from '../shared/query-pagination';
import { applyResourceFilter, ResourceFilter } from './resource-query.service';

export type ResourceDiscoveryFilter = Pick<
  ResourceFilter,
  'text' | 'statuses' | 'categories'
>;

@Injectable()
export class ResourceDiscoveryService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly passengers: PassengerQueryService,
  ) {}

  async discover(
    passengerId: string,
    page: Page,
    filter: ResourceDiscoveryFilter = {},
  ): Promise<Connection<ResourceEntity>> {
    const passenger = await this.passengers.byId(passengerId);
    if (!passenger.active)
      throw new DomainError('FORBIDDEN', 'An active Passenger is required');

    const normalized = normalizeDiscoveryFilter(filter);
    const query = this.dataSource
      .getRepository(ResourceEntity)
      .createQueryBuilder('resource');
    applyResourceFilter(query, normalized);
    query.andWhere('resource.minimum_membership_level IN (:...levels)', {
      levels: Object.values(MembershipLevel).filter(
        (level) =>
          membershipRank(level) <= membershipRank(passenger.membershipLevel),
      ),
    });
    return paginateByCode(query, 'resource.code', page, normalized);
  }
}

function normalizeDiscoveryFilter(
  filter: ResourceDiscoveryFilter,
): ResourceFilter {
  const statuses =
    requireNonEmptyArray(filter.statuses, 'statuses') ?? [
      'ACTIVE',
      'OUT_OF_SERVICE',
    ];
  if (statuses.some((status) => status === 'DECOMMISSIONED'))
    throw new DomainError(
      'VALIDATION_ERROR',
      'Discovery cannot include decommissioned Resources',
    );
  return {
    text: normalizeQueryText(filter.text),
    statuses,
    categories: requireNonEmptyArray(filter.categories, 'categories'),
  };
}
