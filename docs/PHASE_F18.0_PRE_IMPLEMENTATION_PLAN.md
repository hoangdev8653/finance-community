# PHASE F18.0 — PRE-IMPLEMENTATION PLAN
# ANALYST RESEARCH WORKSPACE & CREATOR PORTFOLIO DASHBOARD

**Phase**: F18.0  
**Type**: Pre-Implementation Architectural Plan  
**Target**: `apps/web`  
**Baseline**: Phase F17.1 Approved (232 tests, 80 test files, 0 TS errors, Build PASS)  
**Backend Mode**: STRICT IMMUTABLE (`apps/api` unchanged)  
**Database Mode**: STRICT IMMUTABLE (`DATABASE_SCHEMA.sql` unchanged)  

---

## 1. CURRENT BASELINE & AUDIT SUMMARY

### 1.1 Frozen Baselines (F2.1 – F17.1)
The following layers are approved, frozen, and verified:
- **F2.1**: App Shell, Tailwind token system, UI Foundation (`Button`, `Card`, `Badge`, `DropdownMenu`, etc.).
- **F3.1**: Authentication & Identity (`AuthContext`, JWT lifecycle, token store, `AuthGuard`).
- **F4.1**: Public Feed & Discovery Engine (`FeedList`, `CategoryFilterBar`, pagination, sorting).
- **F5.1**: Post Detail & Series Reader (Article rendering, Markdown parsing, cover media).
- **F6.1**: Comments & Discussions (Hierarchical comment tree, optimistic replies).
- **F7.1**: Users & Profiles (`PublicProfile`, `ProfileHeader`, follow/unfollow, social stats).
- **F8.1**: Post Studio & Content Mutations (`PostStudio`, draft creation, editing, publishing).
- **F9.1**: Media Asset Pipeline (Cloudinary upload client, cover image picker, avatar picker).
- **F10.1**: Series Management & Curriculum Reader (`SeriesView`, `SeriesChapterList`).
- **F11.1**: Engagement & Social Reactions (`PostReactionsBar`, `CommentReactionButton`).
- **F12.1**: Moderation & Safety (`ModerationQueueTable`, report modal, execute action dialog).
- **F13.1**: Notifications Center (`NotificationBell`, `NotificationsCenter`, filter tabs).
- **F14.1**: Platform Administration & System Governance (`UserManagementView`, audit logs, settings).
- **F15.1**: Global Search & Taxonomy Discovery (`CommandPalette`, `SearchBar`, `/tags/[slug]`).
- **F16.1**: Dynamic Feature Flag Runtime (`FeatureFlagProvider`, `useFeatureFlags`, `FeatureGate`).
- **F17.1**: SEO Metadata, Open Graph & Structured JSON-LD Engine (`site-config`, `<JsonLd />`, `robots.ts`, `sitemap.ts`).

### 1.2 Quantitative Baseline
- **Total Tests**: 232 / 232 PASS
- **Total Test Files**: 80 / 80 PASS
- **TypeScript Errors**: 0 (`npx tsc --noEmit`)
- **Production Build**: PASS (`npx next build`)
- **Backend Modifications**: 0
- **Database Migrations**: 0

---

## 2. CANDIDATE PHASE ANALYSIS & GAP EVALUATION

A comprehensive repository audit of `apps/web`, `apps/api`, and `DATABASE_SCHEMA.sql` evaluated all candidate next phases:

