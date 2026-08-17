# PHASE 3.4 — PRE-IMPLEMENTATION PLAN

**Target Module**: Platform Operations & Governance  
**Version**: 1.0 — PRE-IMPLEMENTATION DRAFT  
**Date**: 2026-08-13  
**Status**: PLANNING ONLY — READ-ONLY / AWAITING HUMAN REVIEW  
**Baselines**:
- `docs/SYSTEM_ARCHITECTURE.md`
- `docs/DATABASE_ARCHITECTURE.md`
- `docs/DATABASE_SCHEMA.sql` (20 Tables, Approved & Locked)
- `docs/DATABASE_ERD.md`
- `docs/AUTH_SECURITY_SPEC.md` v1.2
- `docs/SECURITY_FOUNDATION_REVIEW.md`
- `docs/DATABASE_ACCESS_LAYER_DECISION.md`
- `docs/PHASE_3_IMPLEMENTATION_PLAN.md`
- Phase 3.1, Phase 3.2 & Phase 3.3 Final Re-Audit Reports (Approved & Closed)

---

## 1. Scope

Phase 3.4 encompasses the final domain operational layer for platform governance, moderation, user notifications, system settings, feature flags, and administrative RBAC management. The scope covers:

1. **Notifications Module** (`notifications` table): In-app notification creation, unread feeds, and read-state management.
2. **Reports & Moderation Module** (`reports` & `moderation_actions` tables): User-filed reporting queue, single-target validation, and moderator action recording (`WARN`, `HIDE_CONTENT`, `SUSPEND`, `BAN`, `DISMISS`).
3. **Admin & Governance Module** (`system_settings`, `feature_flags`, `users`, `user_roles`, `audit_logs` tables): Runtime configuration management, feature toggling, user status transitions (`ACTIVE`, `SUSPENDED`, `BANNED`, `DEACTIVATED`), role assignments/revocations, and global security audit log queries.

---

## 2. Out-of-Scope Items

The following items are explicitly **OUT OF SCOPE** for Phase 3.4 and the backend API:

- Frontend Admin Dashboard / Moderator CMS UI components.
- Email / Push Notification Delivery Services (Third-party SMTP / FCM integrations).
- Automated Machine Learning Content Moderation / AI Auto-banning.
- Search Engine Indexing (ElasticSearch / MeiliSearch integrations).

---

## 3. Existing Database Tables Involved

Phase 3.4 utilizes the remaining 5 unmapped tables out of the locked 20-table schema:

1. **`reports`** (Table 15)
2. **`moderation_actions`** (Table 16)
3. **`notifications`** (Table 17)
4. **`system_settings`** (Table 19)
5. **`feature_flags`** (Table 20)

Additionally, Phase 3.4 interfaces with previously implemented core tables: `users` (Table 1), `user_roles` (Table 7), `roles` (Table 2), and `audit_logs` (Table 18).

---

## 4. Database-to-Drizzle Mappings

### 4.1 `notifications.schema.ts` (`public.notifications`)
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

### 4.2 `reports.schema.ts` (`public.reports`)
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

### 4.3 `moderation-actions.schema.ts` (`public.moderation_actions`)
- `id`: `uuid('id').primaryKey().defaultRandom()`
- `moderatorId`: `uuid('moderator_id').notNull().references(() => usersTable.id, { onDelete: 'restrict' })`
- `reportId`: `uuid('report_id').references(() => reportsTable.id, { onDelete: 'set null' })`
- `actionType`: `varchar('action_type', { length: 30 }).notNull()` (`WARN`, `HIDE_CONTENT`, `SUSPEND`, `BAN`, `DISMISS`)
- `targetUserId`: `uuid('target_user_id').references(() => usersTable.id, { onDelete: 'set null' })`
- `reason`: `text('reason').notNull()`
- `metadata`: `jsonb('metadata')`
- `createdAt`: `timestamp('created_at', { withTimezone: true }).notNull().defaultNow()`

### 4.4 `system-settings.schema.ts` (`public.system_settings`)
- `id`: `uuid('id').primaryKey().defaultRandom()`
- `key`: `varchar('key', { length: 100 }).notNull().unique()`
- `value`: `jsonb('value').notNull()`
- `description`: `text('description')`
- `updatedAt`: `timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()`

