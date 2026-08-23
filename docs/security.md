# Security

Authentication is deferred through Level 1 only. Until Phase 4, `x-actor-id` may identify a development or internal-demo actor when `ALLOW_INSECURE_ACTOR_HEADER=true`; the server resolves the role from persistence, and production startup rejects the flag. Crew Lead operations are administrative, while passengers may discover and use only permitted resources.

Initialization uses `x-setup-secret` matched against a non-empty environment value. The secret is never persisted, returned, included in client bundles, or logged. Examples use high-entropy generated values. Validate all input, redact configuration failures, use UTC timestamps, and protect audit records from mutation.
