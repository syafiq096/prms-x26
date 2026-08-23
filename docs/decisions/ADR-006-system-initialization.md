# ADR-006: Explicit System Initialization

Status: accepted

PRMS has explicit `UNINITIALIZED` and `OPERATIONAL` states stored in a structural Application Setting row created by migration. A setup-secret-protected, atomic initialization locks that row, creates exactly three Crew Leads, and irreversibly enters the operational state. Replacement uses the same lock. The application transaction boundary enforces exactly three active Crew Leads after initialization; privileged direct SQL is outside this guarantee.
