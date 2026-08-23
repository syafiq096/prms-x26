import { ArgumentsHost, Catch, ExceptionFilter, Injectable, UseFilters } from '@nestjs/common';
import { Args, Context, Field, ID, InputType, Int, Mutation, ObjectType, Query, registerEnumType, Resolver } from '@nestjs/graphql';
import { IsEmail, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { GraphQLError } from 'graphql';
import { QueryFailedError } from 'typeorm';
import { CrewLeadsService } from '../application/crew-leads/crew-leads.service';
import { CrewLeadQueryService } from '../application/crew-leads/crew-lead-query.service';
import { PassengersService } from '../application/passengers/passengers.service';
import { PassengerFilter as PassengerFilterValue, PassengerQueryService } from '../application/passengers/passenger-query.service';
import { ResourcesService } from '../application/resources/resources.service';
import { ResourceDiscoveryService } from '../application/resources/resource-discovery.service';
import { ResourceFilter as ResourceFilterValue, ResourceQueryService } from '../application/resources/resource-query.service';
import { SystemSetupService } from '../application/system/system-setup.service';
import { SystemStatusQueryService } from '../application/system/system-status-query.service';
import { PassengerEntity, ResourceCategory, ResourceEntity, SystemState } from '../database/entities';
import { MembershipLevel } from '../domain/access-policy';
import { DomainError } from '../domain/normalization';
import { ActorContextService, RequestContext } from './actor-context.service';

registerEnumType(MembershipLevel, { name: 'MembershipLevel' });
registerEnumType(ResourceCategory, { name: 'ResourceCategory' });
enum ResourceStatus { ACTIVE = 'ACTIVE', OUT_OF_SERVICE = 'OUT_OF_SERVICE', DECOMMISSIONED = 'DECOMMISSIONED' }
registerEnumType(ResourceStatus, { name: 'ResourceStatus' });
registerEnumType(SystemState, { name: 'SystemState' });

@ObjectType() class SystemStatus { @Field(() => SystemState) state!: SystemState; }
@ObjectType() class CrewLead { @Field(() => ID) id!: string; @Field() missionCode!: string; @Field() fullName!: string; @Field(() => String, { nullable: true }) email!: string | null; @Field() active!: boolean; @Field(() => ID, { nullable: true }) replacesCrewLeadId!: string | null; @Field(() => String, { nullable: true }) deactivationReason!: string | null; @Field(() => Date, { nullable: true }) deactivatedAt!: Date | null; @Field(() => Int) version!: number; @Field() createdAt!: Date; @Field() updatedAt!: Date; }
@ObjectType() class CrewLeadSummary { @Field(() => ID) id!: string; @Field() missionCode!: string; @Field() fullName!: string; @Field() active!: boolean; }
@ObjectType() class Passenger { @Field(() => ID) id!: string; @Field() missionCode!: string; @Field() fullName!: string; @Field(() => String, { nullable: true }) email!: string | null; @Field(() => String, { nullable: true }) cabinCode!: string | null; @Field(() => MembershipLevel) membershipLevel!: MembershipLevel; @Field() active!: boolean; @Field(() => String, { nullable: true }) deactivationReason!: string | null; @Field(() => Date, { nullable: true }) deactivatedAt!: Date | null; @Field(() => Int) version!: number; @Field() createdAt!: Date; @Field() updatedAt!: Date; }
@ObjectType() class Resource { @Field(() => ID) id!: string; @Field() code!: string; @Field() displayName!: string; @Field(() => ResourceCategory) category!: ResourceCategory; @Field(() => MembershipLevel) minimumMembershipLevel!: MembershipLevel; @Field(() => ResourceStatus) status!: string; @Field(() => String, { nullable: true }) statusChangeReason!: string | null; @Field(() => Date, { nullable: true }) decommissionedAt!: Date | null; @Field(() => Int) version!: number; @Field() createdAt!: Date; @Field() updatedAt!: Date; }
@ObjectType() class DiscoverableResource { @Field(() => ID) id!: string; @Field() code!: string; @Field() displayName!: string; @Field(() => ResourceCategory) category!: ResourceCategory; @Field(() => MembershipLevel) minimumMembershipLevel!: MembershipLevel; @Field(() => ResourceStatus) status!: string; @Field() hasMembershipAccess!: boolean; @Field() canUseNow!: boolean; }
@ObjectType() class PageInfo { @Field() hasNextPage!: boolean; @Field(() => String, { nullable: true }) endCursor!: string | null; }
@ObjectType() class PassengerEdge { @Field() cursor!: string; @Field(() => Passenger) node!: Passenger; }
@ObjectType() class ResourceEdge { @Field() cursor!: string; @Field(() => Resource) node!: Resource; }
@ObjectType() class DiscoverableResourceEdge { @Field() cursor!: string; @Field(() => DiscoverableResource) node!: DiscoverableResource; }
@ObjectType() class PassengerConnection { @Field(() => [PassengerEdge]) edges!: PassengerEdge[]; @Field(() => PageInfo) pageInfo!: PageInfo; @Field(() => Int) totalCount!: number; }
@ObjectType() class ResourceConnection { @Field(() => [ResourceEdge]) edges!: ResourceEdge[]; @Field(() => PageInfo) pageInfo!: PageInfo; @Field(() => Int) totalCount!: number; }
@ObjectType() class DiscoverableResourceConnection { @Field(() => [DiscoverableResourceEdge]) edges!: DiscoverableResourceEdge[]; @Field(() => PageInfo) pageInfo!: PageInfo; @Field(() => Int) totalCount!: number; }
@ObjectType() class InitializeSystemPayload { @Field(() => SystemStatus) systemStatus!: SystemStatus; @Field(() => [CrewLead]) crewLeads!: CrewLead[]; }
@ObjectType() class CrewLeadPayload { @Field(() => CrewLead) crewLead!: CrewLead; }
@ObjectType() class ReplaceCrewLeadPayload { @Field(() => CrewLead) outgoingCrewLead!: CrewLead; @Field(() => CrewLead) replacementCrewLead!: CrewLead; }
@ObjectType() class PassengerPayload { @Field(() => Passenger) passenger!: Passenger; }
@ObjectType() class ResourcePayload { @Field(() => Resource) resource!: Resource; }

@InputType() class PageInput { @Field(() => Int, { nullable: true }) @IsOptional() @IsInt() @Min(1) first?: number; @Field(() => String, { nullable: true }) @IsOptional() @IsString() after?: string | null; }
@InputType() class CrewLeadProfileInput { @Field() @IsString() missionCode!: string; @Field() @IsString() fullName!: string; @Field(() => String, { nullable: true }) @IsOptional() @IsEmail() email?: string | null; }
@InputType() class OwnProfileInput { @Field() @IsString() fullName!: string; @Field(() => String, { nullable: true }) @IsOptional() @IsEmail() email?: string | null; @Field(() => Int) @IsInt() @Min(1) expectedVersion!: number; }
@InputType() class CreatePassengerInput { @Field() @IsString() missionCode!: string; @Field() @IsString() fullName!: string; @Field(() => String, { nullable: true }) @IsOptional() @IsEmail() email?: string | null; @Field(() => String, { nullable: true }) @IsOptional() @IsString() cabinCode?: string | null; @Field(() => MembershipLevel, { nullable: true }) @IsOptional() @IsEnum(MembershipLevel) membershipLevel?: MembershipLevel; }
@InputType() class UpdatePassengerInput { @Field(() => ID) @IsUUID() id!: string; @Field(() => String, { nullable: true }) @IsOptional() @IsString() fullName?: string; @Field(() => String, { nullable: true }) @IsOptional() @IsEmail() email?: string | null; @Field(() => String, { nullable: true }) @IsOptional() @IsString() cabinCode?: string | null; @Field(() => Int) @IsInt() @Min(1) expectedVersion!: number; }
@InputType() class PassengerFilter { @Field(() => String, { nullable: true }) @IsOptional() @IsString() text?: string | null; @Field(() => Boolean, { nullable: true }) @IsOptional() active?: boolean | null; @Field(() => [MembershipLevel], { nullable: true }) @IsOptional() @IsEnum(MembershipLevel, { each: true }) membershipLevels?: MembershipLevel[] | null; }
@InputType() class ProvisionResourceInput { @Field() @IsString() code!: string; @Field() @IsString() displayName!: string; @Field(() => ResourceCategory) @IsEnum(ResourceCategory) category!: ResourceCategory; @Field(() => MembershipLevel, { nullable: true }) @IsOptional() @IsEnum(MembershipLevel) minimumMembershipLevel?: MembershipLevel; }
@InputType() class UpdateResourceInput { @Field(() => ID) @IsUUID() id!: string; @Field(() => String, { nullable: true }) @IsOptional() @IsString() displayName?: string; @Field(() => MembershipLevel, { nullable: true }) @IsOptional() @IsEnum(MembershipLevel) minimumMembershipLevel?: MembershipLevel; @Field(() => Int) @IsInt() @Min(1) expectedVersion!: number; }
@InputType() class ResourceFilter { @Field(() => String, { nullable: true }) @IsOptional() @IsString() text?: string | null; @Field(() => [ResourceStatus], { nullable: true }) @IsOptional() @IsEnum(ResourceStatus, { each: true }) statuses?: ResourceStatus[] | null; @Field(() => [ResourceCategory], { nullable: true }) @IsOptional() @IsEnum(ResourceCategory, { each: true }) categories?: ResourceCategory[] | null; @Field(() => [MembershipLevel], { nullable: true }) @IsOptional() @IsEnum(MembershipLevel, { each: true }) minimumMembershipLevels?: MembershipLevel[] | null; }
@InputType() class DiscoveryFilter { @Field(() => String, { nullable: true }) @IsOptional() @IsString() text?: string | null; @Field(() => [ResourceStatus], { nullable: true }) @IsOptional() @IsEnum(ResourceStatus, { each: true }) statuses?: ResourceStatus[] | null; @Field(() => [ResourceCategory], { nullable: true }) @IsOptional() @IsEnum(ResourceCategory, { each: true }) categories?: ResourceCategory[] | null; }

@Catch()
class PrmsGraphqlErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): GraphQLError {
    const gqlHost = host.getType<'graphql'>() === 'graphql' ? host : undefined;
    if (!gqlHost) throw exception;
    const error = exception instanceof DomainError ? exception : exception instanceof QueryFailedError ? new DomainError('CONFLICT', 'A record with those values already exists') : new DomainError('INTERNAL_SERVER_ERROR', 'Internal server error');
    const status = ({ VALIDATION_ERROR: 400, UNAUTHENTICATED: 401, UNAUTHORIZED: 403, FORBIDDEN: 403, NOT_FOUND: 404, CONFLICT: 409, VERSION_CONFLICT: 409, NO_CHANGES: 409 } as Record<string, number>)[error.code] ?? 500;
    return new GraphQLError(error.message, { extensions: { code: error.code === 'UNAUTHORIZED' ? 'FORBIDDEN' : error.code, statusCode: status, ...(error.details ? { details: error.details } : {}) } });
  }
}

