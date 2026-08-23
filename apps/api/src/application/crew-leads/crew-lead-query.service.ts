import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CrewLeadEntity } from '../../database/entities';
import { DomainError } from '../../domain/normalization';

@Injectable()
export class CrewLeadQueryService {
  constructor(private readonly dataSource: DataSource) {}

  active(): Promise<CrewLeadEntity[]> {
    return this.dataSource.getRepository(CrewLeadEntity).find({
      where: { active: true },
      order: { missionCode: 'ASC', id: 'ASC' },
    });
  }

  async byId(id: string): Promise<CrewLeadEntity> {
    const lead = await this.dataSource
      .getRepository(CrewLeadEntity)
      .findOneBy({ id });
    if (!lead) throw new DomainError('NOT_FOUND', 'Crew Lead was not found');
    return lead;
  }
}
