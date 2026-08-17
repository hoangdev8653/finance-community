# PHASE F4.0 — PUBLIC FEED & DISCOVERY PRE-IMPLEMENTATION PLAN

**Target**: Next.js App Router Public Feed, Discovery Architecture, Filtering & Pagination (`apps/web`)  
**Phase**: F4.0  
**Mode**: STRICT READ-ONLY — PLANNING ONLY  
**Date**: 2026-08-15  
**Author**: Senior Staff Frontend Architect & Data Architecture Lead  
**Status**: PLANNING COMPLETE — READY FOR REVIEW  

---

## 1. Executive Summary

This document establishes the comprehensive, implementation-ready architectural plan for **Phase F4 — Public Feed & Discovery** for the Finance Community Platform (`apps/web`).

Phase F4 connects the Frontend App Shell (established in F2) and Authentication Context (completed in F3) to the verified **NestJS Posts, Categories, and Tags REST APIs** (`apps/api`). The objective is to deliver an information-dense, high-credibility editorial discovery experience adhering to the **EDITORIAL FINANCIAL PRECISION** design language.

The plan defines:
- Typed API client services for post feed pagination, categories listing, and tag searches.
- TanStack Query v5 cache management with deterministic query keys.
- Hybrid pagination strategy (cursor/offset pagination with load more and URL synchronization).
- Editorial `PostCard`, `FeedList`, `CategoryFilterBar`, and `TagSelector` components.
- Complete separation of public discovery from future post reading (F5), comment/reaction interactions (F6), and author profiles (F7).

---

## 2. Repository Discovery

A source-level inspection of the repository confirms:
- **`apps/api/src/modules/posts`**:
  - `GET /api/v1/posts`: Public paginated feed endpoint accepting `QueryPostsDto` (`contentType`, `categoryId`, `tagId`, `authorId`, `status`, `page`, `limit`, `sortBy`, `order`).
  - `GET /api/v1/posts/:contentType/:slug`: Published post detail endpoint.
- **`apps/api/src/modules/categories`**:
  - `GET /api/v1/categories`: Public categories list endpoint with optional `scope` filter (`SERIES` | `COMMUNITY`).
  - `GET /api/v1/categories/:id`: Category detail endpoint.
- **`apps/api/src/modules/tags`**:
  - `GET /api/v1/tags`: Public tag search endpoint accepting `search` and `limit`.
  - `GET /api/v1/tags/:id`: Tag detail endpoint.
- **`apps/web`**:
  - Phase F2 App Shell & UI Foundation (15 UI primitives, 3 feedback states, responsive 12-column grid).
  - Phase F3 Authentication & Identity (in-memory token store, AuthContext, login/register routes, UserMenu).
  - Vitest test suite passing 36/36 tests with 0 TypeScript errors.

---

## 3. Existing Frontend Architecture Baseline

- **App Router Shell**: `app/layout.tsx` mounts `ThemeProvider` -> `QueryProvider` -> `AuthProvider` -> `ToastProvider` -> `Header` -> `children` -> `MobileNavigation`.
- **Query Foundation**: `lib/query/QueryProvider.tsx` sets `staleTime: 5 mins`, `gcTime: 30 mins`.
- **API Engine**: `lib/api/client.ts` Axios instance with Bearer token injection and NestJS error normalization.
- **UI & Feedback Primitives**: `Skeleton`, `Spinner`, `LoadingState`, `EmptyState`, `ErrorState`, `Badge`, `Avatar`, `Button`, `Divider`.

---

## 4. Existing Backend Contract Verification

### 4.1 Posts API Contract (`apps/api/src/modules/posts/controllers/posts.controller.ts`)

