# PHASE 3.4 — PRE-IMPLEMENTATION CLARIFICATION AUDIT

**Target Phase**: Phase 3.4 — Platform Operations & Governance  
**Version**: 1.0 — READ-ONLY CLARIFICATION  
**Date**: 2026-08-13  
**Status**: PHASE 3.4 — CLARIFICATION AUDIT COMPLETE  
**Implementation**: NOT STARTED  
**Database Schema**: IMMUTABLE  
**Migrations**: 0  
**Source Files Modified**: 0  

---

## 1. Confirmed Decisions

### 1.1 Moderation Target Resolution & Action Compatibility
- **Target Resolution Rule**: When a moderator executes an action referencing a `reportId`, the target entity is resolved directly from the report record without modifying schema columns:
  - If `report.reported_post_id IS NOT NULL` -> Target is Post (`reported_post_id`). Valid actions: `HIDE_CONTENT`, `WARN`, `DISMISS`.
  - If `report.reported_comment_id IS NOT NULL` -> Target is Comment (`reported_comment_id`). Valid actions: `HIDE_CONTENT`, `WARN`, `DISMISS`.
  - If `report.reported_user_id IS NOT NULL` -> Target is User (`reported_user_id`). Valid actions: `WARN`, `SUSPEND`, `BAN`, `DISMISS`. Action `HIDE_CONTENT` is **invalid** for user targets (`400 Bad Request`, `code: 'INVALID_TARGET_ACTION'`).
- **Direct Moderation Action (Without Report)**: `ExecuteModerationActionDto` supports optional explicit target fields (`targetPostId?`, `targetCommentId?`, `targetUserId?`). Application validation ensures exactly 1 target is supplied.
- **Report Status Transitions**:
  - Action `HIDE_CONTENT`, `WARN`, `SUSPEND`, `BAN` -> Sets `reports.status = 'RESOLVED'`, `resolved_at = NOW()`.
  - Action `DISMISS` -> Sets `reports.status = 'DISMISSED'`, `resolved_at = NOW()`.

### 1.2 RBAC Hierarchy & Privilege Escalation Rules
Audited against `AUTH_SECURITY_SPEC.md` v1.2 and `roles` table:
1. **Can ADMIN assign SUPER_ADMIN?** NO (`403 Forbidden`, `code: 'PRIVILEGE_ESCALATION_DENIED'`).
2. **Can ADMIN revoke SUPER_ADMIN?** NO (`403 Forbidden`).
3. **Can ADMIN modify another ADMIN?** NO (`403 Forbidden`). Peer admin modifications are blocked.
4. **Can ADMIN modify SUPER_ADMIN?** NO (`403 Forbidden`).
5. **Can an administrator modify their own role?** NO (`403 Forbidden`, `code: 'CANNOT_MODIFY_SELF_ROLE'`). Self-demotion/escalation is forbidden.
6. **Who can assign/revoke MODERATOR?** `ADMIN` or `SUPER_ADMIN`.
7. **Who can assign/revoke ADMIN?** `SUPER_ADMIN` only.
8. **Who can assign/revoke SUPER_ADMIN?** `SUPER_ADMIN` only.

### 1.3 User Status State Machine
Audited against `users.status` CHECK constraint (`'ACTIVE'`, `'SUSPENDED'`, `'BANNED'`, `'DEACTIVATED'`):
- **`ACTIVE` -> `SUSPENDED`**: Allowed by `MODERATOR`, `ADMIN`, `SUPER_ADMIN`.
- **`ACTIVE` -> `BANNED`**: Allowed by `ADMIN`, `SUPER_ADMIN` only.
- **`ACTIVE` -> `DEACTIVATED`**: Allowed by User (Self-deactivation) or `ADMIN`.
- **`SUSPENDED` -> `ACTIVE`**: Allowed by `MODERATOR`, `ADMIN`, `SUPER_ADMIN` (Re-activation).
- **`BANNED` -> `ACTIVE`**: Allowed by `ADMIN`, `SUPER_ADMIN` (Unban).
- **`DEACTIVATED` -> `ACTIVE`**: Allowed by User logging in / JIT re-activation.
- **Restrictions**:
  - Self-status mutation is forbidden (`CANNOT_MODIFY_SELF_STATUS` -> `400 Bad Request`).
  - `SUPER_ADMIN` accounts cannot be `SUSPENDED` or `BANNED` by `ADMIN` or `MODERATOR` (`PROTECTED_SUPER_ADMIN_STATUS` -> `403 Forbidden`).

