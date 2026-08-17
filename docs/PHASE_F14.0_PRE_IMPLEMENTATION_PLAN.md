# PHASE F14.0 — ADMIN CONSOLE & SYSTEM GOVERNANCE ENGINE PRE-IMPLEMENTATION PLAN

**Target**: Platform Administration Console, User Status Governance, RBAC Role Management, System Settings, Feature Flag Engine, Category Management & Security Audit Logs (`apps/web`)  
**Phase**: F14.0  
**Mode**: STRICT READ-ONLY — PLANNING ONLY  
**Date**: 2026-08-16  
**Author**: Senior Staff Frontend Architect, Full-Stack Architecture Reviewer, Backend Contract Auditor, Application Security Engineer, Accessibility Auditor & Lead QA  
**Status**: READY FOR HUMAN APPROVAL  

---

## 1. Executive Summary

Following the successful completion and approval of **Phases F2 through F13.1**, this document establishes the comprehensive, implementation-ready pre-implementation plan for **Phase F14.0 — Admin Console & System Governance Engine**.

An exhaustive investigation of the repository confirms that the backend module `apps/api/src/modules/admin`, categories administration (`apps/api/src/modules/categories`), and database tables (Table 2: `roles`, Table 7: `user_roles`, Table 18: `audit_logs`, Table 19: `system_settings`, Table 20: `feature_flags`) are fully built, unit-tested, and ready for frontend integration with **0 backend modifications and 0 database schema migrations**.

---

## 2. Frozen Approved Baselines & Current Project State

```text
PHASE F2.1  App Shell & UI Foundation              APPROVED (Frozen)
PHASE F3.1  Authentication & Identity              APPROVED (Frozen)
PHASE F4.1  Public Feed & Discovery Engine         APPROVED (Frozen)
PHASE F5.1  Post Detail & Series Reader            APPROVED (Frozen)
PHASE F6.1  Comments & Discussions                 APPROVED (Frozen)
PHASE F7.1  Users, Profiles & Social Identity       APPROVED (Frozen)
PHASE F8.1  Notification System                     APPROVED (Frozen)
PHASE F9.1  Post Creation & Editing Studio          APPROVED (Frozen)
PHASE F10.1 Educational Series Engine              APPROVED (Frozen)
PHASE F11.1 Reactions & Engagement Engine          APPROVED (Frozen)
PHASE F12.1 Media Upload & Asset Management Engine  APPROVED (Frozen)
PHASE F13.1 Moderation & Community Reporting Engine APPROVED (Frozen)

Verified Baseline:
- 154 / 154 Tests Passing across 56 Test Files
- 0 TypeScript Compilation Errors
- Production Build: PASS (Next.js Turbopack)
- 0 Backend / Database Modifications
```

---

## 3. Database Gap Analysis

