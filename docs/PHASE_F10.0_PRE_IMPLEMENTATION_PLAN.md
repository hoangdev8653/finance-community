# PHASE F10.0 — EDUCATIONAL SERIES ENGINE & CURRICULUM READER PRE-IMPLEMENTATION PLAN

**Target**: Educational Series Catalog (`/series`), Series Curriculum Detail (`/series/[slug]`), Chapter Navigation & Series Reader Integration (`apps/web`)  
**Phase**: F10.0  
**Mode**: STRICT READ-ONLY — PLANNING ONLY  
**Date**: 2026-08-15  
**Author**: Senior Staff Frontend Architect, Full-Stack Architecture Reviewer, Backend Contract Auditor, Application Security Engineer & Lead QA  
**Status**: PLANNING REVISION COMPLETE — READY FOR HUMAN APPROVAL  

---

## 1. Executive Summary

This revised document establishes the comprehensive, implementation-ready architectural plan for **Phase F10 — Educational Series Engine & Curriculum Reader** for the Finance Community Platform (`apps/web`).

Phase F10 delivers our core educational curriculum experience, allowing financial analysts, students, and institutional investors to browse structured research courses (e.g., *Macroeconomic Frameworks*, *Advanced Equity Valuation*, *Fixed Income Analytics*), inspect full sequential chapter syllabi, and navigate chronologically between series articles.

Key architectural pillars defined in this plan:
1. **100% Backend API & Database Contract Alignment**:
   - `GET /api/v1/series`: Retrieves paginated educational series categories with published article counts (`SeriesItem[]`).
   - `GET /api/v1/series/:slug`: Retrieves series curriculum overview and its sequential, chronologically ordered articles (`SeriesDetailResponse`) with pagination metadata.
   - Grounded in the immutable database domain model where a **Series** is represented by `categoriesTable` (`scope = 'SERIES'`) and **Chapters** are represented by `postsTable` (`contentType = 'SERIES'`, `category_id = series.id`, sorted by `published_at ASC`).
2. **Dedicated Educational Routes**:
   - `/series`: Public Series Catalog & Index grid displaying curated research tracks, chapter count badges, descriptions, and syllabus exploration triggers.
   - `/series/[slug]`: Public Series Curriculum Detail page displaying course overview, sequential chapter syllabus, published timestamps, view counts, pagination/load-more controls, and direct reading links to `/posts/SERIES/[slug]`.
3. **Component Architecture (`apps/web/components/series/`)**:
   - `SeriesGrid.tsx`: Responsive multi-column grid container for series cards.
   - `SeriesCard.tsx`: Curated track card featuring title, description, article counter badge, and link to curriculum.
   - `SeriesHeader.tsx`: Curriculum hero header with series metadata (name, description, total articles count, created date).
   - `SeriesChapterList.tsx`: Sequential chapter timeline/syllabus with numbered step indicators and pagination/load-more support.
   - `SeriesChapterItem.tsx`: Individual chapter row with view count, publication date, and direct link to reader.
   - `SeriesSkeleton.tsx`: Pulsing loading state placeholder for catalog and curriculum views.
4. **Server vs. Client Data Architecture**:
   - Follows established Next.js App Router patterns from `profile/[username]` and `posts/[contentType]/[slug]`: Server Component performs SSR data-fetch for `generateMetadata()` and passes `initialData` to client components, avoiding duplicate client waterfalls.
5. **SEO & Structured Data**:
   - Schema.org `ItemList` JSON-LD structured data utilizing exclusively available backend fields (`series.name`, `series.description`, `article.title`, `article.slug`, `article.publishedAt`).
   - Canonical URL strategy aligned with existing platform conventions (`https://financepulse.community/series` and `https://financepulse.community/series/[slug]`).
6. **Strict Plain-Text Content Security**:
   - Plain-text React node rendering enforced for all series and chapter metadata (0 `dangerouslySetInnerHTML`).

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

