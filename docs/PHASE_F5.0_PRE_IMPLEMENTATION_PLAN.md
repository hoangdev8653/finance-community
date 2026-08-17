# PHASE F5.0 — POST DETAIL & EDUCATIONAL SERIES READER PRE-IMPLEMENTATION PLAN

**Target**: Next.js App Router Post Detail Page, Series Reader, Content Rendering, Media & SEO (`apps/web`)  
**Phase**: F5.0  
**Mode**: STRICT READ-ONLY — PLANNING ONLY  
**Date**: 2026-08-15  
**Author**: Senior Staff Frontend Architect, Editorial Experience Lead & Application Security Engineer  
**Status**: PLANNING COMPLETE — READY FOR FINAL RE-AUDIT  

---

## 1. Executive Summary

This document establishes the authoritative, implementation-ready architectural plan for **Phase F5 — Post Detail & Educational Series Reader** for the Finance Community Platform (`apps/web`).

Phase F5 builds the core content reading experience, transitioning visitors from the public discovery feed (Phase F4) into an immersive, distraction-free **EDITORIAL FINANCIAL PRECISION** reading environment for both **Community Analyses** and **Educational Series**.

Key architectural pillars defined in this plan:
1. **Verified Contract Alignment**: Exact matching with `GET /api/v1/posts/:contentType/:slug`, consuming `PostDetailResponse` (`PostEntity & { tags: Tag[], media: Media[] }`).
2. **Safe Content Rendering Architecture**: Secure, styled rendering of the backend's sanitized rich text HTML with financial editorial typography tokens (`Newsreader` serif headers, `Inter` body, `JetBrains Mono` code/tabular callouts).
3. **Dedicated Presentation Modes**:
   - **Community Post**: Single-author research note format with sector badges, author attribution, reading time estimate, and tags bar.
   - **Educational Series Reader**: Curated curriculum format with series progress indicators and structured takeaway callouts.
4. **Cover Media Presentation**: Cloudinary `secureUrl` rendering with responsive aspect ratio containment and graceful fallback states.
5. **Dynamic SEO & Social Graph**: App Router `generateMetadata()` generating canonical URLs, OpenGraph article tags, and semantic JSON-LD `NewsArticle` / `Article` schema.
6. **Strict Security & Boundaries**: 0 XSS vulnerabilities, safe external link handling (`rel="noopener noreferrer"`), and clean separation from future comments/reactions (Phase F6).

---

## 2. Repository Discovery

A source-level inspection of the repository confirms:
- **`apps/api/src/modules/posts`**:
  - `GET /api/v1/posts/:contentType/:slug`: Returns `PostDetailResponse`. Requires `status === 'PUBLISHED'` and `deletedAt IS NULL`. Returns `404 Not Found` if unpublished, hidden, or non-existent. Asynchronously increments `viewCount` in backend repository.
  - `contentType` parameter in PostgreSQL is case-sensitive (`'COMMUNITY'` or `'SERIES'`).
- **`apps/api/src/common/utils/sanitizer.util.ts`**:
  - `SanitizerUtil.sanitizeRichText`: Sanitizes HTML using strict tag allowlists (`p`, `h1`-`h6`, `blockquote`, `code`, `pre`, `ul`, `ol`, `li`, `a`, `span`, `div`), safe attributes, and safe schemes (`http`, `https`, `mailto`), stripping script tags, event handlers, and protocol-relative links.
- **`apps/api/src/database/repositories/post-media.repository.ts`**:
  - Joins `mediaTable` on `post_media` to return `{ id, secureUrl, purpose, sortOrder }[]`.
- **`apps/web`**:
  - Phase F2 App Shell & UI Foundation (Design tokens, UI primitives, Feedback states).
  - Phase F3.1 Authentication & Identity (In-memory token store, AuthContext, UserMenu).
  - Phase F4.1 Public Feed & Discovery (FeedList, PostCard, CategoryFilterBar, TagFilterBar).

---

## 3. Existing Frontend Architecture Baseline

