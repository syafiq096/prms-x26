import { Column, Entity, PrimaryColumn, VersionColumn } from 'typeorm';

@Entity({ name: 'crew_leads' })
export class CrewLeadEntity {
  @PrimaryColumn('uuid', { default: () => 'gen_random_uuid()' })
  id!: string;

  @Column({ name: 'mission_code', type: 'varchar', length: 32, unique: true })
  missionCode!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 120 })
  fullName!: string;

  @Column({ type: 'varchar', length: 320, nullable: true })
  email!: string | null;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Column({ name: 'replaces_crew_lead_id', type: 'uuid', nullable: true })
  replacesCrewLeadId!: string | null;

  @Column({
    name: 'deactivation_reason',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  deactivationReason!: string | null;

  @Column({
    name: 'deactivated_at',
    type: 'timestamptz',
    precision: 3,
    nullable: true,
  })
  deactivatedAt!: Date | null;

  @VersionColumn({ type: 'integer', default: 1 })
  version!: number;

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
