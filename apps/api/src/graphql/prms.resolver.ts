import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  Injectable,
  UseFilters,
} from '@nestjs/common';
import {
  Args,
  Context,
  ID,
  Int,
  Mutation,
  Query,
  registerEnumType,
  Resolver,
} from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { QueryFailedError } from 'typeorm';
import { CrewLeadsService } from '../application/crew-leads/crew-leads.service';
import { CrewLeadQueryService } from '../application/crew-leads/crew-lead-query.service';
import { PassengersService } from '../application/passengers/passengers.service';
import {
  PassengerFilter as PassengerFilterValue,
  PassengerQueryService,
} from '../application/passengers/passenger-query.service';
import { ResourcesService } from '../application/resources/resources.service';
import { ResourceDiscoveryService } from '../application/resources/resource-discovery.service';
import {
  ResourceFilter as ResourceFilterValue,
  ResourceQueryService,
} from '../application/resources/resource-query.service';
import { SystemSetupService } from '../application/system/system-setup.service';
import { SystemStatusQueryService } from '../application/system/system-status-query.service';
import { AuditEventQueryService } from '../application/audit/audit-event-query.service';
import {
  PassengerEntity,
  ResourceCategory,
  ResourceEntity,
  SystemState,
  AuditEventEntity,
  AuditActorType,
} from '../database/entities';
import { ResourceUsageService } from '../application/usage/resource-usage.service';
import { MembershipLevel } from '../domain/access-policy';
import { DomainError } from '../domain/normalization';
import { ActorContextService, RequestContext } from './actor-context.service';
import {
  HistorySort,
  Interaction,
  InteractionOutcome,
  ReportingFilter as ReportingFilterValue,
  ReportingService,
  ReportingWindow as ReportingWindowValue,
  UsageSummary,
} from '../application/reporting/reporting.service';
import { ActorRole, ResourceStatus } from './prms.enums';

registerEnumType(MembershipLevel, { name: 'MembershipLevel' });
registerEnumType(ResourceCategory, { name: 'ResourceCategory' });
registerEnumType(SystemState, { name: 'SystemState' });
registerEnumType(AuditActorType, { name: 'AuditActorType' });
registerEnumType(InteractionOutcome, { name: 'InteractionOutcome' });
registerEnumType(HistorySort, { name: 'HistorySort' });

import {
  SystemStatus,
  CrewLead,
  CrewLeadSummary,
  Passenger,
  Resource,
  PassengerConnection,
  ResourceConnection,
  DiscoverableResourceConnection,
  InitializeSystemPayload,
  CrewLeadPayload,
  ReplaceCrewLeadPayload,
  PassengerPayload,
  ResourcePayload,
  CurrentActor,
  UseResourcePayload,
  AuditEventConnection,
  ResourceInteractionConnection,
  UsageReportSummary,
  MembershipUsageReport,
  ResourceDemandReport,
  PageInput,
  CrewLeadProfileInput,
  OwnProfileInput,
  CreatePassengerInput,
  UpdatePassengerInput,
  PassengerFilter,
  ProvisionResourceInput,
  UpdateResourceInput,
  ResourceFilter,
  DiscoveryFilter,
  UseResourceInput,
  ReportingWindowInput,
  ReportingFilter,
} from './prms.types';

@Catch()
class PrmsGraphqlErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): GraphQLError {
    const gqlHost = host.getType<'graphql'>() === 'graphql' ? host : undefined;
    if (!gqlHost) throw exception;
    const error = mapGraphqlException(exception);
    const status =
      (
        {
          VALIDATION_ERROR: 400,
          UNAUTHENTICATED: 401,
          UNAUTHORIZED: 403,
          FORBIDDEN: 403,
          NOT_FOUND: 404,
          CONFLICT: 409,
          VERSION_CONFLICT: 409,
          NO_CHANGES: 409,
          DATABASE_ACCESS_ERROR: 503,
        } as Record<string, number>
      )[error.code] ?? 500;
    return new GraphQLError(error.message, {
      extensions: {
        code: error.code === 'UNAUTHORIZED' ? 'FORBIDDEN' : error.code,
        statusCode: status,
        ...(error.details ? { details: error.details } : {}),
      },
    });
  }
}