| Endpoint | Method | DTO / Query Params | Verified Backend Response Shape | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/posts` | `GET` | `QueryPostsDto`:<br>• `contentType?: 'SERIES' \| 'COMMUNITY'`<br>• `categoryId?: UUID`<br>• `tagId?: UUID`<br>• `authorId?: UUID`<br>• `status?: 'PUBLISHED'`<br>• `page?: number` (default 1)<br>• `limit?: number` (default 20, max 100)<br>• `sortBy?: 'publishedAt' \| 'createdAt'`<br>• `order?: 'ASC' \| 'DESC'` | `PaginatedResult<PostEntity>`:<br>`{ data: PostEntity[], meta: { page, limit, totalItems, totalPages, hasNextPage, hasPreviousPage } }` | `200 OK` |
| `/api/v1/posts/:contentType/:slug` | `GET` | `contentType: string`, `slug: string` | `PostDetailResponse`: `PostEntity & { tags: Tag[], media: Media[] }` | `200 OK`, `404 Not Found` |

### 4.2 Categories & Tags API Contract

| Endpoint | Method | Query Params | Verified Backend Response Shape | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/categories` | `GET` | `scope?: 'SERIES' \| 'COMMUNITY'` | `CategoryEntity[]`:<br>`Array<{ id, name, slug, description, scope, icon, sortOrder, createdAt }>` | `200 OK` |
| `/api/v1/categories/:id` | `GET` | `id: UUID` | `CategoryEntity` | `200 OK`, `404 Not Found` |
| `/api/v1/tags` | `GET` | `search?: string`, `limit?: number` | `TagEntity[]`:<br>`Array<{ id, name, slug, usageCount, createdAt }>` | `200 OK` |
| `/api/v1/tags/:id` | `GET` | `id: UUID` | `TagEntity` | `200 OK`, `404 Not Found` |

---

## 5. Relevant Database Contract Verification

From `docs/DATABASE_SCHEMA.sql` and Drizzle schema:
- **`posts` table**: `id`, `author_id`, `content_type`, `title`, `slug`, `body`, `cover_media_id`, `category_id`, `status` (`DRAFT`, `PUBLISHED`, `ARCHIVED`, `HIDDEN`), `meta_title`, `meta_description`, `view_count`, `published_at`, `created_at`, `updated_at`, `deleted_at`.
- **`categories` table**: `id`, `name`, `slug`, `description`, `scope`, `icon`, `sort_order`, `created_at`.
- **`tags` table**: `id`, `name`, `slug`, `usage_count`, `created_at`.
- **`media` table**: `id`, `uploader_id`, `public_id`, `secure_url`, `format`, `resource_type`, `bytes`, `folder`, `purpose`.

---

## 6. Public Feed Architecture

```
                                    [ Public Feed Page (app/page.tsx) ]
                                                   │
                  ┌────────────────────────────────┼────────────────────────────────┐
                  ▼                                ▼                                ▼
       [ CategoryFilterBar ]               [ FeedTabs & Sorter ]             [ TagSelectorBar ]
       (scope: COMMUNITY/ALL)              (Latest vs Popular)              (Filter by tagId)
                  └────────────────────────────────┬────────────────────────────────┘
                                                   │
                                                   ▼
                                       [ usePostsFeed Query Hook ]
                                      (TanStack Query v5 Infinite)
                                                   │
                                                   ▼
                                           [ FeedListView ]
                                                   │
                         ┌─────────────────────────┴─────────────────────────┐
                         ▼                                                   ▼
                 [ PostCard List ]                                    [ Pagination ]
         - Cover image / fallback thumbnail                     - "Load More Articles" button
         - Title (Newsreader Serif)                             - Meta total count indicator
         - Excerpt / metaDescription
         - Author, Category, Date, Views
```

---

## 7. Feed Data Flow

1. **Client Mounts Feed Page**:
   - `useSearchParams()` reads active filters (`category`, `tag`, `sort`, `type`, `page`).
   - TanStack Query initiates `usePostsFeed({ categoryId, tagId, sortBy, order, page, limit })`.
2. **Network Execution**:
   - Axios client calls `GET /api/v1/posts?status=PUBLISHED&...`.
   - If user is authenticated, Bearer token is automatically attached for personalized metadata. If anonymous, request executes publicly without credentials.
3. **Data Hydration & Rendering**:
   - Returns `PaginatedResult<PostEntity>`.
   - Maps items to `<PostCard />`.
   - Renders category badges, publication dates, author metadata, and view counters.
4. **Filter & Sort Interaction**:
   - User clicks category pill or sort tab -> Updates URL query string -> TanStack Query fetches filtered page with cached stale-while-revalidate strategy.

---

## 8. API Service Architecture (`apps/web/lib/posts/posts-service.ts`)

