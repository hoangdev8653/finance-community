# PHASE F15.0 — GLOBAL SEARCH & ADVANCED TAXONOMY DISCOVERY ENGINE PRE-IMPLEMENTATION PLAN

**Target**: Global Command Palette (Cmd+K / Ctrl+K), Full-Text Tag Search, Multi-Dimensional Discovery Filtering, Dedicated Search Route, and Tag Exploration Views (`apps/web`)  
**Phase**: F15.0  
**Mode**: STRICT READ-ONLY — PLANNING ONLY  
**Date**: 2026-08-16  
**Author**: Senior Staff Frontend Architect, Full-Stack Architecture Reviewer, Backend Contract Auditor, Application Security Engineer, Accessibility Auditor & Lead QA  
**Status**: READY FOR HUMAN APPROVAL  

---

## 1. Executive Summary

Following the successful completion and approval of **Phases F2 through F14.1**, this document establishes the comprehensive, implementation-ready pre-implementation plan for **Phase F15.0 — Global Search & Advanced Taxonomy Discovery Engine**.

An exhaustive investigation of the repository confirms that the backend modules `apps/api/src/modules/tags` and `apps/api/src/modules/posts`, alongside database tables (Table 4: `tags`, Table 9: `post_tags`, Table 8: `posts`, Table 3: `categories`), expose all necessary querying endpoints for:
1. **Global Command Palette / Search Modal (`Cmd+K` / `Ctrl+K`)**: Rapid real-time search across taxonomy tags and content categories with keyboard navigation.
2. **Multi-Dimensional Discovery Filtering**: Advanced filtering of public content by `tagId`, `categoryId`, `contentType` (`SERIES` vs `COMMUNITY`), `authorId`, `sortBy` (`publishedAt` vs `createdAt`), and `order` (`ASC` vs `DESC`).
3. **Dedicated Search & Discovery Hub (`/search`)**: Deep-dive search interface with query synchronization, filter state persistence, and responsive results presentation.
4. **Tag Exploration Views (`/tags/[slug]`)**: Tag-scoped content feeds and related taxonomy hubs.
5. **Zero Backend Modifications & Zero Database Migrations**: 100% client-side implementation consuming existing backend contracts with 0 schema migrations.

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
PHASE F14.1 Admin Console & System Governance Engine APPROVED (Frozen)

