import {
  MembershipLevel,
  decideResourceAccess,
  membershipRank,
} from './access-policy';

describe('resource access policy', () => {
  it('orders membership levels explicitly', () => {
    expect(membershipRank(MembershipLevel.SILVER)).toBe(1);
    expect(membershipRank(MembershipLevel.GOLD)).toBe(2);
    expect(membershipRank(MembershipLevel.PLATINUM)).toBe(3);
  });

  it('allows a higher membership level to use lower-level resources', () => {
    expect(
      decideResourceAccess({
        passengerActive: true,
        passengerLevel: MembershipLevel.GOLD,
        resourceStatus: 'ACTIVE',
        resourceMinimumLevel: MembershipLevel.SILVER,
      }),
    ).toEqual({ allowed: true });
  });

  it('returns deterministic denial codes in lifecycle-before-entitlement order', () => {
    expect(
      decideResourceAccess({
        passengerActive: false,
        passengerLevel: MembershipLevel.SILVER,
        resourceStatus: 'DECOMMISSIONED',
        resourceMinimumLevel: MembershipLevel.PLATINUM,
      }),
    ).toEqual({ allowed: false, reason: 'PASSENGER_INACTIVE' });

    expect(
      decideResourceAccess({
        passengerActive: true,
        passengerLevel: MembershipLevel.SILVER,
        resourceStatus: 'OUT_OF_SERVICE',
        resourceMinimumLevel: MembershipLevel.PLATINUM,
      }),
    ).toEqual({ allowed: false, reason: 'RESOURCE_OUT_OF_SERVICE' });

    expect(
      decideResourceAccess({
        passengerActive: true,
        passengerLevel: MembershipLevel.SILVER,
        resourceStatus: 'ACTIVE',
        resourceMinimumLevel: MembershipLevel.GOLD,
      }),
    ).toEqual({ allowed: false, reason: 'INSUFFICIENT_MEMBERSHIP' });
  });
});
