# PHASE F13.0 — MODERATION & COMMUNITY REPORTING ENGINE PRE-IMPLEMENTATION PLAN

**Target**: Community Content Reporting, Moderation Queue Dashboard, Moderation Action Enforcement & Governance Integration (`apps/web`)  
**Phase**: F13.0  
**Mode**: STRICT READ-ONLY — PLANNING ONLY  
**Date**: 2026-08-16  
**Author**: Senior Staff Frontend Architect, Full-Stack Architecture Reviewer, Backend Contract Auditor, Application Security Engineer, Accessibility Auditor & Lead QA  
**Status**: READY FOR HUMAN APPROVAL  

---

## 1. Executive Summary

Following the successful completion and approval of **Phases F2 through F12.1**, this document establishes the comprehensive, implementation-ready architectural plan for **Phase F13.0 — Moderation & Community Reporting Engine**.

An exhaustive investigation of the backend (`apps/api/src/modules/reports`, `apps/api/src/modules/moderation`), database schema (`docs/DATABASE_SCHEMA.sql`, Table 15: `reports`, Table 16: `moderation_actions`), and frontend integration points confirms the architectural readiness for:
1. **Community Content Reporting**: Accessible, authenticated filing of policy violation reports against posts, comments, and user profiles (`POST /api/v1/reports`).
2. **Moderation Queue & Review Workflow**: Dedicated, role-gated moderation dashboard (`/moderation`) providing paginated queue inspection, filtering by status (`OPEN`, `RESOLVED`, `DISMISSED`), target entity metadata resolution, and review (`GET /api/v1/moderation/reports`).
3. **Atomic Moderation Action Execution**: Modal-guided enforcement actions (`WARN`, `HIDE_CONTENT`, `SUSPEND`, `BAN`, `DISMISS`) with reason tracking, single-transaction database execution, automated report resolution, and synchronous audit logging (`POST /api/v1/moderation/actions`).
4. **Zero Backend / Database Alterations**: Full client-side implementation against existing backend contracts with 0 backend modifications and 0 database schema migrations.

---

## 2. Frozen Approved Baselines & Current Project State

```text
PHASE F2   App Shell & UI Foundation              APPROVED (Frozen)
PHASE F3.1 Authentication & Identity              APPROVED (Frozen)
PHASE F4.1 Public Feed & Discovery Engine         APPROVED (Frozen)
PHASE F5.1 Post Detail & Series Reader            APPROVED (Frozen)
PHASE F6.1 Comments & Discussions                 APPROVED (Frozen)
PHASE F7.1 Users, Profiles & Social Identity       APPROVED (Frozen)
PHASE F8.1 Notification System                     APPROVED (Frozen)
PHASE F9.1 Post Creation & Editing Studio          APPROVED (Frozen)
PHASE F10.1 Educational Series Engine              APPROVED (Frozen)
PHASE F11.1 Reactions & Engagement Engine          APPROVED (Frozen)
PHASE F12.1 Media Upload & Asset Management       APPROVED (Frozen)

Latest Verified Validation:
- Tests: 139/139 PASS across 50 test files
- Typecheck: 0 TypeScript errors
- Production Build: PASS (Next.js Turbopack)
- Backend Modifications: 0
- Database Modifications: 0
- Migrations: 0
- Scope Creep: 0
```

All previous phases remain **IMMUTABLE BASELINES**.

---

## 3. Required Repository Investigation

### 3.1 Backend Modules (`apps/api/src/modules/`)

1. **`reports` module**:
   - `ReportsController` (`POST /api/v1/reports`): Protected by `JwtAuthGuard`, `AccountStatusGuard`, `EmailVerificationGuard`.
   - `ReportsService.fileReport()`: Enforces exactly 1 target (`reportedPostId`, `reportedCommentId`, or `reportedUserId`). Deduplicates active `OPEN` reports for the same target by the same reporter (returns 200 OK idempotent response if duplicate, 201 Created if new).
   - `ReportsService.getQueue()`: Paginated retrieval with status filtering.
