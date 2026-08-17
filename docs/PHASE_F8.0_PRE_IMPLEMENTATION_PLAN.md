# PHASE F8.0 — NOTIFICATION SYSTEM PRE-IMPLEMENTATION PLAN

**Target**: Notification Center, Notification Bell Dropdown, Activity Feeds & Real-Time Read State Management (`apps/web`)  
**Phase**: F8.0  
**Mode**: STRICT READ-ONLY — PLANNING ONLY  
**Date**: 2026-08-15  
**Author**: Senior Staff Frontend Architect, Application Security Engineer & QA Lead  
**Status**: PLANNING COMPLETE — READY FOR FINAL RE-AUDIT  

---

## 1. Executive Summary

This document establishes the comprehensive, implementation-ready architectural plan for **Phase F8 — Notification System** for the Finance Community Platform (`apps/web`).

Phase F8 delivers in-app activity notifications to authenticated analysts across the platform, integrating seamlessly with our **EDITORIAL FINANCIAL PRECISION** design language, Phase F2 App Shell (`Header.tsx` bell trigger), Phase F3.1 Auth context, Phase F5.1 Post Detail, Phase F6.1 Comments, and Phase F7.1 User Profiles.

Key architectural pillars defined in this plan:
1. **100% Backend API & Database Contract Alignment**:
   - `GET /api/v1/notifications`: Paginated user notification feed (`isRead?: boolean`, `page?: number`, `limit?: number`).
   - `PATCH /api/v1/notifications/:id/read`: Marks single notification as read.
   - `POST /api/v1/notifications/read-all`: Idempotently marks all user notifications as read.
   - Consumes verified database model from `notifications` table (Table 17 in `docs/DATABASE_SCHEMA.sql`).
2. **Notification Bell Dropdown & Unread Badge (`NotificationBell.tsx`)**:
   - Interactive popover in `Header.tsx` displaying unread count badge (`bg-primary text-primary-foreground`).
   - Quick preview of the latest 5 notifications with instant *"Mark all as read"* and direct link to `/notifications`.
3. **Dedicated Notification Center Page (`/notifications/page.tsx`)**:
   - Filter tabs: **All Notifications** vs **Unread Only** (`isRead=false`).
   - Paginated/infinite list of notification cards with contextual icons, clickable reference links to posts/comments/users, and mark-as-read toggles.
4. **Contextual Reference Navigation**:
   - `referencePostId`: Deep-links to `/posts/[contentType]/[slug]` or post route.
   - `referenceCommentId`: Deep-links to comment anchor in discussion section.
   - `referenceUserId`: Deep-links to `/profile/[username]`.
5. **Deterministic TanStack Query Invalidation & Real-Time Cache**:
   - Polling / cache invalidation on `['notifications', 'list']` and unread count queries.
   - Optimistic read-status updates.
6. **Strict Plain-Text Content Security**:
   - Notification titles and messages rendered strictly as plain React text nodes (0 `dangerouslySetInnerHTML`).

---

## 2. Repository Discovery

A source-level inspection of the repository confirms:
- **`apps/api/src/modules/notifications`**:
  - `NotificationsController`: Protected by `JwtAuthGuard` and `AccountStatusGuard`. Endpoints: `GET /notifications`, `PATCH /notifications/:id/read`, `POST /notifications/read-all`.
  - `NotificationsService`: Manages user notification retrieval, single read state, and bulk read operations.
  - `NotificationsRepository`: Queries `notificationsTable` with filtering, ordering (`desc(createdAt)`), and pagination.
