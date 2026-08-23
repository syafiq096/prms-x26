import { Column, Entity, PrimaryColumn, VersionColumn } from 'typeorm';

export enum ApplicationSettingKey {
  SYSTEM_STATE = 'SYSTEM_STATE',
}

export enum SystemState {
  UNINITIALIZED = 'UNINITIALIZED',
  OPERATIONAL = 'OPERATIONAL',
}

@Entity({ name: 'application_settings' })
export class ApplicationSettingEntity {
  @PrimaryColumn({
    type: 'enum',
    enum: ApplicationSettingKey,
    enumName: 'application_setting_key',
  })
  key!: ApplicationSettingKey;

  @Column({ name: 'text_value', type: 'text', nullable: true })
  textValue!: string | null;

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
