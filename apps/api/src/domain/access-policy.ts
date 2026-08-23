export enum MembershipLevel {
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

export type ResourceStatus = 'ACTIVE' | 'OUT_OF_SERVICE' | 'DECOMMISSIONED';

export type AccessDenialReason =
  | 'PASSENGER_INACTIVE'
  | 'RESOURCE_OUT_OF_SERVICE'
  | 'RESOURCE_DECOMMISSIONED'
  | 'INSUFFICIENT_MEMBERSHIP';

export type ResourceAccessDecision =
  { allowed: true } | { allowed: false; reason: AccessDenialReason };

export interface ResourceAccessInput {
  passengerActive: boolean;
  passengerLevel: MembershipLevel;
  resourceStatus: ResourceStatus;
  resourceMinimumLevel: MembershipLevel;
}

const membershipRanks: Readonly<Record<MembershipLevel, number>> = {
  [MembershipLevel.SILVER]: 1,
  [MembershipLevel.GOLD]: 2,
  [MembershipLevel.PLATINUM]: 3,
};

export function membershipRank(level: MembershipLevel): number {
  return membershipRanks[level];
}

export function decideResourceAccess(
  input: ResourceAccessInput,
): ResourceAccessDecision {
  if (!input.passengerActive) {
    return { allowed: false, reason: 'PASSENGER_INACTIVE' };
  }

  if (input.resourceStatus === 'OUT_OF_SERVICE') {
    return { allowed: false, reason: 'RESOURCE_OUT_OF_SERVICE' };
  }

  if (input.resourceStatus === 'DECOMMISSIONED') {
    return { allowed: false, reason: 'RESOURCE_DECOMMISSIONED' };
  }

  if (
    membershipRank(input.passengerLevel) <
    membershipRank(input.resourceMinimumLevel)
  ) {
    return { allowed: false, reason: 'INSUFFICIENT_MEMBERSHIP' };
  }

  return { allowed: true };
}
