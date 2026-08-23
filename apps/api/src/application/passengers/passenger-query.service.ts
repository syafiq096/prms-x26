import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PassengerEntity } from '../../database/entities';
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

export type PassengerFilter = {
  text?: string | null;
  active?: boolean | null;
  membershipLevels?: MembershipLevel[] | null;
};

@Injectable()
export class PassengerQueryService {
  constructor(private readonly dataSource: DataSource) {}

  async byId(id: string): Promise<PassengerEntity> {
    const passenger = await this.dataSource
      .getRepository(PassengerEntity)
      .findOneBy({ id });
    if (!passenger) throw new DomainError('NOT_FOUND', 'Passenger was not found');
    return passenger;
  }

  async byMissionCode(missionCode: string): Promise<PassengerEntity> {
    const passenger = await this.dataSource
      .getRepository(PassengerEntity)
      .createQueryBuilder('passenger')
      .where('UPPER(passenger.mission_code) = UPPER(:missionCode)', {
        missionCode,
      })
      .getOne();
    if (!passenger) throw new DomainError('NOT_FOUND', 'Passenger was not found');
    return passenger;
  }

  async list(
    page: Page,
    filter: PassengerFilter = {},
  ): Promise<Connection<PassengerEntity>> {
    const normalized = normalizePassengerFilter(filter);
    const query = this.dataSource
      .getRepository(PassengerEntity)
      .createQueryBuilder('passenger');
    if (normalized.text)
      query.andWhere(
        "(passenger.mission_code ILIKE :text ESCAPE '\\' OR passenger.full_name ILIKE :text ESCAPE '\\' OR passenger.email ILIKE :text ESCAPE '\\' OR passenger.cabin_code ILIKE :text ESCAPE '\\')",
        { text: `%${escapeLike(normalized.text)}%` },
      );
    if (normalized.active !== null)
      query.andWhere('passenger.active = :active', {
        active: normalized.active,
      });
    if (normalized.membershipLevels)
      query.andWhere('passenger.membership_level IN (:...membershipLevels)', {
        membershipLevels: normalized.membershipLevels,
      });
    return paginateByCode(query, 'passenger.mission_code', page, normalized);
  }
}

function normalizePassengerFilter(filter: PassengerFilter): PassengerFilter {
  return {
    text: normalizeQueryText(filter.text),
    active: Object.prototype.hasOwnProperty.call(filter, 'active')
      ? filter.active ?? null
      : true,
    membershipLevels: requireNonEmptyArray(
      filter.membershipLevels,
      'membershipLevels',
    ),
  };
}
