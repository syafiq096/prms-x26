import Joi from 'joi';

export type NodeEnvironment = 'development' | 'test' | 'production';

export interface EnvironmentVariables {
  NODE_ENV: NodeEnvironment;
  API_PORT: number;
  DATABASE_HOST: string;
  DATABASE_PORT: number;
  DATABASE_NAME: string;
  DATABASE_SCHEMA: string;
  DATABASE_USER: string;
  DATABASE_PASSWORD: string;
  MIGRATION_DATABASE_USER: string;
  MIGRATION_DATABASE_PASSWORD: string;
  PRMS_SETUP_SECRET: string;
  CLERK_SECRET_KEY: string;
  CLERK_AUTHORIZED_PARTIES: string;
  VITE_GRAPHQL_URL: string;
}

const schema = Joi.object<EnvironmentVariables>({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').required(),
  API_PORT: Joi.number().port().required(),
  DATABASE_HOST: Joi.string().trim().min(1).required(),
  DATABASE_PORT: Joi.number().port().required(),
  DATABASE_NAME: Joi.string().trim().min(1).required(),
  DATABASE_SCHEMA: Joi.string().trim().min(1).required(),
  DATABASE_USER: Joi.string().trim().min(1).required(),
  DATABASE_PASSWORD: Joi.string().min(1).required(),
  MIGRATION_DATABASE_USER: Joi.string().trim().min(1).required(),
  MIGRATION_DATABASE_PASSWORD: Joi.string().min(1).required(),
  PRMS_SETUP_SECRET: Joi.string().min(1).required(),
  CLERK_SECRET_KEY: Joi.string().trim().min(1).when('NODE_ENV', { is: 'test', then: Joi.optional().default('sk_test_fixture'), otherwise: Joi.required() }),
  CLERK_AUTHORIZED_PARTIES: Joi.string().trim().min(1).when('NODE_ENV', { is: 'test', then: Joi.optional().default('http://localhost:5173'), otherwise: Joi.required() }),
  VITE_GRAPHQL_URL: Joi.string().uri({ scheme: ['http', 'https'] }).required(),
}).unknown(true);

export function validateEnvironment(
  input: Record<string, unknown>,
): EnvironmentVariables {
  const { error, value } = schema.validate(input, {
    abortEarly: false,
    convert: true,
  });

  if (error) {
    const fields = error.details.map((detail) => detail.path.join('.')).join(', ');
    throw new Error(`Invalid environment configuration: ${fields}`);
  }

  const environment = value as EnvironmentVariables;
  return environment;
}
