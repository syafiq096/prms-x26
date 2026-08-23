import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialDomain1724284800000 implements MigrationInterface {
  name = 'InitialDomain1724284800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = this.schemaIdentifier(queryRunner);
    await queryRunner.query(`SET LOCAL search_path TO ${schema}`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
    await queryRunner.query(
      `CREATE TYPE ${schema}.membership_level AS ENUM ('SILVER', 'GOLD', 'PLATINUM')`,
    );
    await queryRunner.query(
      `CREATE TYPE ${schema}.application_setting_key AS ENUM ('SYSTEM_STATE')`,
    );
    await queryRunner.query(
      `CREATE TYPE ${schema}.resource_category AS ENUM ('SLEEPING', 'FOOD', 'OXYGEN', 'MEDICAL', 'HYGIENE', 'FITNESS', 'RECREATION')`,
    );
    await queryRunner.query(
      `CREATE TYPE ${schema}.resource_status AS ENUM ('ACTIVE', 'OUT_OF_SERVICE', 'DECOMMISSIONED')`,
    );
    await queryRunner.query(
      `CREATE TYPE ${schema}.audit_actor_type AS ENUM ('SYSTEM', 'CREW_LEAD', 'PASSENGER')`,
    );

    await queryRunner.query(`
      CREATE TABLE application_settings (
        key application_setting_key PRIMARY KEY,
        text_value text NULL,
        version integer NOT NULL DEFAULT 1,
        created_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT application_settings_system_state_check CHECK (
          key <> 'SYSTEM_STATE' OR text_value IN ('UNINITIALIZED', 'OPERATIONAL')
        )
      )
    `);
    await queryRunner.query(
      `INSERT INTO application_settings (key, text_value) VALUES ('SYSTEM_STATE', 'UNINITIALIZED')`,
    );

    await queryRunner.query(`
      CREATE TABLE crew_leads (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        mission_code varchar(32) NOT NULL UNIQUE,
        full_name varchar(120) NOT NULL,
        email varchar(320) NULL,
        active boolean NOT NULL DEFAULT true,
        replaces_crew_lead_id uuid NULL,
        deactivation_reason varchar(500) NULL,
        deactivated_at timestamptz(3) NULL,
        version integer NOT NULL DEFAULT 1,
        created_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT crew_leads_code_check CHECK (mission_code ~ '^[A-Z0-9]+(?:-[A-Z0-9]+)*$'),
        CONSTRAINT crew_leads_name_check CHECK (full_name = btrim(full_name) AND char_length(full_name) BETWEEN 1 AND 120),
        CONSTRAINT crew_leads_email_check CHECK (email IS NULL OR email = lower(email)),
        CONSTRAINT crew_leads_terminal_check CHECK (
          (active AND deactivated_at IS NULL AND deactivation_reason IS NULL) OR
          (NOT active AND deactivated_at IS NOT NULL AND deactivation_reason IS NOT NULL)
        ),
        CONSTRAINT crew_leads_replacement_fk FOREIGN KEY (replaces_crew_lead_id) REFERENCES crew_leads(id) ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX crew_leads_active_email_unique ON crew_leads (email) WHERE active AND email IS NOT NULL`,
    );

    await queryRunner.query(`
      CREATE TABLE passengers (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        mission_code varchar(32) NOT NULL UNIQUE,
        full_name varchar(120) NOT NULL,
        email varchar(320) NULL,
        cabin_code varchar(32) NULL,
        membership_level membership_level NOT NULL DEFAULT 'SILVER',
        active boolean NOT NULL DEFAULT true,
        deactivation_reason varchar(500) NULL,
        deactivated_at timestamptz(3) NULL,
        version integer NOT NULL DEFAULT 1,
        created_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT passengers_code_check CHECK (mission_code ~ '^[A-Z0-9]+(?:-[A-Z0-9]+)*$'),
        CONSTRAINT passengers_name_check CHECK (full_name = btrim(full_name) AND char_length(full_name) BETWEEN 1 AND 120),
        CONSTRAINT passengers_email_check CHECK (email IS NULL OR email = lower(email)),
        CONSTRAINT passengers_cabin_check CHECK (cabin_code IS NULL OR cabin_code ~ '^[A-Z0-9]+(?:-[A-Z0-9]+)*$'),
        CONSTRAINT passengers_terminal_check CHECK (
          (active AND deactivated_at IS NULL AND deactivation_reason IS NULL) OR
          (NOT active AND deactivated_at IS NOT NULL AND deactivation_reason IS NOT NULL)
        )
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX passengers_active_email_unique ON passengers (email) WHERE active AND email IS NOT NULL`,
    );

    await queryRunner.query(`
      CREATE TABLE resources (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar(32) NOT NULL UNIQUE,
        display_name varchar(120) NOT NULL,
        category resource_category NOT NULL,
        minimum_membership_level membership_level NOT NULL DEFAULT 'SILVER',
        status resource_status NOT NULL DEFAULT 'ACTIVE',
        status_change_reason varchar(500) NULL,
        decommissioned_at timestamptz(3) NULL,
        version integer NOT NULL DEFAULT 1,
        created_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT resources_code_check CHECK (code ~ '^[A-Z0-9]+(?:-[A-Z0-9]+)*$'),
        CONSTRAINT resources_name_check CHECK (display_name = btrim(display_name) AND char_length(display_name) BETWEEN 1 AND 120),
        CONSTRAINT resources_state_check CHECK (
          (status = 'DECOMMISSIONED' AND decommissioned_at IS NOT NULL AND status_change_reason IS NOT NULL) OR
          (status <> 'DECOMMISSIONED' AND decommissioned_at IS NULL)
        )
      )
    `);

    await queryRunner.query(`
      CREATE TABLE resource_usages (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        idempotency_key uuid NOT NULL UNIQUE,
        passenger_id uuid NOT NULL REFERENCES passengers(id) ON DELETE RESTRICT,
        resource_id uuid NOT NULL REFERENCES resources(id) ON DELETE RESTRICT,
        passenger_mission_code varchar(32) NOT NULL,
        passenger_membership_level membership_level NOT NULL,
        resource_code varchar(32) NOT NULL,
        resource_display_name varchar(120) NOT NULL,
        resource_category resource_category NOT NULL,
        resource_minimum_membership_level membership_level NOT NULL,
        resource_status resource_status NOT NULL,
        occurred_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE audit_events (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        event_type varchar(80) NOT NULL,
        result varchar(32) NOT NULL,
        reason_code varchar(80) NULL,
        actor_type audit_actor_type NOT NULL,
        crew_lead_actor_id uuid NULL REFERENCES crew_leads(id) ON DELETE RESTRICT,
        passenger_actor_id uuid NULL REFERENCES passengers(id) ON DELETE RESTRICT,
        crew_lead_subject_id uuid NULL REFERENCES crew_leads(id) ON DELETE RESTRICT,
        passenger_subject_id uuid NULL REFERENCES passengers(id) ON DELETE RESTRICT,
        resource_subject_id uuid NULL REFERENCES resources(id) ON DELETE RESTRICT,
        resource_usage_subject_id uuid NULL REFERENCES resource_usages(id) ON DELETE RESTRICT,
        application_setting_subject_key application_setting_key NULL REFERENCES application_settings(key) ON DELETE RESTRICT,
        contextual_resource_id uuid NULL REFERENCES resources(id) ON DELETE RESTRICT,
        resource_usage_id uuid NULL UNIQUE REFERENCES resource_usages(id) ON DELETE RESTRICT,
        metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
        occurred_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT audit_events_actor_check CHECK (
          (actor_type = 'SYSTEM' AND crew_lead_actor_id IS NULL AND passenger_actor_id IS NULL) OR
          (actor_type = 'CREW_LEAD' AND crew_lead_actor_id IS NOT NULL AND passenger_actor_id IS NULL) OR
          (actor_type = 'PASSENGER' AND passenger_actor_id IS NOT NULL AND crew_lead_actor_id IS NULL)
        ),
        CONSTRAINT audit_events_subject_check CHECK (
          num_nonnulls(crew_lead_subject_id, passenger_subject_id, resource_subject_id, resource_usage_subject_id, application_setting_subject_key) = 1
        )
      )
    `);

    await queryRunner.query(
      `CREATE INDEX resources_discovery_idx ON resources (status, category, minimum_membership_level, code)`,
    );
    await queryRunner.query(
      `CREATE INDEX resource_usages_occurred_at_idx ON resource_usages (occurred_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX resource_usages_passenger_idx ON resource_usages (passenger_id, occurred_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX resource_usages_resource_idx ON resource_usages (resource_id, occurred_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX audit_events_occurred_at_idx ON audit_events (occurred_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX audit_events_actor_idx ON audit_events (actor_type, crew_lead_actor_id, passenger_actor_id, occurred_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX audit_events_event_type_idx ON audit_events (event_type, occurred_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX audit_events_subject_idx ON audit_events (passenger_subject_id, resource_subject_id, occurred_at DESC)`,
    );

    await queryRunner.query(`
      CREATE FUNCTION reject_immutable_history_change() RETURNS trigger AS $$
      BEGIN RAISE EXCEPTION 'append-only history cannot be updated or deleted'; END;
      $$ LANGUAGE plpgsql
    `);
    await queryRunner.query(
      `CREATE TRIGGER resource_usages_append_only BEFORE UPDATE OR DELETE ON resource_usages FOR EACH ROW EXECUTE FUNCTION reject_immutable_history_change()`,
    );
    await queryRunner.query(
      `CREATE TRIGGER audit_events_append_only BEFORE UPDATE OR DELETE ON audit_events FOR EACH ROW EXECUTE FUNCTION reject_immutable_history_change()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = this.schemaIdentifier(queryRunner);
    await queryRunner.query(`SET LOCAL search_path TO ${schema}`);
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS audit_events_append_only ON audit_events`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS resource_usages_append_only ON resource_usages`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS reject_immutable_history_change()`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS audit_events`);
    await queryRunner.query(`DROP TABLE IF EXISTS resource_usages`);
    await queryRunner.query(`DROP TABLE IF EXISTS resources`);
    await queryRunner.query(`DROP TABLE IF EXISTS passengers`);
    await queryRunner.query(`DROP TABLE IF EXISTS crew_leads`);
    await queryRunner.query(`DROP TABLE IF EXISTS application_settings`);
    await queryRunner.query(`DROP TYPE IF EXISTS ${schema}.audit_actor_type`);
    await queryRunner.query(`DROP TYPE IF EXISTS ${schema}.resource_status`);
    await queryRunner.query(`DROP TYPE IF EXISTS ${schema}.resource_category`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS ${schema}.application_setting_key`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS ${schema}.membership_level`);
  }

  private schemaIdentifier(queryRunner: QueryRunner): string {
    const configuredSchema = (
      queryRunner.connection.options as { schema?: unknown }
    ).schema;
    const schema =
      typeof configuredSchema === 'string' && configuredSchema.length > 0
        ? configuredSchema
        : 'public';
    return `"${schema.replaceAll('"', '""')}"`;
  }
}
