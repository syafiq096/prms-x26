import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import {
  ResourceCategory,
  SystemState,
  AuditActorType,
} from '../database/entities';
import { MembershipLevel } from '../domain/access-policy';
import {
  InteractionOutcome,
  HistorySort,
  MembershipUsage,
} from '../application/reporting/reporting.service';
import { ActorRole, ResourceStatus } from './prms.enums';

@ObjectType()
export class SystemStatus {
  @Field(() => SystemState) state!: SystemState;
}
@ObjectType()
export class CrewLead {
  @Field(() => ID) id!: string;
  @Field() missionCode!: string;
  @Field() fullName!: string;
  @Field(() => String, { nullable: true }) email!: string | null;
  @Field() active!: boolean;
  @Field(() => ID, { nullable: true }) replacesCrewLeadId!: string | null;
  @Field(() => String, { nullable: true }) deactivationReason!: string | null;
  @Field(() => Date, { nullable: true }) deactivatedAt!: Date | null;
  @Field(() => Int) version!: number;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
}
@ObjectType()
export class CrewLeadSummary {
  @Field(() => ID) id!: string;
  @Field() missionCode!: string;
  @Field() fullName!: string;
  @Field(() => String, { nullable: true }) email!: string | null;
  @Field() active!: boolean;
  @Field(() => Int) version!: number;
}
@ObjectType()
export class Passenger {
  @Field(() => ID) id!: string;
  @Field() missionCode!: string;
  @Field() fullName!: string;
  @Field(() => String, { nullable: true }) email!: string | null;
  @Field(() => String, { nullable: true }) cabinCode!: string | null;
  @Field(() => MembershipLevel) membershipLevel!: MembershipLevel;
  @Field() active!: boolean;
  @Field(() => String, { nullable: true }) deactivationReason!: string | null;
  @Field(() => Date, { nullable: true }) deactivatedAt!: Date | null;
  @Field(() => Int) version!: number;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
}
@ObjectType()
export class Resource {
  @Field(() => ID) id!: string;
  @Field() code!: string;
  @Field() displayName!: string;
  @Field(() => ResourceCategory) category!: ResourceCategory;
  @Field(() => MembershipLevel) minimumMembershipLevel!: MembershipLevel;
  @Field(() => ResourceStatus) status!: string;
  @Field(() => String, { nullable: true }) statusChangeReason!: string | null;
  @Field(() => Date, { nullable: true }) decommissionedAt!: Date | null;
  @Field(() => Int) version!: number;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
}
@ObjectType()
export class DiscoverableResource {
  @Field(() => ID) id!: string;
  @Field() code!: string;
  @Field() displayName!: string;
  @Field(() => ResourceCategory) category!: ResourceCategory;
  @Field(() => MembershipLevel) minimumMembershipLevel!: MembershipLevel;
  @Field(() => ResourceStatus) status!: string;
  @Field() hasMembershipAccess!: boolean;
  @Field() canUseNow!: boolean;
}
@ObjectType()
export class PageInfo {
  @Field() hasNextPage!: boolean;
  @Field(() => String, { nullable: true }) endCursor!: string | null;
}
@ObjectType()
export class PassengerEdge {
  @Field() cursor!: string;
  @Field(() => Passenger) node!: Passenger;
}
@ObjectType()
export class ResourceEdge {
  @Field() cursor!: string;
  @Field(() => Resource) node!: Resource;
}
@ObjectType()
export class DiscoverableResourceEdge {
  @Field() cursor!: string;
  @Field(() => DiscoverableResource) node!: DiscoverableResource;
}
@ObjectType()
export class PassengerConnection {
  @Field(() => [PassengerEdge]) edges!: PassengerEdge[];
  @Field(() => PageInfo) pageInfo!: PageInfo;
  @Field(() => Int) totalCount!: number;
}
@ObjectType()
export class ResourceConnection {
  @Field(() => [ResourceEdge]) edges!: ResourceEdge[];
  @Field(() => PageInfo) pageInfo!: PageInfo;
  @Field(() => Int) totalCount!: number;
}
@ObjectType()
export class DiscoverableResourceConnection {
  @Field(() => [DiscoverableResourceEdge]) edges!: DiscoverableResourceEdge[];
  @Field(() => PageInfo) pageInfo!: PageInfo;
  @Field(() => Int) totalCount!: number;
}
@ObjectType()
export class InitializeSystemPayload {
  @Field(() => SystemStatus) systemStatus!: SystemStatus;
  @Field(() => [CrewLead]) crewLeads!: CrewLead[];
}
@ObjectType()
export class CrewLeadPayload {
  @Field(() => CrewLead) crewLead!: CrewLead;
}
@ObjectType()
export class ReplaceCrewLeadPayload {
  @Field(() => CrewLead) outgoingCrewLead!: CrewLead;
  @Field(() => CrewLead) replacementCrewLead!: CrewLead;
}
@ObjectType()
export class PassengerPayload {
  @Field(() => Passenger) passenger!: Passenger;
}
@ObjectType()
export class ResourcePayload {
  @Field(() => Resource) resource!: Resource;
}
@ObjectType()
export class CurrentActor {
  @Field(() => ID) id!: string;
  @Field(() => ActorRole) role!: ActorRole;
  @Field() displayName!: string;
  @Field() active!: boolean;
}
@ObjectType()
export class ResourceUsage {
  @Field(() => ID) id!: string;
  @Field(() => ID) passengerId!: string;
  @Field(() => ID) resourceId!: string;
  @Field() passengerMissionCode!: string;
  @Field(() => MembershipLevel) passengerMembershipLevel!: MembershipLevel;
  @Field() resourceCode!: string;
  @Field() resourceDisplayName!: string;
  @Field(() => ResourceCategory) resourceCategory!: ResourceCategory;
  @Field(() => MembershipLevel)
  resourceMinimumMembershipLevel!: MembershipLevel;
  @Field(() => ResourceStatus) resourceStatus!: string;
  @Field() occurredAt!: Date;
}
@ObjectType()
export class UseResourcePayload {
  @Field() allowed!: boolean;
  @Field(() => ResourceUsage, { nullable: true }) usage!: ResourceUsage | null;
  @Field(() => String, { nullable: true }) denialReason!: string | null;
}
@ObjectType()
export class AuditEvent {
  @Field(() => ID) id!: string;
  @Field() eventType!: string;
  @Field() result!: string;
  @Field(() => String, { nullable: true }) reasonCode!: string | null;
  @Field(() => AuditActorType) actorType!: AuditActorType;
  @Field(() => ID, { nullable: true }) crewLeadActorId!: string | null;
  @Field(() => ID, { nullable: true }) passengerActorId!: string | null;
  @Field(() => ID, { nullable: true }) crewLeadSubjectId!: string | null;
  @Field(() => ID, { nullable: true }) passengerSubjectId!: string | null;
  @Field(() => ID, { nullable: true }) resourceSubjectId!: string | null;
  @Field(() => ID, { nullable: true }) resourceUsageSubjectId!: string | null;
  @Field(() => Date) occurredAt!: Date;
}
@ObjectType()
export class AuditEventEdge {
  @Field() cursor!: string;
  @Field(() => AuditEvent) node!: AuditEvent;
}
@ObjectType()
export class AuditEventConnection {
  @Field(() => [AuditEventEdge]) edges!: AuditEventEdge[];
  @Field(() => PageInfo) pageInfo!: PageInfo;
  @Field(() => Int) totalCount!: number;
}
@ObjectType()
export class ReportingWindow {
  @Field() from!: Date;
  @Field() to!: Date;
}
@ObjectType()
export class ResourceInteraction {
  @Field(() => ID) id!: string;
  @Field(() => InteractionOutcome) outcome!: InteractionOutcome;
  @Field(() => String, { nullable: true }) denialReason!: string | null;
  @Field() occurredAt!: Date;
  @Field(() => String, { nullable: true }) passengerMissionCode!: string | null;
  @Field(() => MembershipLevel, { nullable: true })
  passengerMembershipLevel!: MembershipLevel | null;
  @Field(() => ID, { nullable: true }) resourceId!: string | null;
  @Field(() => String, { nullable: true }) resourceCode!: string | null;
  @Field(() => String, { nullable: true }) resourceDisplayName!: string | null;
  @Field(() => ResourceCategory, { nullable: true })
  resourceCategory!: ResourceCategory | null;
  @Field(() => MembershipLevel, { nullable: true })
  resourceMinimumMembershipLevel!: MembershipLevel | null;
  @Field(() => ResourceStatus, { nullable: true }) resourceStatus!:
    string | null;
}
@ObjectType()
export class ResourceInteractionEdge {
  @Field() cursor!: string;
  @Field(() => ResourceInteraction) node!: ResourceInteraction;
}
@ObjectType()
export class ResourceInteractionConnection {
  @Field(() => [ResourceInteractionEdge]) edges!: ResourceInteractionEdge[];
  @Field(() => PageInfo) pageInfo!: PageInfo;
  @Field(() => Int) totalCount!: number;
}
@ObjectType()
export class UsageReportSummary {
  @Field(() => ReportingWindow) window!: ReportingWindow;
  @Field(() => Int) allowedCount!: number;
  @Field(() => Int) deniedCount!: number;
  @Field(() => Int) totalAttempts!: number;
  @Field() denialRate!: number;
}
@ObjectType()
export class MembershipUsageGroup {
  @Field(() => MembershipLevel) membershipLevel!: MembershipLevel;
  @Field(() => Int) allowedCount!: number;
  @Field(() => Int) deniedCount!: number;
  @Field(() => Int) totalAttempts!: number;
}
@ObjectType()
export class MembershipUsageReport {
  @Field(() => ReportingWindow) window!: ReportingWindow;
  @Field(() => [MembershipUsageGroup]) groups!: MembershipUsage[];
}
@ObjectType()
export class ResourceDemandRow {
  @Field(() => ID) resourceId!: string;
  @Field() resourceCode!: string;
  @Field() resourceDisplayName!: string;
  @Field(() => ResourceCategory) resourceCategory!: ResourceCategory;
  @Field(() => MembershipLevel)
  resourceMinimumMembershipLevel!: MembershipLevel;
  @Field(() => Int) allowedCount!: number;
  @Field(() => Int) deniedCount!: number;
  @Field(() => Int) totalAttempts!: number;
}
@ObjectType()
export class ResourceDemandEdge {
  @Field() cursor!: string;
  @Field(() => ResourceDemandRow) node!: ResourceDemandRow;
}
@ObjectType()
export class ResourceDemandConnection {
  @Field(() => [ResourceDemandEdge]) edges!: ResourceDemandEdge[];
  @Field(() => PageInfo) pageInfo!: PageInfo;
  @Field(() => Int) totalCount!: number;
}
@ObjectType()
export class ResourceDemandReport {
  @Field(() => ReportingWindow) window!: ReportingWindow;
  @Field(() => ResourceDemandConnection) demand!: ResourceDemandConnection;
}

