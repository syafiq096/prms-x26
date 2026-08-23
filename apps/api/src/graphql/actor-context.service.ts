import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CrewLeadQueryService } from '../application/crew-leads/crew-lead-query.service';
import { PassengerQueryService } from '../application/passengers/passenger-query.service';
import { EnvironmentVariables } from '../config/environment';
import { DomainError } from '../domain/normalization';

export type RequestContext = {
  req?: { headers?: Record<string, string | string[] | undefined> };
};

@Injectable()
export class ActorContextService {
  constructor(
    private readonly crewLeads: CrewLeadQueryService,
    private readonly passengers: PassengerQueryService,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  setupSecret(context: RequestContext): string {
    const secret = header(context, 'x-setup-secret');
    if (!secret) throw new DomainError('UNAUTHENTICATED', 'Invalid setup secret');
    return secret;
  }

  async crewLead(
    context: RequestContext,
  ): Promise<{ type: 'CREW_LEAD'; id: string }> {
    this.assertHeadersEnabled();
    const id = header(context, 'x-actor-id');
    if (!id || !isUuid(id))
      throw new DomainError(
        'UNAUTHENTICATED',
        'A valid Crew Lead identity is required',
      );
    const lead = await this.crewLeads.byId(id).catch(() => {
      throw new DomainError(
        'UNAUTHENTICATED',
        'A valid Crew Lead identity is required',
      );
    });
    if (!lead.active) throw new DomainError('FORBIDDEN', 'Crew Lead is inactive');
    return { type: 'CREW_LEAD', id };
  }

  async passenger(
    context: RequestContext,
  ): Promise<{ type: 'PASSENGER'; id: string }> {
    this.assertHeadersEnabled();
    const id = header(context, 'x-passenger-id');
    if (!id || !isUuid(id))
      throw new DomainError(
        'UNAUTHENTICATED',
        'A valid Passenger identity is required',
      );
    const passenger = await this.passengers.byId(id).catch(() => {
      throw new DomainError(
        'UNAUTHENTICATED',
        'A valid Passenger identity is required',
      );
    });
    if (!passenger.active)
      throw new DomainError('FORBIDDEN', 'Passenger is inactive');
    return { type: 'PASSENGER', id };
  }

  private assertHeadersEnabled(): void {
    if (!this.config.get('ALLOW_INSECURE_ACTOR_HEADER', { infer: true }))
      throw new DomainError(
        'UNAUTHENTICATED',
        'Temporary actor headers are disabled',
      );
  }
}

function header(context: RequestContext, name: string): string | undefined {
  const value = context.req?.headers?.[name];
  return Array.isArray(value) ? value[0] : value;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(
    value,
  );
}