export function mapGraphqlException(exception: unknown): DomainError {
  if (exception instanceof DomainError) return exception;
  if (exception instanceof BadRequestException)
    return validationDomainError(exception);
  if (exception instanceof QueryFailedError) {
    const driverError = exception.driverError as { code?: unknown } | undefined;
    if (driverError?.code === '42501')
      return new DomainError(
        'DATABASE_ACCESS_ERROR',
        'PRMS cannot access its database. Grant the runtime database role access after migrations, then retry.',
      );
    return new DomainError(
      'CONFLICT',
      'A record with those values already exists',
    );
  }
  return new DomainError('INTERNAL_SERVER_ERROR', 'Internal server error');
}

function validationDomainError(exception: BadRequestException): DomainError {
  const response = exception.getResponse();
  const messages =
    typeof response === 'object' && response !== null && 'message' in response
      ? (response as { message?: unknown }).message
      : undefined;
  const values = Array.isArray(messages)
    ? messages.filter((value): value is string => typeof value === 'string')
    : typeof messages === 'string'
      ? [messages]
      : [];
  return new DomainError(
    'VALIDATION_ERROR',
    values[0] ?? 'Input validation failed',
    {
      fields: values.map((message) => ({
        field: message.split(' ')[0] ?? 'input',
        code: 'INVALID',
        message,
      })),
    },
  );
}

@Injectable()
@Resolver()
@UseFilters(PrmsGraphqlErrorFilter)
export class PrmsResolver {
  constructor(
    private readonly systemStatusQuery: SystemStatusQueryService,
    private readonly crewLeadQuery: CrewLeadQueryService,
    private readonly passengerQuery: PassengerQueryService,
    private readonly resourceQuery: ResourceQueryService,
    private readonly discovery: ResourceDiscoveryService,
    private readonly setup: SystemSetupService,
    private readonly crewLeads: CrewLeadsService,
    private readonly passengersService: PassengersService,
    private readonly resourcesService: ResourcesService,
    private readonly usage: ResourceUsageService,
    private readonly auditEventQueries: AuditEventQueryService,
    private readonly reporting: ReportingService,
    private readonly actors: ActorContextService,
  ) {}

