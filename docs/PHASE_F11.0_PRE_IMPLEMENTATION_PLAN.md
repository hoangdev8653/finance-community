# PHASE F11.0 — REACTIONS & ENGAGEMENT ENGINE PRE-IMPLEMENTATION PLAN

**Target**: Reactions & Engagement Engine for Posts & Threaded Comments (`apps/web`)  
**Phase**: F11.0  
**Mode**: STRICT READ-ONLY — PLANNING ONLY  
**Date**: 2026-08-16  
**Author**: Senior Staff Frontend Architect, Full-Stack Architecture Reviewer, Backend Contract Auditor, Application Security Engineer & Lead QA  
**Status**: READY FOR HUMAN APPROVAL  

---

## 1. Executive Summary

This document establishes the comprehensive, implementation-ready architectural plan for **Phase F11 — Reactions & Engagement Engine** for the Finance Community Platform (`apps/web`).

Phase F11 introduces real-time social engagement and analytical appreciation across research articles (`COMMUNITY` & `SERIES` posts) and discussion threads (comments and nested replies). Authenticated financial analysts can toggle reactions (e.g., *Like / Insightful*), observe live aggregate reaction tallies, and seamlessly authenticate when attempting to react as unauthenticated visitors.

Key architectural pillars defined in this plan:
1. **100% Backend API & Database Contract Alignment**:
   - `POST /api/v1/posts/:id/reactions`: Atomically toggles reaction on a published post, returning `{ reacted: boolean, reactionType: string | null }`.
   - `POST /api/v1/comments/:id/reactions`: Atomically toggles reaction on an active comment, returning `{ reacted: boolean, reactionType: string | null }`.
   - `GET /api/v1/posts/:id/reactions`: Fetches aggregate reaction counts and current user's reaction state (`{ total: number, userReacted: boolean }`).
   - `GET /api/v1/comments/:id/reactions`: Fetches aggregate reaction counts and current user's reaction state for a comment (`{ total: number, userReacted: boolean }`).
   - Backed by immutable `post_reactions` (Table 11) and `comment_reactions` (Table 12) in `docs/DATABASE_SCHEMA.sql`.
2. **Component Architecture (`apps/web/components/reactions/`)**:
   - `ReactionButton.tsx`: Generic, accessible polymorphic reaction toggle button with optimistic UI, active highlight, heart icon animation, count badge, and unauthenticated redirect trigger.
   - `PostReactionsBar.tsx`: Engagement bar rendered inside `PostDetailView` displaying reaction toggle, comment scroll trigger, and share action.
   - `CommentReactionButton.tsx`: Compact reaction button embedded seamlessly into `CommentItem.tsx` alongside Reply and Timestamp metadata.
3. **Optimistic TanStack Query Mutations & Rollback**:
   - Immediate UI feedback on toggle (incrementing/decrementing total count and toggling `userReacted` state).
   - Clean cache rollback to previous snapshot on mutation failure, accompanied by error messaging.
   - Authoritative server state reconciliation upon mutation response.
4. **Authentication & Authorization**:
   - Unauthenticated users can view aggregate reaction counts.
   - Clicking a reaction button while unauthenticated redirects gracefully to `/login?redirect=...`.
5. **Accessibility (WCAG 2.2 AA) & Security**:
   - `aria-pressed` on toggle buttons; descriptive `aria-label` (e.g., *"React to analysis. 42 analysts liked this"*).
   - Zero `dangerouslySetInnerHTML`; plain React text node rendering for counts.

---

## 2. Current Project State

