# Phase 2.2 — Database Access Layer Architecture Decision

**Date**: 2026-08-13  
**Status**: APPROVED (Remediated)  
**Target Application**: Finance Community Platform — NestJS Backend (`apps/api`)  
**Baseline**: `DATABASE_SCHEMA.sql` (Phase 1 Approved), `AUTH_SECURITY_SPEC.md` v1.2  

---

## 1. Context & Objectives
Phase 2.2 introduces the production Data Access Layer to replace in-memory prototype persistence used by `JitProvisioningService` and `AuditLogService` with real PostgreSQL database operations.

Key requirements:
1. **Schema Compatibility**: Strict compliance with `DATABASE_SCHEMA.sql` without introducing conflicting ORM-generated schemas.
2. **Atomic Concurrency & Upserts**: Single PostgreSQL transactions utilizing native `ON CONFLICT (id) DO UPDATE` and `ON CONFLICT (user_id, role_id) DO NOTHING`.
3. **Transaction Context Propagation**: 100% of read and write database operations participating in a JIT transaction MUST execute on `tx` (e.g. `findByUserIdTx`, `findByNameTx`).
4. **Deterministic Username Strategy & Concurrency Safety**: Guaranteed <= 50 character usernames using Supabase `sub` hex suffix, combined with PostgreSQL `SAVEPOINT` (nested transaction) isolation to handle `23505` constraint race conditions safely.
5. **Connection Lifecycle**: Centralized connection pooling (`pg.Pool`) with NestJS lifecycle management (`onApplicationShutdown` pool draining).
6. **Security Invariants**: Masking sensitive connection details, credentials, and raw SQL errors from HTTP clients.

---

## 2. Technology Selection — Drizzle ORM (`drizzle-orm` + `pg`)

### Selected Solution:
**Drizzle ORM** with **Node-Postgres (`pg`) Connection Pool**.

### Justification:
1. **SQL-First Architecture**: Drizzle maps directly to the existing Phase 1 `DATABASE_SCHEMA.sql` table structure without requiring heavy code-generation steps or runtime magic.
2. **Native Atomic Upserts**: Direct support for `onConflictDoUpdate` and `onConflictDoNothing`, ensuring single-transaction atomic JIT user provisioning.
3. **Nested Transactions (SAVEPOINT)**: Supports `tx.transaction(async (nestedTx) => ...)` to create PostgreSQL `SAVEPOINT`s, allowing username collision handling without aborting the main transaction.
4. **Type Safety & Zero Overhead**: Provides TypeScript type safety (`$inferSelect`, `$inferInsert`) with parameterized raw query compilation.
5. **NestJS Integration**: Easily injected via standard NestJS provider tokens (`DRIZZLE_TOKEN`, `PG_POOL_TOKEN`) with lifecycle hooks (`pool.end()`).

---

## 3. Implemented Components