Verified Baseline:
- 173 / 173 Tests Passing across 63 Test Files
- 0 TypeScript Compilation Errors
- Production Build: PASS (Next.js Turbopack)
- 0 Backend / Database Modifications
```

---

## 3. Database Gap Analysis

Inspection of [`docs/DATABASE_SCHEMA.sql`](file:///d:/Web_Projects/finance_community_architecture_v1/docs/DATABASE_SCHEMA.sql) across all 20 tables:

| # | Table Name | Description | Current Frontend Coverage | Classification |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `users` | User credentials and timestamps | Auth, Profile, Admin | **A. Fully Implemented** |
| 2 | `roles` | Seeded RBAC definitions | AuthContext, Admin | **A. Fully Implemented** |
| 3 | `categories` | Content categorization | Feed, Studio, Admin | **A. Fully Implemented** |
| 4 | `tags` | Freeform content labels | Studio, Feed (Static) | **B. Partially Implemented** (Target for F15.0 Search & Explorer) |
| 5 | `media` | Uploaded asset metadata | Studio, Profile, Media | **A. Fully Implemented** |
| 6 | `profiles` | User bio, handle, and avatar | Profile, Feed, Comments | **A. Fully Implemented** |
| 7 | `user_roles` | Role assignment mappings | Admin Console | **A. Fully Implemented** |
| 8 | `posts` | Series and community posts | Reader, Feed, Studio | **A. Fully Implemented** (Target for F15.0 Multi-Filter Discovery) |
| 9 | `post_tags` | Posts-tags junction | Post Header, Studio | **B. Partially Implemented** (Target for F15.0 Tag Queries) |
| 10 | `comments` | Threaded discussions | Comments & Reader | **A. Fully Implemented** |
| 11 | `post_reactions` | Post reactions/likes | Engagement Engine | **A. Fully Implemented** |
| 12 | `comment_reactions`| Comment reactions/likes | Engagement Engine | **A. Fully Implemented** |
| 13 | `follows` | User follow graph | Social Profile | **A. Fully Implemented** |
| 14 | `post_media` | Post-media attachments | Studio & Reader | **A. Fully Implemented** |
| 15 | `reports` | Violation reports | Moderation Engine | **A. Fully Implemented** |
| 16 | `moderation_actions`| Moderator action logs | Moderation Engine | **A. Fully Implemented** |
| 17 | `notifications` | Notification alerts | Notifications Center | **A. Fully Implemented** |
| 18 | `audit_logs` | Security audit trail | Admin Console | **A. Fully Implemented** |
| 19 | `system_settings` | Runtime settings | Admin Console | **A. Fully Implemented** |
| 20 | `feature_flags` | Feature flag toggles | Admin Console & Client | **A. Fully Implemented** |

---

## 4. Frontend Gap Analysis

Audit of `apps/web`:
1. **Global Search Experience**: Currently, the application header lacks a global search trigger or command palette. Users cannot quickly jump to categories, search tags, or find specific financial topics without manual navigation.
2. **Tag Exploration**: Tags are rendered as passive labels in post details and studios, but clicking a tag does not route to a dedicated tag hub (`/tags/[slug]`) to view all articles sharing that analytical topic.
3. **Advanced Filter Controls**: The main feed provides category filtering, but lacks multi-dimensional sorting (`publishedAt` vs `createdAt`, `ASC` vs `DESC`) and content-type scoping on a dedicated search surface.

---

## 5. Phase Ordering Analysis

### Candidate Ranking

- **Candidate #1: Phase F15.0 — Global Search & Advanced Taxonomy Discovery Engine (RECOMMENDED)**
  - **Backend Readiness**: **100%**. Backend supports `GET /api/v1/tags?search=&limit=` and `GET /api/v1/posts?tagId=&categoryId=&contentType=&authorId=&sortBy=&order=`.
  - **Database Readiness**: **100%**. Tables `tags`, `post_tags`, `posts`, and `categories` are fully ready.
  - **User & Architectural Value**: Bridges content discovery across curriculum series and community discussions, elevating platform UX.
  - **Risk**: Low (isolated to search components, command palette dialog, and dedicated discovery routes).

- **Candidate #2: Bookmarks & Saved Lists**
  - **Backend Readiness**: **0%**. No backend module or database table exists (requires database schema changes).

- **Candidate #3: Direct User Messaging**
  - **Backend Readiness**: **0%**. No backend messaging module exists.

### Selection
**Phase F15.0: Global Search & Advanced Taxonomy Discovery Engine** is the undisputed recommended next phase.

---

## 6. Approved Backend API Contracts for F15

All endpoints are consumed from `apps/api/src/modules/tags`, `apps/api/src/modules/categories`, and `apps/api/src/modules/posts`:

| Endpoint | Method | Required Auth | Request Query / Params | Response Structure | Status Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET /api/v1/tags` | `GET` | Public / None | `?search=&limit=` | `TagEntity[]` | `200` |
| `GET /api/v1/tags/:id` | `GET` | Public / None | Param `:id` | `TagEntity` | `200`, `404` |
| `GET /api/v1/categories` | `GET` | Public / None | `?scope=` (`SERIES` \| `COMMUNITY`) | `CategoryEntity[]` | `200` |
| `GET /api/v1/posts` | `GET` | Public / None | `?contentType=&categoryId=&tagId=&authorId=&status=PUBLISHED&sortBy=&order=&page=&limit=` | `PaginatedPostsResponse` | `200` |

---

## 7. Planned Frontend Architecture for F15.0

### Planned File Inventory

```text
apps/web/
├── types/
│   └── search.ts                                  # Search filters, command palette types, and discovery interfaces
│
├── lib/
│   └── search/
│       ├── search-service.ts                      # Client wrapper combining tags and multi-dimensional post queries
│       └── use-search.ts                          # Search & taxonomy query hooks
│
├── components/
│   └── search/
│       ├── CommandPalette.tsx                     # Global Cmd+K / Ctrl+K accessible modal dialog
│       ├── SearchBar.tsx                          # Header search trigger button & input
│       ├── SearchFilterBar.tsx                    # Multi-dimensional filter toolbar (Content type, sort, order, category, tag)
│       ├── SearchResultsList.tsx                  # Results stream with loading skeletons and empty states
│       └── TagBadge.tsx                           # Interactive tag link badge
│
└── app/
    ├── search/
    │   └── page.tsx                               # Dedicated discovery & search hub
    └── tags/
        └── [slug]/
            └── page.tsx                           # Tag-specific content explorer route
```

### Files to Modify
- `apps/web/components/layout/Header.tsx`: Mount `SearchBar` trigger for quick keyboard search.
- `apps/web/lib/query/keys.ts`: Register `queryKeys.search` keys.

---

## 8. Security & Authorization Defenses

1. **Public Read Integrity**:
   - Discovery endpoints (`GET /tags`, `GET /categories`, `GET /posts`) are public and read-only.
   - Posts query strictly filters by `status=PUBLISHED` by default to prevent leaking draft or hidden content to unauthenticated users.
