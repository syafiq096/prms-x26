import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActorIdentities1724544000000 implements MigrationInterface {
  name = 'AddActorIdentities1724544000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema =
      (queryRunner.connection.options as { schema?: string }).schema ??
      'public';
    const tablePath = `${schema}.actor_identities`;
    if (await queryRunner.hasTable(tablePath)) {
      const table = await queryRunner.getTable(tablePath);
      const expectedColumns = [
        'clerk_subject',
        'crew_lead_id',
        'passenger_id',
        'created_at',
      ];
      const actualColumns = table?.columns.map((column) => column.name).sort();
      const hasExpectedColumns =
        JSON.stringify(actualColumns) ===
        JSON.stringify([...expectedColumns].sort());
      const clerkSubject = table?.findColumnByName('clerk_subject');
      const crewLeadId = table?.findColumnByName('crew_lead_id');
      const passengerId = table?.findColumnByName('passenger_id');
      const createdAt = table?.findColumnByName('created_at');
      const foreignColumns = new Set(
        table?.foreignKeys.flatMap((key) => key.columnNames) ?? [],
      );
      const uniqueColumns = new Set(
        table?.uniques.flatMap((unique) => unique.columnNames) ?? [],
      );
      const hasExpectedShape =
        hasExpectedColumns &&
        clerkSubject?.isPrimary === true &&
        clerkSubject.isNullable === false &&
        clerkSubject.length === '128' &&
        crewLeadId?.isNullable === true &&
        passengerId?.isNullable === true &&
        createdAt?.isNullable === false &&
        foreignColumns.has('crew_lead_id') &&
        foreignColumns.has('passenger_id') &&
        uniqueColumns.has('crew_lead_id') &&
        uniqueColumns.has('passenger_id') &&
        table?.checks.some(
          (check) => check.name === 'actor_identities_exactly_one_actor_check',
        );
      if (!hasExpectedShape)
        throw new Error(
          `Existing ${tablePath} does not match the expected actor identity schema`,
        );
      return;
    }
    await queryRunner.query(`
      CREATE TABLE "${schema}".actor_identities (
        clerk_subject varchar(128) PRIMARY KEY,
        crew_lead_id uuid NULL UNIQUE REFERENCES "${schema}".crew_leads(id) ON DELETE RESTRICT,
        passenger_id uuid NULL UNIQUE REFERENCES "${schema}".passengers(id) ON DELETE RESTRICT,
        created_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT actor_identities_exactly_one_actor_check
          CHECK (num_nonnulls(crew_lead_id, passenger_id) = 1)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema =
      (queryRunner.connection.options as { schema?: string }).schema ??
      'public';
    await queryRunner.query(`DROP TABLE "${schema}".actor_identities`);
  }
}