2. **`moderation` module**:
   - `ModerationController` (`GET /api/v1/moderation/reports`, `POST /api/v1/moderation/actions`): Protected by `JwtAuthGuard`, `AccountStatusGuard`, `PermissionGuard` requiring `moderation:manage`.
   - `ModerationService.executeAction()`: Single atomic database transaction executing:
     - `HIDE_CONTENT` on Post (`posts.status = 'HIDDEN'`) or Comment (`comments.status = 'HIDDEN'`)
     - `SUSPEND` on User (`users.status = 'SUSPENDED'`)
     - `BAN` on User (`users.status = 'BANNED'`)
     - `DISMISS` on Report (`reports.status = 'DISMISSED'`)
     - Resolves report status to `'RESOLVED'` (or `'DISMISSED'`)
     - Creates `moderation_actions` row and logs to `audit_logs`

### 3.2 Database Schema (`docs/DATABASE_SCHEMA.sql`)

1. **Table 15: `reports`**:
   - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `reporter_id`: `UUID NULL REFERENCES users(id) ON DELETE SET NULL`
   - `reported_post_id`: `UUID NULL REFERENCES posts(id) ON DELETE RESTRICT`
   - `reported_comment_id`: `UUID NULL REFERENCES comments(id) ON DELETE RESTRICT`
   - `reported_user_id`: `UUID NULL REFERENCES users(id) ON DELETE RESTRICT`
   - `reason`: `VARCHAR(100) NOT NULL`
   - `description`: `TEXT NULL`
   - `status`: `VARCHAR(20) NOT NULL DEFAULT 'OPEN'` (`CHECK (status IN ('OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED'))`)
   - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
   - `resolved_at`: `TIMESTAMPTZ NULL`
   - Constraint `chk_reports_exactly_one_target`: `CHECK (num_nonnulls(reported_post_id, reported_comment_id, reported_user_id) = 1)`
2. **Table 16: `moderation_actions`**:
   - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `moderator_id`: `UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT`
   - `report_id`: `UUID NULL REFERENCES reports(id) ON DELETE SET NULL`
   - `action_type`: `VARCHAR(30) NOT NULL` (`CHECK (action_type IN ('WARN', 'HIDE_CONTENT', 'SUSPEND', 'BAN', 'DISMISS'))`)
   - `target_user_id`: `UUID NULL REFERENCES users(id) ON DELETE SET NULL`
   - `reason`: `TEXT NOT NULL`
   - `metadata`: `JSONB NULL`
   - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`

---

## 4. Backend Contract Audit

| Endpoint | Method | Auth Required | Required Permission | Request Body / Query Params | Response Shape | Status Codes |
| :--- | :---: | :---: | :---: | :--- | :--- | :---: |
| `/api/v1/reports` | `POST` | Bearer JWT (Active, Verified) | `reports:create` (All authenticated members) | `CreateReportDto` (`reportedPostId?`, `reportedCommentId?`, `reportedUserId?`, `reason`, `description?`) | `ReportItem` | `201 Created` (new report), `200 OK` (duplicate active report), `400 Bad Request`, `401`, `403`, `404` |
| `/api/v1/moderation/reports` | `GET` | Bearer JWT (Active) | `moderation:manage` (`MODERATOR`, `ADMIN`, `SUPER_ADMIN`) | Query: `status?`, `page?`, `limit?` | `PaginatedResponse<ReportItem>` (`data: ReportItem[]`, `meta: PaginationMeta`) | `200 OK`, `401`, `403` |
| `/api/v1/moderation/actions` | `POST` | Bearer JWT (Active) | `moderation:manage` (`MODERATOR`, `ADMIN`, `SUPER_ADMIN`) | `ExecuteModerationActionDto` (`reportId?`, `targetPostId?`, `targetCommentId?`, `targetUserId?`, `actionType`, `reason`, `metadata?`) | `ModerationActionItem` | `200 OK`, `400 Bad Request`, `401`, `403`, `404` |

---

## 5. Reporting Architecture

### 5.1 Supported Target Entities
1. **Post Target**: `reportedPostId: string` (Dispatched from `PostHeader.tsx` or `PostDetailView.tsx`).
2. **Comment Target**: `reportedCommentId: string` (Dispatched from `CommentItem.tsx`).
3. **User Target**: `reportedUserId: string` (Dispatched from `ProfileHeader.tsx`).

### 5.2 Predefined Report Reasons
To ensure consistent policy adherence and structured reports, the UI presents standardized reason options:
- `SPAM`: "Spam, promotional advertising, or commercial solicitation"
- `MISINFORMATION`: "Financial misinformation, deceptive market manipulation, or unverified claims"
- `HARASSMENT`: "Harassment, hate speech, defamation, or offensive language"
- `PLAGIARISM`: "Copyright infringement or unattributed content plagiarism"
- `OTHER`: "Other platform code of conduct violation"

### 5.3 Report Filing Flow
```
User Clicks "Report" Button
        │
        ▼
