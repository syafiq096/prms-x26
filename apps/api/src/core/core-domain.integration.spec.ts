import { ConfigService } from '@nestjs/config';
import { config as loadEnvironment } from 'dotenv';
import { DataSource } from 'typeorm';
import { validateEnvironment } from '../config/environment';
import { rootEnvironmentPath } from '../config/workspace-paths';
import { InitialDomain1724284800000 } from '../database/migrations/1724284800000-InitialDomain';
import {
  ApplicationSettingEntity,
  AuditEventEntity,
  CrewLeadEntity,
  PassengerEntity,
  ResourceCategory,
  ResourceEntity,
  ResourceUsageEntity,
} from '../database/entities';
import { MembershipLevel } from '../domain/access-policy';
import { AuditWriterService } from '../application/audit/audit-writer.service';
import { PassengersService } from '../application/passengers/passengers.service';
import { ResourcesService } from '../application/resources/resources.service';
import { SystemSetupService } from '../application/system/system-setup.service';
import { ResourceUsageService } from '../application/usage/resource-usage.service';

loadEnvironment({ path: rootEnvironmentPath });

const testSchema = 'prms_test';

describe('PRMS application-service PostgreSQL boundary', () => {
  let dataSource: DataSource;
  let setup: SystemSetupService;
  let passengers: PassengersService;
  let resources: ResourcesService;
  let usage: ResourceUsageService;

  beforeAll(async () => {
    const environment = validateEnvironment(process.env);
    dataSource = new DataSource({
      type: 'postgres',
      host: environment.DATABASE_HOST,
      port: environment.DATABASE_PORT,
      username: environment.MIGRATION_DATABASE_USER,
      password: environment.MIGRATION_DATABASE_PASSWORD,
      database: environment.DATABASE_NAME,
      schema: testSchema,
      migrations: [InitialDomain1724284800000],
      migrationsTableName: 'typeorm_migrations',
      migrationsTransactionMode: 'all',
      entities: [
        ApplicationSettingEntity,
        AuditEventEntity,
        CrewLeadEntity,
        PassengerEntity,
        ResourceEntity,
        ResourceUsageEntity,
      ],
    });
    await dataSource.initialize();
    const audits = new AuditWriterService();
    setup = new SystemSetupService(
      dataSource,
      new ConfigService(environment),
      audits,
    );
    passengers = new PassengersService(dataSource, audits);
    resources = new ResourcesService(dataSource, audits);
    usage = new ResourceUsageService(dataSource, audits);
  });

  beforeEach(async () => {
    await dataSource.query(`DROP SCHEMA IF EXISTS "${testSchema}" CASCADE`);
    await dataSource.query(`CREATE SCHEMA "${testSchema}"`);
    await dataSource.runMigrations({ transaction: 'all' });
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('initializes exactly three Crew Leads and records an immutable audit event', async () => {
    await setup.initialize(process.env.PRMS_SETUP_SECRET as string, [
      { missionCode: 'LEAD-ONE', fullName: 'Lead One' },
      { missionCode: 'LEAD-TWO', fullName: 'Lead Two' },
      { missionCode: 'LEAD-THREE', fullName: 'Lead Three' },
    ]);

    const leads = await dataSource.query(
      `SELECT mission_code FROM "${testSchema}".crew_leads WHERE active ORDER BY mission_code`,
    );
    expect(leads).toHaveLength(3);

    const audit = await dataSource
      .getRepository(AuditEventEntity)
      .findOneByOrFail({ eventType: 'SYSTEM_INITIALIZED' });
    await expect(
      dataSource.query(
        `UPDATE "${testSchema}".audit_events SET result = 'TAMPERED' WHERE id = $1`,
        [audit.id],
      ),
    ).rejects.toThrow('append-only history');
  });

  it('writes an allowed Resource Usage snapshot and returns it for a matching retry', async () => {
    await setup.initialize(process.env.PRMS_SETUP_SECRET as string, [
      { missionCode: 'LEAD-ONE', fullName: 'Lead One' },
      { missionCode: 'LEAD-TWO', fullName: 'Lead Two' },
      { missionCode: 'LEAD-THREE', fullName: 'Lead Three' },
    ]);
    const lead = await dataSource.query(
      `SELECT id FROM "${testSchema}".crew_leads WHERE mission_code = 'LEAD-ONE'`,
    );
    const actor = { type: 'CREW_LEAD' as const, id: lead[0].id as string };
    const passenger = await passengers.create(actor, {
      missionCode: 'PASSENGER-ONE',
      fullName: 'Passenger One',
      membershipLevel: MembershipLevel.GOLD,
    });
    const resource = await resources.create(actor, {
      code: 'GALLEY-ONE',
      displayName: 'Galley One',
      category: ResourceCategory.FOOD,
      minimumMembershipLevel: MembershipLevel.SILVER,
    });
    const key = '40000000-0000-4000-8000-000000000001';

    const first = await usage.record(
      { type: 'PASSENGER', id: passenger.id },
      resource.id,
      key,
    );
    const retry = await usage.record(
      { type: 'PASSENGER', id: passenger.id },
      resource.id,
      key,
    );

    expect(first.allowed).toBe(true);
    expect(retry).toEqual(first);
    const usages = await dataSource.getRepository(ResourceUsageEntity).find();
    expect(usages).toHaveLength(1);
    expect(usages[0]).toMatchObject({
      passengerMissionCode: 'PASSENGER-ONE',
      resourceCode: 'GALLEY-ONE',
      passengerMembershipLevel: MembershipLevel.GOLD,
    });
  });

  it('serializes concurrent initialization attempts through the system-state row', async () => {
    const profiles = [
      { missionCode: 'LEAD-ONE', fullName: 'Lead One' },
      { missionCode: 'LEAD-TWO', fullName: 'Lead Two' },
      { missionCode: 'LEAD-THREE', fullName: 'Lead Three' },
    ];

    const outcomes = await Promise.allSettled([
      setup.initialize(process.env.PRMS_SETUP_SECRET as string, profiles),
      setup.initialize(process.env.PRMS_SETUP_SECRET as string, profiles),
    ]);

    expect(
      outcomes.filter((outcome) => outcome.status === 'fulfilled'),
    ).toHaveLength(1);
    expect(
      outcomes.filter((outcome) => outcome.status === 'rejected'),
    ).toHaveLength(1);
    const leads = await dataSource.query(
      `SELECT id FROM "${testSchema}".crew_leads WHERE active`,
    );
    expect(leads).toHaveLength(3);
  });

  it('creates one Resource Usage when matching allowed requests race', async () => {
    await setup.initialize(process.env.PRMS_SETUP_SECRET as string, [
      { missionCode: 'LEAD-ONE', fullName: 'Lead One' },
      { missionCode: 'LEAD-TWO', fullName: 'Lead Two' },
      { missionCode: 'LEAD-THREE', fullName: 'Lead Three' },
    ]);
    const [lead] = await dataSource.query(
      `SELECT id FROM "${testSchema}".crew_leads WHERE mission_code = 'LEAD-ONE'`,
    );
    const actor = { type: 'CREW_LEAD' as const, id: lead.id as string };
    const passenger = await passengers.create(actor, {
      missionCode: 'PASSENGER-ONE',
      fullName: 'Passenger One',
    });
    const resource = await resources.create(actor, {
      code: 'GALLEY-ONE',
      displayName: 'Galley One',
      category: ResourceCategory.FOOD,
    });
    const key = '50000000-0000-4000-8000-000000000001';

    const results = await Promise.all([
      usage.record({ type: 'PASSENGER', id: passenger.id }, resource.id, key),
      usage.record({ type: 'PASSENGER', id: passenger.id }, resource.id, key),
    ]);

    expect(results.every((result) => result.allowed)).toBe(true);
    expect(await dataSource.getRepository(ResourceUsageEntity).count()).toBe(1);
  });
});
