import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuditActorType, PassengerEntity } from '../../database/entities';
import { MembershipLevel } from '../../domain/access-policy';
import {
  DomainError,
  normalizeCode,
  normalizeEmail,
  normalizeWhitespace,
} from '../../domain/normalization';
import { AuditWriterService } from '../audit/audit-writer.service';
import { CrewLeadActor } from '../shared/actors';
import { requireActiveCrewLead } from '../shared/active-crew-lead';

export type PassengerInput = {
  id?: string;
  missionCode: string;
  fullName: string;
  email?: string | null;
  cabinCode?: string | null;
  membershipLevel?: MembershipLevel;
};
export type PassengerUpdate = {
  fullName?: string;
  email?: string | null;
  cabinCode?: string | null;
};

@Injectable()
export class PassengersService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly audits: AuditWriterService,
  ) {}

  async create(
    actor: CrewLeadActor,
    input: PassengerInput,
  ): Promise<PassengerEntity> {
    return this.dataSource.transaction(async (manager) => {
      await requireActiveCrewLead(manager, actor.id);
      const passengers = manager.getRepository(PassengerEntity);
      const passenger = await passengers.save(
        passengers.create({
          id: input.id,
          missionCode: normalizeCode(input.missionCode, 'missionCode'),
          fullName: normalizeWhitespace(input.fullName, 'fullName', 120),
          email: normalizeEmail(input.email),
          cabinCode: input.cabinCode
            ? normalizeCode(input.cabinCode, 'cabinCode')
            : null,
          membershipLevel: input.membershipLevel ?? MembershipLevel.SILVER,
        }),
      );
      await this.audits.write(manager, {
        actorType: AuditActorType.CREW_LEAD,
        crewLeadActorId: actor.id,
        eventType: 'PASSENGER_CREATED',
        result: 'SUCCESS',
        passengerSubjectId: passenger.id,
      });
      return passenger;
    });
  }

  async update(
    actor: CrewLeadActor,
    passengerId: string,
    input: PassengerUpdate,
  ): Promise<PassengerEntity> {
    return this.dataSource.transaction(async (manager) => {
      await requireActiveCrewLead(manager, actor.id);
      const passengers = manager.getRepository(PassengerEntity);
      const passenger = await passengers.findOne({
        where: { id: passengerId, active: true },
      });
      if (!passenger)
        throw new DomainError('NOT_FOUND', 'Active Passenger was not found');
      const before = {
        fullName: passenger.fullName,
        email: passenger.email,
        cabinCode: passenger.cabinCode,
      };
      if (input.fullName !== undefined)
        passenger.fullName = normalizeWhitespace(
          input.fullName,
          'fullName',
          120,
        );
      if (input.email !== undefined)
        passenger.email = normalizeEmail(input.email);
      if (input.cabinCode !== undefined)
        passenger.cabinCode = input.cabinCode
          ? normalizeCode(input.cabinCode, 'cabinCode')
          : null;
      const saved = await passengers.save(passenger);
      await this.audits.write(manager, {
        actorType: AuditActorType.CREW_LEAD,
        crewLeadActorId: actor.id,
        eventType: 'PASSENGER_UPDATED',
        result: 'SUCCESS',
        passengerSubjectId: saved.id,
        metadata: {
          before,
          after: {
            fullName: saved.fullName,
            email: saved.email,
            cabinCode: saved.cabinCode,
          },
        },
      });
      return saved;
    });
  }

  async changeMembership(
    actor: CrewLeadActor,
    passengerId: string,
    membershipLevel: MembershipLevel,
  ): Promise<PassengerEntity> {
    return this.dataSource.transaction(async (manager) => {
      await requireActiveCrewLead(manager, actor.id);
      const passengers = manager.getRepository(PassengerEntity);
      const passenger = await passengers.findOne({
        where: { id: passengerId, active: true },
      });
      if (!passenger)
        throw new DomainError('NOT_FOUND', 'Active Passenger was not found');
      if (passenger.membershipLevel === membershipLevel)
        throw new DomainError(
          'INVALID_MEMBERSHIP_TRANSITION',
          'Passenger already has this membership level',
        );
      const before = passenger.membershipLevel;
      passenger.membershipLevel = membershipLevel;
      const saved = await passengers.save(passenger);
      await this.audits.write(manager, {
        actorType: AuditActorType.CREW_LEAD,
        crewLeadActorId: actor.id,
        eventType: 'PASSENGER_MEMBERSHIP_CHANGED',
        result: 'SUCCESS',
        passengerSubjectId: saved.id,
        metadata: { before, after: saved.membershipLevel },
      });
      return saved;
    });
  }

  async deactivate(
    actor: CrewLeadActor,
    passengerId: string,
    reason: string,
  ): Promise<PassengerEntity> {
    const normalizedReason = normalizeWhitespace(reason, 'reason', 500);
    return this.dataSource.transaction(async (manager) => {
      await requireActiveCrewLead(manager, actor.id);
      const passengers = manager.getRepository(PassengerEntity);
      const passenger = await passengers
        .createQueryBuilder('passenger')
        .setLock('pessimistic_write')
        .where('passenger.id = :id AND passenger.active = true', {
          id: passengerId,
        })
        .getOne();
      if (!passenger)
        throw new DomainError('NOT_FOUND', 'Active Passenger was not found');
      passenger.active = false;
      passenger.deactivatedAt = new Date();
      passenger.deactivationReason = normalizedReason;
      await passengers.save(passenger);
      await this.audits.write(manager, {
        actorType: AuditActorType.CREW_LEAD,
        crewLeadActorId: actor.id,
        eventType: 'PASSENGER_DEACTIVATED',
        result: 'SUCCESS',
        passengerSubjectId: passenger.id,
        metadata: { reason: normalizedReason },
      });
      return passenger;
    });
  }
}
