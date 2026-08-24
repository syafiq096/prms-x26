import { ConfigService } from '@nestjs/config';
import { config as loadEnvironment } from 'dotenv';
import { DataSource } from 'typeorm';
import { validateEnvironment } from '../config/environment';
import { rootEnvironmentPath } from '../config/workspace-paths';
import { InitialDomain1724284800000 } from '../database/migrations/1724284800000-InitialDomain';
import { AddDeniedInteractionSnapshots1724630400000 } from '../database/migrations/1724630400000-AddDeniedInteractionSnapshots';
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
import { CrewLeadsService } from '../application/crew-leads/crew-leads.service';
import { HistorySort, ReportingService } from '../application/reporting/reporting.service';

loadEnvironment({ path: rootEnvironmentPath });

const testSchema = 'prms_test';

describe('PRMS application-service PostgreSQL boundary', () => {
  let dataSource: DataSource;
  let setup: SystemSetupService;
  let passengers: PassengersService;
  let resources: ResourcesService;
  let usage: ResourceUsageService;
  let reporting: ReportingService;

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
      migrations: [InitialDomain1724284800000, AddDeniedInteractionSnapshots1724630400000],
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
    reporting = new ReportingService(dataSource);
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

  it('updates only the actor profile and atomically replaces another Crew Lead', async () => {
    await setup.initialize(process.env.PRMS_SETUP_SECRET as string, [
      { missionCode: 'LEAD-ONE', fullName: 'Lead One' },
      { missionCode: 'LEAD-TWO', fullName: 'Lead Two' },
      { missionCode: 'LEAD-THREE', fullName: 'Lead Three' },
    ]);
    const leads = await dataSource.getRepository(CrewLeadEntity).find({ order: { missionCode: 'ASC' } });
    const actor = { type: 'CREW_LEAD' as const, id: leads[0].id };
    const updated = await new CrewLeadsService(dataSource, new AuditWriterService()).updateOwnProfile(actor, { fullName: 'Lead One Updated', email: 'lead.one@x26.test' }, leads[0].version);
    expect(updated).toMatchObject({ missionCode: 'LEAD-ONE', fullName: 'Lead One Updated', email: 'lead.one@x26.test' });
    const crewLeads = new CrewLeadsService(dataSource, new AuditWriterService());
    await expect(crewLeads.replace(actor, actor.id, { missionCode: 'LEAD-FOUR', fullName: 'Lead Four' }, 'Rotation', updated.version)).rejects.toMatchObject({ code: 'SELF_REPLACEMENT_FORBIDDEN' });
    const incoming = await crewLeads.replace(actor, leads[1].id, { missionCode: 'LEAD-FOUR', fullName: 'Lead Four' }, 'Scheduled rotation', leads[1].version);
    expect(incoming.replacesCrewLeadId).toBe(leads[1].id);
    expect(await dataSource.getRepository(CrewLeadEntity).count({ where: { active: true } })).toBe(3);
    expect(await dataSource.getRepository(CrewLeadEntity).findOneByOrFail({ id: leads[1].id })).toMatchObject({ active: false, deactivationReason: 'Scheduled rotation' });
    expect(await dataSource.getRepository(AuditEventEntity).findOneBy({ eventType: 'CREW_LEAD_REPLACED' })).not.toBeNull();
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

  it('reports allowed and denied interactions from immutable usage-time snapshots', async () => {
    await setup.initialize(process.env.PRMS_SETUP_SECRET as string, [
      { missionCode: 'LEAD-ONE', fullName: 'Lead One' },
      { missionCode: 'LEAD-TWO', fullName: 'Lead Two' },
      { missionCode: 'LEAD-THREE', fullName: 'Lead Three' },
    ]);
    const [lead] = await dataSource.query(`SELECT id FROM "${testSchema}".crew_leads WHERE mission_code = 'LEAD-ONE'`);
    const actor = { type: 'CREW_LEAD' as const, id: lead.id as string };
    const passenger = await passengers.create(actor, { missionCode: 'PASSENGER-ONE', fullName: 'Passenger One' });
    const resource = await resources.create(actor, { code: 'FITNESS-ONE', displayName: 'Fitness One', category: ResourceCategory.FITNESS, minimumMembershipLevel: MembershipLevel.GOLD });
    const denied = await usage.record({ type: 'PASSENGER', id: passenger.id }, resource.id, '60000000-0000-4000-8000-000000000001');
    expect(denied).toEqual({ allowed: false, reason: 'INSUFFICIENT_MEMBERSHIP' });
    await passengers.changeMembership(actor, passenger.id, MembershipLevel.GOLD, passenger.version);
    await usage.record({ type: 'PASSENGER', id: passenger.id }, resource.id, '60000000-0000-4000-8000-000000000002');
    const window = { from: new Date(Date.now() - 60_000), to: new Date(Date.now() + 60_000) };
    const history = await reporting.history(passenger.id, window, {}, HistorySort.NEWEST, {});
    const summary = await reporting.summary(window, {});
    const membership = await reporting.membership(window, {});
    const firstPage = await reporting.history(passenger.id, window, {}, HistorySort.OLDEST, { first: 1 });
    const demand = await reporting.demand(window, {}, {});
    expect(history.totalCount).toBe(2);
    expect(summary).toMatchObject({ allowedCount: 1, deniedCount: 1, totalAttempts: 2, denialRate: 0.5 });
    expect(membership.groups).toEqual([
      { membershipLevel: MembershipLevel.SILVER, allowedCount: 0, deniedCount: 1, totalAttempts: 1 },
      { membershipLevel: MembershipLevel.GOLD, allowedCount: 1, deniedCount: 0, totalAttempts: 1 },
    ]);
    expect(firstPage.hasNextPage).toBe(true);
    expect(firstPage.edges[0].node.outcome).toBe('DENIED');
    expect(demand.connection.edges[0].node).toMatchObject({ resourceCode: 'FITNESS-ONE', allowedCount: 1, deniedCount: 1 });
    await expect(reporting.history(passenger.id, window, { categories: [ResourceCategory.MEDICAL] }, HistorySort.OLDEST, { first: 1, after: firstPage.endCursor })).rejects.toMatchObject({ code: 'INVALID_CURSOR' });
    await expect(reporting.summary({ from: new Date('2024-01-01T00:00:00Z'), to: new Date('2025-01-02T00:00:00Z') }, {})).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await dataSource.query(`INSERT INTO "${testSchema}".resource_usages
      (id, idempotency_key, passenger_id, resource_id, passenger_mission_code, passenger_membership_level, resource_code, resource_display_name, resource_category, resource_minimum_membership_level, resource_status, occurred_at)
      SELECT gen_random_uuid(), gen_random_uuid(), $1, $2, 'PASSENGER-ONE', 'GOLD', 'FITNESS-ONE', 'Fitness One', 'FITNESS', 'GOLD', 'ACTIVE', CURRENT_TIMESTAMP - (random() * interval '30 days')
      FROM generate_series(1, 5000)`, [passenger.id, resource.id]);
    const [plan] = await dataSource.query(`EXPLAIN (ANALYZE, FORMAT JSON)
      SELECT passenger_membership_level, COUNT(*) FROM "${testSchema}".resource_usages
      WHERE occurred_at >= CURRENT_TIMESTAMP - interval '30 days' AND occurred_at < CURRENT_TIMESTAMP
      GROUP BY passenger_membership_level`);
    expect(Number(plan['QUERY PLAN'][0]['Execution Time'])).toBeLessThan(1000);
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
