import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { config as loadEnvironment } from 'dotenv';
import { DataSource, MigrationInterface } from 'typeorm';
import {
  EnvironmentVariables,
  validateEnvironment,
} from '../src/config/environment';
import { rootEnvironmentPath } from '../src/config/workspace-paths';
import { InitialDomain1724284800000 } from '../src/database/migrations/1724284800000-InitialDomain';
import { AddActorIdentities1724544000000 } from '../src/database/migrations/1724544000000-AddActorIdentities';
import { AddDeniedInteractionSnapshots1724630400000 } from '../src/database/migrations/1724630400000-AddDeniedInteractionSnapshots';
import {
  assertMigrationVerificationSafety,
  migrationVerificationSchema,
} from './support/migration-verification';

loadEnvironment({ path: rootEnvironmentPath });

type MigrationConstructor = new () => MigrationInterface;

const allMigrations: MigrationConstructor[] = [
  InitialDomain1724284800000,
  AddActorIdentities1724544000000,
  AddDeniedInteractionSnapshots1724630400000,
];

describe('migration verification', () => {
  let applicationEnvironment: EnvironmentVariables;
  let verificationEnvironment: EnvironmentVariables;
  let administrator: DataSource;

  beforeAll(async () => {
    applicationEnvironment = validateEnvironment(process.env);
    verificationEnvironment = validateEnvironment({
      ...process.env,
      NODE_ENV: 'test',
      DATABASE_SCHEMA: migrationVerificationSchema,
      CLERK_SECRET_KEY: 'sk_test_migration_verification',
      CLERK_AUTHORIZED_PARTIES: 'http://localhost:5173',
    });
    assertMigrationVerificationSafety(
      verificationEnvironment,
      applicationEnvironment.DATABASE_SCHEMA,
    );

    administrator = new DataSource({
      type: 'postgres',
      host: verificationEnvironment.DATABASE_HOST,
      port: verificationEnvironment.DATABASE_PORT,
      username: verificationEnvironment.MIGRATION_DATABASE_USER,
      password: verificationEnvironment.MIGRATION_DATABASE_PASSWORD,
      database: verificationEnvironment.DATABASE_NAME,
      synchronize: false,
    });
    await administrator.initialize();
  });

  beforeEach(async () => {
    await resetVerificationSchema();
  });

  afterAll(async () => {
    try {
      if (administrator?.isInitialized) await dropVerificationSchema();
    } finally {
      if (administrator?.isInitialized) await administrator.destroy();
    }
  });

  it('refuses every target except the dedicated test-only schema', () => {
    expect(() =>
      assertMigrationVerificationSafety(
        {
          NODE_ENV: 'development',
          DATABASE_SCHEMA: migrationVerificationSchema,
        },
        'public',
      ),
    ).toThrow('Refusing migration verification');
    expect(() =>
      assertMigrationVerificationSafety(
        { NODE_ENV: 'test', DATABASE_SCHEMA: 'public' },
        'public',
      ),
    ).toThrow('Refusing migration verification');
    expect(() =>
      assertMigrationVerificationSafety(
        { NODE_ENV: 'test', DATABASE_SCHEMA: migrationVerificationSchema },
        migrationVerificationSchema,
      ),
    ).toThrow('Refusing migration verification');
  });

  it('migrates an empty schema, rolls back the complete lifecycle, and reapplies it', async () => {
    const dataSource = await createMigrationDataSource(allMigrations);
    try {
      await dataSource.runMigrations({ transaction: 'all' });

      await expectMigrationState(dataSource, 3);
      await expectQueryCount(
        dataSource,
        `SELECT 1 FROM "${migrationVerificationSchema}".application_settings WHERE key = 'SYSTEM_STATE' AND text_value = 'UNINITIALIZED'`,
        1,
      );
      await expectQueryCount(
        dataSource,
        `SELECT 1
         FROM pg_trigger trigger
         JOIN pg_class relation ON relation.oid = trigger.tgrelid
         JOIN pg_namespace schema ON schema.oid = relation.relnamespace
         WHERE schema.nspname = $1
           AND trigger.tgname IN ('resource_usages_append_only', 'audit_events_append_only')`,
        2,
        [migrationVerificationSchema],
      );
      await expectQueryCount(
        dataSource,
        `SELECT 1 FROM pg_indexes WHERE schemaname = $1 AND indexname IN ('resources_discovery_idx', 'audit_events_passenger_interaction_idx', 'audit_events_denied_reporting_idx')`,
        3,
        [migrationVerificationSchema],
      );

      await dataSource.undoLastMigration({ transaction: 'all' });
      await dataSource.undoLastMigration({ transaction: 'all' });
      await dataSource.undoLastMigration({ transaction: 'all' });

      await expectMigrationState(dataSource, 0);
      await expectQueryCount(
        dataSource,
        `SELECT 1 FROM information_schema.tables WHERE table_schema = $1 AND table_name = 'application_settings'`,
        0,
        [migrationVerificationSchema],
      );

      await dataSource.runMigrations({ transaction: 'all' });
      await expectMigrationState(dataSource, 3);
    } finally {
      await dataSource.destroy();
    }
  });

  it('upgrades representative data incrementally and supports rollback and reapplication', async () => {
    const initialSource = await createMigrationDataSource([allMigrations[0]]);
    try {
      await initialSource.runMigrations({ transaction: 'all' });
      await seedRepresentativeHistory(initialSource);
    } finally {
      await initialSource.destroy();
    }

    const actorIdentitySource = await createMigrationDataSource(
      allMigrations.slice(0, 2),
    );
    try {
      await actorIdentitySource.runMigrations({ transaction: 'all' });
      await actorIdentitySource.query(
        `INSERT INTO "${migrationVerificationSchema}".actor_identities (clerk_subject, passenger_id) VALUES ('passenger-one', '20000000-0000-4000-8000-000000000001')`,
      );
      await expectMigrationState(actorIdentitySource, 2);
      await expectQueryCount(
        actorIdentitySource,
        `SELECT 1 FROM "${migrationVerificationSchema}".passengers WHERE mission_code = 'PASSENGER-ONE'`,
        1,
      );
    } finally {
      await actorIdentitySource.destroy();
    }

    const fullSource = await createMigrationDataSource(allMigrations);
    try {
      await fullSource.runMigrations({ transaction: 'all' });
      await expectMigrationState(fullSource, 3);
      await expectQueryCount(
        fullSource,
        `SELECT 1 FROM information_schema.columns WHERE table_schema = $1 AND table_name = 'audit_events' AND column_name = 'passenger_mission_code_snapshot'`,
        1,
        [migrationVerificationSchema],
      );
      await expectQueryCount(
        fullSource,
        `SELECT 1 FROM "${migrationVerificationSchema}".audit_events WHERE event_type = 'RESOURCE_ACCESS_DENIED' AND passenger_mission_code_snapshot IS NULL`,
        1,
      );

      await fullSource.undoLastMigration({ transaction: 'all' });
      await expectMigrationState(fullSource, 2);
      await expectQueryCount(
        fullSource,
        `SELECT 1 FROM information_schema.columns WHERE table_schema = $1 AND table_name = 'audit_events' AND column_name = 'passenger_mission_code_snapshot'`,
        0,
        [migrationVerificationSchema],
      );

      await fullSource.runMigrations({ transaction: 'all' });
      await fullSource.undoLastMigration({ transaction: 'all' });
      await fullSource.undoLastMigration({ transaction: 'all' });
      await expectMigrationState(fullSource, 1);
      await expectQueryCount(
        fullSource,
        `SELECT 1 FROM information_schema.tables WHERE table_schema = $1 AND table_name = 'actor_identities'`,
        0,
        [migrationVerificationSchema],
      );
      await expectQueryCount(
        fullSource,
        `SELECT 1 FROM "${migrationVerificationSchema}".resource_usages WHERE passenger_mission_code = 'PASSENGER-ONE'`,
        1,
      );

      await fullSource.runMigrations({ transaction: 'all' });
      await expectMigrationState(fullSource, 3);
      await expectQueryCount(
        fullSource,
        `SELECT 1 FROM "${migrationVerificationSchema}".audit_events WHERE event_type = 'RESOURCE_ACCESS_DENIED'`,
        1,
      );
    } finally {
      await fullSource.destroy();
    }
  });

  it('rejects an incompatible actor identity table without recording a partial upgrade', async () => {
    const initialSource = await createMigrationDataSource([allMigrations[0]]);
    try {
      await initialSource.runMigrations({ transaction: 'all' });
    } finally {
      await initialSource.destroy();
    }

    await administrator.query(
      `CREATE TABLE "${migrationVerificationSchema}".actor_identities (unexpected text)`,
    );
    const upgradeSource = await createMigrationDataSource(
      allMigrations.slice(0, 2),
    );
    try {
      await expect(
        upgradeSource.runMigrations({ transaction: 'all' }),
      ).rejects.toThrow('does not match the expected actor identity schema');
      await expectMigrationState(upgradeSource, 1);
      await expectQueryCount(
        upgradeSource,
        `SELECT 1 FROM information_schema.columns WHERE table_schema = $1 AND table_name = 'actor_identities' AND column_name = 'unexpected'`,
        1,
        [migrationVerificationSchema],
      );
    } finally {
      await upgradeSource.destroy();
    }
  });

  it('does not apply pending migrations when the Nest application initializes', async () => {
    const initialSource = await createMigrationDataSource([allMigrations[0]]);
    try {
      await initialSource.runMigrations({ transaction: 'all' });
      await grantRuntimeSchemaUsage();
    } finally {
      await initialSource.destroy();
    }

    const migrationCountBefore = await migrationCount();
    const originalNodeEnvironment = process.env.NODE_ENV;
    const originalSchema = process.env.DATABASE_SCHEMA;
    let app: INestApplication | undefined;

    try {
      process.env.NODE_ENV = 'test';
      process.env.DATABASE_SCHEMA = migrationVerificationSchema;
      const { AppModule } = await import('../src/app.module');
      const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
      app = moduleRef.createNestApplication();
      await app.init();
      expect(await migrationCount()).toBe(migrationCountBefore);
    } finally {
      await app?.close();
      restoreEnvironment('NODE_ENV', originalNodeEnvironment);
      restoreEnvironment('DATABASE_SCHEMA', originalSchema);
    }
  });

  async function createMigrationDataSource(
    migrations: MigrationConstructor[],
  ): Promise<DataSource> {
    const dataSource = new DataSource({
      type: 'postgres',
      host: verificationEnvironment.DATABASE_HOST,
      port: verificationEnvironment.DATABASE_PORT,
      username: verificationEnvironment.MIGRATION_DATABASE_USER,
      password: verificationEnvironment.MIGRATION_DATABASE_PASSWORD,
      database: verificationEnvironment.DATABASE_NAME,
      schema: migrationVerificationSchema,
      migrations,
      migrationsTableName: 'typeorm_migrations',
      migrationsTransactionMode: 'all',
      synchronize: false,
    });
    await dataSource.initialize();
    return dataSource;
  }

  async function resetVerificationSchema(): Promise<void> {
    await dropVerificationSchema();
    await administrator.query(`CREATE SCHEMA "${migrationVerificationSchema}"`);
  }

  async function dropVerificationSchema(): Promise<void> {
    assertMigrationVerificationSafety(
      verificationEnvironment,
      applicationEnvironment.DATABASE_SCHEMA,
    );
    await administrator.query(
      `DROP SCHEMA IF EXISTS "${migrationVerificationSchema}" CASCADE`,
    );
  }

  async function expectMigrationState(
    dataSource: DataSource,
    expectedCount: number,
  ): Promise<void> {
    expect(await migrationCount(dataSource)).toBe(expectedCount);
  }

  async function migrationCount(dataSource = administrator): Promise<number> {
    const result = (await dataSource.query(
      `SELECT COUNT(*)::int AS count FROM "${migrationVerificationSchema}".typeorm_migrations`,
    )) as Array<{ count: number }>;
    return result[0].count;
  }

  async function expectQueryCount(
    dataSource: DataSource,
    query: string,
    expectedCount: number,
    parameters: unknown[] = [],
  ): Promise<void> {
    const rows = await dataSource.query(query, parameters);
    expect(rows).toHaveLength(expectedCount);
  }

  async function seedRepresentativeHistory(
    dataSource: DataSource,
  ): Promise<void> {
    await dataSource.query(`
      INSERT INTO "${migrationVerificationSchema}".crew_leads (id, mission_code, full_name)
      VALUES ('10000000-0000-4000-8000-000000000001', 'LEAD-ONE', 'Lead One')
    `);
    await dataSource.query(`
      INSERT INTO "${migrationVerificationSchema}".passengers (id, mission_code, full_name)
      VALUES ('20000000-0000-4000-8000-000000000001', 'PASSENGER-ONE', 'Passenger One')
    `);
    await dataSource.query(`
      INSERT INTO "${migrationVerificationSchema}".resources (id, code, display_name, category)
      VALUES ('30000000-0000-4000-8000-000000000001', 'GALLEY-ONE', 'Galley One', 'FOOD')
    `);
    await dataSource.query(`
      INSERT INTO "${migrationVerificationSchema}".resource_usages
        (id, idempotency_key, passenger_id, resource_id, passenger_mission_code, passenger_membership_level, resource_code, resource_display_name, resource_category, resource_minimum_membership_level, resource_status)
      VALUES
        ('40000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'PASSENGER-ONE', 'SILVER', 'GALLEY-ONE', 'Galley One', 'FOOD', 'SILVER', 'ACTIVE')
    `);
    await dataSource.query(`
      INSERT INTO "${migrationVerificationSchema}".audit_events
        (id, event_type, result, reason_code, actor_type, passenger_actor_id, resource_subject_id)
      VALUES
        ('60000000-0000-4000-8000-000000000001', 'RESOURCE_ACCESS_DENIED', 'DENIED', 'INSUFFICIENT_MEMBERSHIP', 'PASSENGER', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001')
    `);
  }

  async function grantRuntimeSchemaUsage(): Promise<void> {
    const runtimeUser = applicationEnvironment.DATABASE_USER.replaceAll(
      '"',
      '""',
    );
    await administrator.query(
      `GRANT USAGE ON SCHEMA "${migrationVerificationSchema}" TO "${runtimeUser}"`,
    );
  }

  function restoreEnvironment(key: string, value: string | undefined): void {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});