```typescript
export interface PostsFeedParams {
  contentType?: 'SERIES' | 'COMMUNITY';
  categoryId?: string;
  tagId?: string;
  authorId?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: 'publishedAt' | 'createdAt';
  order?: 'ASC' | 'DESC';
}

export const postsService = {
  getFeed: async (params?: PostsFeedParams): Promise<PaginatedResult<PostEntity>> => {
    const response = await apiClient.get<PaginatedResult<PostEntity>>('/posts', { params });
    return response.data;
  },

  getCategories: async (scope?: 'SERIES' | 'COMMUNITY'): Promise<CategoryEntity[]> => {
    const response = await apiClient.get<CategoryEntity[]>('/categories', {
      params: scope ? { scope } : undefined,
    });
    return response.data;
  },

  getTags: async (search?: string, limit?: number): Promise<TagEntity[]> => {
    const response = await apiClient.get<TagEntity[]>('/tags', {
      params: { search, limit },
    });
    return response.data;
  },
};
```

---

## 9. TanStack Query & Caching Strategy

Deterministic query keys registered in `lib/query/keys.ts`:
- `queryKeys.posts.list(params)`: `['posts', 'list', params]`
- `queryKeys.categories.list(scope)`: `['categories', 'list', scope]`
- `queryKeys.tags.list(params)`: `['tags', 'list', params]`

### Cache Parameters
- `staleTime`: **2 minutes** for public feeds (ensures timely view counts and newly published posts).
- `staleTime`: **15 minutes** for categories and tags (static taxonomies).
- `gcTime`: **30 minutes**.

---

## 10. Pagination Strategy

- Backend exposes standard offset pagination: `{ page, limit, totalItems, totalPages, hasNextPage, hasPreviousPage }`.
- Frontend adopts a **"Load More" button with Infinite Query support** (`useInfiniteQuery`):
  - Fetches page 1 on initial load (`limit: 10`).
  - Clicking *"Load More Articles"* appends page `n + 1` seamlessly.
  - If JavaScript is disabled or direct page navigation is preferred, URL parameter `?page=2` supports direct page indexing.

---

## 11. URL / Query Parameter Strategy

The feed state synchronizes directly with URL search parameters:
- `?category=<categoryId>`: Filter by specific sector / category.
- `?tag=<tagId>`: Filter by topic tag (e.g. `$AAPL`, `MACRO`, `VALUE`).
- `?sort=latest` (`sortBy=publishedAt&order=DESC`): Default feed sorting.
- `?sort=popular` (`sortBy=createdAt&order=DESC`): High-interest feeds.
- `?type=COMMUNITY` | `SERIES`: Content type segregation.

---

## 12. Post Card Architecture (`components/content/PostCard.tsx`)

Following **EDITORIAL FINANCIAL PRECISION**:
- **Typography**:
  - Title: `Newsreader` font (`font-serif font-bold text-xl leading-snug group-hover:text-primary transition-colors`).
  - Excerpt: `Inter` font (`text-sm text-muted-foreground line-clamp-2 leading-relaxed`).
  - Metadata: `JetBrains Mono` font (`text-xs text-muted-foreground`).
- **Visual Container**:
  - Crisp border (`border border-border bg-surface rounded-lg p-5 hover:border-primary/40 transition-all`).
  - Flat design with zero heavy drop shadows.
  - Cover Image: Aspect-ratio `16:9` or `4:3` with subtle border and fallback gradient badge.
- **Metadata Elements**:
  - Category Badge (`Badge variant="secondary"`).
  - Author Avatar & Display Name.
  - Publication Date (formatted e.g. *"Aug 15, 2026"*).
  - View Count indicator (`Eye` icon with count formatted in `JetBrains Mono`).

---

## 13. Category Filtering Architecture (`components/content/CategoryFilterBar.tsx`)

- Horizontal scrollable pill bar displaying:
  - *"All Topics"* (resets filter).
  - List of categories fetched via `useQuery(queryKeys.categories.list())`.
- Active State: `bg-primary text-primary-foreground font-semibold`.
- Inactive State: `bg-surface border border-border text-foreground hover:bg-muted`.

---

## 14. Tag Filtering Architecture (`components/content/TagFilterBar.tsx`)

- Compact badge bar rendering top market tags (`$NVDA`, `Macro`, `Fixed Income`, `Crypto/CBDC`).
- Clicking a tag filters the feed via `?tag=<tagId>`.
- Active tag displays a dismissable *"×"* button to reset.

---

## 15. Search Architecture

- **Backend Status**: Backend tags module supports `GET /api/v1/tags?search=...`. Direct full-text post search is not a dedicated backend endpoint in Phase 3.2 (search is accomplished via taxonomy tags and categories).
- **Frontend Behavior**: Header search bar acts as a **Taxonomy Tag & Category Search Trigger**. Typing in search filters tags or highlights categories rather than inventing a non-existent `/posts/search` endpoint.

