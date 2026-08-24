# Phase 2 GraphQL Verification Examples

Run these requests against `http://localhost:3000/graphql`. Protected requests require `Authorization: Bearer <Clerk-session-token>`; roles are resolved by the API from the verified session.

## Read system state

```graphql
query {
  systemStatus {
    state
  }
}
```

## Initialize a clean system

Send `x-setup-secret: <PRMS_SETUP_SECRET>`.

```graphql
mutation {
  initializeSystem(profiles: [
    { missionCode: "LEAD-ONE", fullName: "Lead One" }
    { missionCode: "LEAD-TWO", fullName: "Lead Two" }
    { missionCode: "LEAD-THREE", fullName: "Lead Three" }
  ]) {
    systemStatus { state }
    crewLeads { id missionCode fullName version }
  }
}
```

## Create and list Passengers

Send an authenticated Crew Lead Bearer session.

```graphql
mutation {
  createPassenger(input: {
    missionCode: "PASSENGER-ONE"
    fullName: "Passenger One"
    membershipLevel: GOLD
  }) {
    passenger { id missionCode membershipLevel version }
  }
}
```

```graphql
query {
  passengers(page: { first: 25 }) {
    totalCount
    edges { cursor node { id missionCode active membershipLevel version } }
  }
}
```

## Discover entitled Resources

Send an authenticated Passenger Bearer session.

```graphql
query {
  discoverResources(page: { first: 25 }) {
    edges {
      node {
        code
        displayName
        minimumMembershipLevel
        status
        hasMembershipAccess
        canUseNow
      }
    }
  }
}
```

## Handle a stale write

Send an authenticated Crew Lead Bearer session. A stale `expectedVersion` returns a GraphQL error with `extensions.code = VERSION_CONFLICT` and `extensions.details.expectedVersion/currentVersion`.

```graphql
mutation {
  updatePassenger(input: {
    id: "<passenger-uuid>"
    fullName: "Passenger One Updated"
    expectedVersion: 1
  }) {
    passenger { id fullName version }
  }
}
```