- **Shell Architecture**: `Header` with dynamic `UserMenu` / Sign In triggers, responsive layout wrappers.
- **API Engine**: `apps/web/lib/api/client.ts` automatically attaches Bearer tokens when available and normalizes errors.
- **Query Infrastructure**: `@tanstack/react-query@5.101.4` with `staleTime: 5 mins` and `queryKeys.posts.detail(contentType, slug)`.
- **Feedback & UI Primitives**: `LoadingState`, `ErrorState`, `EmptyState`, `Badge`, `Avatar`, `Button`, `Divider`, `Skeleton`.

---

## 4. Backend Contract Verification

### Endpoint: `GET /api/v1/posts/:contentType/:slug`

- **Controller**: `PostsController.getPostBySlug(contentType, slug)`
- **Service**: `PostsService.getPostBySlug(contentType, slug)`
- **Authentication**: **Public** (No Bearer token required, but accepts Bearer token via Axios interceptors if visitor is logged in).
- **Status Lifecycle Enforcement**: Backend enforces `post.status === 'PUBLISHED'`. If `status` is `'DRAFT'`, `'ARCHIVED'`, `'HIDDEN'`, or `deletedAt IS NOT NULL`, backend throws `404 NotFoundException` (`code: 'POST_NOT_FOUND'`).
- **View Count**: Backend asynchronously fires `incrementViewCountTx(id)` on successful read without blocking response latency.

---

## 5. Database Contract Verification

From `posts.schema.ts`, `media.schema.ts`, `tags.schema.ts`, `post_tags.schema.ts`, `post_media.schema.ts`:
- **Unique Constraint**: `unique('uq_posts_content_type_slug').on(table.contentType, table.slug)`.
- **Relations resolved in single endpoint**:
  - `tags`: Joined via `post_tags` -> `tagsTable` (`id`, `name`, `slug`).
  - `media`: Joined via `post_media` -> `mediaTable` (`id`, `secureUrl`, `purpose`, `sortOrder`).

---

## 6. Exact Post Detail Response Contract

Verified from `apps/api/src/modules/posts/services/posts.service.ts`:

```typescript
export interface PostMediaItem {
  id: string;
  secureUrl: string;
  purpose: string;
  sortOrder: number;
}

export interface PostTagItem {
  id: string;
  name: string;
  slug: string;
}

export interface PostDetailResponse {
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
  deletedAt: string | null;
  tags: PostTagItem[];
  media: PostMediaItem[];
}
```

---

## 7. Routing Architecture

### Route Hierarchy:
- `apps/web/app/posts/[contentType]/[slug]/page.tsx`

### Parameter Contract & Normalization:
- Clean, SEO-friendly lowercase URL in browser:
  - Community: `/posts/community/us-treasury-yield-curve-analysis`
  - Series: `/posts/series/financial-valuation-masterclass-part-1`
- Route param `params.contentType` is normalized to uppercase (`COMMUNITY` | `SERIES`) when invoking `postsService.getBySlug(contentType.toUpperCase(), slug)`.
- If `params.contentType` is not `community` or `series`, triggers Next.js `notFound()`.

---

## 8. Community Post Architecture

Designed for deep-dive analytical notes:
- **Header Block**:
  - Breadcrumb: `Home` -> `Market Feed` -> `Post Title`.
  - Category Badge & Content Type Pill.
  - Article Headline (`font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight`).
  - Meta Description / Executive Summary callout box (`border-l-2 border-primary bg-muted/30 p-4 text-sm text-foreground/90 italic`).
  - Author Meta bar: Analyst ID badge, publication date, estimated reading time, and live view count.
- **Cover Media Container**: High-res Cloudinary asset with subtle rounded border.
- **Article Body**: Styled prose container (`max-w-3xl mx-auto`).
- **Footer Block**: Tags list (`#macro`, `#fixed-income`), publication audit timestamp.

---

## 9. Educational Series Reader Architecture