---

## 16. Anonymous vs Authenticated Behavior

- **Anonymous Visitors**: Can view all published posts, filter by categories/tags, switch sort order, and read post previews without restriction.
- **Authenticated Members**: Same feed view, but Header displays `UserMenu` with avatar, and post action buttons (bookmarks/reactions) link to authenticated handlers in Phase F6.

---

## 17. Loading / Empty / Error States

- **Loading State**: Renders 4 `PostCardSkeleton` cards with pulsing header, avatar, and content line skeletons.
- **Empty State**: Renders `EmptyState` component with dashed border:
  - *"No published analyses found for the selected category/tag."*
  - CTA button: *"Reset Filters"*.
- **Error State**: Renders `ErrorState` component with retry button:
  - *"Unable to load feed content. Please check connection and try again."*

---

## 18. Responsive Behavior

- **Desktop (>=1024px)**: 3-column editorial grid. Feed list occupies 6 columns (`680px`), Sidebar on left (`260px`), Editorial widget on right (`320px`).
- **Tablet (768px - 1023px)**: 2-column layout (Sidebar collapsed to drawer, Feed occupies full width).
- **Mobile (<768px)**: 1-column layout with horizontal scroll category bar, compact card padding, and bottom navigation.

---

## 19. Accessibility Requirements (WCAG 2.2 AA)

- Semantic `<article>` tags for each post card in the feed.
- Headings structured hierarchically (`<h2>` for post titles inside `<article>`).
- Category and tag filters use accessible `<button>` elements with `aria-pressed` indicating active state.
- Keyboard navigation: Full tab order across post cards and filter pills.
- Contrast ratio: `4.5:1` minimum for body text and `3:1` for badges and metadata.

---

## 20. SEO Requirements

- Page metadata on `/` and `/posts`:
  - Title: `Market Insights & Editorial Analysis | Finance Pulse`.
  - Meta description: `Discover deep financial analysis, macroeconomic research, and community-driven investment thesis.`
  - Canonical URL: `https://financepulse.community`.
  - OpenGraph / Twitter cards.
  - Semantic JSON-LD schema for `ItemList` structured data.

---

## 21. Security Considerations

- **XSS Defense**: Post titles, excerpts, and author display names are rendered through React text nodes with automatic HTML entity encoding.
- **Safe URLs**: Post links use validated slug routes `/posts/${contentType}/${slug}`.
- **Authoritative Status**: Feed only displays posts where `status === 'PUBLISHED'`. Backend repository enforces `isNull(postsTable.deletedAt)`.

---

## 22. Target Component Architecture for Phase F4

```
apps/web/
├── components/
│   └── content/
│       ├── PostCard.tsx                  # Editorial Post Card primitive
│       ├── PostCardSkeleton.tsx          # Skeleton loading placeholder
│       ├── FeedList.tsx                  # Feed items wrapper with load more
│       ├── CategoryFilterBar.tsx         # Category selector pill bar
│       ├── TagFilterBar.tsx              # Market tags selector bar
│       └── FeedSorter.tsx                # Latest / Popular sort tabs
│
├── lib/
│   └── posts/
│       ├── posts-service.ts              # Typed API calls (posts, categories, tags)
│       └── use-posts-feed.ts             # TanStack Query feed hook
│
├── types/
│   └── content.ts                        # PostEntity, CategoryEntity, TagEntity DTO types
│
└── tests/
    ├── content/
    │   ├── PostCard.test.tsx             # Unit tests for PostCard rendering & accessibility
    │   ├── CategoryFilterBar.test.tsx    # Unit tests for CategoryFilterBar selection
    │   └── FeedList.test.tsx             # Unit tests for FeedList empty/loading/data states
    └── posts/
        └── posts-service.test.ts         # Unit tests for postsService API calls
```

---

## 23. Type Architecture (`apps/web/types/content.ts`)

