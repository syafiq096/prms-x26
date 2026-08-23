import { DataSource } from 'typeorm';
import { assertTestDatabaseSafety } from '../../src/database/test-database-safety';

const testSchema = 'prms_test';

export async function prepareTestDatabase(dataSource: DataSource): Promise<void> {
  assertTestDatabaseSafety(process.env);
  await dataSource.query(`CREATE SCHEMA IF NOT EXISTS "${testSchema}"`);
  await dataSource.runMigrations({ transaction: 'all' });
}

export async function clearTestDatabase(dataSource: DataSource): Promise<void> {
  assertTestDatabaseSafety(process.env);
  const tables = (await dataSource.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = $1 AND tablename <> $2`,
    [testSchema, 'typeorm_migrations'],
  )) as Array<{ tablename: string }>;

  if (tables.length === 0) return;

  const quotedTables = tables
    .map(({ tablename }) => `"${testSchema}"."${tablename.replaceAll('"', '""')}"`)
    .join(', ');
  await dataSource.query(`TRUNCATE ${quotedTables} RESTART IDENTITY CASCADE`);
}
