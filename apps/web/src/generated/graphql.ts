/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any };
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
  fullName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  missionCode: Scalars['String']['output'];
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

export type InitializeSystemPayload = {
  __typename?: 'InitializeSystemPayload';
  crewLeads: Array<CrewLead>;
  systemStatus: SystemStatus;
};

export enum MembershipLevel {
  Gold = 'GOLD',
  Platinum = 'PLATINUM',
  Silver = 'SILVER',
}

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
  crewLead: CrewLead;
  discoverResources: DiscoverableResourceConnection;
  health: Health;
  myCrewLeadProfile: CrewLead;
  passenger: Passenger;
  passengerByMissionCode: Passenger;
  passengers: PassengerConnection;
  resource: Resource;
  resourceByCode: Resource;
  resources: ResourceConnection;
  systemStatus: SystemStatus;
};

export type QueryCrewLeadArgs = {
  id: Scalars['ID']['input'];
};

export type QueryDiscoverResourcesArgs = {
  filter?: InputMaybe<DiscoveryFilter>;
  page?: InputMaybe<PageInput>;
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

export type QueryResourcesArgs = {
  filter?: InputMaybe<ResourceFilter>;
  page?: InputMaybe<PageInput>;
};

export type ReplaceCrewLeadPayload = {
  __typename?: 'ReplaceCrewLeadPayload';
  outgoingCrewLead: CrewLead;
  replacementCrewLead: CrewLead;
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
  Sleeping = 'SLEEPING',
}

export type ResourceConnection = {
  __typename?: 'ResourceConnection';
  edges: Array<ResourceEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
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

export type ResourcePayload = {
  __typename?: 'ResourcePayload';
  resource: Resource;
};

export enum ResourceStatus {
  Active = 'ACTIVE',
  Decommissioned = 'DECOMMISSIONED',
  OutOfService = 'OUT_OF_SERVICE',
}

export enum SystemState {
  Operational = 'OPERATIONAL',
  Uninitialized = 'UNINITIALIZED',
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

export type HealthQueryVariables = Exact<{ [key: string]: never }>;

export type HealthQuery = {
  __typename?: 'Query';
  health: {
    __typename?: 'Health';
    status: string;
    timestamp: string;
    database: string;
  };
};

export type SystemStatusQueryVariables = Exact<{ [key: string]: never }>;

export type SystemStatusQuery = {
  __typename?: 'Query';
  systemStatus: { __typename?: 'SystemStatus'; state: SystemState };
};

export type MyCrewLeadProfileQueryVariables = Exact<{ [key: string]: never }>;

export type MyCrewLeadProfileQuery = {
  __typename?: 'Query';
  myCrewLeadProfile: {
    __typename?: 'CrewLead';
    id: string;
    missionCode: string;
    fullName: string;
    active: boolean;
  };
};

export type PassengersQueryVariables = Exact<{
  filter?: InputMaybe<PassengerFilter>;
  page?: InputMaybe<PageInput>;
}>;

export type PassengersQuery = {
  __typename?: 'Query';
  passengers: {
    __typename?: 'PassengerConnection';
    totalCount: number;
    pageInfo: {
      __typename?: 'PageInfo';
      endCursor?: string | null;
      hasNextPage: boolean;
    };
    edges: Array<{
      __typename?: 'PassengerEdge';
      cursor: string;
      node: {
        __typename?: 'Passenger';
        id: string;
        missionCode: string;
        fullName: string;
        email?: string | null;
        cabinCode?: string | null;
        membershipLevel: MembershipLevel;
        active: boolean;
        deactivationReason?: string | null;
        version: number;
      };
    }>;
  };
};

export type CreatePassengerMutationVariables = Exact<{
  input: CreatePassengerInput;
}>;

export type CreatePassengerMutation = {
  __typename?: 'Mutation';
  createPassenger: {
    __typename?: 'PassengerPayload';
    passenger: {
      __typename?: 'Passenger';
      id: string;
      missionCode: string;
      fullName: string;
      email?: string | null;
      cabinCode?: string | null;
      membershipLevel: MembershipLevel;
      active: boolean;
      version: number;
    };
  };
};

export type UpdatePassengerMutationVariables = Exact<{
  input: UpdatePassengerInput;
}>;

export type UpdatePassengerMutation = {
  __typename?: 'Mutation';
  updatePassenger: {
    __typename?: 'PassengerPayload';
    passenger: {
      __typename?: 'Passenger';
      id: string;
      missionCode: string;
      fullName: string;
      email?: string | null;
      cabinCode?: string | null;
      membershipLevel: MembershipLevel;
      active: boolean;
      version: number;
    };
  };
};

export type ChangePassengerMembershipMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  membershipLevel: MembershipLevel;
  expectedVersion: Scalars['Int']['input'];
}>;

export type ChangePassengerMembershipMutation = {
  __typename?: 'Mutation';
  changePassengerMembership: {
    __typename?: 'PassengerPayload';
    passenger: {
      __typename?: 'Passenger';
      id: string;
      membershipLevel: MembershipLevel;
      version: number;
    };
  };
};

export type DeactivatePassengerMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
  expectedVersion: Scalars['Int']['input'];
}>;

export type DeactivatePassengerMutation = {
  __typename?: 'Mutation';
  deactivatePassenger: {
    __typename?: 'PassengerPayload';
    passenger: {
      __typename?: 'Passenger';
      id: string;
      active: boolean;
      deactivationReason?: string | null;
      version: number;
    };
  };
};

export type ResourcesQueryVariables = Exact<{
  filter?: InputMaybe<ResourceFilter>;
  page?: InputMaybe<PageInput>;
}>;

export type ResourcesQuery = {
  __typename?: 'Query';
  resources: {
    __typename?: 'ResourceConnection';
    totalCount: number;
    pageInfo: {
      __typename?: 'PageInfo';
      endCursor?: string | null;
      hasNextPage: boolean;
    };
    edges: Array<{
      __typename?: 'ResourceEdge';
      cursor: string;
      node: {
        __typename?: 'Resource';
        id: string;
        code: string;
        displayName: string;
        category: ResourceCategory;
        minimumMembershipLevel: MembershipLevel;
        status: ResourceStatus;
        statusChangeReason?: string | null;
        version: number;
      };
    }>;
  };
};

export type ProvisionResourceMutationVariables = Exact<{
  input: ProvisionResourceInput;
}>;

export type ProvisionResourceMutation = {
  __typename?: 'Mutation';
  provisionResource: {
    __typename?: 'ResourcePayload';
    resource: {
      __typename?: 'Resource';
      id: string;
      code: string;
      displayName: string;
      category: ResourceCategory;
      minimumMembershipLevel: MembershipLevel;
      status: ResourceStatus;
      version: number;
    };
  };
};

export type UpdateResourceMutationVariables = Exact<{
  input: UpdateResourceInput;
}>;

export type UpdateResourceMutation = {
  __typename?: 'Mutation';
  updateResource: {
    __typename?: 'ResourcePayload';
    resource: {
      __typename?: 'Resource';
      id: string;
      code: string;
      displayName: string;
      category: ResourceCategory;
      minimumMembershipLevel: MembershipLevel;
      status: ResourceStatus;
      version: number;
    };
  };
};

export type TransitionResourceStatusMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  status: ResourceStatus;
  reason: Scalars['String']['input'];
  expectedVersion: Scalars['Int']['input'];
}>;