Inspection of [`docs/DATABASE_SCHEMA.sql`](file:///d:/Web_Projects/finance_community_architecture_v1/docs/DATABASE_SCHEMA.sql) across all 20 tables:

| # | Table Name | Description | Current Frontend Coverage | Classification |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `users` | User credentials, status, and timestamps | Auth & Profile (F3.1, F7.1) | **A. Fully Implemented** |
| 2 | `roles` | Seeded RBAC role definitions | Context & ModerationGuard | **B. Partially Implemented** (Target for F14.0 Role Admin) |
| 3 | `categories` | Content categorization | Feed, Studio, Series | **B. Partially Implemented** (Target for F14.0 Category Admin) |
| 4 | `tags` | Freeform taxonomy | Feed, Studio | **A. Fully Implemented** |
| 5 | `media` | Uploaded asset metadata | Studio, Profile, Media | **A. Fully Implemented** |
| 6 | `profiles` | User bio, handle, and avatar | Profile, Feed, Comments | **A. Fully Implemented** |
| 7 | `user_roles` | User-role junction assignments | AuthContext session | **C. Backend-Ready / Missing Frontend** (Target for F14.0) |
| 8 | `posts` | Series chapters and community posts | Feed, Reader, Studio | **A. Fully Implemented** |
| 9 | `post_tags` | Posts-tags junction | Feed, Studio | **A. Fully Implemented** |
| 10 | `comments` | Threaded discussion comments | Discussions (F6.1) | **A. Fully Implemented** |
| 11 | `post_reactions` | Post likes & reactions | Reactions (F11.1) | **A. Fully Implemented** |
| 12 | `comment_reactions`| Comment likes & reactions | Reactions (F11.1) | **A. Fully Implemented** |
| 13 | `follows` | User-to-user following graph | Social (F7.1) | **A. Fully Implemented** |
| 14 | `post_media` | Post-media attachments | Studio & Reader | **A. Fully Implemented** |
| 15 | `reports` | Community violation reports | Moderation (F13.1) | **A. Fully Implemented** |
| 16 | `moderation_actions`| Moderator enforcement logs | Moderation (F13.1) | **A. Fully Implemented** |
| 17 | `notifications` | Notification feed & alerts | Notifications (F8.1) | **A. Fully Implemented** |
| 18 | `audit_logs` | Security & compliance audit trail | Not surfaced | **C. Backend-Ready / Missing Frontend** (Target for F14.0) |
| 19 | `system_settings` | Runtime key-value settings | Not surfaced | **C. Backend-Ready / Missing Frontend** (Target for F14.0) |
| 20 | `feature_flags` | Feature toggle engine | Not surfaced | **C. Backend-Ready / Missing Frontend** (Target for F14.0) |

---

## 4. Phase Ordering Analysis

### Evaluation of Candidates

- **Candidate #1: Phase F14.0 — Admin Console & System Governance Engine (RECOMMENDED)**
  - **Backend Readiness**: **100%**. All endpoints (`/admin/*`, `/feature-flags`, `/categories`) exist and are active in `apps/api/src/modules/admin` and `apps/api/src/modules/categories`.
  - **Database Readiness**: **100%**. Tables 2, 7, 18, 19, 20 are completely built.
  - **Architectural Value**: Completes the governance layer started in F13.1 by providing full platform administrative controls to `ADMIN` and `SUPER_ADMIN` users (User management, RBAC, feature toggles, runtime settings, and audit logs).
  - **Risk**: Low (isolated to `/admin` routes and guarded by RBAC).

- **Candidate #2: Bookmarks & Reading Lists**
  - **Backend Readiness**: **0%**. No backend module or database table exists. Requires database migrations (violates read-only backend rule).

- **Candidate #3: Analytics & Creator Metrics**
  - **Backend Readiness**: **0%**. No dedicated metrics aggregation API exists.

### Selection
**Phase F14.0: Admin Console & System Governance Engine** is the only fully supported, architecturally sound candidate.

---

## 5. Frozen Backend API Contracts for F14

All endpoints are consumed from `apps/api/src/modules/admin` and `apps/api/src/modules/categories`:

| Endpoint | Method | Required Permission | Request Payload / Query | Response Structure | Status Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET /api/v1/feature-flags` | `GET` | Public / None | None | `Record<string, boolean>` | `200` |
| `PATCH /api/v1/admin/users/:id/status` | `PATCH` | `admin:full` | `{ status: 'ACTIVE' \| 'SUSPENDED' \| 'BANNED' \| 'DEACTIVATED', reason?: string }` | `UserEntity` | `200`, `400` (self), `403` (escalation), `404` |
| `POST /api/v1/admin/roles/assign` | `POST` | `admin:full` | `{ userId: string, roleName: 'MEMBER' \| 'MODERATOR' \| 'ADMIN' \| 'SUPER_ADMIN' }` | `{ assigned: boolean, roleName: string, userId: string }` | `200`, `403` (self/escalation), `404` |
| `POST /api/v1/admin/roles/revoke` | `POST` | `admin:full` | `{ userId: string, roleName: 'MEMBER' \| 'MODERATOR' \| 'ADMIN' \| 'SUPER_ADMIN' }` | `{ revoked: boolean, roleName: string, userId: string }` | `200`, `403` (self/escalation), `404` |
| `GET /api/v1/admin/settings` | `GET` | `admin:full` | None | `SystemSettingEntity[]` | `200`, `403` |
| `PATCH /api/v1/admin/settings/:key` | `PATCH` | `admin:full` | `{ value: Record<string, any>, description?: string }` | `SystemSettingEntity` | `200`, `403` |
| `GET /api/v1/admin/feature-flags` | `GET` | `admin:full` | None | `FeatureFlagEntity[]` | `200`, `403` |
| `PATCH /api/v1/admin/feature-flags/:key` | `PATCH` | `admin:full` | `{ isEnabled: boolean, description?: string }` | `FeatureFlagEntity` | `200`, `403` |
| `GET /api/v1/admin/audit-logs` | `GET` | `admin:full` | `?page=&limit=&actorId=&entityType=&action=` | `{ data: AuditLogEntity[], meta: PaginationMeta }` | `200`, `403` |
| `POST /api/v1/categories` | `POST` | `categories:manage` | `{ name: string, slug: string, scope: 'SERIES' \| 'COMMUNITY', description?: string, sortOrder?: number }` | `CategoryEntity` | `201`, `403` |
| `PATCH /api/v1/categories/:id` | `PATCH` | `categories:manage` | `{ name?: string, slug?: string, description?: string, sortOrder?: number }` | `CategoryEntity` | `200`, `403`, `404` |

---

## 6. Frontend Architecture Plan

### Planned File Structure

```text
apps/web/
├── types/
│   └── admin.ts                                   # TypeScript definitions for admin entities, DTOs & audit logs
│
├── lib/
│   └── admin/
│       ├── admin-service.ts                       # REST client for /admin/* and /feature-flags
│       └── use-admin.ts                           # TanStack Query hooks for admin operations
│
├── components/
│   └── admin/
│       ├── AdminGuard.tsx                         # RBAC route guard (ADMIN, SUPER_ADMIN)
│       ├── AdminNav.tsx                           # Sub-navigation bar for admin sections
│       ├── UserManagementView.tsx                 # User status changes & role assignment dialogs
│       ├── SystemSettingsView.tsx                 # Key-value JSON/string configuration editor
│       ├── FeatureFlagsView.tsx                   # Feature toggle switches with confirmation
│       ├── AuditLogsTable.tsx                     # Paginated security audit log inspector
│       └── CategoryManagementView.tsx             # Category creation and editing modal
│
└── app/
    └── admin/
        ├── layout.tsx                             # Admin shell with AdminGuard & AdminNav
        ├── page.tsx                               # Overview & Quick Stats dashboard
        ├── users/page.tsx                         # User Governance & Roles page
        ├── settings/page.tsx                      # Runtime System Settings page
        ├── feature-flags/page.tsx                 # Feature Flags page
        ├── audit-logs/page.tsx                    # Security Audit Logs page
        └── categories/page.tsx                    # Content Category Management page
```

---

## 7. Security & Privilege Escalation Defenses

1. **Self-Modification Defenses**:
   - Backend enforces `adminId !== targetUserId` for account status changes, role assignments, and role revocations (throws 400/403).
   - Frontend disables self-modification actions in UI with clear contextual tooltips.
2. **Privilege Escalation Rules**:
   - `ADMIN` cannot assign or revoke `SUPER_ADMIN` or `ADMIN` roles.
   - `ADMIN` cannot change the account status of another `ADMIN` or `SUPER_ADMIN`.
   - UI reflects these constraints dynamically based on `user.roles.includes('SUPER_ADMIN')`.
3. **Data Sanitization**:
   - Zero use of `dangerouslySetInnerHTML`. All audit log metadata, JSON settings, and reasons rendered as safe React elements or formatted code blocks.
4. **Authoritative Backend Security**:
   - Client-side `<AdminGuard>` provides clean UX routing; backend `PermissionGuard('admin:full')` remains the authoritative security boundary.

---

## 8. Accessibility & Responsive UI (WCAG 2.2 AA)

- **Accessible Controls**: Toggle switches for feature flags have explicit `role="switch"`, `aria-checked`, and accessible labels.
- **Dialogs & Modals**: User status dialogs and category editors implement `role="dialog"`, `aria-modal="true"`, focus traps, and Escape key dismissal.
- **Responsive Layout**: Desktop data tables convert to responsive structured cards on mobile screens (<768px).

---

## 9. Comprehensive Test Strategy

Planned test files in `apps/web/tests/admin/`:
1. `admin-service.test.ts`: Tests all REST endpoints (`PATCH /users/:id/status`, `POST /roles/assign`, `POST /roles/revoke`, `GET/PATCH /settings`, `GET/PATCH /feature-flags`, `GET /audit-logs`).
2. `AdminGuard.test.tsx`: Tests `ADMIN`/`SUPER_ADMIN` allowance and `MEMBER`/`MODERATOR` blocking.
3. `UserManagementView.test.tsx`: Tests status updating, role assignment, and self-modification blocking.
4. `FeatureFlagsView.test.tsx`: Tests toggle mutations and optimistic feedback.
5. `SystemSettingsView.test.tsx`: Tests settings form editing and saving.
6. `AuditLogsTable.test.tsx`: Tests audit log filtering, pagination, and metadata inspector.
7. `CategoryManagementView.test.tsx`: Tests category creation and editing.

---

## 10. Risk Register

| Risk ID | Risk | Severity | Probability | Mitigation | Blocking |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `R-F14-01` | Accidental administrator self-lockout or privilege modification | High | Low | Backend enforces 400/403 on self-modification; UI disables self-action controls. | No |
| `R-F14-02` | Unauthorized role assignment by lower-tier admins | High | Low | Backend `AdminService` strictly checks caller's `SUPER_ADMIN` role; frontend hides elevated role options. | No |
| `R-F14-03` | Malformed JSON in system settings editor | Medium | Medium | Frontend JSON validator pre-checks input before network dispatch. | No |

---

## 11. Acceptance Criteria

- [ ] **AC-F14-001**: `/admin` dashboard accessible only to users with `ADMIN` or `SUPER_ADMIN` roles.
- [ ] **AC-F14-002**: Administrators can update user account statuses (`ACTIVE`, `SUSPENDED`, `BANNED`, `DEACTIVATED`) with audit reasons.
- [ ] **AC-F14-003**: Super Admins can assign and revoke RBAC roles with self-modification prevention.
- [ ] **AC-F14-004**: System configuration settings can be inspected and updated at `/admin/settings`.
- [ ] **AC-F14-005**: Feature flags can be toggled in real time at `/admin/feature-flags`.
- [ ] **AC-F14-006**: Paginated audit log inspector supports filtering by action, actor, and entity at `/admin/audit-logs`.
- [ ] **AC-F14-007**: Content categories can be created and edited at `/admin/categories`.
- [ ] **AC-F14-008**: 100% tests passing, 0 TypeScript errors, 0 backend/database modifications.

---

## 12. Final Recommendation

```text
============================================================
PHASE F14.0 — PRE-IMPLEMENTATION PLAN
============================================================

Recommended Phase:
F14.0 — ADMIN CONSOLE & SYSTEM GOVERNANCE ENGINE

Repository Investigation: COMPLETE
Backend Contract Audit: COMPLETE (apps/api/src/modules/admin)
Database Audit: COMPLETE (Tables 2, 7, 18, 19, 20)
Frontend Gap Analysis: COMPLETE
Security Audit: COMPLETE
Accessibility Plan: COMPLETE
Testing Strategy: COMPLETE

Implementation:
NOT AUTHORIZED

Files:
NOT MODIFIED

Status:
READY FOR HUMAN APPROVAL

STOP.
DO NOT IMPLEMENT CODE.
DO NOT MODIFY FILES.
DO NOT FIX FINDINGS.
DO NOT START CODING.

AWAIT HUMAN APPROVAL.
============================================================
```
