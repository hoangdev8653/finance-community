# PHASE F19.0 — PRE-IMPLEMENTATION PLAN
# TAXONOMY HUB, MARKET DIRECTORIES & CONTENT ARCHIVES ENGINE

**Phase**: F19.0  
**Type**: Pre-Implementation Architectural Plan  
**Target**: `apps/web`  
**Baseline**: Phase F18.2 Approved (250 tests, 85 test files, 0 TS errors, Build PASS)  
**Backend Mode**: STRICT IMMUTABLE (`apps/api` unchanged)  
**Database Mode**: STRICT IMMUTABLE (`DATABASE_SCHEMA.sql` unchanged)  

---

## 1. CURRENT BASELINE & PLATFORM AUDIT

### 1.1 Frozen Baselines (F2.1 – F18.2)
- **F2.1**: App Shell & UI Foundation (Tokens, Layouts, Buttons, Badges, Modals, Dropdowns).
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
- **F18.1 / F18.2**: Analyst Research Workspace & Creator Portfolio Dashboard (`/dashboard`, KPI metrics, content lifecycle).

### 1.2 Quantitative Baseline
- **Total Tests**: 250 / 250 PASS
- **Total Test Files**: 85 / 85 PASS
- **TypeScript Errors**: 0 (`npx tsc --noEmit`)
- **Production Build**: PASS (20 static/dynamic routes)
- **Backend Modifications**: 0
- **Database Migrations**: 0

---

## 2. CANDIDATE FEATURE COMPARISON & GAP EVALUATION

A comprehensive repository audit of `apps/web`, `apps/api`, and `DATABASE_SCHEMA.sql` evaluated all candidate next phases:

| Candidate | Backend Ready | DB Ready | Frontend Dependencies | Priority | Risk | Complexity | User Value | Recommended |
|---|---|---|---|---|---|---|---|---|
| **A. Taxonomy Hub & Market Directories (`/tags`, `/categories`, `/posts`)** | **YES** (100%) | **YES** (100%) | F2, F4, F10, F15, F17 | **CRITICAL** | **LOW** | **MEDIUM** | **VERY HIGH** | **YES (Recommended)** |
| **B. Public Author Directory (`/analysts`)** | **NO** (No public `GET /profiles` endpoint) | YES | F2, F7, F15, F17 | HIGH | HIGH | HIGH | MEDIUM | NO (Blocked by Backend) |
| **C. Personalized Following Stream (`/feed/following`)** | **NO** (No multi-author query) | YES | F3, F4, F7 | MEDIUM | HIGH | MEDIUM | MEDIUM | NO (Blocked by Backend) |
| **D. Bookmarks / Reading List (`/bookmarks`)** | **NO** (No bookmarks table/API) | **NO** | F3, F4 | MEDIUM | HIGH | HIGH | MEDIUM | NO (Blocked by DB/API) |
| **E. Real-time Market Tickers / Websockets** | **NO** (No market data feeds) | **NO** | F2, F4 | LOW | HIGH | HIGH | LOW | NO (Blocked by Backend) |

### Rationale for Selecting Candidate A:
1. **Resolves Critical Shell Navigation 404s**: The primary Sidebar navigation (`Sidebar.tsx`) currently renders links to `/posts` ("Explore Posts"), `/categories` ("Categories"), and `/tags` ("Market Tags"). In the current build, all 3 routes return 404 pages.
2. **Zero Backend & Database Gaps**:
   - `GET /api/v1/tags?search=&limit=100`: Fully implemented in `TagsController.getTags()`.
   - `GET /api/v1/categories`: Fully implemented in `CategoriesController.getCategories()`.
   - `GET /api/v1/posts`: Fully implemented with multi-facet filters (`contentType`, `categoryId`, `tagId`, `sortBy`, `order`, `page`, `limit`).
3. **SEO Multiplier**: Provides high-authority, crawlable catalog hubs (`/tags`, `/categories`, `/posts`) linked directly into Schema.org `CollectionPage` structured data and `sitemap.xml`.

