import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: '../api/schema.gql',
  documents: ['src/**/*.graphql'],
  generates: { './src/generated/': { preset: 'client', plugins: [] } },
};

export default config;
