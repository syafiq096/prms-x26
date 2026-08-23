# ADR-007: Temporary Actor Header Boundary

Status: accepted

Before real authentication, protected requests identify an actor through an actor-specific temporary header. Administrative operations resolve a Crew Lead and Resource Usage resolves a Passenger; actor identity is not accepted as mutable business input. The server resolves identity and lifecycle state from persistence rather than trusting client claims. This mechanism requires an explicit non-production opt-in and is replaced by authentication before usage history and reporting are exposed.