### 4.5 `feature-flags.schema.ts` (`public.feature_flags`)
- `id`: `uuid('id').primaryKey().defaultRandom()`
- `key`: `varchar('key', { length: 100 }).notNull().unique()`
- `isEnabled`: `boolean('is_enabled').notNull().default(false)`
- `description`: `text('description')`
- `updatedAt`: `timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()`

---

## 5. Entity Relationships

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

- `reports` maps target references to `posts`, `comments`, or `users` (`num_nonnulls = 1`).
- `moderation_actions` maps moderator (`users.id`), target user (`users.id`), and optional `report_id`.
- `notifications` maps recipient `user_id` and contextual references (`reference_post_id`, `reference_comment_id`, `reference_user_id`).

---

## 6. Dependencies on Phase 3.1

- `UsersModule`: `JitProvisioningService` for user authentication, role evaluation (`AccountStatusGuard`), and user status management.
- `AuditModule`: `AuditLogService` to log administrative and moderation operations.

---

## 7. Dependencies on Phase 3.2

- `PostsModule`: `PostsService` / `PostsRepository` to validate reported post existence and execute content hiding (`status = 'HIDDEN'`).

---

## 8. Dependencies on Phase 3.3

- `CommentsModule`: `CommentsService` / `CommentsRepository` to validate reported comment existence and execute comment hiding (`status = 'HIDDEN'`).

---

## 9. Authorization and RBAC Model

Phase 3.4 enforces strict role-based access control (RBAC):

- **Authenticated Users (`MEMBER`)**:
  - Receive and read own notifications (`GET /notifications`).
  - File reports on posts, comments, or users (`POST /reports`).
- **Moderators (`MODERATOR`)**:
  - View report queue (`GET /moderation/reports`).
  - Execute moderation actions: `WARN`, `HIDE_CONTENT`, `DISMISS`, `SUSPEND`.
- **Administrators (`ADMIN`, `SUPER_ADMIN`)**:
  - Full access to moderation actions including `BAN`.
  - Assign / revoke user roles (`POST /admin/roles/assign`, `POST /admin/roles/revoke`).
  - Update user account status (`PATCH /admin/users/:id/status`).
  - Manage system settings and feature flags (`PATCH /admin/settings/:key`, `PATCH /admin/feature-flags/:key`).
  - Query global audit logs (`GET /admin/audit-logs`).

---

## 10. Guard Requirements

- **Notification Endpoints**: `@UseGuards(JwtAuthGuard, AccountStatusGuard)`.
- **Report Filing**: `@UseGuards(JwtAuthGuard, AccountStatusGuard, EmailVerificationGuard)`.
- **Moderation Endpoints**: `@UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)` with `@RequirePermission('moderation:manage')`.
- **Admin Endpoints**: `@UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)` with `@RequirePermission('admin:full')`.

---

## 11. Repository Contracts

### 11.1 `NotificationsRepository`
- `createTx(tx, data)`: Inserts notification record.
- `findUserNotifications(userId, isRead?, page?, limit?)`: Fetches user notifications.
- `markAsReadTx(tx, id, userId)`: Marks single notification read.
- `markAllAsReadTx(tx, userId)`: Marks all notifications read for user.

### 11.2 `ReportsRepository`
- `createTx(tx, data)`: Inserts report record.
- `findById(id)`: Fetches report by ID.
- `findQueuePaginated(status?, page?, limit?)`: Fetches moderation queue.
- `updateStatusTx(tx, id, status, resolvedAt?)`: Updates report status.

### 11.3 `ModerationActionsRepository`
- `createTx(tx, data)`: Inserts moderation action record.
- `findHistoryByTargetUser(targetUserId, page?, limit?)`: Fetches action history for target user.

### 11.4 `SystemSettingsRepository`
- `findByKey(key)`: Fetches setting by key.
- `upsertTx(tx, key, value, description?)`: Updates setting.
- `findAll()`: Returns all system settings.

### 11.5 `FeatureFlagsRepository`
- `findByKey(key)`: Fetches flag by key.
- `toggleTx(tx, key, isEnabled)`: Toggles flag.
- `findAll()`: Returns all feature flags.

---

## 12. Service Contracts

### 12.1 `NotificationsService`
- `createNotification(data)`: Creates notification record.
- `getUserNotifications(userId, query)`: Returns user notifications.
- `markAsRead(userId, notificationId)`: Marks single notification read.
- `markAllAsRead(userId)`: Marks all notifications read.