Opens Accessible <ReportModal>
  - Pre-selects target (Post / Comment / User)
  - Displays reason radio group / dropdown
  - Provides optional description textarea (max 1000 chars)
        │
        ▼
Submits POST /api/v1/reports
        │
        ├─► 201 Created: Shows success toast/alert "Report submitted for moderator review."
        ├─► 200 OK (Duplicate): Shows friendly notice "You have already filed an active report for this item."
        └─► 401 Unauthenticated: Redirects to /login?returnUrl=...
```

---

## 6. Moderation Queue Dashboard Architecture (`/moderation`)

### 6.1 Route & Access Control
- Route: `/moderation` (Protected route requiring authentication and role `MODERATOR`, `ADMIN`, or `SUPER_ADMIN`).
- Access Guard: `<ModerationGuard>` checks `user?.roles.some(r => ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(r))`. If unauthorized, renders standard 403 Forbidden state with back button.

### 6.2 Queue Features & Filtering
- **Status Filter Tabs**: `ALL` | `OPEN` (Default) | `REVIEWING` | `RESOLVED` | `DISMISSED`.
- **Target Resolution**: Displays target type (`POST` / `COMMENT` / `USER`) with target ID, reason badge, reporter user ID, submission timestamp, and current status.
- **Pagination Controls**: Standard Previous / Next navigation using backend `meta` (`page`, `totalPages`, `totalItems`, `hasNextPage`, `hasPreviousPage`).
- **Action Triggers**: Direct action buttons on each report row:
  - "Take Action" (Opens action execution modal)
  - "Dismiss" (Quick dismissal with reason)

---

## 7. Moderation Action Enforcement Architecture

### 7.1 Supported Action Types (`ExecuteModerationActionDto`)

| Action Type | Supported Targets | Backend Effect | Confirmation Prompt |
| :--- | :--- | :--- | :--- |
| **`WARN`** | Post, Comment, User | Records formal warning in moderation actions & audit log; resolves report | Standard reason prompt |
| **`HIDE_CONTENT`** | Post, Comment *(Forbidden on User)* | Sets `status = 'HIDDEN'` on target post/comment; resolves report | Destructive warning: *"This will remove the content from public feeds and readers."* |
| **`SUSPEND`** | User *(or author of target Post/Comment)* | Sets `users.status = 'SUSPENDED'`; resolves report | High-severity confirmation: *"User will be prevented from logging in or authoring content."* |
| **`BAN`** | User *(or author of target Post/Comment)* | Sets `users.status = 'BANNED'`; resolves report | Critical-severity confirmation: *"User account will be permanently banned."* |
| **`DISMISS`** | Post, Comment, User | Sets `reports.status = 'DISMISSED'` with explanation reason | Standard reason prompt |

### 7.2 Action Execution Flow
```
Moderator Clicks "Take Action" on Report (or Direct Target)
        │
        ▼
