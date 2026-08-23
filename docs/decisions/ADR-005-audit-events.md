# ADR-005: Audit Events

Status: accepted

Record setup, every successful mutation, and every resolved Resource interaction as append-only Audit Events in the same transaction as their associated outcome. Database triggers reject Audit Event updates and deletes. An allowed interaction creates Resource Usage plus its linked Audit Event; a denied interaction commits only its typed Audit Event result.
