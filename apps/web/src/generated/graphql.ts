/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
};

export enum ActorRole {
  CrewLead = 'CREW_LEAD',
  Passenger = 'PASSENGER'
}

export enum AuditActorType {
  CrewLead = 'CREW_LEAD',
  Passenger = 'PASSENGER',
  System = 'SYSTEM'
}

export type AuditEvent = {
  __typename?: 'AuditEvent';
  actorType: AuditActorType;
  crewLeadActorId?: Maybe<Scalars['ID']['output']>;
  crewLeadSubjectId?: Maybe<Scalars['ID']['output']>;
  eventType: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  occurredAt: Scalars['DateTime']['output'];
  passengerActorId?: Maybe<Scalars['ID']['output']>;
  passengerSubjectId?: Maybe<Scalars['ID']['output']>;
  reasonCode?: Maybe<Scalars['String']['output']>;
  resourceSubjectId?: Maybe<Scalars['ID']['output']>;
  resourceUsageSubjectId?: Maybe<Scalars['ID']['output']>;
  result: Scalars['String']['output'];
};

export type AuditEventConnection = {
  __typename?: 'AuditEventConnection';
  edges: Array<AuditEventEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type AuditEventEdge = {
  __typename?: 'AuditEventEdge';
  cursor: Scalars['String']['output'];
  node: AuditEvent;
};

export type CreatePassengerInput = {
  cabinCode?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  fullName: Scalars['String']['input'];
  membershipLevel?: InputMaybe<MembershipLevel>;
  missionCode: Scalars['String']['input'];
};

export type CrewLead = {
  __typename?: 'CrewLead';
  active: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  deactivatedAt?: Maybe<Scalars['DateTime']['output']>;
  deactivationReason?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  fullName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  missionCode: Scalars['String']['output'];
  replacesCrewLeadId?: Maybe<Scalars['ID']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  version: Scalars['Int']['output'];
};

export type CrewLeadPayload = {
  __typename?: 'CrewLeadPayload';
  crewLead: CrewLead;
};

export type CrewLeadProfileInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  fullName: Scalars['String']['input'];
  missionCode: Scalars['String']['input'];
};

export type CrewLeadSummary = {
  __typename?: 'CrewLeadSummary';
  active: Scalars['Boolean']['output'];
  email?: Maybe<Scalars['String']['output']>;
  fullName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  missionCode: Scalars['String']['output'];
  version: Scalars['Int']['output'];
};

export type CurrentActor = {
  __typename?: 'CurrentActor';
  active: Scalars['Boolean']['output'];
  displayName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  role: ActorRole;
};

export type DiscoverableResource = {
  __typename?: 'DiscoverableResource';
  canUseNow: Scalars['Boolean']['output'];
  category: ResourceCategory;
  code: Scalars['String']['output'];
  displayName: Scalars['String']['output'];
  hasMembershipAccess: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  minimumMembershipLevel: MembershipLevel;
  status: ResourceStatus;
};

