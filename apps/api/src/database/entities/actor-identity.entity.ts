import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { CrewLeadEntity } from './crew-lead.entity';
import { PassengerEntity } from './passenger.entity';

@Entity({ name: 'actor_identities' })
export class ActorIdentityEntity {
  @PrimaryColumn({ name: 'clerk_subject', type: 'varchar', length: 128 })
  clerkSubject!: string;

  @Column({ name: 'crew_lead_id', type: 'uuid', nullable: true, unique: true })
  crewLeadId!: string | null;

  @Column({ name: 'passenger_id', type: 'uuid', nullable: true, unique: true })
  passengerId!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', precision: 3, default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @OneToOne(() => CrewLeadEntity)
  @JoinColumn({ name: 'crew_lead_id' })
  crewLead?: CrewLeadEntity | null;

  @OneToOne(() => PassengerEntity)
  @JoinColumn({ name: 'passenger_id' })
  passenger?: PassengerEntity | null;
}