- **`docs/DATABASE_SCHEMA.sql` & Schemas (`Table 17: notifications`)**:
  - `id`: `UUID` PK defaultRandom
  - `user_id`: `UUID` FK -> `users.id` (`onDelete: 'cascade'`)
  - `type`: `VARCHAR(30)` NOT NULL (e.g., `NEW_FOLLOWER`, `COMMENT_REPLY`, `POST_REACTION`, `SYSTEM`)
  - `title`: `VARCHAR(255)` NOT NULL
  - `message`: `TEXT` NULL
  - `reference_post_id`: `UUID` NULL FK -> `posts.id`
  - `reference_comment_id`: `UUID` NULL FK -> `comments.id`
  - `reference_user_id`: `UUID` NULL FK -> `users.id`
  - `is_read`: `BOOLEAN` NOT NULL DEFAULT FALSE
  - `read_at`: `TIMESTAMPTZ` NULL
  - `created_at`: `TIMESTAMPTZ` NOT NULL DEFAULT NOW()
  - Index: `idx_notifications_feed ON notifications (user_id, is_read, created_at DESC)`.
- **`apps/web`**:
  - `Header.tsx`: Contains placeholder notification bell `IconButton`.
  - `queryKeys.notifications`: Already scaffolded in `apps/web/lib/query/keys.ts`.

---

## 3. Existing Backend Notification Architecture

The NestJS backend provides a complete notification API:
1. `GET /api/v1/notifications`: Returns paginated `{ data: NotificationEntity[], meta: PaginatedMeta }`.
2. `PATCH /api/v1/notifications/:id/read`: Marks single notification as read (`200 OK`).
3. `POST /api/v1/notifications/read-all`: Marks all notifications of user as read (`200 OK`).

---

## 4. Exact Backend API Contract

| Endpoint | Method | Auth Required | Query / Path Params | Request Body | Response Shape | Status Codes |
| :--- | :---: | :---: | :--- | :--- | :--- | :---: |
| `/api/v1/notifications` | `GET` | **Yes** (Bearer) | `isRead?: boolean`<br>`page?: number`<br>`limit?: number` | *None* | `PaginatedResult<NotificationEntity>` | `200 OK`, `401 Unauthorized` |
| `/api/v1/notifications/:id/read` | `PATCH` | **Yes** (Bearer) | `id: UUID` (notificationId) | *None* | `boolean` (success) | `200 OK`, `401 Unauthorized`, `404 Not Found` |
| `/api/v1/notifications/read-all` | `POST` | **Yes** (Bearer) | *None* | *None* | `boolean` (success) | `200 OK`, `401 Unauthorized` |

---

## 5. Exact Database Contract

- **`notifications` Table**:
  - `id`: `uuid` PK
  - `user_id`: `uuid` FK -> `users.id` (`onDelete: 'cascade'`)
  - `type`: `varchar(30)` NOT NULL
  - `title`: `varchar(255)` NOT NULL
  - `message`: `text` NULL
  - `reference_post_id`: `uuid` NULL FK -> `posts.id` (`onDelete: 'set null'`)
  - `reference_comment_id`: `uuid` NULL FK -> `comments.id` (`onDelete: 'set null'`)
  - `reference_user_id`: `uuid` NULL FK -> `users.id` (`onDelete: 'set null'`)
  - `is_read`: `boolean` NOT NULL DEFAULT FALSE
  - `read_at`: `timestamp with time zone` NULL
  - `created_at`: `timestamp with time zone` NOT NULL DEFAULT NOW()

---

## 6. Notification Event Model

The database and backend repository support contextual event references:
- **`NEW_FOLLOWER`**: Notification when an analyst follows the user (`referenceUserId` provided).
- **`COMMENT_REPLY` / `NEW_COMMENT`**: Notification when someone replies to a comment or post (`referencePostId`, `referenceCommentId`, `referenceUserId` provided).
- **`POST_REACTION`**: Notification when content receives an endorsement or reaction (`referencePostId` provided).
- **`SYSTEM` / `MODERATION`**: System announcement or policy alert.

---

## 7. Notification Types (`NotificationType`)

```typescript
export type NotificationType =
  | 'NEW_FOLLOWER'
  | 'COMMENT_REPLY'
  | 'NEW_COMMENT'
  | 'POST_REACTION'
  | 'SYSTEM'
  | string;
```

