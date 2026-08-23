import { validateEnvironment } from './environment';

const validEnvironment = {
  NODE_ENV: 'development',
  API_PORT: '3000',
  DATABASE_HOST: 'localhost',
  DATABASE_PORT: '5432',
  DATABASE_NAME: 'prms',
  DATABASE_SCHEMA: 'public',
  DATABASE_USER: 'prms_app',
  DATABASE_PASSWORD: 'local-password',
  MIGRATION_DATABASE_USER: 'prms_owner',
  MIGRATION_DATABASE_PASSWORD: 'migration-password',
  PRMS_SETUP_SECRET: 'setup',
  ALLOW_INSECURE_ACTOR_HEADER: 'false',
  VITE_GRAPHQL_URL: 'http://localhost:3000/graphql',
};

describe('API environment', () => {
  it('normalizes a complete valid environment', () => {
    expect(validateEnvironment(validEnvironment)).toMatchObject({
      NODE_ENV: 'development',
      API_PORT: 3000,
      DATABASE_PORT: 5432,
      ALLOW_INSECURE_ACTOR_HEADER: false,
    });
  });

  it('rejects missing database configuration', () => {
    const environment = Object.fromEntries(
      Object.entries(validEnvironment).filter(([key]) => key !== 'DATABASE_HOST'),
    );

    expect(() => validateEnvironment(environment)).toThrow('DATABASE_HOST');
  });

  it('rejects the insecure actor header in production', () => {
    expect(() =>
      validateEnvironment({
        ...validEnvironment,
        NODE_ENV: 'production',
        ALLOW_INSECURE_ACTOR_HEADER: 'true',
      }),
    ).toThrow('ALLOW_INSECURE_ACTOR_HEADER');
  });

  it('reports invalid fields without exposing configured values', () => {
    const sensitiveValue = 'do-not-print-this-secret';

    try {
      validateEnvironment({
        ...validEnvironment,
        PRMS_SETUP_SECRET: sensitiveValue,
        VITE_GRAPHQL_URL: 'not-a-url',
      });
      throw new Error('Expected validation to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('VITE_GRAPHQL_URL');
      expect((error as Error).message).not.toContain(sensitiveValue);
    }
  });
});
