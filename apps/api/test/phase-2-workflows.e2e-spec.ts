import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigService } from '@nestjs/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import { config as loadEnvironment } from 'dotenv';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AuditWriterService } from '../src/application/audit/audit-writer.service';
import { AuditEventQueryService } from '../src/application/audit/audit-event-query.service';
import { CrewLeadQueryService } from '../src/application/crew-leads/crew-lead-query.service';
import { CrewLeadsService } from '../src/application/crew-leads/crew-leads.service';
import { PassengerQueryService } from '../src/application/passengers/passenger-query.service';
import { PassengersService } from '../src/application/passengers/passengers.service';
import { ResourceDiscoveryService } from '../src/application/resources/resource-discovery.service';
import { ResourceQueryService } from '../src/application/resources/resource-query.service';
import { ResourcesService } from '../src/application/resources/resources.service';
import { SystemSetupService } from '../src/application/system/system-setup.service';
import { SystemStatusQueryService } from '../src/application/system/system-status-query.service';
import { ResourceUsageService } from '../src/application/usage/resource-usage.service';
import { ReportingService } from '../src/application/reporting/reporting.service';
import { EnvironmentVariables, validateEnvironment } from '../src/config/environment';
import { rootEnvironmentPath } from '../src/config/workspace-paths';
import {
  ApplicationSettingEntity,
  AuditEventEntity,
  CrewLeadEntity,
  PassengerEntity,
  ResourceEntity,
  ResourceUsageEntity,
} from '../src/database/entities';
import { InitialDomain1724284800000 } from '../src/database/migrations/1724284800000-InitialDomain';
import { AddDeniedInteractionSnapshots1724630400000 } from '../src/database/migrations/1724630400000-AddDeniedInteractionSnapshots';
import { ActorContextService } from '../src/graphql/actor-context.service';
import { PrmsResolver } from '../src/graphql/prms.resolver';

loadEnvironment({ path: rootEnvironmentPath });