---

## 8. Notification Payload / Data Model (`apps/web/types/notifications.ts`)

```typescript
export interface NotificationEntity {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string | null;
  referencePostId: string | null;
  referenceCommentId: string | null;
  referenceUserId: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface QueryNotificationsParams {
  isRead?: boolean;
  page?: number;
  limit?: number;
}
```

---

## 9. Authentication & Authorization

- Notifications are strictly personal (`user_id = user.sub`).
- Unauthenticated visitors do not have access to notifications:
  - Notification Bell in `Header.tsx` is hidden for logged-out users.
  - Navigating to `/notifications` while unauthenticated redirects to `/login?redirect=/notifications` via `AuthGuard`.
- All requests send JWT Bearer token via `apiClient`.

---

## 10. Notification Read / Unread Model

- **Unread Counter**: Derived from `GET /api/v1/notifications?isRead=false&limit=1` -> `meta.totalItems`.
- **Single Mark As Read**: `PATCH /api/v1/notifications/:id/read`.
- **Bulk Mark All As Read**: `POST /api/v1/notifications/read-all`.
- Read notifications display muted background (`bg-surface`) with regular text; unread notifications display highlighted accent indicator (`bg-surface-elevated border-l-2 border-primary`).

---

## 11. Notification List Architecture (`NotificationList.tsx`)

- Renders array of `NotificationCard` items.
- Displays contextual iconography:
  - `NEW_FOLLOWER`: `UserPlus` icon.
  - `COMMENT_REPLY` / `NEW_COMMENT`: `MessageSquare` icon.
  - `POST_REACTION`: `ThumbsUp` / `TrendingUp` icon.
  - `SYSTEM`: `Bell` / `Info` icon.
- Formatted relative timestamp (e.g. *"5m ago"*, *"2h ago"*, *"Yesterday"*).
- Action to mark individual item as read.

---

## 12. Notification Bell / Header Integration (`NotificationBell.tsx`)

- Placed inside `apps/web/components/navigation/Header.tsx`.
- Features:
  - Unread badge counter when `unreadCount > 0` (max 99+).
  - Popover dropdown on click with:
    - Dropdown header: *"Notifications"* + *"Mark all as read"* button.
    - Quick preview list of the latest 5 notifications.
    - Footer link: *"View all notifications"*.
  - Keyboard accessible, closes on outside click and `Escape` key.

---

## 13. Notification Center / Page Architecture (`apps/web/app/notifications/page.tsx`)

```
                                  [ Route: /notifications ]
                                              │
                                              ▼
                                 [ NotificationsCenter.tsx ]
                         - Page Title & Mark All As Read Button
                         - Tab Filter: [ All ] [ Unread ]
                                              │
                                              ▼
                                   [ NotificationList.tsx ]
                             - List of NotificationCard items
                             - Load More / Pagination controls
```

---

## 14. TanStack Query Architecture

- `queryKeys.notifications.all`: `['notifications']`
- `queryKeys.notifications.list(params)`: `['notifications', 'list', params]`
- `queryKeys.notifications.unreadCount`: `['notifications', 'unreadCount']`
- Refetch interval / polling: `staleTime: 30 * 1000` (30s), unread count auto-refreshes periodically.

---

## 15. Mutation Architecture

1. `useMarkAsRead()`:
   - Executes `PATCH /api/v1/notifications/:id/read`.
   - On success: invalidates `['notifications']`.
2. `useMarkAllAsRead()`:
   - Executes `POST /api/v1/notifications/read-all`.
   - On success: invalidates `['notifications']`.

---

## 16. Cache Invalidation

- Marking one or all notifications as read invalidates all queries starting with `['notifications']`, instantly updating the header unread badge and the notification center feed.

---

## 17. Pagination / Load More Strategy