---

## 3. PHASE F19.0 ARCHITECTURAL SPECIFICATION

### 3.1 Problem Definition
- **Current Limitation**: Users exploring the platform via the primary sidebar find dead-ends on `/posts`, `/categories`, and `/tags`. Furthermore, there is no centralized index to browse all market tags by popularity, view sectoral categories with analytical descriptions, or explore complete research archives with advanced sorting.
- **Affected Personas**: All public readers, search engine crawlers, and institutional analysts seeking topical research.
- **Solution**: Implement 3 high-performance directory hubs:
  1. `/tags`: **Market Taxonomy & Tag Cloud Hub** — complete searchable index of all market tags with real usage counts and direct links to `/tags/[slug]`.
  2. `/categories`: **Financial Sectors & Research Categories Hub** — segmented by `COMMUNITY` (Sector Analyses, Macro, Equity Research) and `SERIES` (Valuation Curriculums, Fixed Income).
  3. `/posts`: **Public Research Archives & Master Explorer** — full-featured research catalog with multi-facet category/tag filtering, layout grid, and sorting (publishedAt, views, createdAt).

---

### 3.2 System & Data Architecture Flow

```
User / Crawler
   │
   ├──► /tags (app/tags/page.tsx)
   │      │
   │      ├── <TagsDirectoryView /> ──► Query: queryKeys.tags.list('', 100)
   │      │     ├── Search input (instant client filtering)
   │      │     ├── Popular / Trending Tags Cloud
   │      │     └── Alphabetical Taxonomy Index
   │      │
   │      └── SEO: Schema.org CollectionPage + Breadcrumbs
   │
   ├──► /categories (app/categories/page.tsx)
   │      │
   │      ├── <CategoriesDirectoryView /> ──► Query: queryKeys.categories.all()
   │      │     ├── Community Research Sectors Grid
   │      │     └── Educational Curriculum Tracks Grid
   │      │
   │      └── SEO: Schema.org CollectionPage + Breadcrumbs
   │
   └──► /posts (app/posts/page.tsx)
          │
          ├── <PostsExplorerView /> ──► Query: queryKeys.posts.feed(params)
          │     ├── Multi-facet filter header (Content Type, Category, Sort)
          │     ├── Grid / List analytical post stream
          │     └── Pagination controls
          │
          └── SEO: Schema.org CollectionPage + Breadcrumbs
```

---

### 3.3 Route Architecture & SEO Strategy

| Route | Purpose | Access | Indexable | Canonical URL | JSON-LD Schema |
|---|---|---|---|---|---|
| `/tags` | Market Taxonomy & Tag Cloud Hub | Public | `index, follow` | `https://financepulse.community/tags` | `CollectionPage`, `BreadcrumbList` |
| `/categories` | Sectors & Curriculum Directory | Public | `index, follow` | `https://financepulse.community/categories` | `CollectionPage`, `BreadcrumbList` |
| `/posts` | Master Research Explorer & Archives | Public | `index, follow` | `https://financepulse.community/posts` | `CollectionPage`, `BreadcrumbList` |

---

### 3.4 Component Architecture

1. **Tags Hub**:
   - `apps/web/app/tags/page.tsx`: Server Component entry with `buildPageMetadata({ title: 'Market Taxonomy & Research Tags', canonicalPath: '/tags' })`.
   - `apps/web/components/tags/TagsDirectoryView.tsx`: Client container with search filter, trending tags cloud, and alphabetical groups.
   - `apps/web/components/tags/TagCard.tsx`: Individual tag pill/card displaying name, hashtag, and usage count badge.
2. **Categories Hub**:
   - `apps/web/app/categories/page.tsx`: Server Component entry with `buildPageMetadata({ title: 'Research Categories & Financial Sectors', canonicalPath: '/categories' })`.
   - `apps/web/components/categories/CategoriesDirectoryView.tsx`: Grouped overview of Community sectors and Educational Series tracks.
   - `apps/web/components/categories/CategoryCard.tsx`: Sector card with icon, description, scope badge, and link to filtered feed.
