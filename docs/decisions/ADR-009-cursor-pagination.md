# ADR-009: Versioned Cursor Pagination

Status: accepted

PRMS list APIs use opaque versioned cursors with deterministic sort values and UUID tie-breakers. This avoids unstable offset pages as records change while allowing cursor internals to evolve without exposing persistence details.