### 12.2 `ModerationService`
- `fileReport(reporterId, dto: CreateReportDto)`: Validates single target and files report.
- `getReportQueue(userRoles, query: QueryReportsDto)`: Returns paginated moderation queue.
- `executeAction(moderatorId, userRoles, dto: ExecuteModerationActionDto)`: Atomic execution of action + target state update + report resolution + audit log.

### 12.3 `AdminService`
- `changeUserStatus(adminId, adminRoles, userId, status, reason)`: Updates user status in `users` table.
- `assignRole(adminId, adminRoles, userId, roleName)`: Assigns role via `user_roles`.
- `revokeRole(adminId, adminRoles, userId, roleName)`: Revokes role via `user_roles`.
- `getSystemSettings()` & `updateSystemSetting(adminId, key, value)`: System setting management.
- `getFeatureFlags()` & `toggleFeatureFlag(adminId, key, isEnabled)`: Feature flag management.
- `getAuditLogs(query)`: Queries global audit log.

---

## 13. Controller / API Contracts

| Route | Method | Access | Required Guard / Permission |
| :--- | :--- | :--- | :--- |
| `/api/v1/notifications` | `GET` | Recipient | `JwtAuthGuard`, `AccountStatusGuard` |
| `/api/v1/notifications/:id/read` | `PATCH` | Recipient | `JwtAuthGuard`, `AccountStatusGuard` |
| `/api/v1/notifications/read-all` | `POST` | Recipient | `JwtAuthGuard`, `AccountStatusGuard` |
| `/api/v1/reports` | `POST` | Verified User | `JwtAuthGuard`, `AccountStatusGuard`, `EmailVerificationGuard` |
| `/api/v1/moderation/reports` | `GET` | Moderator / Admin | `PermissionGuard('moderation:manage')` |
| `/api/v1/moderation/actions` | `POST` | Moderator / Admin | `PermissionGuard('moderation:manage')` |
| `/api/v1/admin/users/:id/status` | `PATCH` | Admin | `PermissionGuard('admin:full')` |
| `/api/v1/admin/roles/assign` | `POST` | Admin | `PermissionGuard('admin:full')` |
| `/api/v1/admin/roles/revoke` | `POST` | Admin | `PermissionGuard('admin:full')` |
| `/api/v1/admin/settings` | `GET` | Admin | `PermissionGuard('admin:full')` |
| `/api/v1/admin/settings/:key` | `PATCH` | Admin | `PermissionGuard('admin:full')` |
| `/api/v1/admin/feature-flags` | `GET` | Public / Admin | Public Read / Admin Write |
| `/api/v1/admin/feature-flags/:key` | `PATCH` | Admin | `PermissionGuard('admin:full')` |
| `/api/v1/admin/audit-logs` | `GET` | Admin | `PermissionGuard('admin:full')` |

---

## 14. DTO Contracts

- **`CreateReportDto`**: `reportedPostId?`, `reportedCommentId?`, `reportedUserId?`, `reason` (string, max 100), `description?`.
- **`ExecuteModerationActionDto`**: `reportId?`, `actionType` (`WARN`, `HIDE_CONTENT`, `SUSPEND`, `BAN`, `DISMISS`), `targetUserId?`, `reason` (string), `metadata?`.
- **`UpdateUserStatusDto`**: `status` (`ACTIVE`, `SUSPENDED`, `BANNED`, `DEACTIVATED`), `reason` (string).
- **`AssignRoleDto`**: `userId` (UUID), `roleName` (`MEMBER`, `MODERATOR`, `ADMIN`, `SUPER_ADMIN`).
- **`UpdateSystemSettingDto`**: `value` (Record<string, any>), `description?`.
- **`ToggleFeatureFlagDto`**: `isEnabled` (boolean), `description?`.

---

## 15. Transaction Boundaries

1. **Moderation Action Execution**: Single atomic transaction (`this.db.transaction(async (tx) => ...)`):
   - Insert `moderation_actions` record.
   - Update target entity state (`posts.status = 'HIDDEN'`, `comments.status = 'HIDDEN'`, or `users.status = 'SUSPENDED'`).
   - Update `reports.status = 'RESOLVED'` (if `reportId` provided).
   - Log synchronous audit entry to `audit_logs`.
2. **User Status Change**: Single transaction updating `users.status` + creating `audit_logs` record.
3. **Role Assignment / Revocation**: Single transaction mutating `user_roles` + creating `audit_logs` record.