### 3.1 Centralized Connection Lifecycle (`apps/api/src/database/`)
- [database.config.ts](file:///d:/Web_Projects/finance_community_architecture_v1/apps/api/src/config/database.config.ts): Environment configuration (`DATABASE_URL`, pool size, connection timeouts, SSL).
- [database.module.ts](file:///d:/Web_Projects/finance_community_architecture_v1/apps/api/src/database/database.module.ts): Global NestJS module providing `pg.Pool` and `DrizzleDB` client, handling graceful pool draining on shutdown.

### 3.2 Schema Definitions (`apps/api/src/database/schema/`)
- [users.schema.ts](file:///d:/Web_Projects/finance_community_architecture_v1/apps/api/src/database/schema/users.schema.ts): `public.users` table mapping.
- [roles.schema.ts](file:///d:/Web_Projects/finance_community_architecture_v1/apps/api/src/database/schema/roles.schema.ts): `public.roles` table mapping.
- [user-roles.schema.ts](file:///d:/Web_Projects/finance_community_architecture_v1/apps/api/src/database/schema/user-roles.schema.ts): `public.user_roles` junction table mapping.
- [profiles.schema.ts](file:///d:/Web_Projects/finance_community_architecture_v1/apps/api/src/database/schema/profiles.schema.ts): `public.profiles` table mapping.
- [audit-logs.schema.ts](file:///d:/Web_Projects/finance_community_architecture_v1/apps/api/src/database/schema/audit-logs.schema.ts): `public.audit_logs` table mapping with `metadata` JSONB column.

### 3.3 Repositories (`apps/api/src/database/repositories/`)
- [users.repository.ts](file:///d:/Web_Projects/finance_community_architecture_v1/apps/api/src/database/repositories/users.repository.ts): Parameterized queries for `public.users` upsert (`upsertUserTx`).
- [roles.repository.ts](file:///d:/Web_Projects/finance_community_architecture_v1/apps/api/src/database/repositories/roles.repository.ts): Transaction-aware role lookup (`findByNameTx`) and assignment (`assignRoleTx`).
- [profiles.repository.ts](file:///d:/Web_Projects/finance_community_architecture_v1/apps/api/src/database/repositories/profiles.repository.ts): Transaction-aware profile reads (`findByUserIdTx`), upsert (`upsertProfileTx`), and username availability queries (`isUsernameTakenTx`).
- [audit-log.repository.ts](file:///d:/Web_Projects/finance_community_architecture_v1/apps/api/src/database/repositories/audit-log.repository.ts): Direct persistence to `public.audit_logs` (`insertLogTx`).

### 3.4 Security & Concurrency Design

#### 1. Transaction Context Propagation
100% of operations in JIT provisioning pass the active transaction context (`tx`):
1. `usersRepo.upsertUserTx(tx, ...)`
2. `rolesRepo.findByNameTx(tx, 'MEMBER')`
3. `rolesRepo.assignRoleTx(tx, sub, memberRole.id)`
4. `profilesRepo.findByUserIdTx(tx, sub)`
5. `profilesRepo.isUsernameTakenTx(tx, baseUsername, sub)`

No operation participating in JIT provisioning uses `this.db` directly inside the transaction loop.

#### 2. Deterministic Username Strategy & Length Constraints
- **Primary Username Candidate**: Sanitized email prefix, capped at 50 characters (`VARCHAR(50)`).
- **Fallback Deterministic Username**: If the primary username is taken or encounters a race condition:
  `targetUsername = truncate(baseUsername, 17) + '_' + subClean` (where `subClean` is 32 hex chars derived from the user's UUID `sub`).
  Total length calculation: `17 + 1 + 32 = 50` characters max.
- **Uniqueness Guarantee**: Because `sub` is UUID-unique per user in Supabase Auth, the 32 hex characters are globally unique across all users.

#### 3. PostgreSQL Uniqueness as Final Source of Truth & SAVEPOINT Collision Isolation
- Initial profile insert executes inside `tx.transaction(async (nestedTx) => ...)` (a PostgreSQL `SAVEPOINT`).
- If a concurrent race condition occurs where two requests attempt to insert the same username simultaneously, PostgreSQL raises `23505` (`uq_profiles_username`).
- The error is caught at the `SAVEPOINT` boundary, rolling back the `nestedTx` without setting the outer transaction `tx` to an aborted state.
- The catch block executes `upsertProfileTx(tx, ...)` using the 100% unique deterministic username, guaranteeing success.

#### 4. Rollback Semantics
- If any unhandled exception (e.g. database connectivity issue or foreign key failure) occurs during JIT provisioning, `db.transaction` issues a full PostgreSQL `ROLLBACK`, restoring database state completely.

---

## 4. Verification & Testing

- `npm run build`: **PASS** (0 errors)
- `npm test`: **PASS** (2 test suites, 9 tests)
- `npm run test:e2e`: **PASS** (9 test suites, 35 tests covering database connection lifecycle, JIT provisioning, username collisions, concurrent initial requests, and audit logging)

**Total Verification**: 11 Test Suites Passed, 44 Tests Passed, 0 Failures.