| Candidate | Backend Ready | DB Ready | Frontend Dependencies | Priority | Risk | Complexity | User Value | Recommended |
|---|---|---|---|---|---|---|---|---|
| **A. Analyst Research Workspace & Creator Dashboard (`/dashboard`)** | **YES** (100%) | **YES** (100%) | F2, F3, F4, F7, F8, F13, F17 | **CRITICAL** | **LOW** | **MEDIUM** | **VERY HIGH** | **YES (Recommended)** |
| **B. Public Author Directory (`/analysts`)** | **NO** (No public `GET /profiles` endpoint) | YES | F2, F7, F15, F17 | HIGH | HIGH | HIGH | MEDIUM | NO (Blocked by Backend) |
| **C. Personalized Following Stream (`/feed/following`)** | **NO** (No multi-author feed query) | YES | F3, F4, F7 | MEDIUM | HIGH | MEDIUM | MEDIUM | NO (Blocked by Backend) |
| **D. Bookmarks & Reading List (`/bookmarks`)** | **NO** (No bookmarks table/API) | **NO** | F3, F4 | MEDIUM | HIGH | HIGH | MEDIUM | NO (Blocked by DB/API) |
| **E. Taxonomy Catalog Directory (`/tags` & `/categories`)** | **YES** | **YES** | F2, F4, F10, F15 | LOW | LOW | LOW | LOW | NO (Lower impact) |

### Rationale for Selecting Candidate A:
1. **Critical Product Gap**: Currently, authors and analysts who create research in the Studio (`/posts/create`) have **no centralized workspace** to view their unpublished drafts, track article performance metrics (aggregate views, reactions), filter their research notes by status (Draft / Published / Archived), or manage content lifecycle actions (quick publish, unpublish, archive, delete).
2. **Zero Backend & Database Gaps**:
   - `GET /posts?authorId=:userId&status=...` is fully supported by `QueryPostsDto` and `PostsService.findFeedPaginated()`.
   - `POST /posts`, `PATCH /posts/:id`, `DELETE /posts/:id` are already implemented and RBAC-protected.
   - `GET /users/me` provides the authenticated user's profile and roles.
   - `GET /users/:id/followers` and `GET /users/:id/following` provide network metrics.
3. **Architectural Coherence**: Ties together Auth (F3), Posts (F4), Profile (F7), Studio (F8), and Notifications (F13) into a single cohesive control plane with private route SEO protection (`noindex, nofollow` from F17.1).

---

## 3. PHASE F18.0 ARCHITECTURAL SPECIFICATION

### 3.1 Problem Definition
- **Current Limitation**: When a registered analyst signs in, the user menu links to `/users/:username` (a public view that only displays published articles). Authors cannot inspect drafts, see why a post is unpublished, view aggregate portfolio metrics (total views across notes, draft volume), or manage their articles from a unified dashboard.
- **Affected Personas**: All authenticated financial analysts, content contributors, and researchers.
- **Solution**: Implement a dedicated, authenticated **Analyst Research Workspace & Creator Portfolio Dashboard** at `/dashboard` with tabbed content management (Drafts, Published, Archived), metrics overview cards, quick actions, and direct integration with the Studio.

---

### 3.2 System & Data Architecture Flow

```
User (Browser)
   │
   ▼
Route: /dashboard (app/dashboard/page.tsx)
   │
   ├── Protected by <AuthGuard />
   │
   ▼
Container: <DashboardView /> (components/dashboard/DashboardView.tsx)
   │
   ├── <DashboardMetricsBar />  ──► Aggregates total analyses, draft count, total views, followers
   │
   ├── <DashboardTabs />        ──► Tabs: "Published" | "Drafts" | "Archived" | "Activity"
   │
   ├── <DashboardPostsList />   ──► TanStack Query: queryKeys.posts.byAuthor(authorId, status, page)
   │     │
   │     ├── <DashboardPostCard /> ──► Status badge, view count, published date, Action Dropdown
   │     │     ├── "Edit in Studio" ──► /posts/[id]/edit
   │     │     ├── "Publish Draft"  ──► postsMutationsService.updatePost(id, { status: 'PUBLISHED' })
   │     │     ├── "Archive Post"   ──► postsMutationsService.updatePost(id, { status: 'ARCHIVED' })
   │     │     └── "Delete Post"    ──► postsMutationsService.deletePost(id)
   │     │
   │     └── <DashboardEmptyState /> ──► Contextual empty state with "Write New Analysis" CTA
   │
   └── <RecentActivityWidget /> ──► Notifications/Followers highlights
```

---

### 3.3 Query Architecture & TanStack Keys

We will extend `queryKeys` in `apps/web/lib/posts/posts-service.ts` / `apps/web/lib/dashboard/dashboard-service.ts`:

```typescript
export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  metrics: (authorId: string) => ['dashboard', 'metrics', authorId] as const,
  posts: (authorId: string, status?: string, page?: number) =>
    ['dashboard', 'posts', { authorId, status, page }] as const,
};
```

- **Stale Time**:
  - Metrics: 30 seconds (`staleTime: 30 * 1000`)
  - Post lists: 30 seconds (`staleTime: 30 * 1000`)
- **Cache Invalidation**: On post mutation (publish, archive, delete), invalidate `['dashboard']`, `['posts']`, and `['feed']`.

---

### 3.4 Route Architecture & SEO Gating

| Route | Purpose | Auth Requirement | Indexable (Robots) | SEO Metadata |
|---|---|---|---|---|
| `/dashboard` | Central Analyst Workspace | Authenticated (`<AuthGuard>`) | `noindex, nofollow` | `buildPageMetadata({ title: 'Analyst Dashboard', noIndex: true, noFollow: true })` |

---

### 3.5 Component Architecture

1. **`apps/web/app/dashboard/page.tsx`**:
   - Server Component entry with `buildPageMetadata({ title: 'Analyst Dashboard', noIndex: true, noFollow: true })`.
   - Mounts `<AuthGuard>` wrapping `<DashboardView />`.
2. **`apps/web/components/dashboard/DashboardView.tsx`**:
   - Primary client container. Orchestrates user profile data, metrics queries, tab state (`'published' | 'drafts' | 'archived'`), and active mutations.
3. **`apps/web/components/dashboard/DashboardMetricsBar.tsx`**:
   - Visual statistics grid displaying 4 institutional KPI cards:
     - Total Published Analyses
     - Active Research Drafts
     - Total Cumulative Views
     - Total Follower Base
4. **`apps/web/components/dashboard/DashboardTabs.tsx`**:
   - Accessible ARIA tablist (`role="tablist"`) with badge counters for each status segment.
5. **`apps/web/components/dashboard/DashboardPostsList.tsx`**:
   - Paginated list rendering `<DashboardPostCard />` items with loading skeletons, error fallback, and empty states.
6. **`apps/web/components/dashboard/DashboardPostCard.tsx`**:
   - High-density institutional card displaying:
     - Title, content type badge (`COMMUNITY` / `SERIES`), status badge (`DRAFT` / `PUBLISHED` / `ARCHIVED`).
     - Metadata metrics: Views, published date / last updated timestamp, category pill.
     - Action menu: Edit, Publish/Unpublish, Archive, Delete.
7. **`apps/web/components/dashboard/DashboardSkeleton.tsx`**:
   - Loading skeleton for metrics cards and post rows.
8. **`apps/web/components/dashboard/DeleteConfirmDialog.tsx`**:
   - Accessible modal confirming destructive post soft-delete.

---

### 3.6 Navigation & Shell Integration
- **`apps/web/components/auth/UserMenu.tsx`**:
  - Fix profile link to `/profile/${user.username}`.
  - Add explicit "Analyst Dashboard" link (`/dashboard`) with `LayoutDashboard` icon.
  - Add "Write Analysis" link (`/posts/create`) with `PenSquare` icon.
- **`apps/web/components/navigation/Sidebar.tsx`**:
  - Add "My Workspace" item (`/dashboard`) under Personal Library for authenticated users.

---

## 4. SECURITY & AUTHORIZATION AUDIT

| Vector | Threat | Mitigation |
|---|---|---|
| **Unauthorized Access** | Unauthenticated user visits `/dashboard` | Gated client-side by `<AuthGuard>` with redirection to `/login?redirect=/dashboard` and protected server-side with `noindex, nofollow`. |
| **IDOR Mutation Attack** | Malicious user attempts to edit/delete another author's post | Backend `PostsController.updatePost` and `deletePost` enforce `post.authorId === user.sub || roles.includes('MODERATOR')`. UI only renders actions for owner's posts. |
| **XSS Injection** | User-generated titles in dashboard list | Rendered via safe React string interpolation (no `dangerouslySetInnerHTML`). |
| **Information Leakage** | Private drafts indexed by search engines | `robots: { index: false, follow: false }` metadata configured on `/dashboard` and disallowed in `robots.ts` (`/posts/*/edit`). |

