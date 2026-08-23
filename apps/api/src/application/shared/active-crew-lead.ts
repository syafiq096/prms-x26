import { EntityManager } from 'typeorm';
import { CrewLeadEntity } from '../../database/entities';
import { DomainError } from '../../domain/normalization';

export async function requireActiveCrewLead(
  manager: EntityManager,
  id: string,
): Promise<CrewLeadEntity> {
  const lead = await manager
    .getRepository(CrewLeadEntity)
    .findOne({ where: { id, active: true } });
  if (!lead)
    throw new DomainError('UNAUTHORIZED', 'An active Crew Lead is required');
  return lead;
}
