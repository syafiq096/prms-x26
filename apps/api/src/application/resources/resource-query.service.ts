import { Injectable } from '@nestjs/common';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { ResourceEntity } from '../../database/entities';
import { MembershipLevel } from '../../domain/access-policy';
import { DomainError } from '../../domain/normalization';
import {
  Connection,
  escapeLike,
  Page,
  paginateByCode,
  normalizeQueryText,
  requireNonEmptyArray,
} from '../shared/query-pagination';

export type ResourceFilter = {
  text?: string | null;
  statuses?: string[] | null;
  categories?: string[] | null;
  minimumMembershipLevels?: MembershipLevel[] | null;
};

@Injectable()
export class ResourceQueryService {
  constructor(private readonly dataSource: DataSource) {}

  async byId(id: string): Promise<ResourceEntity> {
    const resource = await this.dataSource
      .getRepository(ResourceEntity)
      .findOneBy({ id });
    if (!resource) throw new DomainError('NOT_FOUND', 'Resource was not found');
    return resource;
  }

  async byCode(code: string): Promise<ResourceEntity> {
    const resource = await this.dataSource
      .getRepository(ResourceEntity)
      .createQueryBuilder('resource')
      .where('UPPER(resource.code) = UPPER(:code)', { code })
      .getOne();
    if (!resource) throw new DomainError('NOT_FOUND', 'Resource was not found');
    return resource;
  }

  async list(
    page: Page,
    filter: ResourceFilter = {},
  ): Promise<Connection<ResourceEntity>> {
    const normalized = normalizeResourceFilter(filter);
    const query = this.dataSource
      .getRepository(ResourceEntity)
      .createQueryBuilder('resource');
    applyResourceFilter(query, normalized);
    return paginateByCode(query, 'resource.code', page, normalized);
  }
}

export function applyResourceFilter(
  query: SelectQueryBuilder<ResourceEntity>,
  filter: ResourceFilter,
): void {
  if (filter.text)
    query.andWhere(
      "(resource.code ILIKE :text ESCAPE '\\' OR resource.display_name ILIKE :text ESCAPE '\\')",
      { text: `%${escapeLike(filter.text)}%` },
    );
  if (filter.statuses)
    query.andWhere('resource.status IN (:...statuses)', {
      statuses: filter.statuses,
    });
  if (filter.categories)
    query.andWhere('resource.category IN (:...categories)', {
      categories: filter.categories,
    });
  if (filter.minimumMembershipLevels)
    query.andWhere(
      'resource.minimum_membership_level IN (:...minimumMembershipLevels)',
      { minimumMembershipLevels: filter.minimumMembershipLevels },
    );
}

export function normalizeResourceFilter(filter: ResourceFilter): ResourceFilter {
  return {
    text: normalizeQueryText(filter.text),
    statuses:
      requireNonEmptyArray(filter.statuses, 'statuses') ?? [
        'ACTIVE',
        'OUT_OF_SERVICE',
      ],
    categories: requireNonEmptyArray(filter.categories, 'categories'),
    minimumMembershipLevels: requireNonEmptyArray(
      filter.minimumMembershipLevels,
      'minimumMembershipLevels',
    ),
  };
}
