import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeniedInteractionSnapshots1724630400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = (queryRunner.connection.options as { schema?: string }).schema ?? 'public';
    await queryRunner.query(`ALTER TABLE "${schema}".audit_events
      ADD COLUMN passenger_mission_code_snapshot varchar(32),
      ADD COLUMN passenger_membership_level_snapshot "${schema}".membership_level,
      ADD COLUMN resource_code_snapshot varchar(32),
      ADD COLUMN resource_display_name_snapshot varchar(120),
      ADD COLUMN resource_category_snapshot "${schema}".resource_category,
      ADD COLUMN resource_minimum_membership_level_snapshot "${schema}".membership_level,
      ADD COLUMN resource_status_snapshot "${schema}".resource_status`);
    await queryRunner.query(`CREATE INDEX audit_events_passenger_interaction_idx ON "${schema}".audit_events (passenger_actor_id, occurred_at DESC, id) WHERE event_type = 'RESOURCE_ACCESS_DENIED'`);
    await queryRunner.query(`CREATE INDEX audit_events_denied_reporting_idx ON "${schema}".audit_events (occurred_at DESC, passenger_membership_level_snapshot, resource_category_snapshot) WHERE event_type = 'RESOURCE_ACCESS_DENIED'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = (queryRunner.connection.options as { schema?: string }).schema ?? 'public';
    await queryRunner.query(`DROP INDEX "${schema}".audit_events_denied_reporting_idx`);
    await queryRunner.query(`DROP INDEX "${schema}".audit_events_passenger_interaction_idx`);
    await queryRunner.query(`ALTER TABLE "${schema}".audit_events
      DROP COLUMN resource_status_snapshot,
      DROP COLUMN resource_minimum_membership_level_snapshot,
      DROP COLUMN resource_category_snapshot,
      DROP COLUMN resource_display_name_snapshot,
      DROP COLUMN resource_code_snapshot,
      DROP COLUMN passenger_membership_level_snapshot,
      DROP COLUMN passenger_mission_code_snapshot`);
  }
}
