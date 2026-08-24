const codePattern = /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/;

export function normalizeWhitespace(
  value: string,
  field: string,
  maximum: number,
): string {
  const normalized = value.trim().replace(/\s+/gu, ' ');
  if (normalized.length === 0 || normalized.length > maximum)
    throw new DomainError(
      'VALIDATION_ERROR',
      `${field} must be 1-${maximum} characters`,
    );
  return normalized;
}

export function normalizeCode(value: string, field: string): string {
  const normalized = value.trim().toUpperCase();
  if (
    normalized.length < 1 ||
    normalized.length > 32 ||
    !codePattern.test(normalized)
  )
    throw new DomainError(
      'VALIDATION_ERROR',
      `${field} must be a valid mission code`,
    );
  return normalized;
}

export function normalizeEmail(
  value: string | null | undefined,
): string | null {
  if (value === null || value === undefined || value.trim() === '') return null;
  const normalized = value.trim().toLowerCase();
  if (
    normalized.length > 320 ||
    !/^[^\s@,]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/u.test(normalized)
  )
    throw new DomainError('VALIDATION_ERROR', 'email must be valid');
  return normalized;
}

export class DomainError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
  }
}