Designed for sequential, structured curricula:
- **Series Header Banner**:
  - Highlighted badge: `Educational Series`.
  - Visual Series Breadcrumb: `Home` -> `Educational Series` -> `Part Name`.
  - Series Takeaway Box: Structured summary emphasizing learning objectives.
- **Reader Layout**:
  - 2-column desktop layout (`lg:grid-cols-12`): Main reading column (9 cols) + Sticky reading navigation sidebar (3 cols).
  - Clean typographic hierarchy optimized for instructional step-by-step reading.

---

## 10. Content Rendering Architecture

- **Backend Source Format**: The backend `body` stores rich text HTML pre-sanitized with `sanitize-html`.
- **Rendering Strategy**:
  - `PostContentRenderer.tsx` component renders sanitized HTML within a dedicated CSS prose container (`prose prose-slate dark:prose-invert max-w-none`).
  - Strict typography rules:
    - Headings: `font-serif font-bold text-foreground` (`h2: text-2xl mt-8 mb-4`, `h3: text-xl mt-6 mb-3`).
    - Paragraphs: `text-foreground/90 text-base sm:text-lg leading-relaxed mb-6 font-sans`.
    - Blockquotes: `border-l-4 border-primary pl-4 italic text-muted-foreground my-6`.
    - Code / Tables: `font-mono text-sm bg-muted p-4 rounded-md overflow-x-auto`.
    - Lists: Ordered and unordered lists styled with custom bullet tokens.

---

## 11. Markdown / HTML / Rich Content Security

- **Multi-Tier Defense**:
  1. Backend Tier: `SanitizerUtil.sanitizeRichText` strips `<script>`, `<iframe>`, `object`, `embed`, inline event handlers (`onload`, `onclick`), and `javascript:` URIs.
  2. Frontend Rendering Tier: Content is rendered inside a bounded container with `rel="noopener noreferrer"` enforced on all anchor elements.
  3. Zero usage of `eval()`, `new Function()`, or dynamic client scripts.

---

## 12. Media Architecture

- **Cover Media Resolution**:
  - If `post.coverMediaId` is present, locate matching item in `post.media` where `item.id === post.coverMediaId` or `item.purpose === 'cover'`.
  - Fallback: Use first available item in `post.media` or clean gradient placeholder.
- **Cloudinary Security**:
  - Render strictly via `secureUrl` (HTTPS).
  - Configured Next.js Image domains: `res.cloudinary.com`.
- **Responsive Image Container**: Aspect ratio `16:9` or `21:9` with `object-cover` and `loading="eager"` for LCP optimization.

---

## 13. Data Fetching Architecture

- **Server-Side Rendering (SSR) & Dynamic Metadata**:
  - `app/posts/[contentType]/[slug]/page.tsx` fetches data server-side for initial HTML delivery and dynamic `generateMetadata()`.
  - Client component `PostDetailView` hydrates the TanStack Query cache (`queryKeys.posts.detail(contentType, slug)`) for instant client-side interactivity.

---

## 14. Server vs Client Component Boundaries

```
[ app/posts/[contentType]/[slug]/page.tsx ] (Server Component)
├── generateMetadata() -> Server-side fetch via postsService
└── Server Page Wrapper
    └── [ PostDetailView.tsx ] (Client Component)
        ├── PostHeader (Title, Author, Category, Date, Views)
        ├── PostCoverMedia (Cloudinary Image with fallback)
        ├── PostContentRenderer (Styled sanitized HTML body)
        ├── PostTagsList (Tag pill links)
        └── ReadingProgressBar (Scroll listener)
```

---

## 15. Caching & Revalidation

- TanStack Query `staleTime: 5 mins` for post details.
- Query key: `queryKeys.posts.detail(contentType, slug)` -> `['posts', 'detail', contentType, slug]`.
- Asynchronous view counter increments in backend on initial fetch.

---

## 16. Loading / Empty / Error / Not Found States

