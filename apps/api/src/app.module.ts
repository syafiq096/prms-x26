import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import {
  EnvironmentVariables,
  validateEnvironment,
} from './config/environment';
import { rootEnvironmentPath } from './config/workspace-paths';
import { createDatabaseOptions } from './database/database-options';
import { PrmsDomainModule } from './application/prms-domain.module';
import { PrmsGraphqlModule } from './graphql/prms-graphql.module';
import { dirname, join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: rootEnvironmentPath,
      validate: validateEnvironment,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(dirname(rootEnvironmentPath), 'apps', 'api', 'schema.gql'),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      context: ({ req }: { req: unknown }) => ({ req }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) =>
        createDatabaseOptions(config),
    }),
    HealthModule,
    PrmsDomainModule,
    PrmsGraphqlModule,
  ],
})
export class AppModule {}
