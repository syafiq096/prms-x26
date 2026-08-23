import { SelectQueryBuilder } from 'typeorm';
import { DomainError } from '../../domain/normalization';

export type Page = { first?: number; after?: string | null };
export type Connection<T> = {
  edges: { node: T; cursor: string }[];
  hasNextPage: boolean;
  endCursor: string | null;
  totalCount: number;
};

export async function paginateByCode<T extends { id: string }>(
  query: SelectQueryBuilder<T>,
  sort: string,
  page: Page,
  filter: unknown,
): Promise<Connection<T>> {
  const first = page.first ?? 25;
  if (!Number.isInteger(first) || first < 1 || first > 100)
    throw new DomainError(
      'VALIDATION_ERROR',
      'first must be an integer from 1 through 100',
    );

  const fingerprint = JSON.stringify(filter);
  const totalCount = await query.clone().getCount();
  if (page.after) {
    const cursor = decodeCursor(page.after);
    if (cursor.filter !== fingerprint)
      throw new DomainError('INVALID_CURSOR', 'Cursor does not match filters');
    query.andWhere(
      `(${sort}, ${sort.split('.')[0]}.id) > (:cursorValue, :cursorId)`,
      { cursorValue: cursor.value, cursorId: cursor.id },
    );
  }

  const nodes = await query
    .orderBy(sort, 'ASC')
    .addOrderBy(`${sort.split('.')[0]}.id`, 'ASC')
    .take(first + 1)
    .getMany();
  const hasNextPage = nodes.length > first;
  const result = hasNextPage ? nodes.slice(0, first) : nodes;
  const last = result.at(-1);
  const sortProperty = sort.split('.')[1];

  return {
    edges: result.map((node) => ({
      node,
      cursor: encodeCursor(
        (node as unknown as Record<string, unknown>)[sortProperty] as string,
        node.id,
        fingerprint,
      ),
    })),
    hasNextPage,
    endCursor: last
      ? encodeCursor(
          (last as unknown as Record<string, unknown>)[sortProperty] as string,
          last.id,
          fingerprint,
        )
      : null,
    totalCount,
  };
}

export function normalizeQueryText(
  value: string | null | undefined,
): string | undefined {
  if (value === null || value === undefined) return undefined;
  const text = value.trim().replace(/\s+/gu, ' ');
  if (!text || text.length > 120)
    throw new DomainError('VALIDATION_ERROR', 'text must be 1-120 characters');
  return text;
}

export function requireNonEmptyArray<T>(
  value: T[] | null | undefined,
  name: string,
): T[] | undefined {
  if (value !== undefined && value !== null && value.length === 0)
    throw new DomainError('VALIDATION_ERROR', `${name} cannot be empty`);
  return value ?? undefined;
}

export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/gu, '\\$&');
}

function encodeCursor(value: string, id: string, filter: string): string {
  return Buffer.from(JSON.stringify({ v: 1, value, id, filter })).toString(
    'base64url',
  );
}

function decodeCursor(value: string): {
  value: string;
  id: string;
  filter: string;
} {
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as {
      v?: number;
      value?: string;
      id?: string;
      filter?: string;
    };
    if (
      parsed.v !== 1 ||
      !parsed.value ||
      !parsed.id ||
      parsed.filter === undefined
    )
      throw new Error();
    return parsed as { value: string; id: string; filter: string };
  } catch {
    throw new DomainError('INVALID_CURSOR', 'Cursor is invalid');
  }
}