@InputType()
export class PageInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  first?: number;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() after?:
    string | null;
}
@InputType()
export class CrewLeadProfileInput {
  @Field() @IsString() missionCode!: string;
  @Field() @IsString() fullName!: string;
  @Field(() => String, { nullable: true }) @IsOptional() @IsEmail() email?:
    string | null;
}
@InputType()
export class OwnProfileInput {
  @Field() @IsString() fullName!: string;
  @Field(() => String, { nullable: true }) @IsOptional() @IsEmail() email?:
    string | null;
  @Field(() => Int) @IsInt() @Min(1) expectedVersion!: number;
}
@InputType()
export class CreatePassengerInput {
  @Field() @IsString() missionCode!: string;
  @Field() @IsString() fullName!: string;
  @Field(() => String, { nullable: true }) @IsOptional() @IsEmail() email?:
    string | null;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  cabinCode?: string | null;
  @Field(() => MembershipLevel, { nullable: true })
  @IsOptional()
  @IsEnum(MembershipLevel)
  membershipLevel?: MembershipLevel;
}
@InputType()
export class UpdatePassengerInput {
  @Field(() => ID) @IsUUID() id!: string;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  fullName?: string;
  @Field(() => String, { nullable: true }) @IsOptional() @IsEmail() email?:
    string | null;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  cabinCode?: string | null;
  @Field(() => Int) @IsInt() @Min(1) expectedVersion!: number;
}
@InputType()
export class PassengerFilter {
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() text?:
    string | null;
  @Field(() => Boolean, { nullable: true }) @IsOptional() active?:
    boolean | null;
  @Field(() => [MembershipLevel], { nullable: true })
  @IsOptional()
  @IsEnum(MembershipLevel, { each: true })
  membershipLevels?: MembershipLevel[] | null;
}
@InputType()
export class ProvisionResourceInput {
  @Field() @IsString() code!: string;
  @Field() @IsString() displayName!: string;
  @Field(() => ResourceCategory)
  @IsEnum(ResourceCategory)
  category!: ResourceCategory;
  @Field(() => MembershipLevel, { nullable: true })
  @IsOptional()
  @IsEnum(MembershipLevel)
  minimumMembershipLevel?: MembershipLevel;
}
@InputType()
export class UpdateResourceInput {
  @Field(() => ID) @IsUUID() id!: string;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  displayName?: string;
  @Field(() => MembershipLevel, { nullable: true })
  @IsOptional()
  @IsEnum(MembershipLevel)
  minimumMembershipLevel?: MembershipLevel;
  @Field(() => Int) @IsInt() @Min(1) expectedVersion!: number;
}
@InputType()
export class ResourceFilter {
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() text?:
    string | null;
  @Field(() => [ResourceStatus], { nullable: true })
  @IsOptional()
  @IsEnum(ResourceStatus, { each: true })
  statuses?: ResourceStatus[] | null;
  @Field(() => [ResourceCategory], { nullable: true })
  @IsOptional()
  @IsEnum(ResourceCategory, { each: true })
  categories?: ResourceCategory[] | null;
  @Field(() => [MembershipLevel], { nullable: true })
  @IsOptional()
  @IsEnum(MembershipLevel, { each: true })
  minimumMembershipLevels?: MembershipLevel[] | null;
}
@InputType()
export class DiscoveryFilter {
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() text?:
    string | null;
  @Field(() => [ResourceStatus], { nullable: true })
  @IsOptional()
  @IsEnum(ResourceStatus, { each: true })
  statuses?: ResourceStatus[] | null;
  @Field(() => [ResourceCategory], { nullable: true })
  @IsOptional()
  @IsEnum(ResourceCategory, { each: true })
  categories?: ResourceCategory[] | null;
}
@InputType()
export class UseResourceInput {
  @Field(() => ID) @IsUUID() resourceId!: string;
  @Field() @IsUUID() idempotencyKey!: string;
}
@InputType()
export class ReportingWindowInput {
  @Field() @IsDate() from!: Date;
  @Field() @IsDate() to!: Date;
}
@InputType()
export class ReportingFilter {
  @Field(() => [InteractionOutcome], { nullable: true })
  @IsOptional()
  @IsEnum(InteractionOutcome, { each: true })
  outcomes?: InteractionOutcome[] | null;
  @Field(() => [MembershipLevel], { nullable: true })
  @IsOptional()
  @IsEnum(MembershipLevel, { each: true })
  membershipLevels?: MembershipLevel[] | null;
  @Field(() => [ResourceCategory], { nullable: true })
  @IsOptional()
  @IsEnum(ResourceCategory, { each: true })
  categories?: ResourceCategory[] | null;
  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsString({ each: true })
  denialReasons?: string[] | null;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  resourceText?: string | null;
}
