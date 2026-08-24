import { registerEnumType } from '@nestjs/graphql';

export enum ResourceStatus {
  ACTIVE = 'ACTIVE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
  DECOMMISSIONED = 'DECOMMISSIONED',
}

export enum ActorRole {
  CREW_LEAD = 'CREW_LEAD',
  PASSENGER = 'PASSENGER',
}

registerEnumType(ResourceStatus, { name: 'ResourceStatus' });
registerEnumType(ActorRole, { name: 'ActorRole' });