describe('Phase 2 GraphQL workflows', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let environment: EnvironmentVariables;
  let leadId: string;
  let passengerId: string;
  let resourceId: string;

  beforeAll(async () => {
    environment = validateEnvironment({
      ...process.env,
      NODE_ENV: 'test',
      DATABASE_SCHEMA: 'prms_test',
      CLERK_SECRET_KEY: 'sk_test_e2e',
      CLERK_AUTHORIZED_PARTIES: 'http://localhost:5173',
    });
    dataSource = new DataSource({
      type: 'postgres',
      host: environment.DATABASE_HOST,
      port: environment.DATABASE_PORT,
      username: environment.MIGRATION_DATABASE_USER,
      password: environment.MIGRATION_DATABASE_PASSWORD,
      database: environment.DATABASE_NAME,
      schema: 'prms_test',
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
    await dataSource.query('DROP SCHEMA IF EXISTS "prms_test" CASCADE');
    await dataSource.query('CREATE SCHEMA "prms_test"');
    await dataSource.runMigrations({ transaction: 'all' });

    const moduleRef = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true,
          context: ({ req }: { req: unknown }) => ({ req }),
        }),
      ],
      providers: [
        PrmsResolver,
        ActorContextService,
        AuditWriterService,
        AuditEventQueryService,
        SystemSetupService,
        SystemStatusQueryService,
        CrewLeadsService,
        CrewLeadQueryService,
        PassengersService,
        PassengerQueryService,
        ResourcesService,
        ResourceQueryService,
        ResourceDiscoveryService,
        ResourceUsageService,
        ReportingService,
        { provide: DataSource, useValue: dataSource },
        { provide: ConfigService, useValue: new ConfigService(environment) },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await dataSource.destroy();
  });

  it('enforces the core Level 1 journey through GraphQL', async () => {
    const initialized = await execute(
      `mutation { initializeSystem(profiles: [
        { missionCode: "LEAD-ONE", fullName: "Lead One" }
        { missionCode: "LEAD-TWO", fullName: "Lead Two" }
        { missionCode: "LEAD-THREE", fullName: "Lead Three" }
      ]) { crewLeads { id missionCode } systemStatus { state } } }`,
      { 'x-setup-secret': environment.PRMS_SETUP_SECRET },
    );
    expect(initialized.body.data.initializeSystem.systemStatus.state).toBe(
      'OPERATIONAL',
    );
    leadId = initialized.body.data.initializeSystem.crewLeads[0].id;

    const passenger = await execute(
      `mutation { createPassenger(input: { missionCode: "PASSENGER-ONE", fullName: "Passenger One", membershipLevel: GOLD }) { passenger { id version membershipLevel } } }`,
      actorHeaders(),
    );
    expect(passenger.body.errors).toBeUndefined();
    passengerId = passenger.body.data.createPassenger.passenger.id;
    expect(passenger.body.data.createPassenger.passenger.membershipLevel).toBe(
      'GOLD',
    );

    const silverResource = await execute(
      `mutation { provisionResource(input: { code: "SILVER-RESOURCE", displayName: "Silver Resource", category: FOOD, minimumMembershipLevel: SILVER }) { resource { id } } }`,
      actorHeaders(),
    );
    resourceId = silverResource.body.data.provisionResource.resource.id;
    await execute(
      `mutation { provisionResource(input: { code: "PLATINUM-RESOURCE", displayName: "Platinum Resource", category: MEDICAL, minimumMembershipLevel: PLATINUM }) { resource { id } } }`,
      actorHeaders(),
    );

    const listed = await execute(
      `{ passengers(page: { first: 1 }) { totalCount edges { cursor node { missionCode } } pageInfo { hasNextPage } } }`,
      actorHeaders(),
    );
    expect(listed.body.data.passengers.totalCount).toBe(1);
    expect(listed.body.data.passengers.edges[0].node.missionCode).toBe(
      'PASSENGER-ONE',
    );

    const discovered = await execute(
      `{ discoverResources(page: { first: 25 }) { edges { node { code hasMembershipAccess canUseNow } } } }`,
      { 'x-passenger-id': passengerId },
    );
    expect(discovered.body.data.discoverResources.edges).toEqual([
      {
        node: {
          code: 'SILVER-RESOURCE',
          hasMembershipAccess: true,
          canUseNow: true,
        },
      },
    ]);

    const stale = await execute(
      `mutation { updatePassenger(input: { id: "${passengerId}", fullName: "Updated Passenger", expectedVersion: 99 }) { passenger { id } } }`,
      actorHeaders(),
    );
    expect(stale.body.errors[0].extensions).toMatchObject({
      code: 'VERSION_CONFLICT',
      statusCode: 409,
      details: { expectedVersion: 99, currentVersion: 1 },
    });
  });

  it('records Passenger resource use and exposes Crew Lead audit activity', async () => {
    const used = await execute(
      `mutation { useResource(input: { resourceId: "${resourceId}", idempotencyKey: "60000000-0000-4000-8000-000000000001" }) { allowed denialReason usage { id resourceCode } } }`,
      { 'x-passenger-id': passengerId },
    );
    expect(used.body.data.useResource).toMatchObject({ allowed: true, denialReason: null, usage: { resourceCode: 'SILVER-RESOURCE' } });

    const from = new Date(Date.now() - 86_400_000).toISOString();
    const to = new Date(Date.now() + 86_400_000).toISOString();
    const history = await execute(
      `{ myUsageHistory(window: { from: "${from}", to: "${to}" }) { totalCount edges { node { outcome resourceCode passengerMembershipLevel } } } }`,
      { 'x-passenger-id': passengerId },
    );
    expect(history.body.data.myUsageHistory).toMatchObject({ totalCount: 1, edges: [{ node: { outcome: 'ALLOWED', resourceCode: 'SILVER-RESOURCE', passengerMembershipLevel: 'GOLD' } }] });

    const report = await execute(
      `{ usageReportSummary(window: { from: "${from}", to: "${to}" }) { allowedCount deniedCount totalAttempts denialRate } }`,
      actorHeaders(),
    );
    expect(report.body.data.usageReportSummary).toEqual({ allowedCount: 1, deniedCount: 0, totalAttempts: 1, denialRate: 0 });

    const forbiddenReport = await execute(
      `{ usageReportSummary(window: { from: "${from}", to: "${to}" }) { totalAttempts } }`,
      { 'x-passenger-id': passengerId },
    );
    expect(forbiddenReport.body.errors[0].extensions.code).toBe('FORBIDDEN');

    const audit = await execute(
      `{ auditEvents(page: { first: 25 }) { totalCount edges { node { eventType result actorType } } } }`,
      actorHeaders(),
    );
    expect(audit.body.data.auditEvents.edges).toEqual(expect.arrayContaining([
      { node: { eventType: 'RESOURCE_USED', result: 'ALLOWED', actorType: 'PASSENGER' } },
    ]));

    const forbidden = await execute(
      `{ auditEvents(page: { first: 25 }) { totalCount } }`,
      { 'x-passenger-id': passengerId },
    );
    expect(forbidden.body.errors[0].extensions.code).toBe('FORBIDDEN');
  });

  function actorHeaders(): Record<string, string> {
    return { 'x-actor-id': leadId };
  }

  function execute(query: string, headers: Record<string, string>) {
    return request(app.getHttpServer()).post('/graphql').set(headers).send({ query });
  }
});