- **Loading State**: `PostDetailSkeleton` rendering breadcrumb, title skeleton, author meta skeleton, and paragraph block skeletons.
- **404 Not Found**: If backend returns `404` or post is not `PUBLISHED`, calls Next.js `notFound()`, rendering clean `not-found.tsx` editorial error page.
- **500 Server Error**: Renders `ErrorState` with retry button.

---

## 17. SEO Architecture

- **Dynamic Metadata (`generateMetadata`)**:
  - Title: `${post.metaTitle || post.title} | Finance Pulse`
  - Description: `${post.metaDescription || 'Read in-depth market intelligence on Finance Pulse.'}`
  - Canonical URL: `https://financepulse.community/posts/${contentType}/${slug}`
  - OpenGraph Article: `type: 'article'`, `publishedTime: post.publishedAt`, `modifiedTime: post.updatedAt`, `images: [coverUrl]`.
  - Twitter Card: `summary_large_image`.
- **Structured Data (JSON-LD)**:
  - Injects `schema.org/NewsArticle` / `schema.org/Article` structured metadata.

---

## 18. Accessibility Architecture (WCAG 2.2 AA)

- Semantic `<main>` and `<article>` landmark elements.
- Strict heading hierarchy (`<h1>` for title, `<h2>`/`<h3>` in content).
- High-contrast body text (`4.5:1` minimum).
- Clear keyboard focus indicators on all interactive tags and breadcrumb links.
- Screen-reader accessible dates using semantic `<time dateTime="...">`.

---

## 19. Responsive Reading Layout

- **Desktop (>=1024px)**: Focused reading column (`max-w-3xl`) with 16px/24px editorial gutters.
- **Mobile (<768px)**: Fluid reading width with 16px margins, 18px body font size, and 1.75 line height for optimal legibility.

---

## 20. Security Architecture

- **Token Security**: Post reader is public. Authenticated users send Bearer token automatically via Axios client; zero tokens are passed as URL parameters or logged.
- **Input Sanitization**: Content body rendered through vetted HTML typography container.

---

## 21. Performance Architecture

- Fast First Contentful Paint (FCP) via Server Component pre-rendering.
- Largest Contentful Paint (LCP) optimized by pre-loading cover image.
- Zero client-side bundle bloat (no heavy markdown parser libraries required).

---

## 22. Component Architecture

```
apps/web/
├── app/
│   └── posts/
│       └── [contentType]/
│           └── [slug]/
│               └── page.tsx              # Dynamic route with generateMetadata
│
├── components/
│   └── content/
│       ├── PostDetailView.tsx            # Main reader view orchestrator
│       ├── PostHeader.tsx                # Title, author, date, views, category
│       ├── PostCoverMedia.tsx            # Cover image presentation
│       ├── PostContentRenderer.tsx       # Typography prose container
│       ├── PostTagsList.tsx              # Taxonomy tag badges
│       └── PostDetailSkeleton.tsx        # Reading layout loading skeleton
│
├── lib/
│   └── posts/
│       └── use-post-detail.ts            # TanStack Query post detail hook
│
└── tests/
    └── content/
        ├── PostHeader.test.tsx           # Header metadata tests
        ├── PostCoverMedia.test.tsx       # Media rendering tests
        └── PostContentRenderer.test.tsx  # Content rendering & security tests
```

---

## 23. Type Architecture (`apps/web/types/content.ts`)

```typescript
export interface PostMediaItem {
  id: string;
  secureUrl: string;
  purpose: string;
  sortOrder: number;
}

export interface PostTagItem {
  id: string;
  name: string;
  slug: string;
}

export interface PostDetailResponse extends PostEntity {
  tags: PostTagItem[];
  media: PostMediaItem[];
}
```

---

## 24. Test Architecture

Vitest unit and component tests for Phase F5:
1. `posts-service.test.ts`: Add tests for `postsService.getBySlug(contentType, slug)`.
2. `PostHeader.test.tsx`: Verifies title, category badge, author ID, views count, and published date.
3. `PostCoverMedia.test.tsx`: Verifies image rendering with `secureUrl` and fallback when no media.
4. `PostContentRenderer.test.tsx`: Verifies styled HTML rendering, link targets, and heading hierarchy.

