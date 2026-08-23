export interface TestDatabaseTarget {
  NODE_ENV?: string;
  DATABASE_SCHEMA?: string;
}

export function assertTestDatabaseSafety(target: TestDatabaseTarget): void {
  if (
    target.NODE_ENV !== 'test' ||
    target.DATABASE_SCHEMA !== 'prms_test'
  ) {
    throw new Error(
      'Refusing test database operation: NODE_ENV must be test and DATABASE_SCHEMA must be prms_test',
    );
  }
}