---

## 16. Concurrency Requirements

- **Report Single-Target Constraint**: Enforced by database constraint `chk_reports_exactly_one_target` (`num_nonnulls(reported_post_id, reported_comment_id, reported_user_id) = 1`).
- **Unique System Keys**: Enforced by `uq_system_settings_key` and `uq_feature_flags_key`.
- **Moderation Concurrency**: Atomic transaction prevents partial status updates when concurrent moderators resolve the same report queue item.

---

## 17. Audit & Security Requirements

- All moderation actions, user status changes, role assignments/revocations, system setting edits, and feature flag toggles MUST generate synchronous audit log entries in `audit_logs` via `AuditLogService`.
- Standard users attempting access to `/api/v1/admin/*` or `/api/v1/moderation/*` must receive `403 Forbidden` (`PermissionGuard`).

---

## 18. Soft-Delete & Status Semantics

- **Target Entities**: Target posts/comments soft-deleted (`deleted_at IS NOT NULL`) or hidden (`status = 'HIDDEN'`) remain in database. Foreign keys on `reports` use `ON DELETE RESTRICT` to preserve report historical links.
- **Notification Read State**: Notifications are updated (`is_read = true`, `read_at = NOW()`), never deleted.

---

## 19. Pagination & Query Design

Reuses standard platform pagination (`page`, `limit`, `sortBy`, `order`):
- `GET /notifications`: Sorted by `is_read ASC, created_at DESC`.
- `GET /moderation/reports`: Filterable by `status` (`OPEN`, `REVIEWING`, `RESOLVED`, `DISMISSED`), default sorted by `created_at DESC`.
- `GET /admin/audit-logs`: Filterable by `actorId`, `entityType`, `action`, sorted by `created_at DESC`.

---

## 20. Error Contracts

- `400 Bad Request`: Validation failure, invalid target combination on report filing (`num_nonnulls != 1`), invalid role assignment.
- `401 Unauthorized`: Missing or invalid JWT credentials.
- `403 Forbidden`: Account status restrictions, insufficient permissions (`moderation:manage`, `admin:full`), non-admin role modification.
- `404 Not Found`: Report ID, Notification ID, target entity, setting key, or user not found.

---

## 21. Test Strategy

1. **`notifications.spec.ts`**:
   - Notification creation on events.
   - Fetching user notifications feed.
   - Marking single & all notifications as read.
   - Isolation (User A cannot read User B notifications).
2. **`moderation.spec.ts`**:
   - Filing report with single-target validation (`num_nonnulls = 1`).
   - Rejecting reports with 0 or multiple targets.
   - Moderator executing `HIDE_CONTENT` (hides target post/comment, resolves report, creates audit log in 1 transaction).
   - Non-moderator receiving `403 Forbidden` on moderation endpoints.
3. **`admin.spec.ts`**:
   - Admin updating user status (`ACTIVE` -> `SUSPENDED`).
   - Admin assigning & revoking roles.
   - Admin toggling feature flags and updating system settings.
   - Non-admin receiving `403 Forbidden` on `/api/v1/admin/*` endpoints.

---

## 22. Implementation Order

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

## 23. Verification Pipeline

Upon explicit authorization, implementation will be verified with:
```bash
npx tsc --noEmit
npm run build
npm test
npm run test:e2e
```

---

## 24. Stop Conditions

Stop and report if:
1. `DATABASE_SCHEMA.sql` table constraints conflict with planned Drizzle mappings.
2. Any circular dependency occurs during module wiring.
3. `AuditLogService` fails to record moderation or administrative actions.

---

## 25. Acceptance Criteria

1. All 5 remaining database schemas (`notifications`, `reports`, `moderation_actions`, `system_settings`, `feature_flags`) map 100% to `DATABASE_SCHEMA.sql`.
2. Filing reports enforces `chk_reports_exactly_one_target` (`num_nonnulls = 1`).
3. Moderation action `HIDE_CONTENT` hides target content, resolves report, and logs audit record atomically.
4. Admin endpoints enforce `PermissionGuard('admin:full')` and block non-admins with `403 Forbidden`.
5. All 4 verification commands (`tsc`, `build`, `test`, `test:e2e`) pass with 0 errors.

---

**PLANNING STATUS**:  
**PLANNING ONLY — READ-ONLY / AWAITING HUMAN REVIEW**
