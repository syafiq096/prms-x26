import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuditEventEntity } from '../../database/entities';
import { DomainError } from '../../domain/normalization';
import { Connection, Page } from '../shared/query-pagination';

@Injectable()
export class AuditEventQueryService {
  constructor(private readonly dataSource: DataSource) {}

  async list(page: Page): Promise<Connection<AuditEventEntity>> {
    const first = page.first ?? 25;
    if (!Number.isInteger(first) || first < 1 || first > 100)
      throw new DomainError('VALIDATION_ERROR', 'first must be an integer from 1 through 100');
    const query = this.dataSource.getRepository(AuditEventEntity).createQueryBuilder('audit');
    const totalCount = await query.clone().getCount();
    if (page.after) {
      const cursor = decodeCursor(page.after);
      query.andWhere('(audit.occurred_at, audit.id) < (:occurredAt, :id)', cursor);
    }
    const rows = await query
      .orderBy('audit.occurred_at', 'DESC')
      .addOrderBy('audit.id', 'DESC')
      .take(first + 1)
      .getMany();
    const hasNextPage = rows.length > first;
    const nodes = hasNextPage ? rows.slice(0, first) : rows;
    const last = nodes.at(-1);
    return {
      edges: nodes.map((node) => ({ node, cursor: encodeCursor(node) })),
      hasNextPage,
      endCursor: last ? encodeCursor(last) : null,
      totalCount,
    };
  }
}

function encodeCursor(event: AuditEventEntity): string {
  return Buffer.from(JSON.stringify({ v: 1, occurredAt: event.occurredAt.toISOString(), id: event.id })).toString('base64url');
}

function decodeCursor(value: string): { occurredAt: string; id: string } {
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as { v?: number; occurredAt?: string; id?: string };
    if (parsed.v !== 1 || !parsed.occurredAt || !parsed.id || Number.isNaN(Date.parse(parsed.occurredAt))) throw new Error();
    return { occurredAt: parsed.occurredAt, id: parsed.id };
  } catch {
    throw new DomainError('INVALID_CURSOR', 'Cursor is invalid');
  }
}