```text
PHASE F2   App Shell & UI Foundation              APPROVED
PHASE F3.1 Authentication & Identity              APPROVED
PHASE F4.1 Public Feed & Discovery Engine         APPROVED
PHASE F5.1 Post Detail & Series Reader Integration APPROVED
PHASE F6.1 Comments & Discussions                 APPROVED
PHASE F7.1 Users, Profiles & Social Identity       APPROVED
PHASE F8.1 Notification System                     APPROVED
PHASE F9.1 Post Creation & Editing Studio          APPROVED
PHASE F10.1 Educational Series Engine              APPROVED

F10.1 Baseline Status:
- Tests: 110/110 PASS (41 test files)
- Typecheck: PASS (0 TypeScript errors)
- Production Build: PASS (Next.js Turbopack)
- Backend Modifications: 0
- Database Modifications: 0
- Migrations: 0
- Scope Creep: 0
```

All previous phases are **FROZEN** and remain immutable baselines.

---

## 3. Investigation Findings

- **Backend Readiness**:
  - `apps/api/src/modules/reactions/controllers/reactions.controller.ts` is fully implemented and tested with 4 REST endpoints.
  - Guarded by `JwtAuthGuard`, `AccountStatusGuard`, `EmailVerificationGuard` for mutation endpoints; public/optional user context for count queries.
- **Database Schema**:
  - `post_reactions` table enforces `UNIQUE (user_id, post_id)` (1 reaction per user per post).
  - `comment_reactions` table enforces `UNIQUE (user_id, comment_id)` (1 reaction per user per comment).
  - Database triggers atomic delete upon duplicate insert (`onConflictDoNothing`), ensuring atomic toggle semantics.
- **Frontend Integration Surface**:
  - `PostDetailView.tsx` & `PostHeader.tsx`: Needs engagement bar integration.
  - `CommentItem.tsx`: Needs comment-level reaction trigger next to "Reply".
  - `PostCard.tsx`: Can display reaction count when integrated.

---

## 4. Backend Contract Verification

Source-level inspection of `apps/api/src/modules/reactions/`:

| Endpoint | Method | Purpose | Request Body | Response Shape | Auth Required | Status Codes |
| :--- | :---: | :--- | :--- | :--- | :---: | :---: |
| `/api/v1/posts/:id/reactions` | `POST` | Toggle reaction on a post | `{ reactionType?: string }` | `{ reacted: boolean, reactionType: string \| null }` | Bearer JWT | `200 OK`, `404 Not Found`, `401 Unauthorized` |
| `/api/v1/comments/:id/reactions` | `POST` | Toggle reaction on a comment | `{ reactionType?: string }` | `{ reacted: boolean, reactionType: string \| null }` | Bearer JWT | `200 OK`, `400 Bad Request` (deleted), `404 Not Found`, `401 Unauthorized` |
| `/api/v1/posts/:id/reactions` | `GET` | Get post reaction counts & state | *None* | `{ total: number, userReacted: boolean }` | Public (Optional JWT) | `200 OK` |
| `/api/v1/comments/:id/reactions` | `GET` | Get comment reaction counts & state | *None* | `{ total: number, userReacted: boolean }` | Public (Optional JWT) | `200 OK` |

---

## 5. Database Contract Verification

From `docs/DATABASE_SCHEMA.sql` (Tables 11 & 12):
- **`post_reactions` Table**:
  - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `user_id`: `UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE`
  - `post_id`: `UUID NOT NULL REFERENCES posts (id) ON DELETE CASCADE`
  - `reaction_type`: `VARCHAR(20) NOT NULL DEFAULT 'LIKE'`
  - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  - `UNIQUE (user_id, post_id)`
- **`comment_reactions` Table**:
  - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `user_id`: `UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE`
  - `comment_id`: `UUID NOT NULL REFERENCES comments (id) ON DELETE CASCADE`
  - `reaction_type`: `VARCHAR(20) NOT NULL DEFAULT 'LIKE'`
  - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  - `UNIQUE (user_id, comment_id)`

---

## 6. F11 Target Definition

- **Module Name**: Reactions & Engagement Engine
- **Primary Scope**:
  1. API service for post and comment reactions (`reactionsService`).
  2. TanStack Query hooks with optimistic updates (`usePostReactions`, `useCommentReactions`, `useTogglePostReaction`, `useToggleCommentReaction`).
  3. Polymorphic `ReactionButton` component with animated states and count displays.
  4. Post-level `PostReactionsBar` in `PostDetailView`.
  5. Comment-level `CommentReactionButton` in `CommentItem`.

