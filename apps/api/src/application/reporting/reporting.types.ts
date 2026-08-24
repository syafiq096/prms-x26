import { ResourceCategory } from '../../database/entities';
import { MembershipLevel, ResourceStatus } from '../../domain/access-policy';

export enum InteractionOutcome {
  ALLOWED = 'ALLOWED',
  DENIED = 'DENIED',
}
export enum HistorySort {
  NEWEST = 'NEWEST',
  OLDEST = 'OLDEST',
}
export type ReportingWindow = { from: Date; to: Date };
export type ReportingFilter = {
  outcomes?: InteractionOutcome[] | null;
  membershipLevels?: MembershipLevel[] | null;
  categories?: ResourceCategory[] | null;
  denialReasons?: string[] | null;
  resourceText?: string | null;
};
export type Interaction = {
  id: string;
  passengerId: string;
  resourceId: string;
  outcome: InteractionOutcome;
  denialReason: string | null;
  occurredAt: Date;
  passengerMissionCode: string | null;
  passengerMembershipLevel: MembershipLevel | null;
  resourceCode: string | null;
  resourceDisplayName: string | null;
  resourceCategory: ResourceCategory | null;
  resourceMinimumMembershipLevel: MembershipLevel | null;
  resourceStatus: ResourceStatus | null;
};
export type UsageSummary = {
  window: ReportingWindow;
  allowedCount: number;
  deniedCount: number;
  totalAttempts: number;
  denialRate: number;
};
export type MembershipUsage = {
  membershipLevel: MembershipLevel;
  allowedCount: number;
  deniedCount: number;
  totalAttempts: number;
};
export type ResourceDemand = {
  resourceId: string;
  resourceCode: string;
  resourceDisplayName: string;
  resourceCategory: ResourceCategory;
  resourceMinimumMembershipLevel: MembershipLevel;
  allowedCount: number;
  deniedCount: number;
  totalAttempts: number;
};