  @Query(() => SystemStatus) async systemStatus(): Promise<SystemStatus> {
    return { state: (await this.systemStatusQuery.state()) as SystemState };
  }
  @Query(() => CurrentActor) async currentActor(
    @Context() context: RequestContext,
  ): Promise<CurrentActor> {
    const actor = await this.actors.authenticated(context);
    if (actor.type === 'CREW_LEAD') {
      const lead = await this.crewLeadQuery.byId(actor.id);
      return {
        id: lead.id,
        role: ActorRole.CREW_LEAD,
        displayName: lead.fullName,
        active: lead.active,
      };
    }
    const passenger = await this.passengerQuery.byId(actor.id);
    return {
      id: passenger.id,
      role: ActorRole.PASSENGER,
      displayName: passenger.fullName,
      active: passenger.active,
    };
  }
  @Query(() => [CrewLeadSummary]) async activeCrewLeads(
    @Context() context: RequestContext,
  ): Promise<CrewLeadSummary[]> {
    await this.actors.crewLead(context);
    return this.crewLeadQuery.active();
  }
  @Query(() => CrewLead) async myCrewLeadProfile(
    @Context() context: RequestContext,
  ): Promise<CrewLead> {
    return this.crewLeadQuery.byId((await this.actors.crewLead(context)).id);
  }
  @Query(() => CrewLead) async crewLead(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: RequestContext,
  ): Promise<CrewLead> {
    await this.actors.crewLead(context);
    return this.crewLeadQuery.byId(id);
  }
  @Query(() => Passenger) async passenger(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: RequestContext,
  ): Promise<Passenger> {
    await this.actors.crewLead(context);
    return this.passengerQuery.byId(id);
  }
  @Query(() => Passenger) async passengerByMissionCode(
    @Args('missionCode') missionCode: string,
    @Context() context: RequestContext,
  ): Promise<Passenger> {
    await this.actors.crewLead(context);
    return this.passengerQuery.byMissionCode(missionCode);
  }
  @Query(() => Resource) async resource(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: RequestContext,
  ): Promise<Resource> {
    await this.actors.crewLead(context);
    return this.resourceQuery.byId(id);
  }
  @Query(() => Resource) async resourceByCode(
    @Args('code') code: string,
    @Context() context: RequestContext,
  ): Promise<Resource> {
    await this.actors.crewLead(context);
    return this.resourceQuery.byCode(code);
  }
  @Query(() => PassengerConnection) async passengers(
    @Args('page', { type: () => PageInput, nullable: true })
    page: PageInput | undefined,
    @Args('filter', { type: () => PassengerFilter, nullable: true })
    filter: PassengerFilter | undefined,
    @Context() context: RequestContext,
  ): Promise<PassengerConnection> {
    await this.actors.crewLead(context);
    return passengerConnection(
      await this.passengerQuery.list(
        page ?? {},
        filter as PassengerFilterValue,
      ),
    );
  }
  @Query(() => ResourceConnection) async resources(
    @Args('page', { type: () => PageInput, nullable: true })
    page: PageInput | undefined,
    @Args('filter', { type: () => ResourceFilter, nullable: true })
    filter: ResourceFilter | undefined,
    @Context() context: RequestContext,
  ): Promise<ResourceConnection> {
    await this.actors.crewLead(context);
    return resourceConnection(
      await this.resourceQuery.list(page ?? {}, filter as ResourceFilterValue),
    );
  }
  @Query(() => DiscoverableResourceConnection) async discoverResources(
    @Args('page', { type: () => PageInput, nullable: true })
    page: PageInput | undefined,
    @Args('filter', { type: () => DiscoveryFilter, nullable: true })
    filter: DiscoveryFilter | undefined,
    @Context() context: RequestContext,
  ): Promise<DiscoverableResourceConnection> {
    const passenger = await this.actors.passenger(context);
    return discoveryConnection(
      await this.discovery.discover(passenger.id, page ?? {}, filter ?? {}),
    );
  }
  @Query(() => AuditEventConnection) async auditEvents(
    @Args('page', { type: () => PageInput, nullable: true })
    page: PageInput | undefined,
    @Context() context: RequestContext,
  ): Promise<AuditEventConnection> {
    await this.actors.crewLead(context);
    return auditEventConnection(await this.auditEventQueries.list(page ?? {}));
  }
  @Query(() => ResourceInteractionConnection) async myUsageHistory(
    @Args('window') window: ReportingWindowInput,
    @Args('filter', { type: () => ReportingFilter, nullable: true })
    filter: ReportingFilter | undefined,
    @Args('sort', {
      type: () => HistorySort,
      nullable: true,
      defaultValue: HistorySort.NEWEST,
    })
    sort: HistorySort,
    @Args('page', { type: () => PageInput, nullable: true })
    page: PageInput | undefined,
    @Context() context: RequestContext,
  ): Promise<ResourceInteractionConnection> {
    const passenger = await this.actors.passenger(context);
    return interactionConnection(
      await this.reporting.history(
        passenger.id,
        window as ReportingWindowValue,
        (filter as ReportingFilterValue) ?? {},
        sort,
        page ?? {},
      ),
    );
  }
  @Query(() => UsageReportSummary) async usageReportSummary(
    @Args('window') window: ReportingWindowInput,
    @Args('filter', { type: () => ReportingFilter, nullable: true })
    filter: ReportingFilter | undefined,
    @Context() context: RequestContext,
  ): Promise<UsageReportSummary> {
    await this.actors.crewLead(context);
    return this.reporting.summary(
      window as ReportingWindowValue,
      (filter as ReportingFilterValue) ?? {},
    ) as Promise<UsageSummary>;
  }
  @Query(() => MembershipUsageReport) async usageByMembership(
    @Args('window') window: ReportingWindowInput,
    @Args('filter', { type: () => ReportingFilter, nullable: true })
    filter: ReportingFilter | undefined,
    @Context() context: RequestContext,
  ): Promise<MembershipUsageReport> {
    await this.actors.crewLead(context);
    return this.reporting.membership(
      window as ReportingWindowValue,
      (filter as ReportingFilterValue) ?? {},
    );
  }
  @Query(() => ResourceDemandReport) async resourceDemand(
    @Args('window') window: ReportingWindowInput,
    @Args('filter', { type: () => ReportingFilter, nullable: true })
    filter: ReportingFilter | undefined,
    @Args('page', { type: () => PageInput, nullable: true })
    page: PageInput | undefined,
    @Context() context: RequestContext,
  ): Promise<ResourceDemandReport> {
    await this.actors.crewLead(context);
    const result = await this.reporting.demand(
      window as ReportingWindowValue,
      (filter as ReportingFilterValue) ?? {},
      page ?? {},
    );
    return {
      window: result.window,
      demand: {
        edges: result.connection.edges,
        pageInfo: {
          hasNextPage: result.connection.hasNextPage,
          endCursor: result.connection.endCursor,
        },
        totalCount: result.connection.totalCount,
      },
    };
  }