@Injectable()
@Resolver()
@UseFilters(PrmsGraphqlErrorFilter)
export class PrmsResolver {
  constructor(private readonly systemStatusQuery: SystemStatusQueryService, private readonly crewLeadQuery: CrewLeadQueryService, private readonly passengerQuery: PassengerQueryService, private readonly resourceQuery: ResourceQueryService, private readonly discovery: ResourceDiscoveryService, private readonly setup: SystemSetupService, private readonly crewLeads: CrewLeadsService, private readonly passengersService: PassengersService, private readonly resourcesService: ResourcesService, private readonly actors: ActorContextService) {}

  @Query(() => SystemStatus) async systemStatus(): Promise<SystemStatus> { return { state: (await this.systemStatusQuery.state()) as SystemState }; }
  @Query(() => [CrewLeadSummary]) async activeCrewLeads(@Context() context: RequestContext): Promise<CrewLeadSummary[]> { await this.actors.crewLead(context); return this.crewLeadQuery.active(); }
  @Query(() => CrewLead) async myCrewLeadProfile(@Context() context: RequestContext): Promise<CrewLead> { return this.crewLeadQuery.byId((await this.actors.crewLead(context)).id); }
  @Query(() => CrewLead) async crewLead(@Args('id', { type: () => ID }) id: string, @Context() context: RequestContext): Promise<CrewLead> { await this.actors.crewLead(context); return this.crewLeadQuery.byId(id); }
  @Query(() => Passenger) async passenger(@Args('id', { type: () => ID }) id: string, @Context() context: RequestContext): Promise<Passenger> { await this.actors.crewLead(context); return this.passengerQuery.byId(id); }
  @Query(() => Passenger) async passengerByMissionCode(@Args('missionCode') missionCode: string, @Context() context: RequestContext): Promise<Passenger> { await this.actors.crewLead(context); return this.passengerQuery.byMissionCode(missionCode); }
  @Query(() => Resource) async resource(@Args('id', { type: () => ID }) id: string, @Context() context: RequestContext): Promise<Resource> { await this.actors.crewLead(context); return this.resourceQuery.byId(id); }
  @Query(() => Resource) async resourceByCode(@Args('code') code: string, @Context() context: RequestContext): Promise<Resource> { await this.actors.crewLead(context); return this.resourceQuery.byCode(code); }
  @Query(() => PassengerConnection) async passengers(@Args('page', { type: () => PageInput, nullable: true }) page: PageInput | undefined, @Args('filter', { type: () => PassengerFilter, nullable: true }) filter: PassengerFilter | undefined, @Context() context: RequestContext): Promise<PassengerConnection> { await this.actors.crewLead(context); return passengerConnection(await this.passengerQuery.list(page ?? {}, filter as PassengerFilterValue)); }
  @Query(() => ResourceConnection) async resources(@Args('page', { type: () => PageInput, nullable: true }) page: PageInput | undefined, @Args('filter', { type: () => ResourceFilter, nullable: true }) filter: ResourceFilter | undefined, @Context() context: RequestContext): Promise<ResourceConnection> { await this.actors.crewLead(context); return resourceConnection(await this.resourceQuery.list(page ?? {}, filter as ResourceFilterValue)); }
  @Query(() => DiscoverableResourceConnection) async discoverResources(@Args('page', { type: () => PageInput, nullable: true }) page: PageInput | undefined, @Args('filter', { type: () => DiscoveryFilter, nullable: true }) filter: DiscoveryFilter | undefined, @Context() context: RequestContext): Promise<DiscoverableResourceConnection> { const passenger = await this.actors.passenger(context); return discoveryConnection(await this.discovery.discover(passenger.id, page ?? {}, filter ?? {})); }

