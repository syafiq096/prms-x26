import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { HealthResolver } from '../src/health/health.resolver';

describe('health GraphQL boundary', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true,
        }),
      ],
      providers: [
        HealthResolver,
        { provide: DataSource, useValue: { isInitialized: true } },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves health through the GraphQL HTTP endpoint', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: '{ health { status database } }' })
      .expect(200);

    expect(response.body).toEqual({
      data: { health: { status: 'ok', database: 'up' } },
    });
  });
});
