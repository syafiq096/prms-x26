import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { CrewLeadsService } from '../src/application/crew-leads/crew-leads.service';
import { PassengersService } from '../src/application/passengers/passengers.service';
import { ResourcesService } from '../src/application/resources/resources.service';
import { SystemSetupService } from '../src/application/system/system-setup.service';
import { CrewLeadQueryService } from '../src/application/crew-leads/crew-lead-query.service';
import { PassengerQueryService } from '../src/application/passengers/passenger-query.service';
import { ResourceDiscoveryService } from '../src/application/resources/resource-discovery.service';
import { ResourceQueryService } from '../src/application/resources/resource-query.service';
import { ResourceUsageService } from '../src/application/usage/resource-usage.service';
import { AuditEventQueryService } from '../src/application/audit/audit-event-query.service';
import { SystemStatusQueryService } from '../src/application/system/system-status-query.service';
import { ReportingService } from '../src/application/reporting/reporting.service';
import { PrmsResolver } from '../src/graphql/prms.resolver';
import { ActorContextService } from '../src/graphql/actor-context.service';
import { ConfigService } from '@nestjs/config';

describe('Phase 2 GraphQL schema', () => {
  let app: INestApplication;

  beforeAll(async () => {
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
        { provide: SystemStatusQueryService, useValue: { state: jest.fn().mockResolvedValue('UNINITIALIZED') } },
        { provide: CrewLeadQueryService, useValue: {} },
        { provide: PassengerQueryService, useValue: {} },
        { provide: ResourceQueryService, useValue: {} },
        { provide: ResourceDiscoveryService, useValue: {} },
        { provide: ResourceUsageService, useValue: {} },
        { provide: AuditEventQueryService, useValue: {} },
        { provide: ReportingService, useValue: {} },
        { provide: ActorContextService, useValue: {} },
        { provide: SystemSetupService, useValue: {} },
        { provide: CrewLeadsService, useValue: {} },
        { provide: PassengersService, useValue: {} },
        { provide: ResourcesService, useValue: {} },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(true) } },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => app.close());

  it('publishes the approved public system-status query', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: '{ systemStatus { state } }' })
      .expect(200);

    expect(response.body).toEqual({ data: { systemStatus: { state: 'UNINITIALIZED' } } });
  });
});