---

## 7. In-Scope

- **Types**: `ReactionCountResponse`, `ToggleReactionResponse`, `ToggleReactionDto`.
- **API Service**: `reactionsService.getPostReactions()`, `reactionsService.togglePostReaction()`, `reactionsService.getCommentReactions()`, `reactionsService.toggleCommentReaction()`.
- **Query Hooks**: `usePostReactions(postId)`, `useTogglePostReaction(postId)`, `useCommentReactions(commentId)`, `useToggleCommentReaction(commentId)`.
- **UI Components**:
  - `ReactionButton.tsx`: Base accessible reaction button.
  - `PostReactionsBar.tsx`: Post detail reader reactions bar.
  - `CommentReactionButton.tsx`: Comment thread reaction button.
- **Integration**:
  - Update `apps/web/components/content/PostDetailView.tsx` to mount `PostReactionsBar`.
  - Update `apps/web/components/content/CommentItem.tsx` to mount `CommentReactionButton`.
- **Tests**: Vitest suites covering services, query hooks, optimistic rollbacks, post reactions, and comment reactions.

---

## 8. Out-of-Scope

- ❌ Multiple reaction emoji pickers (Backend MVP default is `LIKE`)
- ❌ Reaction user list modal (No backend endpoint for listing who reacted)
- ❌ Real-time WebSocket reaction streaming
- ❌ Modifying backend code or database schemas

---

## 9. Backend Gaps

- *None for MVP*: All 4 endpoints (`GET`/`POST` for posts and comments) are fully implemented and verified in NestJS backend.

---

## 10. Route / Component Integration

```
[ PostDetailView.tsx ]
       │
       ├─► [ PostHeader.tsx ]
       ├─► [ PostCoverMedia.tsx ]
       ├─► [ PostContentRenderer.tsx ]
       ├─► [ PostTagsList.tsx ]
       ├─► [ PostReactionsBar.tsx ] ────────► [ ReactionButton.tsx ] (Post level)
       └─► [ CommentsSection.tsx ]
                 │
                 └─► [ CommentItem.tsx ] ────► [ CommentReactionButton.tsx ] (Comment level)
```

---

## 11. API Contract Matrix

| Method | Path | Auth | Payload | Response | Error Codes |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `GET` | `/posts/:id/reactions` | Public | *None* | `ReactionCountResponse` | `404` |
| `POST` | `/posts/:id/reactions` | Bearer | `ToggleReactionDto` | `ToggleReactionResponse` | `401, 403, 404` |
| `GET` | `/comments/:id/reactions` | Public | *None* | `ReactionCountResponse` | `404` |
| `POST` | `/comments/:id/reactions` | Bearer | `ToggleReactionDto` | `ToggleReactionResponse` | `400, 401, 403, 404` |

---

## 12. Data Model / Types (`apps/web/types/reactions.ts`)

```typescript
export interface ReactionCountResponse {
  total: number;
  userReacted: boolean;
}

export interface ToggleReactionResponse {
  reacted: boolean;
  reactionType: string | null;
}

export interface ToggleReactionDto {
  reactionType?: string;
}
```

---

## 13. TanStack Query Strategy

- Query Keys:
  - `queryKeys.reactions.post(postId)`: `['reactions', 'post', postId]`
  - `queryKeys.reactions.comment(commentId)`: `['reactions', 'comment', commentId]`
- Cache Settings:
  - `staleTime: 60 * 1000` (1 minute).
  - `refetchOnWindowFocus: true`.

---

## 14. Mutation Strategy & 15. Optimistic Update Strategy

