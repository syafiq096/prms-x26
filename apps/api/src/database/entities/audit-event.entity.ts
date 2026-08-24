import { Column, Entity, PrimaryColumn } from 'typeorm';
import { MembershipLevel, ResourceStatus } from '../../domain/access-policy';
import { ResourceCategory } from './resource.entity';

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
  @Column({ name: 'passenger_mission_code_snapshot', type: 'varchar', length: 32, nullable: true })
  passengerMissionCodeSnapshot!: string | null;
  @Column({ name: 'passenger_membership_level_snapshot', type: 'enum', enum: MembershipLevel, enumName: 'membership_level', nullable: true })
  passengerMembershipLevelSnapshot!: MembershipLevel | null;
  @Column({ name: 'resource_code_snapshot', type: 'varchar', length: 32, nullable: true })
  resourceCodeSnapshot!: string | null;
  @Column({ name: 'resource_display_name_snapshot', type: 'varchar', length: 120, nullable: true })
  resourceDisplayNameSnapshot!: string | null;
  @Column({ name: 'resource_category_snapshot', type: 'enum', enum: ResourceCategory, enumName: 'resource_category', nullable: true })
  resourceCategorySnapshot!: ResourceCategory | null;
  @Column({ name: 'resource_minimum_membership_level_snapshot', type: 'enum', enum: MembershipLevel, enumName: 'membership_level', nullable: true })
  resourceMinimumMembershipLevelSnapshot!: MembershipLevel | null;
  @Column({ name: 'resource_status_snapshot', type: 'enum', enum: ['ACTIVE', 'OUT_OF_SERVICE', 'DECOMMISSIONED'], enumName: 'resource_status', nullable: true })
  resourceStatusSnapshot!: ResourceStatus | null;
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