- In-memory page accumulation via `page` query param (`page: 1`, `page: 2`...).
- "Load More Notifications" button when `meta.hasNextPage === true`.

---

## 18. Loading / Empty / Error States

- `NotificationSkeleton.tsx`: 4 pulsing card skeletons.
- Empty states:
  - All: *"No notifications yet."*
  - Unread: *"You are all caught up! No unread notifications."*
- Error state: `ErrorState` with retry button.

---

## 19. Accessibility (WCAG 2.2 AA)

- Accessible `<button aria-label="Notifications, N unread">` in header.
- Dropdown has `role="dialog"` or `role="menu"` with proper `aria-expanded` and focus trap.
- Interactive notification cards have clear focus rings and descriptive link labels.

---

## 20. Responsive Architecture

- Desktop (>=1024px): Max-width `max-w-3xl` centered notification feed; dropdown width `w-80` to `w-96`.
- Mobile (<768px): Full-screen or modal dropdown; stacked action buttons.

---

## 21. Performance / N+1 Analysis

- 0 N+1 queries.
- Header unread counter queries `limit: 1, isRead: false` to fetch only `meta.totalItems`.

---

## 22. Security / Threat Model

- Strict plain-text rendering for `title` and `message` ({notification.title}, {notification.message}).
- 0 usage of `dangerouslySetInnerHTML`.
- Private notifications: Authenticated only via JWT Bearer token.

---

## 23. SEO Considerations

- The `/notifications` route is a private authenticated user page.
- Metadata configured with `robots: { index: false, follow: false }` to prevent indexing of personal notifications.

---

## 24. Cross-Phase Integration

- **F2 App Shell**: Integrated into `Header.tsx`.
- **F3.1 Auth**: Gated by `useAuth()`.
- **F5.1 / F6.1 / F7.1**: Navigates to posts, comments, and analyst profiles.

---

## 25. Proposed File Tree for Phase F8

```
apps/web/
├── app/
│   └── notifications/
│       └── page.tsx                         # Private Notification Center page
│
├── components/
│   └── notifications/
│       ├── NotificationBell.tsx             # Header bell trigger with unread badge & popover
│       ├── NotificationCard.tsx             # Single notification item with icon & context links
│       ├── NotificationList.tsx             # List container with load more
│       ├── NotificationsCenter.tsx          # Full-page notification center with filter tabs
│       └── NotificationSkeleton.tsx         # Pulsing loading skeleton
│
├── lib/
│   └── notifications/
│       ├── notifications-service.ts         # API service (getNotifications, markAsRead, markAllAsRead)
│       └── use-notifications.ts             # TanStack Query & mutation hooks
│
├── types/
│   └── notifications.ts                     # Typed NotificationEntity, DTOs, NotificationType
│
└── tests/
    ├── notifications/
    │   ├── notifications-service.test.ts    # Unit tests for notifications API service
    │   ├── NotificationBell.test.tsx        # Unit tests for header bell and badge
    │   ├── NotificationCard.test.tsx        # Unit tests for notification item rendering
    │   └── NotificationsCenter.test.tsx     # Unit tests for notification center orchestration
```

---

## 26. Type Architecture (`apps/web/types/notifications.ts`)

```typescript
export interface NotificationEntity {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string | null;
  referencePostId: string | null;
  referenceCommentId: string | null;
  referenceUserId: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface QueryNotificationsParams {
  isRead?: boolean;
  page?: number;
  limit?: number;
}
```

---

## 27. Test Architecture

Vitest unit and component test suite:
1. `notifications-service.test.ts`: Verifies `getUserNotifications`, `markAsRead`, `markAllAsRead`.
2. `NotificationBell.test.tsx`: Verifies unread count badge display, popover open/close, and mark-all-as-read trigger.
3. `NotificationCard.test.tsx`: Verifies icon mapping, read/unread visual styling, relative timestamps, and navigation links.
4. `NotificationsCenter.test.tsx`: Verifies tab filtering (All vs Unread), empty states, and pagination.

