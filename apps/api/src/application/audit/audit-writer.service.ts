import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { AuditEventEntity } from '../../database/entities';

@Injectable()
export class AuditWriterService {
  async write(
    manager: EntityManager,
    event: Partial<AuditEventEntity> &
      Pick<AuditEventEntity, 'actorType' | 'eventType' | 'result'>,
  ): Promise<void> {
    const audits = manager.getRepository(AuditEventEntity);
    await audits.save(audits.create({ metadata: {}, ...event }));
  }
}
