import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ResourceCategory } from '../../database/entities';
import { MembershipLevel, ResourceStatus } from '../../domain/access-policy';
import { DomainError } from '../../domain/normalization';
import {
  Connection,
  Page,
  normalizeQueryText,
  requireNonEmptyArray,
} from '../shared/query-pagination';

import {
  HistorySort,
  Interaction,
  InteractionOutcome,
  MembershipUsage,
  ReportingFilter,
  ReportingWindow,
  ResourceDemand,
  UsageSummary,
} from './reporting.types';

export {
  HistorySort,
  Interaction,
  InteractionOutcome,
  MembershipUsage,
  ReportingFilter,
  ReportingWindow,
  ResourceDemand,
  UsageSummary,
} from './reporting.types';

const interactionCte = (schema: string) => `WITH interactions AS (
  SELECT id, passenger_id, resource_id, 'ALLOWED'::text outcome, NULL::text denial_reason, occurred_at,
    passenger_mission_code, passenger_membership_level::text, resource_code, resource_display_name,
    resource_category::text, resource_minimum_membership_level::text, resource_status::text
  FROM "${schema}".resource_usages
  UNION ALL
  SELECT id, passenger_actor_id, contextual_resource_id, 'DENIED'::text, reason_code, occurred_at,
    passenger_mission_code_snapshot, passenger_membership_level_snapshot::text, resource_code_snapshot,
    resource_display_name_snapshot, resource_category_snapshot::text,
    resource_minimum_membership_level_snapshot::text, resource_status_snapshot::text
  FROM "${schema}".audit_events WHERE event_type = 'RESOURCE_ACCESS_DENIED'
)`;

@Injectable()
export class ReportingService {
  constructor(private readonly dataSource: DataSource) {}