```typescript
export interface PostEntity {
  id: string;
  authorId: string;
  contentType: 'SERIES' | 'COMMUNITY';
  title: string;
  slug: string;
  body: string | null;
  coverMediaId: string | null;
  categoryId: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'HIDDEN';
  metaTitle: string | null;
  metaDescription: string | null;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryEntity {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  scope: 'SERIES' | 'COMMUNITY';
  icon: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface TagEntity {
  id: string;
  name: string;
  slug: string;
  usageCount: number;
  createdAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
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

---

## 24. Test Architecture

Vitest & React Testing Library test suite for Phase F4:
1. `posts-service.test.ts`: Verifies `postsService.getFeed()`, `getCategories()`, and `getTags()` request URLs and parameters.
2. `PostCard.test.tsx`: Verifies title, category badge, publication date, view counter, and clickable slug link.
3. `CategoryFilterBar.test.tsx`: Verifies category pill rendering, active selection, and filter callbacks.
4. `FeedList.test.tsx`: Verifies loading skeleton display, empty state on empty array, and post list rendering.

---

## 25. Implementation Sequence

1. **Types**: Create `apps/web/types/content.ts`.
2. **API Service**: Create `apps/web/lib/posts/posts-service.ts`.
3. **Query Hook**: Create `apps/web/lib/posts/use-posts-feed.ts` using TanStack Query.
4. **Content Primitives**:
   - Create `apps/web/components/content/PostCardSkeleton.tsx`.
   - Create `apps/web/components/content/PostCard.tsx`.
   - Create `apps/web/components/content/CategoryFilterBar.tsx`.
   - Create `apps/web/components/content/TagFilterBar.tsx`.
   - Create `apps/web/components/content/FeedSorter.tsx`.
   - Create `apps/web/components/content/FeedList.tsx`.
5. **Page Assembly**: Update `apps/web/app/page.tsx` to render the interactive, filterable public feed.
6. **Tests**: Write and run Vitest tests in `apps/web/tests/content/` and `apps/web/tests/posts/`.
7. **Validation**: Execute `npm run test`, `npm run typecheck`, and `npm run build`.

---

## 26. Explicit Non-Scope for Phase F4

- ❌ Post Detail reader page & markdown body rendering (Phase F5)
- ❌ Educational Series detail page (Phase F5)
- ❌ Comments & threaded discussion (Phase F6)
- ❌ Reactions (Like/Bookmark toggling) (Phase F6)
- ❌ Public author profile page & follow action (Phase F7)
- ❌ Notifications center (Phase F8)
- ❌ Post creation & rich text editor (Phase F9)
- ❌ Moderation queue & Admin dashboard (Phases F10 & F11)
- ❌ Backend source modifications or database migrations

---

## 27. Risks & Architectural Decisions

- **Risk 1 (Taxonomy Mismatches)**:  
  *Decision*: Posts category scope matches `contentType` (`COMMUNITY` vs `SERIES`). `CategoryFilterBar` passes scope filter.
- **Risk 2 (Slug Navigation)**:  
  *Decision*: Post card links strictly use `/posts/${post.contentType}/${post.slug}` as required by the approved backend route `GET /api/v1/posts/:contentType/:slug`.

---

## 28. Acceptance Checklist for Phase F4

- [ ] `postsService` calls `GET /api/v1/posts` with exact `QueryPostsDto` parameters
- [ ] `postsService` calls `GET /api/v1/categories` and `GET /api/v1/tags`
- [ ] `PostCard` renders editorial typography (`Newsreader` title), category badge, date, and views
- [ ] `PostCard` links to `/posts/:contentType/:slug`
- [ ] `CategoryFilterBar` filters feed by category ID
- [ ] `TagFilterBar` filters feed by tag ID
- [ ] `FeedSorter` switches between latest and popular sorts
- [ ] `PostCardSkeleton` renders during query loading
- [ ] `EmptyState` renders when no posts match filters
- [ ] Responsive 12-column desktop and single-column mobile layout functional
- [ ] WCAG 2.2 AA accessibility verified
- [ ] Zero fake production data (renders live API or clean empty/loading states)
- [ ] Zero backend source files, database schemas, or migrations modified
- [ ] Vitest unit tests pass cleanly
- [ ] `npm run typecheck` passes with 0 errors
- [ ] `npm run build` succeeds cleanly

---

## 29. Human Approval Gate

```text
============================================================
PHASE F4.0 — HUMAN APPROVAL GATE
============================================================

Planning: COMPLETE
Repository Inspection: COMPLETE
Backend Contract Verification: COMPLETE
Database Contract Verification: COMPLETE

Source Code Changes: 0
Backend Changes: 0
Database Changes: 0
Migrations: 0

Status:
READY FOR FINAL HUMAN RE-AUDIT

STOP — DO NOT IMPLEMENT CODE.
============================================================
```