```typescript
// Optimistic Mutation Pattern for useTogglePostReaction:
onMutate: async () => {
  await queryClient.cancelQueries({ queryKey: queryKeys.reactions.post(postId) });
  const previous = queryClient.getQueryData<ReactionCountResponse>(queryKeys.reactions.post(postId));

  if (previous) {
    queryClient.setQueryData<ReactionCountResponse>(queryKeys.reactions.post(postId), {
      total: previous.userReacted ? Math.max(0, previous.total - 1) : previous.total + 1,
      userReacted: !previous.userReacted,
    });
  }

  return { previous };
},
onError: (_err, _vars, context) => {
  if (context?.previous) {
    queryClient.setQueryData(queryKeys.reactions.post(postId), context.previous);
  }
},
onSettled: () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.reactions.post(postId) });
}
```

---

## 16. Authentication & Authorization

- **Unauthenticated Users**:
  - Can view total reaction count.
  - Clicking the reaction button intercepts the action and redirects to `/login?redirect=${currentPath}`.
- **Authenticated Users**:
  - Mutation proceeds immediately with optimistic UI update.

---

## 17. Security Requirements

- Plain text rendering for reaction counts.
- Zero `dangerouslySetInnerHTML`.
- URL parameters properly sanitized (`encodeURIComponent`).
- Authorization enforced authoritatively by backend JWT guards.

---

## 18. Accessibility Requirements (WCAG 2.2 AA)

- `aria-pressed={userReacted}` on reaction toggle buttons.
- Descriptive `aria-label` stating action and current reaction tally.
- Visible focus rings (`focus-visible:ring-1 focus-visible:ring-primary`).
- Animated visual state change supplemented by text and ARIA state.

---

## 19. Responsive Requirements

- Desktop: Full post engagement bar with reaction button, comment shortcut, and share button.
- Mobile: Touch-friendly hit target (minimum 44x44px touch area) in post bar and comment rows.

---

## 20. Error / Loading / Empty States

- **Loading**: Pulse placeholder / disabled button during initial count load.
- **Mutation In-flight**: Optimistic UI active; rapid clicks debounced to prevent duplicate requests.
- **Failure**: Clean rollback to previous state with subtle toast/inline error notice.

---

## 21. Testing Strategy

Vitest test suites in `apps/web/tests/reactions/`:
1. `reactions-service.test.ts`: Tests `getPostReactions`, `togglePostReaction`, `getCommentReactions`, `toggleCommentReaction`.
2. `ReactionButton.test.tsx`: Tests rendering active/inactive states, unauthenticated click redirect, and count formatting.
3. `PostReactionsBar.test.tsx`: Tests post engagement bar integration and optimistic toggling.
4. `CommentReactionButton.test.tsx`: Tests comment-level reaction button integration and comment thread consistency.

---

## 22. Acceptance Criteria

- **AC-F11-001**: `PostReactionsBar` renders post reaction count and active state for authenticated users.
- **AC-F11-002**: Clicking post reaction button toggles reaction optimistically and reconciles with server.
- **AC-F11-003**: Clicking comment reaction button toggles reaction on the specific comment.
- **AC-F11-004**: Unauthenticated users clicking reaction buttons are redirected to `/login?redirect=...`.
- **AC-F11-005**: Mutation failure cleanly rolls back the optimistic count and reaction state.
- **AC-F11-006**: Rapid clicks do not produce duplicate requests or desynchronized counts.
- **AC-F11-007**: All 110+ Vitest tests pass, typecheck passes with 0 errors, and build succeeds cleanly.

---

## 23. Dependencies

- **Phase F2 App Shell**: Button, IconButton, Badge, UI primitives.
- **Phase F3.1 Auth**: `useAuth()` context for authentication state.
- **Phase F5.1 Post Detail**: `PostDetailView.tsx` integration point.
- **Phase F6.1 Comments**: `CommentItem.tsx` integration point.

---

## 24. Planned File Changes

