export const migrationVerificationSchema = 'prms_migration_verify';

export interface MigrationVerificationTarget {
  NODE_ENV?: string;
  DATABASE_SCHEMA?: string;
}

export function assertMigrationVerificationSafety(
  target: MigrationVerificationTarget,
  applicationSchema: string,
): void {
  if (
    target.NODE_ENV !== 'test' ||
    target.DATABASE_SCHEMA !== migrationVerificationSchema ||
    applicationSchema === migrationVerificationSchema
  ) {
    throw new Error(
      `Refusing migration verification: NODE_ENV must be test, DATABASE_SCHEMA must be ${migrationVerificationSchema}, and the application schema must differ`,
    );
  }
}
