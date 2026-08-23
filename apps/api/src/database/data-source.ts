import { config as loadEnvironment } from 'dotenv';
import { DataSource } from 'typeorm';
import { validateEnvironment } from '../config/environment';
import { rootEnvironmentPath } from '../config/workspace-paths';

loadEnvironment({ path: rootEnvironmentPath });
const environment = validateEnvironment(process.env);

export default new DataSource({
  type: 'postgres',
  host: environment.DATABASE_HOST,
  port: environment.DATABASE_PORT,
  username: environment.MIGRATION_DATABASE_USER,
  password: environment.MIGRATION_DATABASE_PASSWORD,
  database: environment.DATABASE_NAME,
  schema: environment.DATABASE_SCHEMA,
  entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
  migrationsTableName: 'typeorm_migrations',
  migrationsTransactionMode: 'all',
  synchronize: false,
});