3. **Master Research Explorer**:
   - `apps/web/app/posts/page.tsx`: Server Component entry with `buildPageMetadata({ title: 'Research Archives & Analyses Explorer', canonicalPath: '/posts' })`.
   - `apps/web/components/posts/PostsExplorerView.tsx`: Multi-facet explorer coordinating contentType switch, category dropdown, sort options, and post feed.
   - `apps/web/components/posts/PostsExplorerHeader.tsx`: Filter bar with search jump and active filter reset.
4. **Sitemap Extension**:
   - Update `apps/web/app/sitemap.ts` to include static entries for `/posts`, `/categories`, and `/tags`.

---

## 4. QUERY & CACHE ARCHITECTURE

- **Query Keys Reused**:
  - `queryKeys.tags.list(search, limit)`
  - `queryKeys.categories.all()`
  - `queryKeys.posts.feed(params)`
- **Stale Times**:
  - Categories: 10 minutes (`staleTime: 10 * 60 * 1000`)
  - Tags directory: 5 minutes (`staleTime: 5 * 60 * 1000`)
  - Posts explorer: 60 seconds (`staleTime: 60 * 1000`)

---

## 5. SECURITY & ACCESSIBILITY

- **Security / XSS**: All tag and category names/descriptions rendered via React JSX text interpolation. Zero `dangerouslySetInnerHTML`.
- **Accessibility (WAI-ARIA)**:
  - Search inputs labeled with `aria-label="Filter market tags"`.
  - Grouped alphabetical sections use semantic `<section>` and `aria-labelledby`.
  - Filter dropdowns support keyboard navigation.
  - Skeletons use `aria-busy="true"` and `aria-label="Loading directory"`.

---

## 6. FILE-LEVEL IMPLEMENTATION BLUEPRINT

### NEW FILES (10 Total)

| # | File | Purpose | Dependencies | Risk |
|---|---|---|---|---|
| 1 | `apps/web/app/tags/page.tsx` | Route page for `/tags` with SEO metadata and JSON-LD | `components/tags/TagsDirectoryView.tsx` | LOW |
| 2 | `apps/web/components/tags/TagsDirectoryView.tsx` | Searchable tag directory with alphabetical grouping | `lib/search/use-search.ts` | LOW |
| 3 | `apps/web/components/tags/TagCard.tsx` | Card displaying tag name, usage count, and link | `types/content.ts` | LOW |
| 4 | `apps/web/app/categories/page.tsx` | Route page for `/categories` with SEO metadata and JSON-LD | `components/categories/CategoriesDirectoryView.tsx` | LOW |
| 5 | `apps/web/components/categories/CategoriesDirectoryView.tsx` | Overview of Community & Series categories | `lib/posts/posts-service.ts` | LOW |
| 6 | `apps/web/components/categories/CategoryCard.tsx` | Sector card with icon, description, and link | `types/content.ts` | LOW |
| 7 | `apps/web/app/posts/page.tsx` | Route page for `/posts` master explorer with SEO metadata | `components/posts/PostsExplorerView.tsx` | LOW |
| 8 | `apps/web/components/posts/PostsExplorerView.tsx` | Master explorer with multi-facet filter bar and feed | `lib/posts/use-posts-feed.ts` | LOW |
| 9 | `apps/web/components/posts/PostsExplorerHeader.tsx` | Filter header with content type, category, and sorting | `types/content.ts` | LOW |
| 10 | `apps/web/components/tags/TagsSkeleton.tsx` | Loading skeleton for tag and category directories | `components/ui/Skeleton.tsx` | LOW |

### MODIFIED FILES (1 Total)