export type TransitionResourceStatusMutation = {
  __typename?: 'Mutation';
  transitionResourceStatus: {
    __typename?: 'ResourcePayload';
    resource: {
      __typename?: 'Resource';
      id: string;
      status: ResourceStatus;
      statusChangeReason?: string | null;
      version: number;
    };
  };
};

export type DiscoverResourcesQueryVariables = Exact<{
  filter?: InputMaybe<DiscoveryFilter>;
  page?: InputMaybe<PageInput>;
}>;

export type DiscoverResourcesQuery = {
  __typename?: 'Query';
  discoverResources: {
    __typename?: 'DiscoverableResourceConnection';
    totalCount: number;
    pageInfo: {
      __typename?: 'PageInfo';
      endCursor?: string | null;
      hasNextPage: boolean;
    };
    edges: Array<{
      __typename?: 'DiscoverableResourceEdge';
      cursor: string;
      node: {
        __typename?: 'DiscoverableResource';
        id: string;
        code: string;
        displayName: string;
        category: ResourceCategory;
        minimumMembershipLevel: MembershipLevel;
        status: ResourceStatus;
        hasMembershipAccess: boolean;
        canUseNow: boolean;
      };
    }>;
  };
};

export const HealthDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Health' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'health' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'timestamp' } },
                { kind: 'Field', name: { kind: 'Name', value: 'database' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<HealthQuery, HealthQueryVariables>;
export const SystemStatusDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'SystemStatus' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'systemStatus' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'state' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SystemStatusQuery, SystemStatusQueryVariables>;
export const MyCrewLeadProfileDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'MyCrewLeadProfile' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'myCrewLeadProfile' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'missionCode' } },
                { kind: 'Field', name: { kind: 'Name', value: 'fullName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'active' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  MyCrewLeadProfileQuery,
  MyCrewLeadProfileQueryVariables
>;
export const PassengersDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Passengers' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'filter' },
          },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'PassengerFilter' },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'page' } },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'PageInput' },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'passengers' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filter' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'filter' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'page' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'page' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'totalCount' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'pageInfo' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'endCursor' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'hasNextPage' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'edges' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'cursor' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'node' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'missionCode' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'fullName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'email' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'cabinCode' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'membershipLevel' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'active' },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'deactivationReason',
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'version' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PassengersQuery, PassengersQueryVariables>;
export const CreatePassengerDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreatePassenger' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreatePassengerInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createPassenger' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'passenger' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'missionCode' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'fullName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'cabinCode' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'membershipLevel' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'active' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'version' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreatePassengerMutation,
  CreatePassengerMutationVariables