---

## 25. Implementation Sequence

1. **Types**: Extend `apps/web/types/content.ts` with `PostDetailResponse`, `PostMediaItem`, and `PostTagItem`.
2. **API Service**: Add `getBySlug(contentType, slug)` to `apps/web/lib/posts/posts-service.ts`.
3. **Query Hook**: Create `apps/web/lib/posts/use-post-detail.ts`.
4. **Reader Primitives**:
   - Create `apps/web/components/content/PostDetailSkeleton.tsx`.
   - Create `apps/web/components/content/PostCoverMedia.tsx`.
   - Create `apps/web/components/content/PostHeader.tsx`.
   - Create `apps/web/components/content/PostContentRenderer.tsx`.
   - Create `apps/web/components/content/PostTagsList.tsx`.
   - Create `apps/web/components/content/PostDetailView.tsx`.
5. **Route Assembly**: Create `apps/web/app/posts/[contentType]/[slug]/page.tsx` with dynamic `generateMetadata()`.
6. **Tests**: Write and execute tests in `apps/web/tests/content/`.
7. **Validation**: Execute `npm run test`, `npm run typecheck`, and `npm run build`.

---

## 26. Explicit Non-Scope for Phase F5

- ❌ Comments & threaded discussions (Phase F6)
- ❌ Reactions (Like/Bookmark toggling) (Phase F6)
- ❌ Public author profile page & follow action (Phase F7)
- ❌ Notifications center (Phase F8)
- ❌ Post creation & editing studio (Phase F9)
- ❌ Moderation actions & Admin dashboard (Phases F10 & F11)
- ❌ Backend source modifications or database migrations

---

## 27. Risks & Architectural Decisions

- **Decision 1 (Case Normalization)**: Route param `:contentType` (e.g. `community`) is uppercased to `COMMUNITY` when calling `GET /api/v1/posts/COMMUNITY/:slug` to match the backend database case sensitivity.
- **Decision 2 (Zero Unnecessary Libraries)**: The backend provides pre-sanitized HTML via `SanitizerUtil.sanitizeRichText`. The frontend renders this safely within a styled CSS prose container, eliminating unnecessary client markdown dependencies.

---

## 28. Acceptance Checklist for Phase F5

- [ ] `postsService.getBySlug` calls `GET /api/v1/posts/:contentType/:slug` with uppercase `contentType`
- [ ] Route `/posts/[contentType]/[slug]` renders both `COMMUNITY` and `SERIES` posts
- [ ] `generateMetadata()` generates canonical title, meta description, and OpenGraph image
- [ ] `PostHeader` displays Newsreader serif headline, category badge, author ID, date, and views
- [ ] `PostCoverMedia` renders Cloudinary `secureUrl` or clean gradient fallback
- [ ] `PostContentRenderer` renders sanitized HTML body with editorial typography
- [ ] `PostTagsList` displays interactive tag links
- [ ] `PostDetailSkeleton` displays during data loading
- [ ] 404 handled gracefully when post does not exist or is unpublished
- [ ] WCAG 2.2 AA accessibility verified
- [ ] Zero backend source files, database schemas, or migrations modified
- [ ] Vitest unit tests pass cleanly
- [ ] `npm run typecheck` passes with 0 errors
- [ ] `npm run build` succeeds cleanly

---

## 29. Human Approval Gate

```text
============================================================
PHASE F5.0 — HUMAN APPROVAL GATE
============================================================

Planning: COMPLETE
Repository Inspection: COMPLETE
Backend Contract Verification: COMPLETE
Database Contract Verification: COMPLETE
Sanitization & Security Architecture: COMPLETE

Source Code Changes: 0
Backend Changes: 0
Database Changes: 0
Migrations: 0

Status:
PLANNING COMPLETE — READY FOR FINAL RE-AUDIT

STOP — DO NOT IMPLEMENT CODE.
============================================================
```