  @Mutation(() => InitializeSystemPayload) async initializeSystem(
    @Args('profiles', { type: () => [CrewLeadProfileInput] })
    profiles: CrewLeadProfileInput[],
    @Context() context: RequestContext,
  ): Promise<InitializeSystemPayload> {
    await this.setup.initialize(this.actors.setupSecret(context), profiles);
    return {
      systemStatus: {
        state: (await this.systemStatusQuery.state()) as SystemState,
      },
      crewLeads: await this.crewLeadQuery.active(),
    };
  }
  @Mutation(() => CrewLeadPayload) async updateOwnCrewLeadProfile(
    @Args('input') input: OwnProfileInput,
    @Context() context: RequestContext,
  ): Promise<CrewLeadPayload> {
    const actor = await this.actors.crewLead(context);
    return {
      crewLead: await this.crewLeads.updateOwnProfile(
        actor,
        input,
        input.expectedVersion,
      ),
    };
  }
  @Mutation(() => ReplaceCrewLeadPayload) async replaceCrewLead(
    @Args('outgoingId', { type: () => ID }) outgoingId: string,
    @Args('replacement') replacement: CrewLeadProfileInput,
    @Args('reason') reason: string,
    @Args('expectedVersion', { type: () => Int }) expectedVersion: number,
    @Context() context: RequestContext,
  ): Promise<ReplaceCrewLeadPayload> {
    const actor = await this.actors.crewLead(context);
    const outgoing = await this.crewLeadQuery.byId(outgoingId);
    const replacementLead = await this.crewLeads.replace(
      actor,
      outgoingId,
      replacement,
      reason,
      expectedVersion,
    );
    return {
      outgoingCrewLead: await this.crewLeadQuery.byId(outgoing.id),
      replacementCrewLead: replacementLead,
    };
  }
  @Mutation(() => PassengerPayload) async createPassenger(
    @Args('input') input: CreatePassengerInput,
    @Context() context: RequestContext,
  ): Promise<PassengerPayload> {
    return {
      passenger: await this.passengersService.create(
        await this.actors.crewLead(context),
        input,
      ),
    };
  }
  @Mutation(() => PassengerPayload) async updatePassenger(
    @Args('input') input: UpdatePassengerInput,
    @Context() context: RequestContext,
  ): Promise<PassengerPayload> {
    const { id, expectedVersion, ...update } = input;
    return {
      passenger: await this.passengersService.update(
        await this.actors.crewLead(context),
        id,
        update,
        expectedVersion,
      ),
    };
  }
  @Mutation(() => PassengerPayload) async changePassengerMembership(
    @Args('id', { type: () => ID }) id: string,
    @Args('membershipLevel', { type: () => MembershipLevel })
    membershipLevel: MembershipLevel,
    @Args('expectedVersion', { type: () => Int }) expectedVersion: number,
    @Context() context: RequestContext,
  ): Promise<PassengerPayload> {
    return {
      passenger: await this.passengersService.changeMembership(
        await this.actors.crewLead(context),
        id,
        membershipLevel,
        expectedVersion,
      ),
    };
  }
  @Mutation(() => PassengerPayload) async deactivatePassenger(
    @Args('id', { type: () => ID }) id: string,
    @Args('reason') reason: string,
    @Args('expectedVersion', { type: () => Int }) expectedVersion: number,
    @Context() context: RequestContext,
  ): Promise<PassengerPayload> {
    return {
      passenger: await this.passengersService.deactivate(
        await this.actors.crewLead(context),
        id,
        reason,
        expectedVersion,
      ),
    };
  }
  @Mutation(() => ResourcePayload) async provisionResource(
    @Args('input') input: ProvisionResourceInput,
    @Context() context: RequestContext,
  ): Promise<ResourcePayload> {
    return {
      resource: await this.resourcesService.create(
        await this.actors.crewLead(context),
        input,
      ),
    };
  }
  @Mutation(() => ResourcePayload) async updateResource(
    @Args('input') input: UpdateResourceInput,
    @Context() context: RequestContext,
  ): Promise<ResourcePayload> {
    const { id, expectedVersion, ...update } = input;
    return {
      resource: await this.resourcesService.update(
        await this.actors.crewLead(context),
        id,
        update,
        expectedVersion,
      ),
    };
  }
  @Mutation(() => ResourcePayload) async transitionResourceStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('status', { type: () => ResourceStatus }) status: ResourceStatus,
    @Args('reason') reason: string,
    @Args('expectedVersion', { type: () => Int }) expectedVersion: number,
    @Context() context: RequestContext,
  ): Promise<ResourcePayload> {
    return {
      resource: await this.resourcesService.transition(
        await this.actors.crewLead(context),
        id,
        status as ResourceEntity['status'],
        reason,
        expectedVersion,
      ),
    };
  }
  @Mutation(() => UseResourcePayload) async useResource(
    @Args('input') input: UseResourceInput,
    @Context() context: RequestContext,
  ): Promise<UseResourcePayload> {
    const result = await this.usage.record(
      await this.actors.passenger(context),
      input.resourceId,
      input.idempotencyKey,
    );
    return result.allowed
      ? { allowed: true, usage: result.usage, denialReason: null }
      : { allowed: false, usage: null, denialReason: result.reason };
  }
}
function passengerConnection(value: {
  edges: { node: PassengerEntity; cursor: string }[];
  hasNextPage: boolean;
  endCursor: string | null;
  totalCount: number;
}): PassengerConnection {
  return {
    edges: value.edges,
    pageInfo: { hasNextPage: value.hasNextPage, endCursor: value.endCursor },
    totalCount: value.totalCount,
  };
}
function resourceConnection(value: {
  edges: { node: ResourceEntity; cursor: string }[];
  hasNextPage: boolean;
  endCursor: string | null;
  totalCount: number;
}): ResourceConnection {
  return {
    edges: value.edges,
    pageInfo: { hasNextPage: value.hasNextPage, endCursor: value.endCursor },
    totalCount: value.totalCount,
  };
}
function discoveryConnection(value: {
  edges: { node: ResourceEntity; cursor: string }[];
  hasNextPage: boolean;
  endCursor: string | null;
  totalCount: number;
}): DiscoverableResourceConnection {
  return {
    edges: value.edges.map(({ cursor, node: resource }) => ({
      cursor,
      node: {
        ...resource,
        hasMembershipAccess: true,
        canUseNow: resource.status === 'ACTIVE',
      },
    })),
    pageInfo: { hasNextPage: value.hasNextPage, endCursor: value.endCursor },
    totalCount: value.totalCount,
  };
}
function auditEventConnection(value: {
  edges: { node: AuditEventEntity; cursor: string }[];
  hasNextPage: boolean;
  endCursor: string | null;
  totalCount: number;
}): AuditEventConnection {
  return {
    edges: value.edges,
    pageInfo: { hasNextPage: value.hasNextPage, endCursor: value.endCursor },
    totalCount: value.totalCount,
  };
}
function interactionConnection(value: {
  edges: { node: Interaction; cursor: string }[];
  hasNextPage: boolean;
  endCursor: string | null;
  totalCount: number;
}): ResourceInteractionConnection {
  return {
    edges: value.edges,
    pageInfo: { hasNextPage: value.hasNextPage, endCursor: value.endCursor },
    totalCount: value.totalCount,
  };
}
