import { assertTestDatabaseSafety } from './test-database-safety';

describe('test database safety', () => {
  it('accepts only the dedicated test schema in the test environment', () => {
    expect(() =>
      assertTestDatabaseSafety({
        NODE_ENV: 'test',
        DATABASE_SCHEMA: 'prms_test',
      }),
    ).not.toThrow();
  });

  it.each([
    ['development', 'prms_test'],
    ['test', 'public'],
    ['production', 'public'],
  ])('rejects NODE_ENV=%s and schema=%s', (nodeEnvironment, databaseSchema) => {
    expect(() =>
      assertTestDatabaseSafety({
        NODE_ENV: nodeEnvironment,
        DATABASE_SCHEMA: databaseSchema,
      }),
    ).toThrow('Refusing test database operation');
  });
});