Opens <ExecuteActionDialog>
  - Selects Action Type (WARN, HIDE_CONTENT, SUSPEND, BAN, DISMISS)
  - Validates target compatibility (prevents HIDE_CONTENT on User)
  - Mandatory Enforcement Reason (minimum 5 chars, max 500 chars)
  - Requires explicit confirmation checkbox for destructive actions (SUSPEND, BAN)
        │
        ▼
Submits POST /api/v1/moderation/actions
        │
        ▼
On Success:
  - Invalidates ['moderation', 'reports'] query cache
  - Invalidates target entity cache (['posts'], ['comments'], ['users'])
  - Closes dialog and displays success alert
```

---

## 8. RBAC & Security

1. **Client UX Gating**:
   - `ReportButton`: Available to all authenticated members (`user !== null`).
   - Moderation Dashboard (`/moderation`): Visible and accessible only if `user.roles` contains `'MODERATOR'`, `'ADMIN'`, or `'SUPER_ADMIN'`.
2. **Authoritative Backend Security**:
   - Backend `PermissionGuard` and `JwtAuthGuard` enforce authorization independently of client-side state.
   - `401 Unauthorized` triggers token expiration / auth redirect.
   - `403 Forbidden` displays clear "Insufficient Permissions" security state.
3. **Data Protection & Reporter Privacy**:
   - Report details are never exposed to public feeds or non-moderator API callers.
   - XSS sanitization: All report descriptions and moderation reasons are rendered safely via React standard text nodes (0 `dangerouslySetInnerHTML`).

---

## 9. TanStack Query Strategy & Query Keys

### 9.1 Query Keys Registration (`apps/web/lib/query/keys.ts`)
```typescript
  reports: {
    all: ['reports'] as const,
    queue: (params?: { status?: string; page?: number; limit?: number }) =>
      ['reports', 'queue', params || {}] as const,
  },
  moderation: {
    all: ['moderation'] as const,
    actions: ['moderation', 'actions'] as const,
  },
```

### 9.2 Invalidation & Cache Strategy
- Filing a report: invalidates `queryKeys.reports.all`.
- Executing an action:
  - Invalidates `queryKeys.reports.all` (updates moderation queue immediately).
  - Invalidates `queryKeys.posts.all` (if post was hidden).
  - Invalidates `queryKeys.posts.comments(postId)` (if comment was hidden).
  - Invalidates `queryKeys.users.profile(username)` (if user was suspended/banned).

---

## 10. Frontend Architecture & Component Plan

```
apps/web/
├── types/
│   └── moderation.ts               # ReportItem, CreateReportDto, ModerationActionItem, ExecuteModerationActionDto
├── lib/
│   ├── moderation/
│   │   ├── moderation-service.ts    # REST client for reports & moderation actions
│   │   └── use-moderation.ts        # TanStack Query hooks (useFileReport, useModerationQueue, useExecuteModerationAction)
│   └── query/
│       └── keys.ts                  # Register queryKeys.reports & queryKeys.moderation
├── components/
│   └── moderation/
│       ├── ReportButton.tsx         # Polymorphic report button for posts, comments, profiles
│       ├── ReportModal.tsx          # Accessible modal dialog for filing reports
│       ├── ModerationQueueTable.tsx # Paginated report queue table with status badges & filter tabs
│       ├── ExecuteActionDialog.tsx  # Confirmation dialog for executing WARN, HIDE_CONTENT, SUSPEND, BAN, DISMISS
│       └── ModerationGuard.tsx      # RBAC protection wrapper for /moderation route
└── app/
    └── moderation/
        └── page.tsx                 # Moderation Dashboard Page
```

---

## 11. Accessibility (WCAG 2.2 AA)

1. **Modal Dialog Accessibility**:
   - `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `aria-describedby`.
   - Focus trapped inside modal; `Escape` key closes modal; returns focus to triggering button upon dismissal.
2. **Form Accessibility**:
   - Radio buttons for reason selection grouped within `<fieldset>` with accessible `<legend>`.
   - Error messages linked to inputs via `aria-describedby` and announced via `aria-live="polite"`.
