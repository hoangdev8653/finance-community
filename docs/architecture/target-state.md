# Target architecture

## Runtime

Keep the API as a modular monolith backed by PostgreSQL. Add Redis and workers only for cross-instance coordination, retries or work that exceeds an HTTP request budget.

```text
Client → Next.js → NestJS modules → PostgreSQL
                    ├→ Cloudinary
                    ├→ market adapters
                    └→ queue/worker → AI, ingestion, notifications
```

## Required contracts

- Every protected endpoint documents auth, permission, DTO, response, error codes and pagination.
- Lists return a consistent `data` plus `meta` shape.
- Errors expose a stable machine-readable code and request/correlation ID.
- External data includes provider, status (`LIVE`, `STALE`, `UNAVAILABLE`) and timestamps.
- AI output is schema-validated, persisted as a draft and never auto-published.

## Reliability goals

- No partial mutation across a moderation or publishing transaction.
- Idempotent background jobs with retry and dead-letter visibility.
- Readiness checks distinguish API process health from database/provider readiness.
- Backups are periodically restored in a disposable environment and verified.
