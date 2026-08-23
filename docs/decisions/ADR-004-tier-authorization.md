# ADR-004: Ordered Tier Authorization

Status: accepted

Persist Silver, Gold, and Platinum as PostgreSQL enum values. Define their order through an explicit application-domain rank mapping rather than relying on incidental database enum comparison. Access is allowed when Passenger rank is greater than or equal to the Resource minimum rank.
