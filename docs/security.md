# Security

PRMS uses Clerk session tokens for authentication. The API verifies the Bearer token and maps its subject to a Crew Lead or Passenger record in persistence; client role claims and actor headers are ignored. Crew Lead operations are administrative, while passengers may discover and use only permitted resources. Legacy actor headers are available only in the automated API test environment.

Initialization uses `x-setup-secret` matched against a non-empty environment value. The secret is never persisted, returned, included in client bundles, or logged. Examples use high-entropy generated values. Validate all input, redact configuration failures, use UTC timestamps, and protect audit records from mutation.