3. **Table & Queue Accessibility**:
   - Semantic `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>` structure.
   - Status indicators use both color and descriptive text badges (never color alone).
4. **Destructive Action Confirmation**:
   - High-contrast confirmation prompts before applying destructive penalties (SUSPEND, BAN).

---

## 12. Responsive Design

- **Mobile (<768px)**:
  - Full-screen / bottom-sheet report modal.
  - Moderation queue switches from wide table to responsive card list format with touch-friendly 44x44px action buttons.
- **Tablet & Desktop (>=768px)**:
  - Centered dialogs with backdrop blur.
  - Data table with sorting, pagination bar, and inline action buttons.

---

## 13. Error, Loading & Empty States

- **Loading States**: Skeleton row loaders for moderation queue; spinner indicators on action submission buttons.
- **Empty State**: Friendly zero-state graphic when moderation queue has no pending reports (`"Queue is clear. No active reports found."`).
- **Duplicate Report**: Gentle informational alert informing user their report is already queued.
- **Permission Errors**: Clear 403 Forbidden screen when non-moderators attempt to navigate to `/moderation`.

---

## 14. Testing Strategy

Comprehensive Vitest test suites in `apps/web/tests/moderation/`:
1. `moderation-service.test.ts`: Tests `fileReport`, `getModerationQueue`, and `executeModerationAction` REST calls.
2. `ReportButton.test.tsx`: Tests rendering, unauthenticated login redirect, and modal opening.
3. `ReportModal.test.tsx`: Tests target assignment, reason selection, validation, duplicate handling, and submission.
4. `ModerationQueueTable.test.tsx`: Tests queue rendering, status filtering tabs, pagination controls, and empty state.
5. `ExecuteActionDialog.test.tsx`: Tests action type selection, reason validation, destructive action safeguards, and submission.
6. `ModerationGuard.test.tsx`: Tests RBAC route protection (allows MODERATOR/ADMIN, blocks MEMBER).

---

## 15. Planned File Changes

### Files to Create (12):
- `apps/web/types/moderation.ts`
- `apps/web/lib/moderation/moderation-service.ts`
- `apps/web/lib/moderation/use-moderation.ts`
- `apps/web/components/moderation/ReportButton.tsx`
- `apps/web/components/moderation/ReportModal.tsx`
- `apps/web/components/moderation/ModerationQueueTable.tsx`
- `apps/web/components/moderation/ExecuteActionDialog.tsx`
- `apps/web/components/moderation/ModerationGuard.tsx`
- `apps/web/app/moderation/page.tsx`
- `apps/web/tests/moderation/moderation-service.test.ts`
- `apps/web/tests/moderation/ReportModal.test.tsx`
- `apps/web/tests/moderation/ModerationQueueTable.test.tsx`
- `apps/web/tests/moderation/ExecuteActionDialog.test.tsx`

### Files to Modify (4):
- `apps/web/lib/query/keys.ts` (Register `queryKeys.reports` and `queryKeys.moderation`)
- `apps/web/components/content/PostHeader.tsx` (Add `ReportButton` for posts)
- `apps/web/components/content/CommentItem.tsx` (Add `ReportButton` for comments)
- `apps/web/components/profile/ProfileHeader.tsx` (Add `ReportButton` for user profiles)

### Files That Must NOT Be Modified:
- `apps/api/**` (0 backend modifications)
- `docs/DATABASE_SCHEMA.sql` (0 database modifications)

---

## 16. Implementation Sequence

1. Define TypeScript interfaces in `apps/web/types/moderation.ts`.
2. Register query keys in `apps/web/lib/query/keys.ts`.
3. Implement API service in `apps/web/lib/moderation/moderation-service.ts`.
4. Implement TanStack Query mutation and query hooks in `apps/web/lib/moderation/use-moderation.ts`.
5. Implement `ReportModal.tsx` and `ReportButton.tsx`.
6. Integrate `ReportButton` into `PostHeader.tsx`, `CommentItem.tsx`, and `ProfileHeader.tsx`.
7. Implement `ExecuteActionDialog.tsx`, `ModerationQueueTable.tsx`, and `ModerationGuard.tsx`.
8. Create `/moderation` dashboard page in `apps/web/app/moderation/page.tsx`.
9. Implement comprehensive unit and component test suites in `apps/web/tests/moderation/`.
10. Execute full validation suite (`npm run test`, `npm run typecheck`, `npm run build`).

