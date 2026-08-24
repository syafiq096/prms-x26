import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { DataSource } from 'typeorm';
import { CrewLeadQueryService } from '../application/crew-leads/crew-lead-query.service';
import { PassengerQueryService } from '../application/passengers/passenger-query.service';
import { EnvironmentVariables } from '../config/environment';
import { ActorIdentityEntity, CrewLeadEntity, PassengerEntity } from '../database/entities';
import { DomainError } from '../domain/normalization';

export type AuthenticatedActor =
  | { type: 'CREW_LEAD'; id: string }
  | { type: 'PASSENGER'; id: string };

export type RequestContext = {
  req?: { headers?: Record<string, string | string[] | undefined> };
  actor?: AuthenticatedActor;
};

@Injectable()
export class ActorContextService {
  constructor(
    private readonly crewLeads: CrewLeadQueryService,
    private readonly passengers: PassengerQueryService,
    private readonly dataSource: DataSource,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  setupSecret(context: RequestContext): string {
    const secret = header(context, 'x-setup-secret');
    if (!secret) throw new DomainError('UNAUTHENTICATED', 'Invalid setup secret');
    return secret;
  }

  async authenticated(context: RequestContext): Promise<AuthenticatedActor> {
    if (context.actor) return context.actor;
    const testActor = await this.temporaryTestActor(context);
    if (testActor) return (context.actor = testActor);
    const token = bearerToken(context);
    if (!token) throw new DomainError('UNAUTHENTICATED', 'Authentication is required');

    let subject: string;
    try {
      const claims = await verifyToken(token, {
        secretKey: this.config.get('CLERK_SECRET_KEY', { infer: true }),
        authorizedParties: this.config
          .get('CLERK_AUTHORIZED_PARTIES', { infer: true })
          .split(',')
          .map((party) => party.trim())
          .filter(Boolean),
      });
      subject = claims.sub;
    } catch {
      throw new DomainError('UNAUTHENTICATED', 'Invalid or expired session');
    }

    let identity = await this.dataSource
      .getRepository(ActorIdentityEntity)
      .findOneBy({ clerkSubject: subject });
    if (!identity) identity = await this.linkByVerifiedEmail(subject);
    if (!identity)
      throw new DomainError('UNAUTHENTICATED', 'No active PRMS actor matches this verified email');

    if (identity.crewLeadId) {
      const lead = await this.crewLeads.byId(identity.crewLeadId).catch(() => {
        throw new DomainError('UNAUTHENTICATED', 'Account is not linked to PRMS');
      });
      if (!lead.active) throw new DomainError('FORBIDDEN', 'Crew Lead is inactive');
      return (context.actor = { type: 'CREW_LEAD', id: lead.id });
    }

    if (identity.passengerId) {
      const passenger = await this.passengers.byId(identity.passengerId).catch(() => {
        throw new DomainError('UNAUTHENTICATED', 'Account is not linked to PRMS');
      });
      if (!passenger.active) throw new DomainError('FORBIDDEN', 'Passenger is inactive');
      return (context.actor = { type: 'PASSENGER', id: passenger.id });
    }
    throw new DomainError('UNAUTHENTICATED', 'Account is not linked to PRMS');
  }

  private async linkByVerifiedEmail(subject: string): Promise<ActorIdentityEntity | null> {
    const client = createClerkClient({ secretKey: this.config.get('CLERK_SECRET_KEY', { infer: true }) });
    let email: string | undefined;
    try {
      const user = await client.users.getUser(subject);
      const primary = user.emailAddresses.find((address) => address.id === user.primaryEmailAddressId);
      if (primary?.verification?.status === 'verified') email = primary.emailAddress.trim().toLowerCase();
    } catch {
      throw new DomainError('UNAUTHENTICATED', 'Unable to verify account email');
    }
    if (!email) throw new DomainError('UNAUTHENTICATED', 'A verified primary email is required');

    const [leads, passengers] = await Promise.all([
      this.dataSource.getRepository(CrewLeadEntity).createQueryBuilder('lead').where('lead.active = true').andWhere('LOWER(lead.email) = :email', { email }).getMany(),
      this.dataSource.getRepository(PassengerEntity).createQueryBuilder('passenger').where('passenger.active = true').andWhere('LOWER(passenger.email) = :email', { email }).getMany(),
    ]);
    const matches = [...leads.map((lead) => ({ type: 'CREW_LEAD' as const, id: lead.id })), ...passengers.map((passenger) => ({ type: 'PASSENGER' as const, id: passenger.id }))];
    if (matches.length !== 1) return null;

    const identities = this.dataSource.getRepository(ActorIdentityEntity);
    const existing = matches[0].type === 'CREW_LEAD'
      ? await identities.findOneBy({ crewLeadId: matches[0].id })
      : await identities.findOneBy({ passengerId: matches[0].id });
    if (existing) {
      if (existing.clerkSubject === subject) return existing;
      try {
        await client.users.getUser(existing.clerkSubject);
        return null;
      } catch {
        await identities.delete({ clerkSubject: existing.clerkSubject });
      }
    }
    const linked = identities.create(matches[0].type === 'CREW_LEAD'
      ? { clerkSubject: subject, crewLeadId: matches[0].id, passengerId: null }
      : { clerkSubject: subject, crewLeadId: null, passengerId: matches[0].id });
    return identities.save(linked);
  }

  private async temporaryTestActor(context: RequestContext): Promise<AuthenticatedActor | undefined> {
    if (this.config.get('NODE_ENV', { infer: true }) !== 'test') return undefined;
    const crewLeadId = header(context, 'x-actor-id');
    const passengerId = header(context, 'x-passenger-id');
    if (crewLeadId) {
      const lead = await this.crewLeads.byId(crewLeadId).catch(() => undefined);
      if (!lead) throw new DomainError('UNAUTHENTICATED', 'Authentication is required');
      if (!lead.active) throw new DomainError('FORBIDDEN', 'Crew Lead is inactive');
      return { type: 'CREW_LEAD', id: lead.id };
    }
    if (passengerId) {
      const passenger = await this.passengers.byId(passengerId).catch(() => undefined);
      if (!passenger) throw new DomainError('UNAUTHENTICATED', 'Authentication is required');
      if (!passenger.active) throw new DomainError('FORBIDDEN', 'Passenger is inactive');
      return { type: 'PASSENGER', id: passenger.id };
    }
    return undefined;
  }

  async crewLead(context: RequestContext): Promise<{ type: 'CREW_LEAD'; id: string }> {
    const actor = await this.authenticated(context);
    if (actor.type !== 'CREW_LEAD')
      throw new DomainError('FORBIDDEN', 'A Crew Lead identity is required');
    return actor;
  }

  async passenger(context: RequestContext): Promise<{ type: 'PASSENGER'; id: string }> {
    const actor = await this.authenticated(context);
    if (actor.type !== 'PASSENGER')
      throw new DomainError('FORBIDDEN', 'A Passenger identity is required');
    return actor;
  }
}

function header(context: RequestContext, name: string): string | undefined {
  const value = context.req?.headers?.[name];
  return Array.isArray(value) ? value[0] : value;
}

function bearerToken(context: RequestContext): string | undefined {
  const authorization = header(context, 'authorization');
  const match = authorization?.match(/^Bearer (.+)$/i);
  return match?.[1];
}
