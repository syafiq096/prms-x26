import { MembershipLevel, ResourceStatus } from '../../domain/access-policy';
import { ResourceCategory } from './resource.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'resource_usages' })
export class ResourceUsageEntity {
  @PrimaryColumn('uuid', { default: () => 'gen_random_uuid()' }) id!: string;
  @Column({ name: 'idempotency_key', type: 'uuid', unique: true })
  idempotencyKey!: string;
  @Column({ name: 'passenger_id', type: 'uuid' }) passengerId!: string;
  @Column({ name: 'resource_id', type: 'uuid' }) resourceId!: string;
  @Column({ name: 'passenger_mission_code', type: 'varchar', length: 32 })
  passengerMissionCode!: string;
  @Column({
    name: 'passenger_membership_level',
    type: 'enum',
    enum: MembershipLevel,
    enumName: 'membership_level',
  })
  passengerMembershipLevel!: MembershipLevel;
  @Column({ name: 'resource_code', type: 'varchar', length: 32 })
  resourceCode!: string;
  @Column({ name: 'resource_display_name', type: 'varchar', length: 120 })
  resourceDisplayName!: string;
  @Column({
    name: 'resource_category',
    type: 'enum',
    enum: ResourceCategory,
    enumName: 'resource_category',
  })
  resourceCategory!: ResourceCategory;
  @Column({
    name: 'resource_minimum_membership_level',
    type: 'enum',
    enum: MembershipLevel,
    enumName: 'membership_level',
  })
  resourceMinimumMembershipLevel!: MembershipLevel;
  @Column({
    name: 'resource_status',
    type: 'enum',
    enum: ['ACTIVE', 'OUT_OF_SERVICE', 'DECOMMISSIONED'],
    enumName: 'resource_status',
  })
  resourceStatus!: ResourceStatus;
  @Column({
    name: 'occurred_at',
    type: 'timestamptz',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP',
  })
  occurredAt!: Date;
}
