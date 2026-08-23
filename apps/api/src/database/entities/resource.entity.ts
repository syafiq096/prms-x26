import { MembershipLevel, ResourceStatus } from '../../domain/access-policy';
import { Column, Entity, PrimaryColumn, VersionColumn } from 'typeorm';

export enum ResourceCategory {
  SLEEPING = 'SLEEPING',
  FOOD = 'FOOD',
  OXYGEN = 'OXYGEN',
  MEDICAL = 'MEDICAL',
  HYGIENE = 'HYGIENE',
  FITNESS = 'FITNESS',
  RECREATION = 'RECREATION',
}

@Entity({ name: 'resources' })
export class ResourceEntity {
  @PrimaryColumn('uuid', { default: () => 'gen_random_uuid()' }) id!: string;
  @Column({ type: 'varchar', length: 32, unique: true }) code!: string;
  @Column({ name: 'display_name', type: 'varchar', length: 120 })
  displayName!: string;
  @Column({
    type: 'enum',
    enum: ResourceCategory,
    enumName: 'resource_category',
  })
  category!: ResourceCategory;
  @Column({
    name: 'minimum_membership_level',
    type: 'enum',
    enum: MembershipLevel,
    enumName: 'membership_level',
    default: MembershipLevel.SILVER,
  })
  minimumMembershipLevel!: MembershipLevel;
  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'OUT_OF_SERVICE', 'DECOMMISSIONED'],
    enumName: 'resource_status',
    default: 'ACTIVE',
  })
  status!: ResourceStatus;
  @Column({
    name: 'status_change_reason',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  statusChangeReason!: string | null;
  @Column({
    name: 'decommissioned_at',
    type: 'timestamptz',
    precision: 3,
    nullable: true,
  })
  decommissionedAt!: Date | null;
  @VersionColumn({ type: 'integer', default: 1 }) version!: number;
  @Column({
    name: 'created_at',
    type: 'timestamptz',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;
  @Column({
    name: 'updated_at',
    type: 'timestamptz',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;
}
