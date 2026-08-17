# PHASE 3.4 — FINAL IMPLEMENTATION PLAN

**Target Module**: Platform Operations & Governance  
**Version**: 1.0 — FINAL CONSOLIDATED  
**Date**: 2026-08-13  
**Status**: READ-ONLY / AWAITING HUMAN APPROVAL  
**Baselines**:
- `docs/SYSTEM_ARCHITECTURE.md`
- `docs/DATABASE_ARCHITECTURE.md`
- `docs/DATABASE_SCHEMA.sql` (20 Tables, Approved & Locked)
- `docs/DATABASE_ERD.md`
- `docs/AUTH_SECURITY_SPEC.md` v1.2
- `docs/SECURITY_FOUNDATION_REVIEW.md`
- `docs/DATABASE_ACCESS_LAYER_DECISION.md`
- `docs/PHASE_3_IMPLEMENTATION_PLAN.md`
- `docs/PHASE_3.4_PRE_IMPLEMENTATION_PLAN.md`
- `docs/PHASE_3.4_PRE_IMPLEMENTATION_CLARIFICATION.md`
- Phase 3.1, Phase 3.2 & Phase 3.3 Final Re-Audit Reports (Approved & Closed)

---

## 1. Scope

Phase 3.4 implements the final platform operational layer for governance, moderation, notifications, runtime configuration, feature flags, and administrative RBAC management:

1. **Notifications Module** (`notifications` table): In-app notification creation, unread feeds, and read-state management.
2. **Reports & Moderation Module** (`reports` & `moderation_actions` tables): User-filed reporting queue, single-target validation, duplicate report deduplication, and moderator action recording (`WARN`, `HIDE_CONTENT`, `SUSPEND`, `BAN`, `DISMISS`).
3. **Admin & Governance Module** (`system_settings`, `feature_flags`, `users`, `user_roles`, `audit_logs` tables): Runtime settings, public & admin feature flags, user status transitions (`ACTIVE`, `SUSPENDED`, `BANNED`, `DEACTIVATED`), role assignments/revocations, and global security audit logging.

---

## 2. Out-of-Scope Items

The following are explicitly **OUT OF SCOPE** for Phase 3.4:

- Frontend Admin Dashboard / Moderator CMS UI components.
- Email / Push Notification Delivery Services (Third-party SMTP / FCM integrations).
- Automated Machine Learning Content Moderation / AI Auto-banning.
- Search Engine Indexing (ElasticSearch / MeiliSearch integrations).

---

## 3. Database Mappings