### 1.4 AuditLogService Transaction Support Verification
- **Inspection Result**: Verified [audit-log.service.ts](file:///d:/Web_Projects/finance_community_architecture_v1/apps/api/src/modules/audit/services/audit-log.service.ts). `AuditLogService.log(entry, tx)` accepts optional `tx?: any` and calls `AuditLogRepository.insertLogTx(tx, data)`.
- **Conclusion**: `AuditLogService` fully supports participation in the caller's active Drizzle transaction. No contradiction exists.

---

## 2. Contradictions

**NONE**. Every table structure, foreign key behavior, CHECK constraint, and unique constraint in [DATABASE_SCHEMA.sql](file:///d:/Web_Projects/finance_community_architecture_v1/docs/DATABASE_SCHEMA.sql) matches the planned Phase 3.4 specifications:
- `chk_reports_exactly_one_target` (`num_nonnulls(reported_post_id, reported_comment_id, reported_user_id) = 1`) -> Verified.
- `chk_moderation_actions_action_type` (`'WARN'`, `'HIDE_CONTENT'`, `'SUSPEND'`, `'BAN'`, `'DISMISS'`) -> Verified.
- `chk_users_status` (`'ACTIVE'`, `'SUSPENDED'`, `'BANNED'`, `'DEACTIVATED'`) -> Verified.

---

## 3. Ambiguities & Resolving Logic

1. **Duplicate Report Filing**:
   - *Ambiguity*: Table `reports` does not have a UNIQUE constraint on `(reporter_id, target)`.
   - *Resolution*: Application logic in `ReportsService.fileReport` queries existing reports for `(reporter_id, target)` where `status IN ('OPEN', 'REVIEWING')`. If an active report already exists, the service idempotently returns the existing report with `200 OK` (`isDuplicate: true`), preventing report queue flooding without schema alterations.

2. **Notification Isolation & Asynchronous Producers**:
   - *Ambiguity*: Phase 3.3 source code is CLOSED and locked. Phase 3.4 Notifications cannot inject producers into Phase 3.3 code directly.
   - *Resolution*: `NotificationsService` exposes a domain producer API (`createNotification`). Phase 3.4 moderation actions, user status changes, and administrative operations invoke `NotificationsService` inside Phase 3.4 handlers.

---

## 4. DECISION REQUIRED Items

### Item 1: Feature Flag Public Endpoint Visibility
- **Current Plan Claim**: `GET /api/v1/admin/feature-flags` Public Read / Admin Write.
- **Clarification**: Public clients require active feature flags to conditionally render UI capabilities, but internal metadata (`description`, `updatedAt`) should not leak to unauthenticated callers.
- **Decision**:
  - `GET /api/v1/feature-flags` (Public): Returns key-boolean map of active flags (`{ "enable_comments": true }`).
  - `GET /api/v1/admin/feature-flags` (Admin Only): Requires `PermissionGuard('admin:full')` and returns full flag entity list.

---

## 5. Recommended Corrections to PHASE_3.4_PRE_IMPLEMENTATION_PLAN.md

1. **Section 13 (Controllers)**: Split `/api/v1/admin/feature-flags` into public read `/api/v1/feature-flags` and administrative `/api/v1/admin/feature-flags`.
2. **Section 12 (Services)**: Add target resolution logic to `ModerationService.executeAction` for Post vs Comment vs User actions.
3. **Section 14 (DTOs)**: Explicitly specify `targetPostId?`, `targetCommentId?`, `targetUserId?` in `ExecuteModerationActionDto` for direct moderator actions.

---

## 6. Impact on Implementation

The clarifications ensure that:
- `ModerationService` handles Post/Comment/User targets cleanly without adding DB columns.
- Admin role management prevents privilege escalation attack vectors.
- Audit logging participates in active Drizzle transaction blocks (`tx`).
- `NotificationsService` operates asynchronously without modifying closed Phase 3.1, 3.2, or 3.3 modules.

---

## 7. Final Readiness Assessment

**PHASE 3.4 — CLARIFICATION AUDIT COMPLETE**  
**IMPLEMENTATION**: NOT STARTED  
**DATABASE_SCHEMA.sql**: IMMUTABLE  
**MIGRATIONS**: 0  
**SOURCE FILES MODIFIED**: 0  

---

**STOP & AWAIT HUMAN AUTHORIZATION BEFORE PROCEEDING TO FINAL PLAN CONSOLIDATION OR IMPLEMENTATION.**
