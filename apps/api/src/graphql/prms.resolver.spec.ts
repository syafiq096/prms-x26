import { QueryFailedError } from 'typeorm';
import { mapGraphqlException } from './prms.resolver';

describe('mapGraphqlException', () => {
  it('identifies a runtime database permission failure without exposing database details', () => {
    const exception = new QueryFailedError('SELECT * FROM application_settings', [], {
      code: '42501',
      message: 'permission denied for table application_settings',
    } as Error & { code: string });

    expect(mapGraphqlException(exception)).toMatchObject({
      code: 'DATABASE_ACCESS_ERROR',
      message: 'PRMS cannot access its database. Grant the runtime database role access after migrations, then retry.',
    });
  });

  it('continues to identify other database constraint failures as conflicts', () => {
    const exception = new QueryFailedError('INSERT INTO crew_leads', [], {
      code: '23505',
      message: 'duplicate key value violates unique constraint',
    } as Error & { code: string });

    expect(mapGraphqlException(exception)).toMatchObject({
      code: 'CONFLICT',
      message: 'A record with those values already exists',
    });
  });
});
