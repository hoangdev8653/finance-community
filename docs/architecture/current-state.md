# Current architecture

Last reviewed: 2026-09-05

## Implemented

- Next.js frontend and NestJS backend run as a modular monolith.
- Drizzle repositories provide PostgreSQL access and migrations live in `apps/api/migrations`.
- JWT/local authentication, Supabase JWKS and OAuth providers are present; the final token lifecycle still needs one documented canonical flow.
- Posts, learning, taxonomy, media, comments, reactions, follows, notifications, reports, moderation and admin modules exist.
- Frontend has TanStack Query hooks and Zustand UI state.
- Vitest is configured separately from Playwright; the frontend suite currently passes 98/98 files and 318/318 tests.
- Market data has external adapters, a short in-memory cache and a baseline snapshot fallback.
- Short-lived coordination data now uses the `ExpiringStore` port with an in-memory default; a Redis adapter can replace it without changing domain logic.

## Known gaps

- `PostsService` remains a large orchestration service and should be split incrementally.
- Market responses need explicit `source`, freshness/status and stale-data semantics.
- Report moderation workflow is being standardized as `PENDING → REVIEWING → RESOLVED/DISMISSED`.
- API response and DTO contracts are not yet represented by a single generated/shared contract.
- View debounce, rate limiting and some fallback caches are process-local and do not coordinate across instances.
- AI editorial processing is not yet a durable queue/worker pipeline with generation history and prompt versioning.
- Production operations still need health/readiness checks, monitoring, backup verification and CI gates.

Evidence and detailed recommendations are maintained in [ARCHITECTURE_AUDIT.md](ARCHITECTURE_AUDIT.md).