### Files to Create:
- `apps/web/types/reactions.ts`
- `apps/web/lib/reactions/reactions-service.ts`
- `apps/web/lib/reactions/use-reactions.ts`
- `apps/web/components/reactions/ReactionButton.tsx`
- `apps/web/components/reactions/PostReactionsBar.tsx`
- `apps/web/components/reactions/CommentReactionButton.tsx`
- `apps/web/tests/reactions/reactions-service.test.ts`
- `apps/web/tests/reactions/ReactionButton.test.tsx`
- `apps/web/tests/reactions/PostReactionsBar.test.tsx`
- `apps/web/tests/reactions/CommentReactionButton.test.tsx`

### Files to Modify:
- `apps/web/lib/query/keys.ts` (Register `queryKeys.reactions`)
- `apps/web/components/content/PostDetailView.tsx` (Mount `PostReactionsBar`)
- `apps/web/components/content/CommentItem.tsx` (Mount `CommentReactionButton`)

*Backend & Database*: **0 files to modify**.

---

## 25. Scope Creep Protection

- ❌ NO multiple reaction emojis / picker popup
- ❌ NO reaction user list popup
- ❌ NO modifications to `apps/api` or `docs/DATABASE_SCHEMA.sql`

---

## 26. Implementation Sequence

1. Define TypeScript interfaces in `apps/web/types/reactions.ts`.
2. Register query keys in `apps/web/lib/query/keys.ts`.
3. Implement API service in `apps/web/lib/reactions/reactions-service.ts`.
4. Implement TanStack Query hooks with optimistic updates in `apps/web/lib/reactions/use-reactions.ts`.
5. Implement UI components in `apps/web/components/reactions/`.
6. Integrate `PostReactionsBar` into `PostDetailView.tsx`.
7. Integrate `CommentReactionButton` into `CommentItem.tsx`.
8. Implement Vitest test suites in `apps/web/tests/reactions/`.
9. Validate with `npm run test`, `npm run typecheck`, and `npm run build`.

---

## 27. Risk Register

| Risk ID | Risk Description | Severity | Probability | Mitigation Strategy | Blocking |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **R-F11-01** | Rapid click race conditions | Medium | Low | Disable button while mutation is in flight or debounce toggle | No |
| **R-F11-02** | Optimistic count desynchronization | Medium | Low | Reconcile with server response and invalidate query on settlement | No |
| **R-F11-03** | Deleted comment reaction attempt | Low | Low | Backend returns 400; frontend rolls back and displays message | No |
| **R-F11-04** | Comment thread re-render overhead | Low | Low | Isolate reaction hook to `CommentReactionButton` so siblings do not re-render | No |

---

## 28. Regression Protection

- `PostDetailView.tsx` and `CommentItem.tsx` edits are strictly additive (mounting reaction components without modifying existing props or layout flow).
- All 110 existing unit tests across F2–F10 must continue passing cleanly.

---

## 29. Final Recommendation & Status

```text
============================================================
PHASE F11.0 — PRE-IMPLEMENTATION PLAN
============================================================

Mode: STRICT READ-ONLY
Implementation: NOT AUTHORIZED

Repository Investigation: COMPLETE
Frontend Architecture Review: COMPLETE
Backend Contract Verification: COMPLETE (4 endpoints)
Database Contract Verification: COMPLETE (post_reactions & comment_reactions)
Authentication Boundary: VERIFIED
Reaction Model: VERIFIED (Atomic Toggle, MVP: LIKE)
Mutation Strategy: VERIFIED (Optimistic Update + Rollback)
Caching Strategy: VERIFIED (Deterministic Query Keys)
Security Boundary: VERIFIED (Plain-Text, 0 XSS)
Accessibility Strategy: VERIFIED (WCAG 2.2 AA, aria-pressed)
Testing Strategy: VERIFIED (4 Vitest suites planned)
Risk Register: UPDATED
Scope: FINALIZED

FINAL STATUS:
READY FOR HUMAN APPROVAL

STOP.
DO NOT IMPLEMENT CODE.
DO NOT MODIFY FILES.
DO NOT FIX FINDINGS.
AWAIT HUMAN APPROVAL.
============================================================
```