All Drizzle ORM schema definitions map 1:1 to [DATABASE_SCHEMA.sql](file:///d:/Web_Projects/finance_community_architecture_v1/docs/DATABASE_SCHEMA.sql) (Zero migrations, schema is locked):

### 3.1 `notifications.schema.ts` (`public.notifications`)
- `id`: `uuid('id').primaryKey().defaultRandom()`
- `userId`: `uuid('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' })`
- `type`: `varchar('type', { length: 30 }).notNull()` (`COMMENT`, `REACTION`, `FOLLOW`, `SYSTEM`)
- `title`: `varchar('title', { length: 255 }).notNull()`
- `message`: `text('message')`
- `referencePostId`: `uuid('reference_post_id').references(() => postsTable.id, { onDelete: 'set null' })`
- `referenceCommentId`: `uuid('reference_comment_id').references(() => commentsTable.id, { onDelete: 'set null' })`
- `referenceUserId`: `uuid('reference_user_id').references(() => usersTable.id, { onDelete: 'set null' })`
- `isRead`: `boolean('is_read').notNull().default(false)`
- `readAt`: `timestamp('read_at', { withTimezone: true })`
- `createdAt`: `timestamp('created_at', { withTimezone: true }).notNull().defaultNow()`

### 3.2 `reports.schema.ts` (`public.reports`)
- `id`: `uuid('id').primaryKey().defaultRandom()`
- `reporterId`: `uuid('reporter_id').references(() => usersTable.id, { onDelete: 'set null' })`
- `reportedPostId`: `uuid('reported_post_id').references(() => postsTable.id, { onDelete: 'restrict' })`
- `reportedCommentId`: `uuid('reported_comment_id').references(() => commentsTable.id, { onDelete: 'restrict' })`
- `reportedUserId`: `uuid('reported_user_id').references(() => usersTable.id, { onDelete: 'restrict' })`
- `reason`: `varchar('reason', { length: 100 }).notNull()`
- `description`: `text('description')`
- `status`: `varchar('status', { length: 20 }).notNull().default('OPEN')` (`OPEN`, `REVIEWING`, `RESOLVED`, `DISMISSED`)
- `createdAt`: `timestamp('created_at', { withTimezone: true }).notNull().defaultNow()`
- `resolvedAt`: `timestamp('resolved_at', { withTimezone: true })`
- CHECK: `num_nonnulls(reported_post_id, reported_comment_id, reported_user_id) = 1` (`chk_reports_exactly_one_target`)

### 3.3 `moderation-actions.schema.ts` (`public.moderation_actions`)
- `id`: `uuid('id').primaryKey().defaultRandom()`
- `moderatorId`: `uuid('moderator_id').notNull().references(() => usersTable.id, { onDelete: 'restrict' })`
- `reportId`: `uuid('report_id').references(() => reportsTable.id, { onDelete: 'set null' })`
- `actionType`: `varchar('action_type', { length: 30 }).notNull()` (`WARN`, `HIDE_CONTENT`, `SUSPEND`, `BAN`, `DISMISS`)
- `targetUserId`: `uuid('target_user_id').references(() => usersTable.id, { onDelete: 'set null' })`
- `reason`: `text('reason').notNull()`
- `metadata`: `jsonb('metadata')`
- `createdAt`: `timestamp('created_at', { withTimezone: true }).notNull().defaultNow()`

### 3.4 `system-settings.schema.ts` (`public.system_settings`)
- `id`: `uuid('id').primaryKey().defaultRandom()`
- `key`: `varchar('key', { length: 100 }).notNull().unique()`
- `value`: `jsonb('value').notNull()`
- `description`: `text('description')`
- `updatedAt`: `timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()`

### 3.5 `feature-flags.schema.ts` (`public.feature_flags`)
- `id`: `uuid('id').primaryKey().defaultRandom()`
- `key`: `varchar('key', { length: 100 }).notNull().unique()`
- `isEnabled`: `boolean('is_enabled').notNull().default(false)`
- `description`: `text('description')`
- `updatedAt`: `timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()`

---

## 4. Entity Relationships

```
┌──────────────┐         ┌──────────────┐         ┌────────────────────┐
│ Users Module │◄───────┤Reports Module├────────►│ Moderation Actions │
└──────┬───────┘         └──────┬───────┘         └────────────────────┘
       │                        │
       ├────────────────────────┼────────────────────────┐
       │                        │                        │
       ▼                        ▼                        ▼
┌──────────────┐         ┌──────────────┐         ┌────────────────────┐
│ Notifications│         │ Posts Module │         │  Comments Module   │
└──────────────┘         └──────────────┘         └────────────────────┘
```

---

## 5. Repository Contracts

### 5.1 `NotificationsRepository`
- `createTx(tx: DrizzleTransaction, data: NewNotificationEntity): Promise<NotificationEntity>`
- `findUserNotifications(userId: string, isRead?: boolean, page?: number, limit?: number): Promise<PaginatedResult<NotificationEntity>>`
- `markAsReadTx(tx: DrizzleTransaction, id: string, userId: string): Promise<boolean>`
- `markAllAsReadTx(tx: DrizzleTransaction, userId: string): Promise<boolean>`

### 5.2 `ReportsRepository`
- `createTx(tx: DrizzleTransaction, data: NewReportEntity): Promise<ReportEntity>`
- `findById(id: string): Promise<ReportEntity | undefined>`
- `findActiveReportForTarget(reporterId: string, targetType: string, targetId: string): Promise<ReportEntity | undefined>`
- `findQueuePaginated(status?: string, page?: number, limit?: number): Promise<PaginatedResult<ReportEntity>>`
- `updateStatusTx(tx: DrizzleTransaction, id: string, status: string, resolvedAt?: Date): Promise<ReportEntity | undefined>`

### 5.3 `ModerationActionsRepository`
- `createTx(tx: DrizzleTransaction, data: NewModerationActionEntity): Promise<ModerationActionEntity>`
- `findHistoryByTargetUser(targetUserId: string, page?: number, limit?: number): Promise<PaginatedResult<ModerationActionEntity>>`

### 5.4 `SystemSettingsRepository`
- `findByKey(key: string): Promise<SystemSettingEntity | undefined>`
- `upsertTx(tx: DrizzleTransaction, key: string, value: Record<string, any>, description?: string): Promise<SystemSettingEntity>`
- `findAll(): Promise<SystemSettingEntity[]>`

### 5.5 `FeatureFlagsRepository`
- `findByKey(key: string): Promise<FeatureFlagEntity | undefined>`
- `toggleTx(tx: DrizzleTransaction, key: string, isEnabled: boolean, description?: string): Promise<FeatureFlagEntity>`
- `findAll(): Promise<FeatureFlagEntity[]>`

---

## 6. Service Contracts

### 6.1 `NotificationsService`
- `createNotification(data: NewNotificationInput): Promise<NotificationEntity>` (Exposed for Phase 3.4 internal handlers).
- `getUserNotifications(userId: string, page?: number, limit?: number): Promise<PaginatedResult<NotificationEntity>>`
- `markAsRead(userId: string, id: string): Promise<boolean>`
- `markAllAsRead(userId: string): Promise<boolean>`

### 6.2 `ModerationService`
- `fileReport(reporterId: string, dto: CreateReportDto): Promise<{ report: ReportEntity; isDuplicate: boolean }>`
  - Checks if an `OPEN` or `REVIEWING` report already exists for `(reporterId, target)`.
  - If existing report exists -> Returns `{ report: existing, isDuplicate: true }` with `200 OK`.
- `getReportQueue(userRoles: string[], page?: number, limit?: number, status?: string): Promise<PaginatedResult<ReportEntity>>`
- `executeAction(moderatorId: string, userRoles: string[], dto: ExecuteModerationActionDto): Promise<ModerationActionEntity>`

### 6.3 `AdminService`
- `changeUserStatus(adminId: string, adminRoles: string[], userId: string, dto: UpdateUserStatusDto): Promise<UserEntity>`
- `assignRole(adminId: string, adminRoles: string[], dto: AssignRoleDto): Promise<UserRoleEntity>`
- `revokeRole(adminId: string, adminRoles: string[], dto: AssignRoleDto): Promise<boolean>`
- `getSystemSettings(): Promise<SystemSettingEntity[]>`
- `updateSystemSetting(adminId: string, adminRoles: string[], key: string, dto: UpdateSystemSettingDto): Promise<SystemSettingEntity>`
- `getPublicFeatureFlags(): Promise<Record<string, boolean>>` (Returns key-boolean map of active flags).
- `getAdminFeatureFlags(adminRoles: string[]): Promise<FeatureFlagEntity[]>` (Returns full entities array).
- `toggleFeatureFlag(adminId: string, adminRoles: string[], key: string, dto: ToggleFeatureFlagDto): Promise<FeatureFlagEntity>`
- `getAuditLogs(adminRoles: string[], page?: number, limit?: number, actorId?: string, entityType?: string): Promise<PaginatedResult<AuditLogEntity>>`

---

## 7. Moderation Target Resolution & Action Compatibility

### 7.1 Target Resolution Flow
When `ModerationService.executeAction` is called:
1. **With `reportId`**:
   - Fetches report from `ReportsRepository`.
   - If `report.reportedPostId` IS NOT NULL -> Target Type: `POST`, Target ID: `report.reportedPostId`.
   - If `report.reportedCommentId` IS NOT NULL -> Target Type: `COMMENT`, Target ID: `report.reportedCommentId`.
   - If `report.reportedUserId` IS NOT NULL -> Target Type: `USER`, Target ID: `report.reportedUserId`.
2. **Without `reportId` (Direct Action)**:
   - Validates that exactly 1 of `targetPostId`, `targetCommentId`, or `targetUserId` is provided in `ExecuteModerationActionDto`.

### 7.2 Target Compatibility Matrix

| Action Type | Valid Target Types | Target Entity Effect | Report Status Result |
| :--- | :--- | :--- | :--- |
| **`HIDE_CONTENT`** | `POST`, `COMMENT` | `posts.status = 'HIDDEN'` or `comments.status = 'HIDDEN'` | `RESOLVED` |
| **`WARN`** | `POST`, `COMMENT`, `USER` | Creates moderation action record; notifies author/user | `RESOLVED` |
| **`SUSPEND`** | `USER` | `users.status = 'SUSPENDED'` | `RESOLVED` |
| **`BAN`** | `USER` | `users.status = 'BANNED'` | `RESOLVED` |
| **`DISMISS`** | `POST`, `COMMENT`, `USER` | No change to target entity | `DISMISSED` |

- **Restriction**: `HIDE_CONTENT` against a `USER` target is **FORBIDDEN** (`400 Bad Request`, `code: 'INVALID_TARGET_ACTION'`).

---

## 8. RBAC Hierarchy & Privilege Escalation Rules

Enforced in `AdminService` and `PermissionGuard`:

1. **`ADMIN` Role Constraints**:
   - `ADMIN` **cannot** assign or revoke `SUPER_ADMIN` role (`403 Forbidden`, `code: 'PRIVILEGE_ESCALATION_DENIED'`).
   - `ADMIN` **cannot** modify another `ADMIN` user's roles or status (`403 Forbidden`).
   - `ADMIN` **cannot** modify a `SUPER_ADMIN` user's roles or status (`403 Forbidden`).
   - Administrators **cannot** modify their own role (`403 Forbidden`, `code: 'CANNOT_MODIFY_SELF_ROLE'`).
2. **Role Assignment Matrix**:
   - `ADMIN` & `SUPER_ADMIN`: Can assign/revoke `MODERATOR` role.
   - `SUPER_ADMIN` only: Can assign/revoke `ADMIN` and `SUPER_ADMIN` roles.
3. **Protected Status Rules**:
   - Self-status mutation is **forbidden** for all administrators (`400 Bad Request`, `code: 'CANNOT_MODIFY_SELF_STATUS'`).
   - `SUPER_ADMIN` users **cannot** be `SUSPENDED` or `BANNED` by `ADMIN` or `MODERATOR` (`403 Forbidden`, `code: 'PROTECTED_SUPER_ADMIN_STATUS'`).

---

## 9. User Status State Machine

Audited against `users.status` CHECK constraint (`'ACTIVE'`, `'SUSPENDED'`, `'BANNED'`, `'DEACTIVATED'`):

```
┌──────────┐     Suspend (Mod/Admin)      ┌───────────┐
│          ├─────────────────────────────►│ SUSPENDED │
│  ACTIVE  │◄─────────────────────────────┤           │
│          │     Reactivate (Mod/Admin)   └───────────┘
│          │
│          │       Ban (Admin Only)       ┌───────────┐
│          ├─────────────────────────────►│  BANNED   │
│          │◄─────────────────────────────┤           │
│          │       Unban (Admin Only)     └───────────┘
│          │
│          │     Deactivate (User/Admin)  ┌───────────┐
│          ├─────────────────────────────►│DEACTIVATED│
│          │◄─────────────────────────────┤           │
└──────────┘    Reactivate (Login/JIT)    └───────────┘
```

- Invalid transitions: `SUSPENDED` -> `BANNED` (Must lift suspension or execute direct ban with audit log), `BANNED` -> `SUSPENDED`.

---

## 10. Transaction Boundaries & Audit Log Support

All Phase 3.4 multi-table write operations execute within single PostgreSQL transactions (`this.db.transaction(async (tx) => ...)`).

`AuditLogService.log(entry, tx)` **participates directly in the same transaction block (`tx`)**:

1. **Moderation Action Execution**:
   - Insert `moderation_actions` record inside `tx`.
   - Update target entity state (`posts.status = 'HIDDEN'`, `comments.status = 'HIDDEN'`, or `users.status = 'SUSPENDED'`) inside `tx`.
   - Update `reports.status = 'RESOLVED'` / `'DISMISSED'` (if `reportId` provided) inside `tx`.
   - Write synchronous `audit_logs` record via `AuditLogService.log(..., tx)` inside `tx`.
2. **User Status Change**: Updates `users.status` + writes `audit_logs` record inside `tx`.
3. **Role Assignment / Revocation**: Mutates `user_roles` + writes `audit_logs` record inside `tx`.
4. **System Settings & Feature Flags**: Updates setting/flag record + writes `audit_logs` record inside `tx`.

If any operation in the transaction fails, the entire block (including the audit log entry) rolls back atomically.

---

## 11. Authorization Matrix & Guard Pipeline

| Endpoint | Method | Public / Auth | Required Guard Pipeline | Required Permission |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/feature-flags` | `GET` | Public | None | None |
| `/api/v1/notifications` | `GET` | Auth | `JwtAuthGuard`, `AccountStatusGuard` | Self Recipient |
| `/api/v1/notifications/:id/read` | `PATCH` | Auth | `JwtAuthGuard`, `AccountStatusGuard` | Self Recipient |
| `/api/v1/notifications/read-all` | `POST` | Auth | `JwtAuthGuard`, `AccountStatusGuard` | Self Recipient |
| `/api/v1/reports` | `POST` | Verified | `JwtAuthGuard`, `AccountStatusGuard`, `EmailVerificationGuard` | Authenticated User |
| `/api/v1/moderation/reports` | `GET` | Mod/Admin | `JwtAuthGuard`, `AccountStatusGuard`, `PermissionGuard` | `moderation:manage` |
| `/api/v1/moderation/actions` | `POST` | Mod/Admin | `JwtAuthGuard`, `AccountStatusGuard`, `PermissionGuard` | `moderation:manage` |
| `/api/v1/admin/users/:id/status` | `PATCH` | Admin | `JwtAuthGuard`, `AccountStatusGuard`, `PermissionGuard` | `admin:full` |
| `/api/v1/admin/roles/assign` | `POST` | Admin | `JwtAuthGuard`, `AccountStatusGuard`, `PermissionGuard` | `admin:full` |
| `/api/v1/admin/roles/revoke` | `POST` | Admin | `JwtAuthGuard`, `AccountStatusGuard`, `PermissionGuard` | `admin:full` |
| `/api/v1/admin/settings` | `GET` | Admin | `JwtAuthGuard`, `AccountStatusGuard`, `PermissionGuard` | `admin:full` |
| `/api/v1/admin/settings/:key` | `PATCH` | Admin | `JwtAuthGuard`, `AccountStatusGuard`, `PermissionGuard` | `admin:full` |
| `/api/v1/admin/feature-flags` | `GET` | Admin | `JwtAuthGuard`, `AccountStatusGuard`, `PermissionGuard` | `admin:full` |
| `/api/v1/admin/feature-flags/:key` | `PATCH` | Admin | `JwtAuthGuard`, `AccountStatusGuard`, `PermissionGuard` | `admin:full` |
| `/api/v1/admin/audit-logs` | `GET` | Admin | `JwtAuthGuard`, `AccountStatusGuard`, `PermissionGuard` | `admin:full` |

---

## 12. DTO Contracts

- **`CreateReportDto`**: `reportedPostId?` (UUID), `reportedCommentId?` (UUID), `reportedUserId?` (UUID), `reason` (string, max 100, required), `description?` (string).
- **`ExecuteModerationActionDto`**: `reportId?` (UUID), `targetPostId?` (UUID), `targetCommentId?` (UUID), `targetUserId?` (UUID), `actionType` (`WARN`, `HIDE_CONTENT`, `SUSPEND`, `BAN`, `DISMISS`, required), `reason` (string, required), `metadata?` (Record<string, any>).
- **`UpdateUserStatusDto`**: `status` (`ACTIVE`, `SUSPENDED`, `BANNED`, `DEACTIVATED`, required), `reason` (string, required).
- **`AssignRoleDto`**: `userId` (UUID, required), `roleName` (`MEMBER`, `MODERATOR`, `ADMIN`, `SUPER_ADMIN`, required).
- **`UpdateSystemSettingDto`**: `value` (Record<string, any>, required), `description?` (string).
- **`ToggleFeatureFlagDto`**: `isEnabled` (boolean, required), `description?` (string).
- **`QueryReportsDto`**: `status?` (`OPEN`, `REVIEWING`, `RESOLVED`, `DISMISSED`), `page` (number), `limit` (number).
- **`QueryAuditLogsDto`**: `actorId?` (UUID), `entityType?` (string), `action?` (string), `page` (number), `limit` (number).

---

## 13. Pagination & Query Design

- **`GET /notifications`**: Paginated by `page` (default 1), `limit` (default 20, max 100), ordered by `is_read ASC, created_at DESC`.
- **`GET /moderation/reports`**: Paginated by `page`, `limit`, filterable by `status`, ordered by `created_at DESC`.
- **`GET /admin/audit-logs`**: Paginated by `page`, `limit`, filterable by `actorId`, `entityType`, `action`, ordered by `created_at DESC`.

---

## 14. Error Contracts

- `400 Bad Request`: Validation failure, invalid target combination (`num_nonnulls != 1`), `HIDE_CONTENT` on user target, self-status change, self-role modification.
- `401 Unauthorized`: Missing authentication credentials, invalid JWT, expired token.
- `403 Forbidden`: User blocked by account status, missing `moderation:manage` or `admin:full` permissions, privilege escalation attempt (ADMIN assigning SUPER_ADMIN or modifying peer ADMIN).
- `404 Not Found`: Report ID, target post/comment/user, setting key, or flag key not found.

---

## 15. Test Strategy

1. **`notifications.spec.ts`**:
   - Creating notifications.
   - User notification feed retrieval & isolation.
   - Marking single and all notifications as read.
2. **`moderation.spec.ts`**:
   - Report filing with single-target validation (`chk_reports_exactly_one_target`).
   - Idempotent duplicate report handling (`isDuplicate: true`, `200 OK`).
   - Moderator executing `HIDE_CONTENT` (hides post/comment, resolves report, logs audit entry in 1 transaction).
   - Rejecting `HIDE_CONTENT` on User targets (`400 Bad Request`).
   - Non-moderator receiving `403 Forbidden`.
3. **`admin.spec.ts`**:
   - User status updates (`ACTIVE` -> `SUSPENDED` / `BANNED`).
   - Preventing self-status mutation and `SUPER_ADMIN` protection.
   - Role assignment/revocation and preventing privilege escalation (ADMIN assigning SUPER_ADMIN).
   - Feature flag public map vs admin detail queries.
   - Non-admin receiving `403 Forbidden` on `/api/v1/admin/*`.

---

## 16. Implementation Order

```text
Step 3.4.1: Drizzle Schemas (notifications, reports, moderation_actions, system_settings, feature_flags) & Index Export
        ↓
Step 3.4.2: Repositories (NotificationsRepository, ReportsRepository, ModerationActionsRepository, SystemSettingsRepository, FeatureFlagsRepository)
        ↓
Step 3.4.3: DTOs (CreateReportDto, ExecuteModerationActionDto, UpdateUserStatusDto, AssignRoleDto, UpdateSystemSettingDto, ToggleFeatureFlagDto)
        ↓
Step 3.4.4: Services (NotificationsService, ModerationService, AdminService)
        ↓
Step 3.4.5: Controllers (NotificationsController, ModerationController, AdminController)
        ↓
Step 3.4.6: Module Registration & Wiring (NotificationsModule, ModerationModule, AdminModule in AppModule)
        ↓
Step 3.4.7: Unit & Integration Test Suites (notifications.spec.ts, moderation.spec.ts, admin.spec.ts)
        ↓
Step 3.4.8: Complete Verification Pipeline Execution
```

---

## 17. Verification Pipeline

Upon explicit human authorization, implementation will be verified using:
```bash
npx tsc --noEmit
npm run build
npm test
npm run test:e2e
```

---

## 18. Stop Conditions

Stop and report if:
1. `DATABASE_SCHEMA.sql` table constraints conflict with planned Drizzle mappings.
2. Any circular dependency occurs during module wiring.
3. `AuditLogService` fails to record moderation or administrative actions in transaction blocks.

---

## 19. Acceptance Criteria

1. All 5 remaining database schemas map 1:1 to `DATABASE_SCHEMA.sql`.
2. `ReportsService.fileReport` validates single targets and handles duplicate active reports idempotently (`isDuplicate: true`, `200 OK`).
3. `ModerationService.executeAction` resolves targets, enforces action compatibility, hides content/suspends users, resolves reports, and logs audit entries in 1 transaction.
4. `AdminService` enforces RBAC hierarchy rules (prevents ADMIN from assigning SUPER_ADMIN or modifying peer ADMINs) and prevents self-role/self-status changes.
5. Public endpoint `GET /api/v1/feature-flags` returns active flag key-boolean map; Admin endpoint returns full flag entities array.
6. `npx tsc --noEmit`, `npm run build`, `npm test`, `npm run test:e2e` pass with 0 errors.

---

STATUS:
PHASE 3.4 FINAL IMPLEMENTATION PLAN
READY FOR HUMAN APPROVAL
IMPLEMENTATION NOT STARTED
FILES MODIFIED: 0
MIGRATIONS: 0

STOP.
WAIT FOR EXPLICIT HUMAN AUTHORIZATION.