export type DiscoverableResourceConnection = {
  __typename?: 'DiscoverableResourceConnection';
  edges: Array<DiscoverableResourceEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type DiscoverableResourceEdge = {
  __typename?: 'DiscoverableResourceEdge';
  cursor: Scalars['String']['output'];
  node: DiscoverableResource;
};

export type DiscoveryFilter = {
  categories?: InputMaybe<Array<ResourceCategory>>;
  statuses?: InputMaybe<Array<ResourceStatus>>;
  text?: InputMaybe<Scalars['String']['input']>;
};

export type Health = {
  __typename?: 'Health';
  database: Scalars['String']['output'];
  status: Scalars['String']['output'];
  timestamp: Scalars['String']['output'];
};

export enum HistorySort {
  Newest = 'NEWEST',
  Oldest = 'OLDEST'
}

export type InitializeSystemPayload = {
  __typename?: 'InitializeSystemPayload';
  crewLeads: Array<CrewLead>;
  systemStatus: SystemStatus;
};

export enum InteractionOutcome {
  Allowed = 'ALLOWED',
  Denied = 'DENIED'
}

export enum MembershipLevel {
  Gold = 'GOLD',
  Platinum = 'PLATINUM',
  Silver = 'SILVER'
}

export type MembershipUsageGroup = {
  __typename?: 'MembershipUsageGroup';
  allowedCount: Scalars['Int']['output'];
  deniedCount: Scalars['Int']['output'];
  membershipLevel: MembershipLevel;
  totalAttempts: Scalars['Int']['output'];
};

export type MembershipUsageReport = {
  __typename?: 'MembershipUsageReport';
  groups: Array<MembershipUsageGroup>;
  window: ReportingWindow;
};

export type Mutation = {
  __typename?: 'Mutation';
  changePassengerMembership: PassengerPayload;
  createPassenger: PassengerPayload;
  deactivatePassenger: PassengerPayload;
  initializeSystem: InitializeSystemPayload;
  provisionResource: ResourcePayload;
  replaceCrewLead: ReplaceCrewLeadPayload;
  transitionResourceStatus: ResourcePayload;
  updateOwnCrewLeadProfile: CrewLeadPayload;
  updatePassenger: PassengerPayload;
  updateResource: ResourcePayload;
  useResource: UseResourcePayload;
};


export type MutationChangePassengerMembershipArgs = {
  expectedVersion: Scalars['Int']['input'];
  id: Scalars['ID']['input'];
  membershipLevel: MembershipLevel;
};


export type MutationCreatePassengerArgs = {
  input: CreatePassengerInput;
};


export type MutationDeactivatePassengerArgs = {
  expectedVersion: Scalars['Int']['input'];
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};


export type MutationInitializeSystemArgs = {
  profiles: Array<CrewLeadProfileInput>;
};


export type MutationProvisionResourceArgs = {
  input: ProvisionResourceInput;
};


export type MutationReplaceCrewLeadArgs = {
  expectedVersion: Scalars['Int']['input'];
  outgoingId: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
  replacement: CrewLeadProfileInput;
};


export type MutationTransitionResourceStatusArgs = {
  expectedVersion: Scalars['Int']['input'];
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
  status: ResourceStatus;
};


export type MutationUpdateOwnCrewLeadProfileArgs = {
  input: OwnProfileInput;
};


export type MutationUpdatePassengerArgs = {
  input: UpdatePassengerInput;
};


export type MutationUpdateResourceArgs = {
  input: UpdateResourceInput;
};


export type MutationUseResourceArgs = {
  input: UseResourceInput;
};

export type OwnProfileInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  expectedVersion: Scalars['Int']['input'];
  fullName: Scalars['String']['input'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type PageInput = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};

export type Passenger = {
  __typename?: 'Passenger';
  active: Scalars['Boolean']['output'];
  cabinCode?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  deactivatedAt?: Maybe<Scalars['DateTime']['output']>;
  deactivationReason?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  fullName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  membershipLevel: MembershipLevel;
  missionCode: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  version: Scalars['Int']['output'];
};

export type PassengerConnection = {
  __typename?: 'PassengerConnection';
  edges: Array<PassengerEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PassengerEdge = {
  __typename?: 'PassengerEdge';
  cursor: Scalars['String']['output'];
  node: Passenger;
};

export type PassengerFilter = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  membershipLevels?: InputMaybe<Array<MembershipLevel>>;
  text?: InputMaybe<Scalars['String']['input']>;
};

export type PassengerPayload = {
  __typename?: 'PassengerPayload';
  passenger: Passenger;
};

export type ProvisionResourceInput = {
  category: ResourceCategory;
  code: Scalars['String']['input'];
  displayName: Scalars['String']['input'];
  minimumMembershipLevel?: InputMaybe<MembershipLevel>;
};

export type Query = {
  __typename?: 'Query';
  activeCrewLeads: Array<CrewLeadSummary>;
  auditEvents: AuditEventConnection;
  crewLead: CrewLead;
  currentActor: CurrentActor;
  discoverResources: DiscoverableResourceConnection;
  health: Health;
  myCrewLeadProfile: CrewLead;
  myUsageHistory: ResourceInteractionConnection;
  passenger: Passenger;
  passengerByMissionCode: Passenger;
  passengers: PassengerConnection;
  resource: Resource;
  resourceByCode: Resource;
  resourceDemand: ResourceDemandReport;
  resources: ResourceConnection;
  systemStatus: SystemStatus;
  usageByMembership: MembershipUsageReport;
  usageReportSummary: UsageReportSummary;
};


export type QueryAuditEventsArgs = {
  page?: InputMaybe<PageInput>;
};


export type QueryCrewLeadArgs = {
  id: Scalars['ID']['input'];
};


export type QueryDiscoverResourcesArgs = {
  filter?: InputMaybe<DiscoveryFilter>;
  page?: InputMaybe<PageInput>;
};


export type QueryMyUsageHistoryArgs = {
  filter?: InputMaybe<ReportingFilter>;
  page?: InputMaybe<PageInput>;
  sort?: InputMaybe<HistorySort>;
  window: ReportingWindowInput;
};


export type QueryPassengerArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPassengerByMissionCodeArgs = {
  missionCode: Scalars['String']['input'];
};


export type QueryPassengersArgs = {
  filter?: InputMaybe<PassengerFilter>;
  page?: InputMaybe<PageInput>;
};


export type QueryResourceArgs = {
  id: Scalars['ID']['input'];
};


export type QueryResourceByCodeArgs = {
  code: Scalars['String']['input'];
};


export type QueryResourceDemandArgs = {
  filter?: InputMaybe<ReportingFilter>;
  page?: InputMaybe<PageInput>;
  window: ReportingWindowInput;
};


export type QueryResourcesArgs = {
  filter?: InputMaybe<ResourceFilter>;
  page?: InputMaybe<PageInput>;
};


export type QueryUsageByMembershipArgs = {
  filter?: InputMaybe<ReportingFilter>;
  window: ReportingWindowInput;
};


export type QueryUsageReportSummaryArgs = {
  filter?: InputMaybe<ReportingFilter>;
  window: ReportingWindowInput;
};

export type ReplaceCrewLeadPayload = {
  __typename?: 'ReplaceCrewLeadPayload';
  outgoingCrewLead: CrewLead;
  replacementCrewLead: CrewLead;
};

export type ReportingFilter = {
  categories?: InputMaybe<Array<ResourceCategory>>;
  denialReasons?: InputMaybe<Array<Scalars['String']['input']>>;
  membershipLevels?: InputMaybe<Array<MembershipLevel>>;
  outcomes?: InputMaybe<Array<InteractionOutcome>>;
  resourceText?: InputMaybe<Scalars['String']['input']>;
};

export type ReportingWindow = {
  __typename?: 'ReportingWindow';
  from: Scalars['DateTime']['output'];
  to: Scalars['DateTime']['output'];
};

export type ReportingWindowInput = {
  from: Scalars['DateTime']['input'];
  to: Scalars['DateTime']['input'];
};

export type Resource = {
  __typename?: 'Resource';
  category: ResourceCategory;
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  decommissionedAt?: Maybe<Scalars['DateTime']['output']>;
  displayName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  minimumMembershipLevel: MembershipLevel;
  status: ResourceStatus;
  statusChangeReason?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  version: Scalars['Int']['output'];
};

export enum ResourceCategory {
  Fitness = 'FITNESS',
  Food = 'FOOD',
  Hygiene = 'HYGIENE',
  Medical = 'MEDICAL',
  Oxygen = 'OXYGEN',
  Recreation = 'RECREATION',
  Sleeping = 'SLEEPING'
}

export type ResourceConnection = {
  __typename?: 'ResourceConnection';
  edges: Array<ResourceEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ResourceDemandConnection = {
  __typename?: 'ResourceDemandConnection';
  edges: Array<ResourceDemandEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ResourceDemandEdge = {
  __typename?: 'ResourceDemandEdge';
  cursor: Scalars['String']['output'];
  node: ResourceDemandRow;
};

export type ResourceDemandReport = {
  __typename?: 'ResourceDemandReport';
  demand: ResourceDemandConnection;
  window: ReportingWindow;
};

export type ResourceDemandRow = {
  __typename?: 'ResourceDemandRow';
  allowedCount: Scalars['Int']['output'];
  deniedCount: Scalars['Int']['output'];
  resourceCategory: ResourceCategory;
  resourceCode: Scalars['String']['output'];
  resourceDisplayName: Scalars['String']['output'];
  resourceId: Scalars['ID']['output'];
  resourceMinimumMembershipLevel: MembershipLevel;
  totalAttempts: Scalars['Int']['output'];
};

export type ResourceEdge = {
  __typename?: 'ResourceEdge';
  cursor: Scalars['String']['output'];
  node: Resource;
};

export type ResourceFilter = {
  categories?: InputMaybe<Array<ResourceCategory>>;
  minimumMembershipLevels?: InputMaybe<Array<MembershipLevel>>;
  statuses?: InputMaybe<Array<ResourceStatus>>;
  text?: InputMaybe<Scalars['String']['input']>;
};

export type ResourceInteraction = {
  __typename?: 'ResourceInteraction';
  denialReason?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  occurredAt: Scalars['DateTime']['output'];
  outcome: InteractionOutcome;
  passengerMembershipLevel?: Maybe<MembershipLevel>;
  passengerMissionCode?: Maybe<Scalars['String']['output']>;
  resourceCategory?: Maybe<ResourceCategory>;
  resourceCode?: Maybe<Scalars['String']['output']>;
  resourceDisplayName?: Maybe<Scalars['String']['output']>;
  resourceId?: Maybe<Scalars['ID']['output']>;
  resourceMinimumMembershipLevel?: Maybe<MembershipLevel>;
  resourceStatus?: Maybe<ResourceStatus>;
};

export type ResourceInteractionConnection = {
  __typename?: 'ResourceInteractionConnection';
  edges: Array<ResourceInteractionEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ResourceInteractionEdge = {
  __typename?: 'ResourceInteractionEdge';
  cursor: Scalars['String']['output'];
  node: ResourceInteraction;
};

export type ResourcePayload = {
  __typename?: 'ResourcePayload';
  resource: Resource;
};

export enum ResourceStatus {
  Active = 'ACTIVE',
  Decommissioned = 'DECOMMISSIONED',
  OutOfService = 'OUT_OF_SERVICE'
}

export type ResourceUsage = {
  __typename?: 'ResourceUsage';
  id: Scalars['ID']['output'];
  occurredAt: Scalars['DateTime']['output'];
  passengerId: Scalars['ID']['output'];
  passengerMembershipLevel: MembershipLevel;
  passengerMissionCode: Scalars['String']['output'];
  resourceCategory: ResourceCategory;
  resourceCode: Scalars['String']['output'];
  resourceDisplayName: Scalars['String']['output'];
  resourceId: Scalars['ID']['output'];
  resourceMinimumMembershipLevel: MembershipLevel;
  resourceStatus: ResourceStatus;
};

export enum SystemState {
  Operational = 'OPERATIONAL',
  Uninitialized = 'UNINITIALIZED'
}

export type SystemStatus = {
  __typename?: 'SystemStatus';
  state: SystemState;
};

export type UpdatePassengerInput = {
  cabinCode?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  expectedVersion: Scalars['Int']['input'];
  fullName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type UpdateResourceInput = {
  displayName?: InputMaybe<Scalars['String']['input']>;
  expectedVersion: Scalars['Int']['input'];
  id: Scalars['ID']['input'];
  minimumMembershipLevel?: InputMaybe<MembershipLevel>;
};

export type UsageReportSummary = {
  __typename?: 'UsageReportSummary';
  allowedCount: Scalars['Int']['output'];
  denialRate: Scalars['Float']['output'];
  deniedCount: Scalars['Int']['output'];
  totalAttempts: Scalars['Int']['output'];
  window: ReportingWindow;
};

export type UseResourceInput = {
  idempotencyKey: Scalars['String']['input'];
  resourceId: Scalars['ID']['input'];
};

export type UseResourcePayload = {
  __typename?: 'UseResourcePayload';
  allowed: Scalars['Boolean']['output'];
  denialReason?: Maybe<Scalars['String']['output']>;
  usage?: Maybe<ResourceUsage>;
};

export type HealthQueryVariables = Exact<{ [key: string]: never; }>;


export type HealthQuery = { __typename?: 'Query', health: { __typename?: 'Health', status: string, timestamp: string, database: string } };

export type SystemStatusQueryVariables = Exact<{ [key: string]: never; }>;


export type SystemStatusQuery = { __typename?: 'Query', systemStatus: { __typename?: 'SystemStatus', state: SystemState } };

export type MyCrewLeadProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type MyCrewLeadProfileQuery = { __typename?: 'Query', myCrewLeadProfile: { __typename?: 'CrewLead', id: string, missionCode: string, fullName: string, active: boolean } };

export type PassengersQueryVariables = Exact<{
  filter?: InputMaybe<PassengerFilter>;
  page?: InputMaybe<PageInput>;
}>;


export type PassengersQuery = { __typename?: 'Query', passengers: { __typename?: 'PassengerConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean }, edges: Array<{ __typename?: 'PassengerEdge', cursor: string, node: { __typename?: 'Passenger', id: string, missionCode: string, fullName: string, email?: string | null, cabinCode?: string | null, membershipLevel: MembershipLevel, active: boolean, deactivationReason?: string | null, version: number } }> } };

export type CreatePassengerMutationVariables = Exact<{
  input: CreatePassengerInput;
}>;


export type CreatePassengerMutation = { __typename?: 'Mutation', createPassenger: { __typename?: 'PassengerPayload', passenger: { __typename?: 'Passenger', id: string, missionCode: string, fullName: string, email?: string | null, cabinCode?: string | null, membershipLevel: MembershipLevel, active: boolean, version: number } } };

export type UpdatePassengerMutationVariables = Exact<{
  input: UpdatePassengerInput;
}>;


export type UpdatePassengerMutation = { __typename?: 'Mutation', updatePassenger: { __typename?: 'PassengerPayload', passenger: { __typename?: 'Passenger', id: string, missionCode: string, fullName: string, email?: string | null, cabinCode?: string | null, membershipLevel: MembershipLevel, active: boolean, version: number } } };

export type ChangePassengerMembershipMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  membershipLevel: MembershipLevel;
  expectedVersion: Scalars['Int']['input'];
}>;


export type ChangePassengerMembershipMutation = { __typename?: 'Mutation', changePassengerMembership: { __typename?: 'PassengerPayload', passenger: { __typename?: 'Passenger', id: string, membershipLevel: MembershipLevel, version: number } } };

export type DeactivatePassengerMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
  expectedVersion: Scalars['Int']['input'];
}>;


export type DeactivatePassengerMutation = { __typename?: 'Mutation', deactivatePassenger: { __typename?: 'PassengerPayload', passenger: { __typename?: 'Passenger', id: string, active: boolean, deactivationReason?: string | null, version: number } } };

export type ResourcesQueryVariables = Exact<{
  filter?: InputMaybe<ResourceFilter>;
  page?: InputMaybe<PageInput>;
}>;


export type ResourcesQuery = { __typename?: 'Query', resources: { __typename?: 'ResourceConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean }, edges: Array<{ __typename?: 'ResourceEdge', cursor: string, node: { __typename?: 'Resource', id: string, code: string, displayName: string, category: ResourceCategory, minimumMembershipLevel: MembershipLevel, status: ResourceStatus, statusChangeReason?: string | null, version: number } }> } };

export type ProvisionResourceMutationVariables = Exact<{
  input: ProvisionResourceInput;
}>;


export type ProvisionResourceMutation = { __typename?: 'Mutation', provisionResource: { __typename?: 'ResourcePayload', resource: { __typename?: 'Resource', id: string, code: string, displayName: string, category: ResourceCategory, minimumMembershipLevel: MembershipLevel, status: ResourceStatus, version: number } } };

export type UpdateResourceMutationVariables = Exact<{
  input: UpdateResourceInput;
}>;


export type UpdateResourceMutation = { __typename?: 'Mutation', updateResource: { __typename?: 'ResourcePayload', resource: { __typename?: 'Resource', id: string, code: string, displayName: string, category: ResourceCategory, minimumMembershipLevel: MembershipLevel, status: ResourceStatus, version: number } } };

export type TransitionResourceStatusMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  status: ResourceStatus;
  reason: Scalars['String']['input'];
  expectedVersion: Scalars['Int']['input'];
}>;


export type TransitionResourceStatusMutation = { __typename?: 'Mutation', transitionResourceStatus: { __typename?: 'ResourcePayload', resource: { __typename?: 'Resource', id: string, status: ResourceStatus, statusChangeReason?: string | null, version: number } } };

export type DiscoverResourcesQueryVariables = Exact<{
  filter?: InputMaybe<DiscoveryFilter>;
  page?: InputMaybe<PageInput>;
}>;


export type DiscoverResourcesQuery = { __typename?: 'Query', discoverResources: { __typename?: 'DiscoverableResourceConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean }, edges: Array<{ __typename?: 'DiscoverableResourceEdge', cursor: string, node: { __typename?: 'DiscoverableResource', id: string, code: string, displayName: string, category: ResourceCategory, minimumMembershipLevel: MembershipLevel, status: ResourceStatus, hasMembershipAccess: boolean, canUseNow: boolean } }> } };

export type UseResourceMutationVariables = Exact<{
  input: UseResourceInput;
}>;


export type UseResourceMutation = { __typename?: 'Mutation', useResource: { __typename?: 'UseResourcePayload', allowed: boolean, denialReason?: string | null, usage?: { __typename?: 'ResourceUsage', id: string, resourceId: string, resourceCode: string, resourceDisplayName: string, occurredAt: any } | null } };

export type AuditEventsQueryVariables = Exact<{
  page?: InputMaybe<PageInput>;
}>;


export type AuditEventsQuery = { __typename?: 'Query', auditEvents: { __typename?: 'AuditEventConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean }, edges: Array<{ __typename?: 'AuditEventEdge', cursor: string, node: { __typename?: 'AuditEvent', id: string, eventType: string, result: string, reasonCode?: string | null, actorType: AuditActorType, crewLeadActorId?: string | null, passengerActorId?: string | null, crewLeadSubjectId?: string | null, passengerSubjectId?: string | null, resourceSubjectId?: string | null, resourceUsageSubjectId?: string | null, occurredAt: any } }> } };

export type CrewLeadManagementQueryVariables = Exact<{ [key: string]: never; }>;


export type CrewLeadManagementQuery = { __typename?: 'Query', activeCrewLeads: Array<{ __typename?: 'CrewLeadSummary', id: string, missionCode: string, fullName: string, email?: string | null, active: boolean, version: number }>, myCrewLeadProfile: { __typename?: 'CrewLead', id: string, missionCode: string, fullName: string, email?: string | null, active: boolean, version: number } };

export type UpdateOwnCrewLeadProfileMutationVariables = Exact<{
  input: OwnProfileInput;
}>;


export type UpdateOwnCrewLeadProfileMutation = { __typename?: 'Mutation', updateOwnCrewLeadProfile: { __typename?: 'CrewLeadPayload', crewLead: { __typename?: 'CrewLead', id: string, missionCode: string, fullName: string, email?: string | null, active: boolean, version: number } } };

export type ReplaceCrewLeadMutationVariables = Exact<{
  outgoingId: Scalars['ID']['input'];
  replacement: CrewLeadProfileInput;
  reason: Scalars['String']['input'];
  expectedVersion: Scalars['Int']['input'];
}>;


export type ReplaceCrewLeadMutation = { __typename?: 'Mutation', replaceCrewLead: { __typename?: 'ReplaceCrewLeadPayload', outgoingCrewLead: { __typename?: 'CrewLead', id: string, active: boolean, deactivationReason?: string | null, deactivatedAt?: any | null }, replacementCrewLead: { __typename?: 'CrewLead', id: string, missionCode: string, fullName: string, email?: string | null, active: boolean, version: number, replacesCrewLeadId?: string | null } } };

export type MyUsageHistoryQueryVariables = Exact<{
  window: ReportingWindowInput;
  filter?: InputMaybe<ReportingFilter>;
  sort?: InputMaybe<HistorySort>;
  page?: InputMaybe<PageInput>;
}>;


export type MyUsageHistoryQuery = { __typename?: 'Query', myUsageHistory: { __typename?: 'ResourceInteractionConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean }, edges: Array<{ __typename?: 'ResourceInteractionEdge', cursor: string, node: { __typename?: 'ResourceInteraction', id: string, outcome: InteractionOutcome, denialReason?: string | null, occurredAt: any, passengerMembershipLevel?: MembershipLevel | null, resourceId?: string | null, resourceCode?: string | null, resourceDisplayName?: string | null, resourceCategory?: ResourceCategory | null, resourceMinimumMembershipLevel?: MembershipLevel | null, resourceStatus?: ResourceStatus | null } }> } };

export type UsageReportSummaryQueryVariables = Exact<{
  window: ReportingWindowInput;
  filter?: InputMaybe<ReportingFilter>;
}>;


export type UsageReportSummaryQuery = { __typename?: 'Query', usageReportSummary: { __typename?: 'UsageReportSummary', allowedCount: number, deniedCount: number, totalAttempts: number, denialRate: number, window: { __typename?: 'ReportingWindow', from: any, to: any } } };

export type UsageByMembershipQueryVariables = Exact<{
  window: ReportingWindowInput;
  filter?: InputMaybe<ReportingFilter>;
}>;


export type UsageByMembershipQuery = { __typename?: 'Query', usageByMembership: { __typename?: 'MembershipUsageReport', window: { __typename?: 'ReportingWindow', from: any, to: any }, groups: Array<{ __typename?: 'MembershipUsageGroup', membershipLevel: MembershipLevel, allowedCount: number, deniedCount: number, totalAttempts: number }> } };

export type ResourceDemandQueryVariables = Exact<{
  window: ReportingWindowInput;
  filter?: InputMaybe<ReportingFilter>;
  page?: InputMaybe<PageInput>;
}>;


export type ResourceDemandQuery = { __typename?: 'Query', resourceDemand: { __typename?: 'ResourceDemandReport', window: { __typename?: 'ReportingWindow', from: any, to: any }, demand: { __typename?: 'ResourceDemandConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean }, edges: Array<{ __typename?: 'ResourceDemandEdge', cursor: string, node: { __typename?: 'ResourceDemandRow', resourceId: string, resourceCode: string, resourceDisplayName: string, resourceCategory: ResourceCategory, resourceMinimumMembershipLevel: MembershipLevel, allowedCount: number, deniedCount: number, totalAttempts: number } }> } } };


export const HealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Health"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"health"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"database"}}]}}]}}]} as unknown as DocumentNode<HealthQuery, HealthQueryVariables>;
export const SystemStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SystemStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"systemStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}}]}}]}}]} as unknown as DocumentNode<SystemStatusQuery, SystemStatusQueryVariables>;
export const MyCrewLeadProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyCrewLeadProfile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myCrewLeadProfile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"missionCode"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"active"}}]}}]}}]} as unknown as DocumentNode<MyCrewLeadProfileQuery, MyCrewLeadProfileQueryVariables>;
export const PassengersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Passengers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PassengerFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PageInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"passengers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"missionCode"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"cabinCode"}},{"kind":"Field","name":{"kind":"Name","value":"membershipLevel"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"deactivationReason"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}}]}}]}}]}}]} as unknown as DocumentNode<PassengersQuery, PassengersQueryVariables>;
export const CreatePassengerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreatePassenger"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePassengerInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPassenger"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"passenger"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"missionCode"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"cabinCode"}},{"kind":"Field","name":{"kind":"Name","value":"membershipLevel"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}}]}}]}}]} as unknown as DocumentNode<CreatePassengerMutation, CreatePassengerMutationVariables>;
export const UpdatePassengerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePassenger"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdatePassengerInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePassenger"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"passenger"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"missionCode"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"cabinCode"}},{"kind":"Field","name":{"kind":"Name","value":"membershipLevel"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}}]}}]}}]} as unknown as DocumentNode<UpdatePassengerMutation, UpdatePassengerMutationVariables>;
export const ChangePassengerMembershipDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangePassengerMembership"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"membershipLevel"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MembershipLevel"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changePassengerMembership"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"membershipLevel"},"value":{"kind":"Variable","name":{"kind":"Name","value":"membershipLevel"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedVersion"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"passenger"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"membershipLevel"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}}]}}]}}]} as unknown as DocumentNode<ChangePassengerMembershipMutation, ChangePassengerMembershipMutationVariables>;
export const DeactivatePassengerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeactivatePassenger"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deactivatePassenger"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedVersion"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"passenger"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"deactivationReason"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}}]}}]}}]} as unknown as DocumentNode<DeactivatePassengerMutation, DeactivatePassengerMutationVariables>;
export const ResourcesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Resources"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ResourceFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PageInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resources"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"minimumMembershipLevel"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"statusChangeReason"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ResourcesQuery, ResourcesQueryVariables>;
export const ProvisionResourceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ProvisionResource"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProvisionResourceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"provisionResource"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resource"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"minimumMembershipLevel"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}}]}}]}}]} as unknown as DocumentNode<ProvisionResourceMutation, ProvisionResourceMutationVariables>;
export const UpdateResourceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateResource"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateResourceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateResource"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resource"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"minimumMembershipLevel"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateResourceMutation, UpdateResourceMutationVariables>;
export const TransitionResourceStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TransitionResourceStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ResourceStatus"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transitionResourceStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedVersion"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resource"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"statusChangeReason"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}}]}}]}}]} as unknown as DocumentNode<TransitionResourceStatusMutation, TransitionResourceStatusMutationVariables>;
export const DiscoverResourcesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DiscoverResources"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DiscoveryFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PageInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"discoverResources"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"minimumMembershipLevel"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"hasMembershipAccess"}},{"kind":"Field","name":{"kind":"Name","value":"canUseNow"}}]}}]}}]}}]}}]} as unknown as DocumentNode<DiscoverResourcesQuery, DiscoverResourcesQueryVariables>;
export const UseResourceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UseResource"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UseResourceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"useResource"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allowed"}},{"kind":"Field","name":{"kind":"Name","value":"denialReason"}},{"kind":"Field","name":{"kind":"Name","value":"usage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"resourceId"}},{"kind":"Field","name":{"kind":"Name","value":"resourceCode"}},{"kind":"Field","name":{"kind":"Name","value":"resourceDisplayName"}},{"kind":"Field","name":{"kind":"Name","value":"occurredAt"}}]}}]}}]}}]} as unknown as DocumentNode<UseResourceMutation, UseResourceMutationVariables>;
export const AuditEventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AuditEvents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PageInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"auditEvents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"eventType"}},{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","name":{"kind":"Name","value":"reasonCode"}},{"kind":"Field","name":{"kind":"Name","value":"actorType"}},{"kind":"Field","name":{"kind":"Name","value":"crewLeadActorId"}},{"kind":"Field","name":{"kind":"Name","value":"passengerActorId"}},{"kind":"Field","name":{"kind":"Name","value":"crewLeadSubjectId"}},{"kind":"Field","name":{"kind":"Name","value":"passengerSubjectId"}},{"kind":"Field","name":{"kind":"Name","value":"resourceSubjectId"}},{"kind":"Field","name":{"kind":"Name","value":"resourceUsageSubjectId"}},{"kind":"Field","name":{"kind":"Name","value":"occurredAt"}}]}}]}}]}}]}}]} as unknown as DocumentNode<AuditEventsQuery, AuditEventsQueryVariables>;
export const CrewLeadManagementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CrewLeadManagement"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activeCrewLeads"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"missionCode"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}},{"kind":"Field","name":{"kind":"Name","value":"myCrewLeadProfile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"missionCode"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}}]}}]} as unknown as DocumentNode<CrewLeadManagementQuery, CrewLeadManagementQueryVariables>;
export const UpdateOwnCrewLeadProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateOwnCrewLeadProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OwnProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOwnCrewLeadProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"crewLead"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"missionCode"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateOwnCrewLeadProfileMutation, UpdateOwnCrewLeadProfileMutationVariables>;
export const ReplaceCrewLeadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReplaceCrewLead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"outgoingId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"replacement"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CrewLeadProfileInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"replaceCrewLead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"outgoingId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"outgoingId"}}},{"kind":"Argument","name":{"kind":"Name","value":"replacement"},"value":{"kind":"Variable","name":{"kind":"Name","value":"replacement"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}},{"kind":"Argument","name":{"kind":"Name","value":"expectedVersion"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expectedVersion"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"outgoingCrewLead"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"deactivationReason"}},{"kind":"Field","name":{"kind":"Name","value":"deactivatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"replacementCrewLead"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"missionCode"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"replacesCrewLeadId"}}]}}]}}]}}]} as unknown as DocumentNode<ReplaceCrewLeadMutation, ReplaceCrewLeadMutationVariables>;
export const MyUsageHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyUsageHistory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"window"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ReportingWindowInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ReportingFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"HistorySort"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PageInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myUsageHistory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"window"},"value":{"kind":"Variable","name":{"kind":"Name","value":"window"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"outcome"}},{"kind":"Field","name":{"kind":"Name","value":"denialReason"}},{"kind":"Field","name":{"kind":"Name","value":"occurredAt"}},{"kind":"Field","name":{"kind":"Name","value":"passengerMembershipLevel"}},{"kind":"Field","name":{"kind":"Name","value":"resourceId"}},{"kind":"Field","name":{"kind":"Name","value":"resourceCode"}},{"kind":"Field","name":{"kind":"Name","value":"resourceDisplayName"}},{"kind":"Field","name":{"kind":"Name","value":"resourceCategory"}},{"kind":"Field","name":{"kind":"Name","value":"resourceMinimumMembershipLevel"}},{"kind":"Field","name":{"kind":"Name","value":"resourceStatus"}}]}}]}}]}}]}}]} as unknown as DocumentNode<MyUsageHistoryQuery, MyUsageHistoryQueryVariables>;
export const UsageReportSummaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UsageReportSummary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"window"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ReportingWindowInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ReportingFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"usageReportSummary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"window"},"value":{"kind":"Variable","name":{"kind":"Name","value":"window"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"window"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}}]}},{"kind":"Field","name":{"kind":"Name","value":"allowedCount"}},{"kind":"Field","name":{"kind":"Name","value":"deniedCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalAttempts"}},{"kind":"Field","name":{"kind":"Name","value":"denialRate"}}]}}]}}]} as unknown as DocumentNode<UsageReportSummaryQuery, UsageReportSummaryQueryVariables>;
export const UsageByMembershipDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UsageByMembership"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"window"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ReportingWindowInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ReportingFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"usageByMembership"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"window"},"value":{"kind":"Variable","name":{"kind":"Name","value":"window"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"window"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}}]}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"membershipLevel"}},{"kind":"Field","name":{"kind":"Name","value":"allowedCount"}},{"kind":"Field","name":{"kind":"Name","value":"deniedCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalAttempts"}}]}}]}}]}}]} as unknown as DocumentNode<UsageByMembershipQuery, UsageByMembershipQueryVariables>;
export const ResourceDemandDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ResourceDemand"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"window"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ReportingWindowInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ReportingFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PageInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resourceDemand"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"window"},"value":{"kind":"Variable","name":{"kind":"Name","value":"window"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"window"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}}]}},{"kind":"Field","name":{"kind":"Name","value":"demand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resourceId"}},{"kind":"Field","name":{"kind":"Name","value":"resourceCode"}},{"kind":"Field","name":{"kind":"Name","value":"resourceDisplayName"}},{"kind":"Field","name":{"kind":"Name","value":"resourceCategory"}},{"kind":"Field","name":{"kind":"Name","value":"resourceMinimumMembershipLevel"}},{"kind":"Field","name":{"kind":"Name","value":"allowedCount"}},{"kind":"Field","name":{"kind":"Name","value":"deniedCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalAttempts"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<ResourceDemandQuery, ResourceDemandQueryVariables>;