---

## 5. ACCESSIBILITY & PERFORMANCE SPECIFICATION

- **Keyboard & ARIA**:
  - Dashboard tabs use standard `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, and `role="tabpanel"`.
  - Action dropdowns support `ArrowDown`, `ArrowUp`, `Enter`, and `Escape`.
  - Delete modal traps focus and implements `aria-modal="true"`.
- **Performance**:
  - Query results are bounded (`limit: 20`).
  - Skeleton screens prevent cumulative layout shifts (CLS < 0.05).
  - Background queries reuse TanStack Query caching with optimistic invalidations.

---

## 6. FILE-LEVEL IMPLEMENTATION BLUEPRINT

### NEW FILES (11 Total)

| # | File | Purpose | Dependencies | Risk |
|---|---|---|---|---|
| 1 | `apps/web/types/dashboard.ts` | Type definitions for dashboard metrics, status tabs, and filters | `types/content.ts` | LOW |
| 2 | `apps/web/lib/dashboard/dashboard-service.ts` | Service layer aggregating author metrics and status queries | `lib/posts/posts-service.ts`, `lib/users/users-service.ts` | LOW |
| 3 | `apps/web/lib/dashboard/use-dashboard.ts` | TanStack Query hooks for dashboard metrics and author posts | `lib/dashboard/dashboard-service.ts` | LOW |
| 4 | `apps/web/app/dashboard/page.tsx` | Next.js route for `/dashboard` with SEO metadata and AuthGuard | `components/dashboard/DashboardView.tsx` | LOW |
| 5 | `apps/web/components/dashboard/DashboardView.tsx` | Main dashboard container orchestrating tabs and lists | `lib/dashboard/use-dashboard.ts` | LOW |
| 6 | `apps/web/components/dashboard/DashboardMetricsBar.tsx` | Institutional KPI cards for views, drafts, analyses, followers | `components/ui/Card.tsx` | LOW |
| 7 | `apps/web/components/dashboard/DashboardTabs.tsx` | ARIA-accessible status navigation tabs | `components/ui/Badge.tsx` | LOW |
| 8 | `apps/web/components/dashboard/DashboardPostsList.tsx` | Paginated list with loading/error/empty handling | `components/dashboard/DashboardPostCard.tsx` | LOW |
| 9 | `apps/web/components/dashboard/DashboardPostCard.tsx` | Post card with metrics and action dropdown | `components/ui/DropdownMenu.tsx` | LOW |
| 10 | `apps/web/components/dashboard/DashboardSkeleton.tsx` | Skeleton loading state for metrics and list | `components/ui/Skeleton.tsx` | LOW |
| 11 | `apps/web/components/dashboard/DeleteConfirmDialog.tsx` | Accessible delete confirmation modal | `components/ui/Modal.tsx` | LOW |

### MODIFIED FILES (2 Total)

| # | File | Modification | Reason | Risk |
|---|---|---|---|---|
| 1 | `apps/web/components/auth/UserMenu.tsx` | Add `/dashboard` navigation item; fix profile URL to `/profile/${user.username}` | Expose dashboard in user menu | LOW |
| 2 | `apps/web/components/navigation/Sidebar.tsx` | Add `/dashboard` to personal navigation items | Quick access to research workspace | LOW |

---

## 7. TESTING STRATEGY & SUITES

We will implement comprehensive unit and component tests under `apps/web/tests/dashboard/`:

1. `apps/web/tests/dashboard/dashboard-service.test.ts` (~4 tests):
   - Computes aggregated view metrics correctly from author posts.
   - Queries posts filtered by authorId and status (`DRAFT`, `PUBLISHED`, `ARCHIVED`).
   - Handles empty and error states gracefully.
2. `apps/web/tests/dashboard/DashboardMetricsBar.test.tsx` (~3 tests):
   - Renders all 4 KPI statistics (analyses count, drafts, total views, followers).
   - Formats numbers accurately (e.g. `1,250 views`).
3. `apps/web/tests/dashboard/DashboardTabs.test.tsx` (~3 tests):
   - Renders tab buttons with badge counters.
   - Emits `onTabChange` on click and handles keyboard arrow navigation.
4. `apps/web/tests/dashboard/DashboardPostCard.test.tsx` (~4 tests):
   - Renders post metadata, status pill, and action menu.
   - Triggers edit redirect, publish mutation, archive mutation, and delete confirmation.
5. `apps/web/tests/dashboard/DashboardView.test.tsx` (~4 tests):
   - Renders full workspace layout with metrics, tabs, and post stream.
   - Switches tabs and refetches appropriate query keys.
   - Handles empty state with direct CTA to create new post.

**Estimated Test Increase**: +18 new tests across 5 new test files (Total: ~250 tests across 85 test files).

---

## 8. IMPLEMENTATION SEQUENCE

```
Step 1: Type definitions (types/dashboard.ts)
Step 2: Service & query hooks (lib/dashboard/dashboard-service.ts, use-dashboard.ts)
Step 3: UI components (DashboardSkeleton, DashboardMetricsBar, DashboardTabs, DeleteConfirmDialog)
Step 4: Post card and post list components (DashboardPostCard, DashboardPostsList)
Step 5: Main container & route (DashboardView, app/dashboard/page.tsx)
Step 6: Shell integration (UserMenu.tsx, Sidebar.tsx)
Step 7: Unit & component test suites (tests/dashboard/*)
Step 8: TypeScript compilation check (npx tsc --noEmit)
Step 9: Full test suite verification (npx vitest run)
Step 10: Production build verification (npx next build)
```

---

## 9. ACCEPTANCE CRITERIA

1. **Dashboard Functionality**:
   - Authenticated users can view their total published analyses, draft count, cumulative views, and follower count.
   - Tabbed view allows seamless toggling between `Published`, `Drafts`, and `Archived` notes.
   - Authors can execute quick actions: Edit in Studio (`/posts/:id/edit`), Publish Draft, Archive, Delete Post.
2. **Access Control & Safety**:
   - Unauthenticated visitors attempting to load `/dashboard` are redirected to `/login?redirect=/dashboard`.
   - Private research notes and drafts are never exposed to search engines (`noindex, nofollow`).
3. **Quality & Regressions**:
   - 100% of existing 232 tests pass (0 regressions on F2.1–F17.1).
   - ~18 new tests pass across 5 new dashboard test files.
   - `npx tsc --noEmit` completes with 0 errors.
   - `npx next build` generates all static and dynamic pages with exit code 0.
4. **Backend & DB Immutability**:
   - `apps/api` remains 100% untouched (0 modifications).
   - `DATABASE_SCHEMA.sql` remains 100% untouched (0 migrations).

---

## 10. RISK REGISTER

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Author Metrics Query Overhead** | Low | Medium | Bound metrics computation to light aggregate queries with `staleTime: 30s`. |
| **Accidental Private Data Indexing** | Very Low | High | Enforce `buildPageMetadata({ noIndex: true, noFollow: true })` on `/dashboard`. |
| **Cache Invalidation Desynchronization** | Low | Low | Centralize cache invalidation for `['dashboard']` and `['posts']` on every post mutation. |
| **Shell Navigation Regression** | Very Low | Low | Covered by existing `Header.test.tsx` and `Sidebar.test.tsx` test suites. |

---

# PHASE F18.0 STATUS

**READY FOR HUMAN APPROVAL**

- **Selected Feature**: Phase F18.1 — Analyst Research Workspace & Creator Portfolio Dashboard (`/dashboard`)
- **Backend Impact**: 0 files modified (100% existing contract reuse)
- **Database Impact**: 0 migrations (100% existing schema support)
- **Estimated Test Increase**: +18 tests across 5 test suites (Total ~250 tests / 85 files)
- **Architecture Integrity**: F2.1 through F17.1 preserved with zero regressions.