>;
export const UpdatePassengerDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdatePassenger' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdatePassengerInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updatePassenger' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'passenger' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'missionCode' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'fullName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'cabinCode' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'membershipLevel' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'active' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'version' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdatePassengerMutation,
  UpdatePassengerMutationVariables
>;
export const ChangePassengerMembershipDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ChangePassengerMembership' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'membershipLevel' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'MembershipLevel' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'expectedVersion' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'changePassengerMembership' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'membershipLevel' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'membershipLevel' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'expectedVersion' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'expectedVersion' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'passenger' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'membershipLevel' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'version' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ChangePassengerMembershipMutation,
  ChangePassengerMembershipMutationVariables
>;
export const DeactivatePassengerDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeactivatePassenger' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'reason' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'expectedVersion' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deactivatePassenger' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'reason' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'reason' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'expectedVersion' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'expectedVersion' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'passenger' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'active' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'deactivationReason' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'version' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeactivatePassengerMutation,
  DeactivatePassengerMutationVariables
>;
export const ResourcesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Resources' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'filter' },
          },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'ResourceFilter' },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'page' } },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'PageInput' },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'resources' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filter' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'filter' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'page' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'page' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'totalCount' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'pageInfo' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'endCursor' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'hasNextPage' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'edges' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'cursor' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'node' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'code' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'displayName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'category' },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'minimumMembershipLevel',
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'status' },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'statusChangeReason',
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'version' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ResourcesQuery, ResourcesQueryVariables>;
export const ProvisionResourceDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ProvisionResource' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'ProvisionResourceInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'provisionResource' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'resource' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'code' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'displayName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'category' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'minimumMembershipLevel' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'version' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ProvisionResourceMutation,
  ProvisionResourceMutationVariables
>;
export const UpdateResourceDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateResource' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateResourceInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateResource' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'resource' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'code' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'displayName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'category' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'minimumMembershipLevel' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'version' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateResourceMutation,
  UpdateResourceMutationVariables
>;
export const TransitionResourceStatusDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'TransitionResourceStatus' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'status' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'ResourceStatus' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'reason' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'expectedVersion' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'transitionResourceStatus' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'status' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'status' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'reason' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'reason' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'expectedVersion' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'expectedVersion' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'resource' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'statusChangeReason' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'version' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  TransitionResourceStatusMutation,
  TransitionResourceStatusMutationVariables
>;
export const DiscoverResourcesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'DiscoverResources' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'filter' },
          },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'DiscoveryFilter' },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'page' } },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'PageInput' },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'discoverResources' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filter' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'filter' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'page' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'page' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'totalCount' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'pageInfo' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'endCursor' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'hasNextPage' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'edges' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'cursor' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'node' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'code' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'displayName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'category' },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'minimumMembershipLevel',
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'status' },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'hasMembershipAccess',
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'canUseNow' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DiscoverResourcesQuery,
  DiscoverResourcesQueryVariables
>;