  @Mutation(() => InitializeSystemPayload) async initializeSystem(@Args('profiles', { type: () => [CrewLeadProfileInput] }) profiles: CrewLeadProfileInput[], @Context() context: RequestContext): Promise<InitializeSystemPayload> { await this.setup.initialize(this.actors.setupSecret(context), profiles); return { systemStatus: { state: (await this.systemStatusQuery.state()) as SystemState }, crewLeads: await this.crewLeadQuery.active() }; }
  @Mutation(() => CrewLeadPayload) async updateOwnCrewLeadProfile(@Args('input') input: OwnProfileInput, @Context() context: RequestContext): Promise<CrewLeadPayload> { const actor = await this.actors.crewLead(context); return { crewLead: await this.crewLeads.updateOwnProfile(actor, input, input.expectedVersion) }; }
  @Mutation(() => ReplaceCrewLeadPayload) async replaceCrewLead(@Args('outgoingId', { type: () => ID }) outgoingId: string, @Args('replacement') replacement: CrewLeadProfileInput, @Args('reason') reason: string, @Args('expectedVersion', { type: () => Int }) expectedVersion: number, @Context() context: RequestContext): Promise<ReplaceCrewLeadPayload> { const actor = await this.actors.crewLead(context); const outgoing = await this.crewLeadQuery.byId(outgoingId); const replacementLead = await this.crewLeads.replace(actor, outgoingId, replacement, reason, expectedVersion); return { outgoingCrewLead: await this.crewLeadQuery.byId(outgoing.id), replacementCrewLead: replacementLead }; }
  @Mutation(() => PassengerPayload) async createPassenger(@Args('input') input: CreatePassengerInput, @Context() context: RequestContext): Promise<PassengerPayload> { return { passenger: await this.passengersService.create(await this.actors.crewLead(context), input) }; }
  @Mutation(() => PassengerPayload) async updatePassenger(@Args('input') input: UpdatePassengerInput, @Context() context: RequestContext): Promise<PassengerPayload> { const { id, expectedVersion, ...update } = input; return { passenger: await this.passengersService.update(await this.actors.crewLead(context), id, update, expectedVersion) }; }
  @Mutation(() => PassengerPayload) async changePassengerMembership(@Args('id', { type: () => ID }) id: string, @Args('membershipLevel', { type: () => MembershipLevel }) membershipLevel: MembershipLevel, @Args('expectedVersion', { type: () => Int }) expectedVersion: number, @Context() context: RequestContext): Promise<PassengerPayload> { return { passenger: await this.passengersService.changeMembership(await this.actors.crewLead(context), id, membershipLevel, expectedVersion) }; }
  @Mutation(() => PassengerPayload) async deactivatePassenger(@Args('id', { type: () => ID }) id: string, @Args('reason') reason: string, @Args('expectedVersion', { type: () => Int }) expectedVersion: number, @Context() context: RequestContext): Promise<PassengerPayload> { return { passenger: await this.passengersService.deactivate(await this.actors.crewLead(context), id, reason, expectedVersion) }; }
  @Mutation(() => ResourcePayload) async provisionResource(@Args('input') input: ProvisionResourceInput, @Context() context: RequestContext): Promise<ResourcePayload> { return { resource: await this.resourcesService.create(await this.actors.crewLead(context), input) }; }
  @Mutation(() => ResourcePayload) async updateResource(@Args('input') input: UpdateResourceInput, @Context() context: RequestContext): Promise<ResourcePayload> { const { id, expectedVersion, ...update } = input; return { resource: await this.resourcesService.update(await this.actors.crewLead(context), id, update, expectedVersion) }; }
  @Mutation(() => ResourcePayload) async transitionResourceStatus(@Args('id', { type: () => ID }) id: string, @Args('status', { type: () => ResourceStatus }) status: ResourceStatus, @Args('reason') reason: string, @Args('expectedVersion', { type: () => Int }) expectedVersion: number, @Context() context: RequestContext): Promise<ResourcePayload> { return { resource: await this.resourcesService.transition(await this.actors.crewLead(context), id, status as ResourceEntity['status'], reason, expectedVersion) }; }
}
function passengerConnection(value: { edges: { node: PassengerEntity; cursor: string }[]; hasNextPage: boolean; endCursor: string | null; totalCount: number }): PassengerConnection { return { edges: value.edges, pageInfo: { hasNextPage: value.hasNextPage, endCursor: value.endCursor }, totalCount: value.totalCount }; }
function resourceConnection(value: { edges: { node: ResourceEntity; cursor: string }[]; hasNextPage: boolean; endCursor: string | null; totalCount: number }): ResourceConnection { return { edges: value.edges, pageInfo: { hasNextPage: value.hasNextPage, endCursor: value.endCursor }, totalCount: value.totalCount }; }
function discoveryConnection(value: { edges: { node: ResourceEntity; cursor: string }[]; hasNextPage: boolean; endCursor: string | null; totalCount: number }): DiscoverableResourceConnection { return { edges: value.edges.map(({ cursor, node: resource }) => ({ cursor, node: { ...resource, hasMembershipAccess: true, canUseNow: resource.status === 'ACTIVE' } })), pageInfo: { hasNextPage: value.hasNextPage, endCursor: value.endCursor }, totalCount: value.totalCount }; }