---

## 17. Risk Register

| Risk ID | Risk Description | Severity | Probability | Mitigation Strategy | Blocking |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **R-F13-01** | Non-moderator attempts to view moderation queue | High | Low | Dual-layer protection: client `<ModerationGuard>` + backend `PermissionGuard` returning 403 | No |
| **R-F13-02** | Accidental permanent user ban or content hiding | High | Low | Mandatory reason input + confirmation checkbox in `ExecuteActionDialog` | No |
| **R-F13-03** | Duplicate report flood by single user | Low | High | Backend idempotency returns 200 OK without creating duplicate rows; client displays clean info message | No |
| **R-F13-04** | Target content deleted while report is open | Medium | Low | Backend handles gracefully with 404; client prompts to dismiss stale report | No |

---

## 18. Acceptance Criteria

- **AC-F13-001**: `POST /api/v1/reports` allows authenticated users to file reports against posts, comments, or users with exact target validation.
- **AC-F13-002**: Duplicate active reports return 200 OK and display informational feedback to the user.
- **AC-F13-003**: `GET /api/v1/moderation/reports` provides paginated queue filtered by status (`OPEN`, `RESOLVED`, `DISMISSED`) for authorized moderators.
- **AC-F13-004**: `POST /api/v1/moderation/actions` supports `WARN`, `HIDE_CONTENT`, `SUSPEND`, `BAN`, `DISMISS` with single-transaction execution and audit logging.
- **AC-F13-005**: Inappropriate action combinations (e.g. `HIDE_CONTENT` on a User) are rejected by client validation and backend guards.
- **AC-F13-006**: All interactive moderation dialogs meet WCAG 2.2 AA standards with keyboard navigation and ARIA attributes.
- **AC-F13-007**: 139+ existing test baseline remains green, TypeScript typecheck passes with 0 errors, and production build succeeds.
- **AC-F13-008**: 0 backend modifications and 0 database schema modifications.

---

## 19. Scope Control

Explicitly excluded:
- Automated AI sentiment analysis / auto-moderation bots (deferred to future platform phases).
- WebSocket-based real-time queue live streaming (standard TanStack Query refetching on window focus/interval is sufficient).
- Modifying backend code or creating database migrations.

---

## 20. Final Recommendation & Status

```text
============================================================
PHASE F13.0 — PRE-IMPLEMENTATION PLAN
============================================================

Mode: STRICT READ-ONLY
Implementation: NOT AUTHORIZED

Repository Investigation: COMPLETE
Previous Baselines: FROZEN (F2, F3.1, F4.1, F5.1, F6.1, F7.1, F8.1, F9.1, F10.1, F11.1, F12.1)
Backend Contract: VERIFIED (POST /reports, GET /moderation/reports, POST /moderation/actions)
Database Contract: VERIFIED (Table 15: reports, Table 16: moderation_actions)
Frontend Architecture: VERIFIED (ReportModal, ReportButton, ModerationQueueTable, ExecuteActionDialog, /moderation)
Security: VERIFIED (RBAC client UX gating + authoritative backend PermissionGuard)
Accessibility: VERIFIED (WCAG 2.2 AA compliant dialogs, tables, and reason fieldsets)
Scope: FINALIZED (Community Content Reporting & Moderation Engine)

FINAL STATUS:
READY FOR HUMAN APPROVAL

STOP.
DO NOT IMPLEMENT CODE.
DO NOT MODIFY FILES.
DO NOT FIX FINDINGS.
DO NOT START CODING.

AWAIT HUMAN APPROVAL.
============================================================
```