2. **Sanitization**:
   - Zero use of `dangerouslySetInnerHTML`. Search keywords, matched titles, and tags are rendered as safe text nodes.
3. **URL Parameter Injection Defenses**:
   - Search parameters (`query`, `tagId`, `categoryId`, `sortBy`, `order`) are strictly typed and sanitized before query dispatch.

---

## 9. Accessibility Plan (WCAG 2.2 AA)

- **Command Palette (`CommandPalette.tsx`)**:
  - Global shortcut listener (`Cmd+K` / `Ctrl+K`).
  - Accessible modal dialog (`role="dialog"`, `aria-modal="true"`, `aria-label="Global Search"`).
  - Arrow key navigation (`ArrowDown`, `ArrowUp`, `Enter` to select, `Escape` to close).
  - Active item indicated via `aria-selected="true"`.
- **Search Filters**:
  - Semantic `<select>` and `<button>` elements with accessible labels.
  - `aria-live="polite"` feedback for total results count changes.

---

## 10. Responsive Design Plan

- **Desktop (>=1024px)**:
  - Command palette centered in viewport (max-w-xl).
  - Search page features a sidebar filter panel alongside a responsive results stream.
- **Mobile (<768px)**:
  - Command palette expands to full-screen mobile overlay with touch-friendly list items.
  - Search filters render as collapsible accordion / drawer.

---

## 11. Comprehensive Test Strategy

Planned test files under `apps/web/tests/search/`:
1. `search-service.test.ts`: Tests tag querying, category querying, and multi-filter post feed queries.
2. `CommandPalette.test.tsx`: Tests `Cmd+K` keyboard trigger, arrow key navigation, search debounce, and navigation routing.
3. `SearchBar.test.tsx`: Tests search trigger button and input binding.
4. `SearchFilterBar.test.tsx`: Tests filter selection, sorting change, and filter reset.
5. `SearchResultsList.test.tsx`: Tests loading skeleton, results rendering, and empty search states.
6. `TagBadge.test.tsx`: Tests tag click navigation to `/tags/[slug]`.

---

## 12. Risk Register

| Risk ID | Risk | Severity | Probability | Mitigation | Blocking |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `R-F15-01` | Query debounce causing laggy UI during fast typing | Low | Medium | Implement 250ms debounce on search input using standard React hooks. | No |
| `R-F15-02` | Keyboard shortcut conflict with browser defaults | Low | Low | Standard `(e.metaKey \|\| e.ctrlKey) && e.key === 'k'` check with `e.preventDefault()`. | No |
| `R-F15-03` | Stale search cache during post publication | Low | Low | Rely on existing TanStack Query TTL (2 mins) and explicit tag invalidation. | No |

---

## 13. Acceptance Criteria

- [ ] **AC-F15-001**: Pressing `Cmd+K` or `Ctrl+K` opens the accessible Command Palette search dialog from any page.
- [ ] **AC-F15-002**: Users can search for taxonomy tags in real time and navigate directly to tag hubs or search results.
- [ ] **AC-F15-003**: Dedicated search page at `/search` supports multi-dimensional filtering by Content Type (`SERIES` vs `COMMUNITY`), Category, Tag, Sort By, and Order.
- [ ] **AC-F15-004**: Tag exploration route at `/tags/[slug]` displays all published articles labeled with the target tag.
- [ ] **AC-F15-005**: All existing 173 tests remain green; new search tests increase total test count.
- [ ] **AC-F15-006**: 0 TypeScript errors, production build PASS, 0 backend modifications, 0 database migrations.

---

## 14. Scope Control

- **IN SCOPE**:
  - Global command palette / search modal (`Cmd+K`).
  - Search trigger in application header.
  - Multi-dimensional discovery filter toolbar.
  - Dedicated `/search` route.
  - Tag exploration route `/tags/[slug]`.
  - Comprehensive unit and integration tests.
- **OUT OF SCOPE**:
  - Full-text search engine (Elasticsearch / Meilisearch) backend additions.
  - AI semantic vector search.
  - Backend modifications or database migrations.
  - Unrelated refactoring.

---

## 15. Final Recommendation

```text
============================================================
PHASE F15.0 — PRE-IMPLEMENTATION PLAN
============================================================

Recommended Phase:
F15.0 — GLOBAL SEARCH & ADVANCED TAXONOMY DISCOVERY ENGINE

Repository Investigation: COMPLETE
Backend Contract Audit: COMPLETE (apps/api/src/modules/tags, posts, categories)
Database Audit: COMPLETE (Tables 3, 4, 8, 9)
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