F9.1 Baseline Status:
- Tests: 101/101 PASS (37 test files)
- Typecheck: PASS (0 TypeScript errors)
- Production Build: PASS (Next.js Turbopack)
- Backend Modifications: 0
- Database Modifications: 0
- Scope Creep: 0
```

Phase F9.1 is **FROZEN** and serves as an immutable foundation.

---

## 3. Investigation Findings

- **Domain Model Confirmation**:
  - In `docs/DATABASE_SCHEMA.sql` and `apps/api/src/database/schema/`:
    - A **Series Track** is stored in `categories` where `scope = 'SERIES'`.
    - **Series Chapters / Articles** are stored in `posts` where `content_type = 'SERIES'` and `category_id = categories.id`.
    - `SeriesService.getSeriesDetailBySlug` performs `findFeedPaginated({ contentType: 'SERIES', categoryId: seriesCategory.id, status: 'PUBLISHED', sortBy: 'publishedAt', order: 'ASC' })`.
- **Backend Endpoints**:
  - `GET /api/v1/series`: Paginated series listing with `publishedArticleCount`.
  - `GET /api/v1/series/:slug`: Series detail with paginated chapters (`page?: number, limit?: number`, default `page = 1, limit = 20`).
- **Progress Tracking Persistence**:
  - Backend does **NOT** expose an API for tracking user reading progress, completed chapters, or progress percentages.
  - Therefore, all persistent progress tracking is **EXCLUDED** from Phase F10. The UI will strictly provide sequential chapter navigation based on published sequence.

---

## 4. Roadmap Reconstruction

| Feature / Module | Backend Ready | Frontend Exists | Previous Phase | Status / Target |
| :--- | :---: | :---: | :--- | :--- |
| **Home Feed** (`/`) | ✅ Yes | ✅ Yes | F4.1 | APPROVED |
| **Post Detail** (`/posts/[type]/[slug]`) | ✅ Yes | ✅ Yes | F5.1 | APPROVED |
| **Comments System** | ✅ Yes | ✅ Yes | F6.1 | APPROVED |
| **User Profiles** (`/profile/[username]`) | ✅ Yes | ✅ Yes | F7.1 | APPROVED |
| **Notifications** (`/notifications`) | ✅ Yes | ✅ Yes | F8.1 | APPROVED |
| **Publishing Studio** (`/posts/create`) | ✅ Yes | ✅ Yes | F9.1 | APPROVED |
| **Educational Series Engine** (`/series`, `/series/[slug]`) | ✅ Yes | ❌ Missing | F1 Route Map | **CANDIDATE FOR PHASE F10** |
| **Reactions & Engagement Engine** | ✅ Yes | ❌ Partial | F3.3 Backend | Candidate for F11 |
| **Media Upload Studio** | ✅ Yes | ❌ Missing | F6 Spec | Candidate for F12 |
| **Member Settings** (`/settings/*`) | ✅ Yes | ❌ Missing | F1 Route Map | Candidate for F13 |
| **Moderation & Admin** (`/admin/*`) | ✅ Yes | ❌ Missing | F7 Spec | Candidate for F14 |

---

## 5. F10.0 Target Definition

- **Module Name**: Educational Series Engine & Curriculum Reader
- **Primary Scope**:
  1. Public Series Catalog & Index (`/series`).
  2. Public Series Curriculum Detail & Chapter Syllabus (`/series/[slug]`).
  3. Sequential numbered chapter navigation.
  4. Integration with existing Phase F5.1 Reader (`/posts/SERIES/[slug]`).

---

## 6. In-Scope

- **Types**: `SeriesItem`, `SeriesDetailResponse`, `SeriesArticleItem`, `QuerySeriesParams`.
- **API Service**: `seriesService.getAllSeries(params)`, `seriesService.getBySlug(slug, params)`.
- **TanStack Query hooks**: `useSeriesList(params)`, `useSeriesDetail(slug, params)`.
- **UI Components**:
  - `SeriesGrid.tsx`: Multi-column catalog grid.
  - `SeriesCard.tsx`: Course track card with article count badge and description.
  - `SeriesHeader.tsx`: Curriculum hero header with name, description, chapter count, and created timestamp.
  - `SeriesChapterList.tsx`: Chronological syllabus timeline with pagination/load-more support.
  - `SeriesChapterItem.tsx`: Individual chapter row with view count, publication date, and reader link.
  - `SeriesView.tsx`: Client view container orchestrating data and pagination.
  - `SeriesSkeleton.tsx`: Loading state skeleton.
- **Routes**:
  - `apps/web/app/series/page.tsx` (`/series`)
  - `apps/web/app/series/[slug]/page.tsx` (`/series/[slug]`)
- **SEO & Metadata**:
  - Dynamic `generateMetadata()` on `/series/[slug]`.
  - Schema.org `ItemList` JSON-LD structured data.
- **Accessibility**: WCAG 2.2 AA landmarks, keyboard navigation, focus management.

---

## 7. Out-of-Scope

- ❌ Persistent reading progress / completed chapter tracking (No backend API support)
- ❌ LocalStorage-based progress workarounds
- ❌ Series authoring & curriculum reordering studio (Deferred to Phase F14)
- ❌ Custom media file upload (Deferred to Phase F12)
- ❌ Paid subscription or paywall gating
- ❌ Modifying backend source files in `apps/api`
- ❌ Modifying `docs/DATABASE_SCHEMA.sql` or creating database migrations

---

## 8. Routes

### 1. `/series` (Series Catalog)
- **Purpose**: Public directory of curated financial research tracks.
- **Auth**: Public (Unauthenticated visitors allowed).
- **SEO**: Indexable (`index: true, follow: true`), canonical URL `https://financepulse.community/series`.
- **Data Source**: `GET /api/v1/series`.
- **Layout**: Standard App Shell with Header and Sidebar.

### 2. `/series/[slug]` (Series Curriculum Detail)
- **Purpose**: Structured chapter syllabus and overview for a specific series.
- **Auth**: Public (Unauthenticated visitors allowed).
- **SEO**: Dynamic `generateMetadata()` with series title, description, canonical `https://financepulse.community/series/${encodeURIComponent(slug)}`, and Schema.org `ItemList` JSON-LD.
- **Data Source**: `GET /api/v1/series/:slug`.
- **Layout**: Standard App Shell with Header and Sidebar.

---

## 9. Component Architecture

```
apps/web/components/series/
├── SeriesGrid.tsx               # Responsive grid container for catalog
├── SeriesCard.tsx               # Individual series course card
├── SeriesHeader.tsx             # Hero header for series detail view
├── SeriesChapterList.tsx        # Chronological chapter syllabus container with pagination
├── SeriesChapterItem.tsx        # Single chapter syllabus row with links
├── SeriesView.tsx               # Main series detail page orchestrator
└── SeriesSkeleton.tsx           # Skeleton loading state
```

---

## 10. API Contract Matrix

| Method | Endpoint | Purpose | Request Query / Body | Response Shape | Auth Required | Status Codes |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| `GET` | `/api/v1/series` | List published series tracks | `page?: number, limit?: number` | `PaginatedResult<SeriesItem>` | Public | `200 OK` |
| `GET` | `/api/v1/series/:slug` | Get series overview and chapters | `slug: string, page?: number, limit?: number` | `SeriesDetailResponse` | Public | `200 OK`, `404 Not Found` |

### Detailed Parameter Verification for `GET /api/v1/series/:slug`
- Path Parameter: `slug: string` (required)
- Query Parameters: `page: number = 1`, `limit: number = 20`
- Response Shape:
  ```typescript
  {
    series: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      sortOrder: number;
      createdAt: string;
    };
    articles: Array<{
      id: string;
      title: string;
      slug: string;
      status: string;
      publishedAt: string | null;
      viewCount: number;
    }>;
    meta: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }
  ```
- **Pagination Handling**: `SeriesChapterList` renders the chapters for the current page and displays a "Load More" / pagination control if `meta.hasNextPage === true`, preventing silent truncation.

---

## 11. Data Model / Types (`apps/web/types/series.ts`)

```typescript
export interface SeriesItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  publishedArticleCount: number;
  createdAt: string;
}

export interface SeriesArticleItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: string | null;
  viewCount: number;
}

export interface SeriesDetailResponse {
  series: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    sortOrder: number;
    createdAt: string;
  };
  articles: SeriesArticleItem[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface QuerySeriesParams {
  page?: number;
  limit?: number;
}
```

---

## 12. TanStack Query Strategy

- Query Keys:
  - `queryKeys.series.all`: `['series']`
  - `queryKeys.series.list(params)`: `['series', 'list', params]`
  - `queryKeys.series.detail(slug, params)`: `['series', 'detail', slug, params]`
- Cache Settings:
  - `staleTime: 5 * 60 * 1000` (5 minutes).
  - `refetchOnWindowFocus: true`.

---

## 13. Server vs. Client Data Architecture

Following the pattern established in `profile/[username]` and `posts/[contentType]/[slug]`:
1. `apps/web/app/series/[slug]/page.tsx` is an async Server Component.
2. In `generateMetadata({ params })`, server calls `seriesService.getBySlug(slug)` to construct SEO metadata and OpenGraph tags.
3. In `SeriesPage({ params })`, server calls `seriesService.getBySlug(slug)`. If `404`, triggers `notFound()`.
4. Renders `<SeriesView initialData={seriesDetail} slug={slug} />`.
5. `SeriesView` initializes state with `initialData`. If user clicks "Load More Chapters", it queries subsequent pages via `useSeriesDetail(slug, { page, limit })`.
6. Zero unnecessary double-fetching on initial page load.

---

## 14. Authentication & Authorization

- All series routes (`/series`, `/series/[slug]`) and API endpoints are **Public**.
- Unauthenticated visitors can view all catalog tracks and chapter syllabi without login barriers.
- Chapter links navigate to the public post reader `/posts/SERIES/[slug]`.

---

## 15. Security Requirements

- Plain-text React node rendering enforced for series names, descriptions, chapter titles, and view counts.
- Zero `dangerouslySetInnerHTML` in series UI components.
- Slugs are properly URL-encoded (`encodeURIComponent(slug)`).

---

## 16. Accessibility Requirements (WCAG 2.2 AA)

- Semantic `<main>`, `<header>`, and `<section>` landmarks.
- Clear heading hierarchy: `<h1>` (Catalog / Series Title), `<h2>` (Curriculum Syllabus), `<h3>` (Chapter Title).
- Numbered sequence indicators on chapters (`aria-label="Chapter 1: Valuation Fundamentals"`).
- Focus rings on all interactive links and pagination buttons.

---

## 17. SEO & Structured Data Requirements

- Canonical URLs:
  - Catalog: `https://financepulse.community/series`
  - Curriculum Detail: `https://financepulse.community/series/${encodeURIComponent(slug)}`
- Schema.org `ItemList` JSON-LD:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Series Name",
    "description": "Series Description",
    "numberOfItems": 5,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Chapter 1 Title",
        "url": "https://financepulse.community/posts/series/chapter-1-slug"
      }
    ]
  }
  ```
- Uses strictly existing backend fields; zero fabricated properties.

---

## 18. Responsive Requirements

- Desktop (>=1024px): 3-column grid on `/series`, centered `max-w-4xl` curriculum layout on `/series/[slug]`.
- Tablet (768px - 1023px): 2-column grid on `/series`.
- Mobile (<768px): 1-column stacked cards with touch-friendly chapter rows.

---

## 19. Error / Loading / Empty States

- **Loading**: `SeriesSkeleton` renders card skeletons for `/series` and timeline skeletons for `/series/[slug]`.
- **Empty**: `EmptyState` displays *"No educational series published yet."* or *"No published chapters in this series yet."*
- **Error**: `ErrorState` with retry button on network failures; `notFound()` triggered if slug does not exist (`404 Not Found`).

---

## 20. Testing Strategy

Vitest test suites in `apps/web/tests/series/`:
1. `series-service.test.ts`: Tests `getAllSeries` and `getBySlug` API client calls.
2. `SeriesCard.test.tsx`: Tests rendering track name, description, and article count badge.
3. `SeriesChapterList.test.tsx`: Tests chapter numbering, publication timestamps, and links.
4. `SeriesView.test.tsx`: Tests series detail orchestration, pagination, and empty states.

---

## 21. Acceptance Criteria

- **AC-F10-001**: `/series` renders grid of published educational series with exact article count badges.
- **AC-F10-002**: Clicking a series card navigates to `/series/[slug]`.
- **AC-F10-003**: `/series/[slug]` renders course overview and chronologically ordered chapter syllabus (`published_at ASC`).
- **AC-F10-004**: Clicking a chapter row navigates directly to `/posts/SERIES/[slug]`.
- **AC-F10-005**: If series contains more than 20 chapters (`meta.hasNextPage === true`), pagination/load-more control is rendered without data truncation.
- **AC-F10-006**: 404 is rendered gracefully when series slug does not exist.
- **AC-F10-007**: Schema.org `ItemList` JSON-LD is injected with valid data.
- **AC-F10-008**: All unit tests pass, typecheck passes with 0 errors, and production build succeeds cleanly.

---

## 22. Dependencies

- **Phase F2 App Shell**: Header, Sidebar, Badge, Button, Skeleton, EmptyState, ErrorState.
- **Phase F5.1 Post Detail**: Chapter reading destination `/posts/SERIES/[slug]`.
- **Phase F9.1 Post Studio**: Authoring series posts.

---

## 23. Planned File Changes for Phase F10

### Files to Create:
- `apps/web/types/series.ts`
- `apps/web/lib/series/series-service.ts`
- `apps/web/lib/series/use-series.ts`
- `apps/web/components/series/SeriesSkeleton.tsx`
- `apps/web/components/series/SeriesCard.tsx`
- `apps/web/components/series/SeriesGrid.tsx`
- `apps/web/components/series/SeriesHeader.tsx`
- `apps/web/components/series/SeriesChapterItem.tsx`
- `apps/web/components/series/SeriesChapterList.tsx`
- `apps/web/components/series/SeriesView.tsx`
- `apps/web/app/series/page.tsx`
- `apps/web/app/series/[slug]/page.tsx`
- `apps/web/tests/series/series-service.test.ts`
- `apps/web/tests/series/SeriesCard.test.tsx`
- `apps/web/tests/series/SeriesChapterList.test.tsx`
- `apps/web/tests/series/SeriesView.test.tsx`

### Files to Modify:
- `apps/web/lib/query/keys.ts` (Register `queryKeys.series`)

*Backend & Database*: **0 files to modify**.

---

## 24. Scope Creep Protection

- ❌ NO persistent user reading progress (No backend endpoint exists)
- ❌ NO custom series creation/management UI (Deferred to F14)
- ❌ NO media file upload in series
- ❌ NO modifications to `apps/api` or `docs/DATABASE_SCHEMA.sql`

---

## 25. Implementation Sequence

1. Define TypeScript types in `apps/web/types/series.ts`.
2. Register query keys in `apps/web/lib/query/keys.ts`.
3. Implement `seriesService` in `apps/web/lib/series/series-service.ts`.
4. Implement TanStack Query hooks in `apps/web/lib/series/use-series.ts`.
5. Implement UI components in `apps/web/components/series/`.
6. Implement App Router pages `apps/web/app/series/page.tsx` and `apps/web/app/series/[slug]/page.tsx`.
7. Implement Vitest test suites in `apps/web/tests/series/`.
8. Validate with `npm run test`, `npm run typecheck`, `npm run build`.

---

## 26. Risk Register

| Risk ID | Risk Description | Severity | Probability | Mitigation Strategy | Blocking |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **R-F10-01** | Slug mismatch / non-existent series | Low | Low | Backend returns 404; Next.js Server Component triggers `notFound()` | No |
| **R-F10-02** | Chapter sorting discrepancy | Low | Low | Backend `SeriesService` strictly enforces `sortBy: 'publishedAt', order: 'ASC'` | No |
| **R-F10-03** | Chapter pagination truncation (>20 articles) | Medium | Low | `SeriesChapterList` inspects `meta.hasNextPage` and provides load-more | No |
| **R-F10-04** | Empty series track (0 articles) | Low | Medium | Render `EmptyState` inside curriculum view without breaking layout | No |
| **R-F10-05** | SSR/client data-fetching duplication | Low | Low | Server passes `initialData` to `SeriesView` avoiding initial client fetch | No |
| **R-F10-06** | JSON-LD schema invalidation | Low | Low | Use standard `ItemList` with strictly verified backend fields | No |

---

## 27. Final Recommendation & Status

```text
============================================================
PHASE F10.0 — PRE-IMPLEMENTATION PLAN
============================================================

Mode: STRICT READ-ONLY
Implementation: NOT AUTHORIZED

Original Plan Reviewed: COMPLETE
Architectural Clarifications: COMPLETE
Backend Contract Re-Verification: COMPLETE
Pagination Behavior: VERIFIED
Progress Tracking Boundary: VERIFIED
SEO Strategy: VERIFIED
Structured Data Strategy: VERIFIED
SSR / Client Data Strategy: VERIFIED
Risk Register: UPDATED
Acceptance Criteria: UPDATED
Scope: FINALIZED

FINAL STATUS:
READY FOR HUMAN APPROVAL

STOP.
DO NOT IMPLEMENT CODE.
AWAIT HUMAN APPROVAL.
============================================================
```