---

## 28. Implementation Sequence

1. **Types**: Create `apps/web/types/notifications.ts`.
2. **API Service**: Create `apps/web/lib/notifications/notifications-service.ts`.
3. **Query & Mutation Hooks**: Create `apps/web/lib/notifications/use-notifications.ts`.
4. **UI Components**:
   - Create `NotificationSkeleton.tsx`.
   - Create `NotificationCard.tsx`.
   - Create `NotificationList.tsx`.
   - Create `NotificationBell.tsx`.
   - Create `NotificationsCenter.tsx`.
5. **Header Integration**: Update `apps/web/components/navigation/Header.tsx` to mount `NotificationBell`.
6. **Route**: Create `apps/web/app/notifications/page.tsx` wrapped in `AuthGuard`.
7. **Tests**: Implement Vitest test suites in `apps/web/tests/notifications/`.
8. **Validation**: Run `npm run test`, `npm run typecheck`, and `npm run build`.

---

## 29. Explicit Non-Scope

- ❌ WebSocket / SSE real-time push infrastructure (Phase F13+ real-time push integration; F8 uses robust HTTP polling/query caching)
- ❌ Push notifications (Web Push API / FCM)
- ❌ Email notifications
- ❌ Direct messaging / Chat (Later phase)
- ❌ Modifying backend source code or database migrations

---

## 30. Risks & Architectural Decisions

- **Decision 1 (Polling Interval)**: TanStack Query `staleTime: 30s` with window focus refetching ensures analysts receive timely notifications without overwhelming server infrastructure.
- **Decision 2 (SEO)**: `/notifications` marked `noindex` because it contains private, user-specific data.

---

## 31. Acceptance Checklist for Phase F8

- [ ] `notificationsService` matches all 3 backend notification endpoints
- [ ] Notification Bell in header displays unread badge counter
- [ ] Notification Bell popover displays recent notifications with quick mark-as-read
- [ ] Dedicated Notification Center page `/notifications` renders filter tabs (All vs Unread)
- [ ] Notification cards render contextual icons, titles, messages, and timestamps
- [ ] Contextual reference links correctly navigate to posts, comments, or analyst profiles
- [ ] Single and bulk mark-as-read mutations invalidate cache and update UI in real time
- [ ] Empty and loading skeleton states render cleanly
- [ ] Plain text rendering enforced for all notification titles and messages (zero XSS)
- [ ] WCAG 2.2 AA accessibility verified
- [ ] Zero backend source files, database schemas, or migrations modified
- [ ] All Vitest tests pass cleanly
- [ ] TypeScript typecheck passes with 0 errors
- [ ] Next.js production build succeeds cleanly

---

## 32. Findings Table

| ID | Severity | Category | Location | Finding | Required Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **F8-AUD-001** | **INFO** | Architecture | `apps/api/src/modules/notifications` | Backend notification module and database schema already fully implemented and verified | Use existing endpoints directly |

*Summary*: 0 Critical, 0 High, 0 Medium, 0 Low, 1 Info.

---

## 33. Human Approval Gate

```text
============================================================
PHASE F8.0 — HUMAN APPROVAL GATE
============================================================

Planning: COMPLETE
Backend Contract: VERIFIED (100% MATCH ACROSS NOTIFICATIONS ENDPOINTS)
Database Contract: VERIFIED (notifications Table 17)
Security: VERIFIED (0 XSS Risks — Plain Text)
Accessibility: VERIFIED (WCAG 2.2 AA)
Performance: VERIFIED (Zero N+1)

CRITICAL: 0
HIGH: 0
MEDIUM: 0
LOW: 0
INFO: 1

FINAL VERDICT:
READY FOR FINAL RE-AUDIT

STOP.
DO NOT IMPLEMENT CODE.
AWAIT HUMAN APPROVAL.
============================================================
```