| # | File | Modification | Reason | Risk |
|---|---|---|---|---|
| 1 | `apps/web/app/sitemap.ts` | Add `/tags`, `/categories`, and `/posts` to core static routes | Ensure search engine indexation of new directories | LOW |

---

## 7. TESTING STRATEGY

New unit and component test suites under `apps/web/tests/directories/`:

1. `apps/web/tests/directories/TagsDirectoryView.test.tsx` (~4 tests):
   - Renders tag list, search filter, and popular tags section.
   - Filters tags dynamically by search input.
   - Handles empty search result and loading skeleton.
2. `apps/web/tests/directories/CategoriesDirectoryView.test.tsx` (~3 tests):
   - Renders Community and Series category groupings.
   - Links each category to filtered feed URL.
3. `apps/web/tests/directories/PostsExplorerView.test.tsx` (~4 tests):
   - Renders post stream with multi-facet filter controls.
   - Updates feed query on category/sort change.
   - Handles pagination controls and empty states.
4. `apps/web/tests/directories/TagCard.test.tsx` (~2 tests):
   - Renders tag name, formatted usage count, and valid link to `/tags/[slug]`.

**Estimated Test Increase**: +13 new tests across 4 new test files (Total: ~263 tests across 89 test files).

---

## 8. IMPLEMENTATION SEQUENCE

```
Step 1: Implement Tags Directory components & route (TagCard, TagsSkeleton, TagsDirectoryView, app/tags/page.tsx)
Step 2: Implement Categories Directory components & route (CategoryCard, CategoriesDirectoryView, app/categories/page.tsx)
Step 3: Implement Master Posts Explorer components & route (PostsExplorerHeader, PostsExplorerView, app/posts/page.tsx)
Step 4: Update sitemap.ts with /tags, /categories, /posts entries
Step 5: Implement test suites (tests/directories/*)
Step 6: Run TypeScript typecheck (npx tsc --noEmit)
Step 7: Run full test suite regression check (npx vitest run)
Step 8: Run production build verification (npx next build)
```

---

## 9. ACCEPTANCE CRITERIA

1. **Route Resolution**:
   - `/tags`, `/categories`, and `/posts` render fully interactive, responsive directories without 404 errors.
2. **SEO & Structured Data**:
   - All 3 routes include accurate Schema.org `CollectionPage` and `BreadcrumbList` JSON-LD via `<JsonLd />`.
   - All 3 routes are dynamically added to `sitemap.xml` with appropriate priority.
3. **Quality & Regressions**:
   - 100% of existing 250 tests pass (0 regressions on F2.1–F18.2).
   - ~13 new tests pass across 4 new directory test files.
   - `npx tsc --noEmit` completes with 0 errors.
   - `npx next build` generates 23 static/dynamic routes with exit code 0.
4. **Backend & DB Immutability**:
   - `apps/api` remains 100% untouched (0 modifications).
   - `DATABASE_SCHEMA.sql` remains 100% untouched (0 migrations).

---

## 10. RISK REGISTER

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Large Tag Count DOM Overhead** | Low | Low | Group tags alphabetically and paginate/limit query to top 100 tags. |
| **Duplicate Query Key Collision** | Very Low | Low | Reuse verified TanStack `queryKeys.tags`, `queryKeys.categories`, and `queryKeys.posts`. |
| **Broken Breadcrumb URLs** | Very Low | Low | Enforce `buildCanonicalUrl()` in `generateBreadcrumbsJsonLd()`. |

---

# PHASE F19.0 STATUS

**READY FOR HUMAN APPROVAL**

- **Selected Feature**: Phase F19.1 — Taxonomy Hub, Market Directories & Content Archives Engine (`/tags`, `/categories`, `/posts`)
- **Backend Impact**: 0 files modified (100% existing API contract reuse)
- **Database Impact**: 0 migrations (100% existing schema support)
- **Estimated Test Increase**: +13 tests across 4 test suites (Total ~263 tests / 89 files)
- **Architecture Integrity**: F2.1 through F18.2 preserved with zero regressions.
