import { Column, Entity, PrimaryColumn } from 'typeorm';

export enum AuditActorType {
  SYSTEM = 'SYSTEM',
  CREW_LEAD = 'CREW_LEAD',
  PASSENGER = 'PASSENGER',
}

@Entity({ name: 'audit_events' })
export class AuditEventEntity {
  @PrimaryColumn('uuid', { default: () => 'gen_random_uuid()' }) id!: string;
  @Column({ name: 'event_type', type: 'varchar', length: 80 })
  eventType!: string;
  @Column({ type: 'varchar', length: 32 }) result!: string;
  @Column({ name: 'reason_code', type: 'varchar', length: 80, nullable: true })
  reasonCode!: string | null;
  @Column({
    name: 'actor_type',
    type: 'enum',
    enum: AuditActorType,
    enumName: 'audit_actor_type',
  })
  actorType!: AuditActorType;
  @Column({ name: 'crew_lead_actor_id', type: 'uuid', nullable: true })
  crewLeadActorId!: string | null;
  @Column({ name: 'passenger_actor_id', type: 'uuid', nullable: true })
  passengerActorId!: string | null;
  @Column({ name: 'crew_lead_subject_id', type: 'uuid', nullable: true })
  crewLeadSubjectId!: string | null;
  @Column({ name: 'passenger_subject_id', type: 'uuid', nullable: true })
  passengerSubjectId!: string | null;
  @Column({ name: 'resource_subject_id', type: 'uuid', nullable: true })
  resourceSubjectId!: string | null;
  @Column({ name: 'resource_usage_subject_id', type: 'uuid', nullable: true })
  resourceUsageSubjectId!: string | null;
  @Column({
    name: 'application_setting_subject_key',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  applicationSettingSubjectKey!: string | null;
  @Column({ name: 'contextual_resource_id', type: 'uuid', nullable: true })
  contextualResourceId!: string | null;
  @Column({
    name: 'resource_usage_id',
    type: 'uuid',
    nullable: true,
    unique: true,
  })
  resourceUsageId!: string | null;
  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" }) metadata!: Record<
    string,
    unknown
  >;
  @Column({
    name: 'occurred_at',
    type: 'timestamptz',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP',
  })
  occurredAt!: Date;
}