  private get interactions(): string {
    const schema = String(
      (this.dataSource.options as { schema?: string }).schema ?? 'public',
    ).replace(/"/gu, '""');
    return interactionCte(schema);
  }

  async history(
    passengerId: string,
    window: ReportingWindow,
    filter: ReportingFilter,
    sort: HistorySort,
    page: Page,
  ): Promise<Connection<Interaction>> {
    const normalized = normalize(window, filter);
    const first = normalizeFirst(page.first);
    const fingerprint = JSON.stringify({ passengerId, ...normalized, sort });
    const params: unknown[] = [
      passengerId,
      normalized.window.from,
      normalized.window.to,
    ];
    const where = [
      'passenger_id = $1',
      'occurred_at >= $2',
      'occurred_at < $3',
    ];
    addFilters(where, params, normalized.filter);
    let cursor: { occurredAt: string; id: string } | undefined;
    if (page.after) {
      cursor = decodeHistoryCursor(page.after, fingerprint);
      params.push(cursor.occurredAt, cursor.id);
      const operator = sort === HistorySort.OLDEST ? '>' : '<';
      where.push(
        `(occurred_at, id) ${operator} ($${params.length - 1}, $${params.length})`,
      );
    }
    const countParams = params.slice(0, cursor ? -2 : undefined);
    const countWhere = where.slice(0, cursor ? -1 : undefined);
    const countRows = (await this.dataSource.query(
      `${this.interactions} SELECT COUNT(*)::int count FROM interactions WHERE ${countWhere.join(' AND ')}`,
      countParams,
    )) as { count: number }[];
    params.push(first + 1);
    const direction = sort === HistorySort.OLDEST ? 'ASC' : 'DESC';
    const rows = (await this.dataSource.query(
      `${this.interactions} SELECT * FROM interactions WHERE ${where.join(' AND ')} ORDER BY occurred_at ${direction}, id ${direction} LIMIT $${params.length}`,
      params,
    )) as Record<string, unknown>[];
    const hasNextPage = rows.length > first;
    const nodes = rows.slice(0, first).map(mapInteraction);
    return {
      edges: nodes.map((node) => ({
        node,
        cursor: encodeCursor(
          { occurredAt: node.occurredAt.toISOString(), id: node.id },
          fingerprint,
        ),
      })),
      hasNextPage,
      endCursor: nodes.length
        ? encodeCursor(
            {
              occurredAt: nodes.at(-1)!.occurredAt.toISOString(),
              id: nodes.at(-1)!.id,
            },
            fingerprint,
          )
        : null,
      totalCount: Number(countRows[0]?.count ?? 0),
    };
  }

  async summary(
    window: ReportingWindow,
    filter: ReportingFilter,
  ): Promise<UsageSummary> {
    const normalized = normalize(window, filter);
    const params: unknown[] = [normalized.window.from, normalized.window.to];
    const where = ['occurred_at >= $1', 'occurred_at < $2'];
    addFilters(where, params, normalized.filter);
    const [row] = (await this.dataSource.query(
      `${this.interactions} SELECT COUNT(*) FILTER (WHERE outcome='ALLOWED')::int allowed_count, COUNT(*) FILTER (WHERE outcome='DENIED')::int denied_count FROM interactions WHERE ${where.join(' AND ')}`,
      params,
    )) as { allowed_count: number; denied_count: number }[];
    const allowedCount = Number(row?.allowed_count ?? 0);
    const deniedCount = Number(row?.denied_count ?? 0);
    const totalAttempts = allowedCount + deniedCount;
    return {
      window: normalized.window,
      allowedCount,
      deniedCount,
      totalAttempts,
      denialRate: totalAttempts ? deniedCount / totalAttempts : 0,
    };
  }

  async membership(
    window: ReportingWindow,
    filter: ReportingFilter,
  ): Promise<{ window: ReportingWindow; groups: MembershipUsage[] }> {
    const normalized = normalize(window, filter);
    const params: unknown[] = [normalized.window.from, normalized.window.to];
    const where = [
      'occurred_at >= $1',
      'occurred_at < $2',
      'passenger_membership_level IS NOT NULL',
    ];
    addFilters(where, params, normalized.filter);
    const rows = (await this.dataSource.query(
      `${this.interactions} SELECT passenger_membership_level membership_level, COUNT(*) FILTER (WHERE outcome='ALLOWED')::int allowed_count, COUNT(*) FILTER (WHERE outcome='DENIED')::int denied_count FROM interactions WHERE ${where.join(' AND ')} GROUP BY passenger_membership_level ORDER BY CASE passenger_membership_level WHEN 'SILVER' THEN 1 WHEN 'GOLD' THEN 2 ELSE 3 END`,
      params,
    )) as Record<string, unknown>[];
    return {
      window: normalized.window,
      groups: rows.map((row) => ({
        membershipLevel: row.membership_level as MembershipLevel,
        allowedCount: Number(row.allowed_count),
        deniedCount: Number(row.denied_count),
        totalAttempts: Number(row.allowed_count) + Number(row.denied_count),
      })),
    };
  }

  async demand(
    window: ReportingWindow,
    filter: ReportingFilter,
    page: Page,
  ): Promise<{
    window: ReportingWindow;
    connection: Connection<ResourceDemand>;
  }> {
    const normalized = normalize(window, filter);
    const first = normalizeFirst(page.first);
    const fingerprint = JSON.stringify(normalized);
    const params: unknown[] = [normalized.window.from, normalized.window.to];
    const where = [
      'occurred_at >= $1',
      'occurred_at < $2',
      'resource_code IS NOT NULL',
    ];
    addFilters(where, params, normalized.filter);
    const group =
      'resource_id, resource_code, resource_display_name, resource_category, resource_minimum_membership_level';
    const base = `${this.interactions} SELECT resource_id, resource_code, resource_display_name, resource_category, resource_minimum_membership_level, COUNT(*) FILTER (WHERE outcome='ALLOWED')::int allowed_count, COUNT(*) FILTER (WHERE outcome='DENIED')::int denied_count FROM interactions WHERE ${where.join(' AND ')} GROUP BY ${group}`;
    const countRows = (await this.dataSource.query(
      `SELECT COUNT(*)::int count FROM (${base}) grouped`,
      params,
    )) as { count: number }[];
    let cursorClause = '';
    if (page.after) {
      const cursor = decodeDemandCursor(page.after, fingerprint);
      params.push(
        cursor.allowedCount,
        cursor.resourceCode,
        cursor.resourceId,
        cursor.resourceDisplayName,
        cursor.resourceCategory,
        cursor.resourceMinimumMembershipLevel,
      );
      cursorClause = ` HAVING (COUNT(*) FILTER (WHERE outcome='ALLOWED') < $${params.length - 5}) OR (COUNT(*) FILTER (WHERE outcome='ALLOWED') = $${params.length - 5} AND (resource_code, resource_id, resource_display_name, resource_category, resource_minimum_membership_level) > ($${params.length - 4}, $${params.length - 3}, $${params.length - 2}, $${params.length - 1}, $${params.length}))`;
    }
    params.push(first + 1);
    const rows = (await this.dataSource.query(
      `${base}${cursorClause} ORDER BY allowed_count DESC, resource_code ASC, resource_id ASC, resource_display_name ASC, resource_category ASC, resource_minimum_membership_level ASC LIMIT $${params.length}`,
      params,
    )) as Record<string, unknown>[];
    const nodes = rows.slice(0, first).map((row) => ({
      resourceId: String(row.resource_id),
      resourceCode: String(row.resource_code),
      resourceDisplayName: String(row.resource_display_name),
      resourceCategory: row.resource_category as ResourceCategory,
      resourceMinimumMembershipLevel:
        row.resource_minimum_membership_level as MembershipLevel,
      allowedCount: Number(row.allowed_count),
      deniedCount: Number(row.denied_count),
      totalAttempts: Number(row.allowed_count) + Number(row.denied_count),
    }));
    const cursorFor = (node: ResourceDemand) =>
      encodeCursor(
        {
          allowedCount: node.allowedCount,
          resourceCode: node.resourceCode,
          resourceId: node.resourceId,
          resourceDisplayName: node.resourceDisplayName,
          resourceCategory: node.resourceCategory,
          resourceMinimumMembershipLevel: node.resourceMinimumMembershipLevel,
        },
        fingerprint,
      );
    return {
      window: normalized.window,
      connection: {
        edges: nodes.map((node) => ({ node, cursor: cursorFor(node) })),
        hasNextPage: rows.length > first,
        endCursor: nodes.length ? cursorFor(nodes.at(-1)!) : null,
        totalCount: Number(countRows[0]?.count ?? 0),
      },
    };
  }
}

function normalize(window: ReportingWindow, filter: ReportingFilter) {
  const from = new Date(window.from);
  const to = new Date(window.to);
  if (
    !Number.isFinite(from.getTime()) ||
    !Number.isFinite(to.getTime()) ||
    from >= to
  )
    throw new DomainError(
      'VALIDATION_ERROR',
      'Reporting window must have a valid from before to',
    );
  if (to.getTime() - from.getTime() > 366 * 24 * 60 * 60 * 1000)
    throw new DomainError(
      'VALIDATION_ERROR',
      'Reporting window cannot exceed 366 days',
    );
  return {
    window: { from, to },
    filter: {
      outcomes: requireNonEmptyArray(filter.outcomes, 'outcomes'),
      membershipLevels: requireNonEmptyArray(
        filter.membershipLevels,
        'membershipLevels',
      ),
      categories: requireNonEmptyArray(filter.categories, 'categories'),
      denialReasons: requireNonEmptyArray(
        filter.denialReasons,
        'denialReasons',
      )?.map((value) => value.trim()),
      resourceText: normalizeQueryText(filter.resourceText),
    },
  };
}
function addFilters(
  where: string[],
  params: unknown[],
  filter: ReturnType<typeof normalize>['filter'],
) {
  if (filter.outcomes) {
    params.push(filter.outcomes);
    where.push(`outcome = ANY($${params.length})`);
  }
  if (filter.membershipLevels) {
    params.push(filter.membershipLevels);
    where.push(`passenger_membership_level = ANY($${params.length})`);
  }
  if (filter.categories) {
    params.push(filter.categories);
    where.push(`resource_category = ANY($${params.length})`);
  }
  if (filter.denialReasons) {
    params.push(filter.denialReasons);
    where.push(`denial_reason = ANY($${params.length})`);
  }
  if (filter.resourceText) {
    params.push(`%${filter.resourceText.replace(/[\\%_]/gu, '\\$&')}%`);
    where.push(
      `(resource_code ILIKE $${params.length} ESCAPE '\\' OR resource_display_name ILIKE $${params.length} ESCAPE '\\')`,
    );
  }
}
function normalizeFirst(first = 25) {
  if (!Number.isInteger(first) || first < 1 || first > 100)
    throw new DomainError(
      'VALIDATION_ERROR',
      'first must be an integer from 1 through 100',
    );
  return first;
}
function mapInteraction(row: Record<string, unknown>): Interaction {
  return {
    id: String(row.id),
    passengerId: String(row.passenger_id),
    resourceId: String(row.resource_id),
    outcome: row.outcome as InteractionOutcome,
    denialReason: row.denial_reason as string | null,
    occurredAt: new Date(String(row.occurred_at)),
    passengerMissionCode: row.passenger_mission_code as string | null,
    passengerMembershipLevel:
      row.passenger_membership_level as MembershipLevel | null,
    resourceCode: row.resource_code as string | null,
    resourceDisplayName: row.resource_display_name as string | null,
    resourceCategory: row.resource_category as ResourceCategory | null,
    resourceMinimumMembershipLevel:
      row.resource_minimum_membership_level as MembershipLevel | null,
    resourceStatus: row.resource_status as ResourceStatus | null,
  };
}
function encodeCursor(value: object, filter: string) {
  return Buffer.from(JSON.stringify({ v: 1, ...value, filter })).toString(
    'base64url',
  );
}
function decodeCursor(value: string, filter: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(
      Buffer.from(value, 'base64url').toString('utf8'),
    ) as Record<string, unknown>;
    if (parsed.v !== 1 || parsed.filter !== filter) throw new Error();
    return parsed;
  } catch {
    throw new DomainError(
      'INVALID_CURSOR',
      'Cursor is invalid or does not match filters',
    );
  }
}
function decodeHistoryCursor(value: string, filter: string) {
  const parsed = decodeCursor(value, filter);
  if (
    typeof parsed.occurredAt !== 'string' ||
    !Number.isFinite(Date.parse(parsed.occurredAt)) ||
    typeof parsed.id !== 'string'
  )
    throw new DomainError('INVALID_CURSOR', 'Cursor is invalid');
  return parsed as { occurredAt: string; id: string };
}
function decodeDemandCursor(value: string, filter: string) {
  const parsed = decodeCursor(value, filter);
  if (
    typeof parsed.allowedCount !== 'number' ||
    typeof parsed.resourceCode !== 'string' ||
    typeof parsed.resourceId !== 'string' ||
    typeof parsed.resourceDisplayName !== 'string' ||
    typeof parsed.resourceCategory !== 'string' ||
    typeof parsed.resourceMinimumMembershipLevel !== 'string'
  )
    throw new DomainError('INVALID_CURSOR', 'Cursor is invalid');
  return parsed as {
    allowedCount: number;
    resourceCode: string;
    resourceId: string;
    resourceDisplayName: string;
    resourceCategory: string;
    resourceMinimumMembershipLevel: string;
  };
}
