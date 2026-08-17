# PHASE F17.0 — PRE-IMPLEMENTATION PLAN
# SEO METADATA, OPEN GRAPH & STRUCTURED JSON-LD ENGINE

**Phase**: F17.0  
**Type**: Pre-Implementation Architectural Blueprint  
**Date**: 2026-08-16  
**Target**: `apps/web`  
**Status**: STRICT READ-ONLY — PLANNING ONLY (NO CODE MODIFICATIONS AUTHORIZED)  
**Baseline**: F16.1 Approved (201/201 tests passing, 73 test files, TypeScript 0 errors, build PASS)

---

## 1. PHASE SELECTION RATIONALE

Before committing to Phase F17 architecture, a full repository audit was conducted to evaluate candidate frontend phases following the completion of Phase F16.1 (Dynamic Feature Flag Runtime).

### Candidate Comparison

| Candidate Phase | Backend Ready | DB Ready | Frontend Dependencies | Architectural Priority | Risk | Recommended |
|---|---|---|---|---|---|---|
| **Candidate A: SEO Metadata, Open Graph & Structured JSON-LD Engine** | **YES** (`/posts`, `/series`, `/categories`, `/tags`, `/profiles`) | **YES** | F4.1, F5.1, F7.1, F10.1, F15.1 (All Frozen) | **CRITICAL FOUNDATION** | **LOW** (No breaking changes, non-blocking hydration) | **YES (Selected)** |
| **Candidate B: Author Directory & Public Portfolio Engine** | **PARTIAL** (Pagination for public users not explicitly curated as a directory) | **YES** | F7.1, F15.1, Candidate A (SEO) | MEDIUM (Enhancement feature) | MEDIUM | NO (Deferred to F18+) |
| **Candidate C: Real-Time WebSockets & Live Market Ticker** | **NO** (No WebSocket gateway in `apps/api`) | **NO** | Infrastructure changes | LOW | HIGH (Requires full-stack refactoring) | NO (Out of Scope) |

### Justification
1. **Zero Backend & Database Gaps**: All required public data entities (posts, educational series, taxonomy tags, categories, analyst profiles) are fully exposed by existing, stable `apps/api` endpoints and consumed in `apps/web`.
2. **Current Discovery Deficits**: An audit of `apps/web/app/` reveals missing page-level metadata on key routes (e.g., `/tags/[slug]` and `/search`), missing robots protections on governance routes (`/moderation`, `/admin/*`), missing dynamic `sitemap.ts` and `robots.ts` handlers, hardcoded URLs (`https://financepulse.community`), and un-sanitized JSON-LD serialization inside `dangerouslySetInnerHTML`.
3. **Architectural Timing**: SEO infrastructure serves as the public layer for all prior content phases (F4, F5, F7, F10, F15). Freezing SEO now ensures all subsequent user-facing modules inherit typed, secure, and standardized metadata protocols.

---

## 2. OBJECTIVE

Establish a centralized, typed, high-precision **SEO, Open Graph, Twitter/X Cards, Canonical URL, Robots Directives, Dynamic Sitemap, and Structured JSON-LD Engine** in `apps/web` compatible with Next.js 16 App Router.

### Primary Architectural Goals
1. **Single Source of Truth**: Centralize canonical site URL resolution and global fallback metadata in a typed configuration module (`lib/seo/site-config.ts`).
2. **Safe Structured Data (JSON-LD)**: Implement a secure `<JsonLd />` component that sanitizes HTML and script injection vectors (`<`, `>`, `&`, `\u2028`, `\u2029`) before rendering.
3. **Comprehensive Schema.org Entities**: Provide typed helpers for `WebSite`, `Organization`, `Article` / `NewsArticle` / `EducationalArticle`, `ItemList`, `ProfilePage` / `Person`, and `BreadcrumbList`.
4. **Dynamic Next.js Handlers**: Introduce `app/robots.ts` and `app/sitemap.ts` leveraging existing backend services.
5. **Private Route Indexing Protection**: Enforce explicit `robots: { index: false, follow: false }` across all administrative, moderation, and authenticated workflows.

---

## 3. REPOSITORY AUDIT

### Environment & Tooling
- **Framework**: Next.js 16.3.1 (Turbopack, App Router)
- **Runtime / UI**: React 19.2.8, React DOM 19.2.8
- **Language**: TypeScript 5 (Strict Mode)
- **Test Runner**: Vitest 4.1.10 with `@testing-library/react` 16.3.2 and `jsdom` 30.0.1
- **API Client**: Axios 1.19.0 with base URL defaulting to `http://localhost:3000/api/v1`

### Audit Discoveries
1. **Hardcoded Domain**: The domain `'https://financepulse.community'` is hardcoded in 5 separate route files (`layout.tsx`, `posts/[contentType]/[slug]/page.tsx`, `series/page.tsx`, `series/[slug]/page.tsx`, and `profile/[username]/page.tsx`).
2. **Missing Robots Protection**:
   - `apps/web/app/moderation/page.tsx` lacks `robots: { index: false, follow: false }`.
   - `apps/web/app/admin/layout.tsx` lacks `robots: { index: false, follow: false }`.
3. **Unsanitized JSON-LD**: Routes rendering JSON-LD use `dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}` directly. User-generated content containing `</script>` or unescaped unicode can cause XSS or DOM hydration corruption.
4. **Missing Handlers**: Neither `app/robots.ts` nor `app/sitemap.ts` exists in the repository.
5. **Client Component Metadata Gaps**:
   - `apps/web/app/tags/[slug]/page.tsx` is a `'use client'` component with no exported metadata.
   - `apps/web/app/search/page.tsx` is a `'use client'` component with no metadata.

---

## 4. CURRENT SEO INVENTORY

| Route | Current Metadata | OG | Twitter | Canonical | JSON-LD | Classification | Current Status |
|---|---|---|---|---|---|---|---|
| `/` | Layout default | Layout default | Layout default | ❌ None | ❌ None | PUBLIC_INDEXABLE | ⚠️ Needs WebSite/Org JSON-LD |
| `/(auth)/login` | Static Metadata | ❌ None | ❌ None | ❌ None | ❌ None | PUBLIC_NON_INDEXABLE | ✅ `robots: noindex, nofollow` |
| `/(auth)/register` | Static Metadata | ❌ None | ❌ None | ❌ None | ❌ None | PUBLIC_NON_INDEXABLE | ✅ `robots: noindex, nofollow` |
| `/posts/[contentType]/[slug]` | `generateMetadata` | Article | Summary Large | Hardcoded | NewsArticle / EducationalArticle | PUBLIC_INDEXABLE | ⚠️ Unsanitized JSON-LD, Hardcoded URL |
| `/posts/create` | Static Metadata | ❌ None | ❌ None | ❌ None | ❌ None | AUTHENTICATED_NON_INDEXABLE | ✅ `robots: noindex, nofollow` |
| `/posts/[id]/edit` | Static Metadata | ❌ None | ❌ None | ❌ None | ❌ None | AUTHENTICATED_NON_INDEXABLE | ✅ `robots: noindex, nofollow` |
| `/series` | Static Metadata | Website | Summary | Hardcoded | ❌ None | PUBLIC_INDEXABLE | ⚠️ Hardcoded URL, Missing ItemList |
| `/series/[slug]` | `generateMetadata` | Website | Summary | Hardcoded | ItemList | PUBLIC_INDEXABLE | ⚠️ Unsanitized JSON-LD, Hardcoded URL |
| `/profile/[username]` | `generateMetadata` | Profile | Summary | Hardcoded | ProfilePage / Person | PUBLIC_INDEXABLE | ⚠️ Unsanitized JSON-LD, Hardcoded URL |
| `/notifications` | Static Metadata | ❌ None | ❌ None | ❌ None | ❌ None | AUTHENTICATED_NON_INDEXABLE | ✅ `robots: noindex, nofollow` |
| `/moderation` | Static Metadata | ❌ None | ❌ None | ❌ None | ❌ None | MODERATION_NON_INDEXABLE | ❌ **DEFICIT**: Missing `noindex, nofollow` |
| `/admin` | Layout Metadata | ❌ None | ❌ None | ❌ None | ❌ None | ADMIN_NON_INDEXABLE | ❌ **DEFICIT**: Missing `noindex, nofollow` |
| `/admin/users` | Inherited | ❌ None | ❌ None | ❌ None | ❌ None | ADMIN_NON_INDEXABLE | ❌ **DEFICIT**: Inherits unprotected layout |
| `/admin/feature-flags` | Inherited | ❌ None | ❌ None | ❌ None | ❌ None | ADMIN_NON_INDEXABLE | ❌ **DEFICIT**: Inherits unprotected layout |
| `/admin/settings` | Inherited | ❌ None | ❌ None | ❌ None | ❌ None | ADMIN_NON_INDEXABLE | ❌ **DEFICIT**: Inherits unprotected layout |
| `/admin/audit-logs` | Inherited | ❌ None | ❌ None | ❌ None | ❌ None | ADMIN_NON_INDEXABLE | ❌ **DEFICIT**: Inherits unprotected layout |
| `/admin/categories` | Inherited | ❌ None | ❌ None | ❌ None | ❌ None | ADMIN_NON_INDEXABLE | ❌ **DEFICIT**: Inherits unprotected layout |
| `/search` | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | UTILITY_NON_INDEXABLE | ❌ **DEFICIT**: Client page, no metadata |
| `/tags/[slug]` | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | PUBLIC_INDEXABLE | ❌ **DEFICIT**: Client page, missing metadata |

---

## 5. NEXT.JS ARCHITECTURE AUDIT

### App Router Metadata Inheritance
In Next.js 16 App Router:
1. `app/layout.tsx` defines the root `metadataBase` and fallback `title.template` (`%s | Finance Pulse`).
2. Route-level `metadata` or `generateMetadata()` shallowly merges into parent metadata.
3. Client components cannot export `metadata` or `generateMetadata`.
   - For `/tags/[slug]`: We create `app/tags/[slug]/layout.tsx` (Server Component) with dynamic `generateMetadata({ params })` without altering the existing client view.
   - For `/search`: We create `app/search/layout.tsx` (Server Component) exporting static metadata with `robots: { index: false, follow: true }` to prevent indexing search query variations while preserving crawler link following.

---

## 6. SITE URL / ENVIRONMENT AUDIT

### Resolution Strategy
Currently, `NEXT_PUBLIC_API_URL` is used for the API client, but no unified URL resolver exists for frontend canonical URLs.

We establish `lib/seo/site-config.ts` with deterministic resolution priority:
1. `process.env.NEXT_PUBLIC_SITE_URL` (Configured production domain)
2. `process.env.VERCEL_PROJECT_PRODUCTION_URL` (`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
3. `process.env.VERCEL_URL` (`https://${process.env.VERCEL_URL}`)
4. Fallback: `https://financepulse.community` (Production canonical default)
5. Localhost fallback when running in non-production: `http://localhost:3000`

---

## 7. SEO ARCHITECTURE DESIGN

We introduce a clean, modular structure under `apps/web/lib/seo/` and `apps/web/types/seo.ts`:

```
apps/web/
├── types/
│   └── seo.ts                         # Type definitions for SEO config, OpenGraph, JSON-LD
├── lib/
│   └── seo/
│       ├── site-config.ts             # Canonical site URL, site identity, default fallbacks
│       ├── metadata-helpers.ts        # Canonical URL builder, OpenGraph/Twitter builders
│       ├── structured-data.ts         # Schema.org payload generators (Article, Series, Person, WebSite)
│       └── json-ld-sanitizer.ts       # XSS-safe serialization for application/ld+json
├── components/
│   └── seo/
│       └── JsonLd.tsx                 # Safe React component rendering <script type="application/ld+json">
├── app/
│   ├── robots.ts                      # Next.js dynamic robots.txt handler
│   ├── sitemap.ts                     # Next.js dynamic sitemap.xml handler
│   ├── search/layout.tsx              # SEO wrapper for Search route
│   └── tags/[slug]/layout.tsx         # SEO dynamic metadata wrapper for Tag route
```

---

## 8. METADATA STRATEGY

### Global Defaults (`app/layout.tsx`)
- **`metadataBase`**: Resolved via `getSiteUrlObject()`
- **Title Template**: `%s | Finance Pulse`
- **Default Title**: `Finance Pulse — Institutional Knowledge & Market Intelligence`
- **Description**: `A high-precision financial knowledge and community platform for editorial research, valuation models, and collaborative market breakdown.`
- **OpenGraph Type**: `website`
- **Twitter Card**: `summary_large_image`
- **Robots Default**: `index: true, follow: true`

### Dynamic Route Specifications
1. **Posts (`/posts/[contentType]/[slug]`)**:
   - `title`: `${post.metaTitle || post.title}`
   - `description`: `${post.metaDescription || post.excerpt || default}`
   - `openGraph`: Type `article`, `publishedTime`, `modifiedTime`, `authors`, `tags`, `images`
2. **Series (`/series/[slug]`)**:
   - `title`: `${series.name} | Educational Curriculum`
   - `description`: `${series.description}`
   - `openGraph`: Type `website`
3. **Profiles (`/profile/[username]`)**:
   - `title`: `${profile.displayName || profile.username} (@${profile.username}) | Analyst Profile`
   - `description`: `${profile.bio || default}`
   - `openGraph`: Type `profile`
4. **Tags (`/tags/[slug]`)**:
   - `title`: `#${tagName} Analyses & Research Notes`
   - `description`: `Curated institutional publications, financial breakdown, and discussion under the #${tagName} topic.`

---

## 9. CANONICAL URL STRATEGY

1. **Deterministic Absolute Paths**: Canonical URLs must always use absolute URLs generated via `buildCanonicalUrl(path)`.
2. **Normalization Rules**:
   - Strips query parameters from canonical tags on feed, search, and dynamic routes.
   - Enforces lowercase content-types (`/posts/community/...`, `/posts/series/...`).
   - Percent-encodes dynamic path segments (`encodeURIComponent`).
   - Enforces no trailing slashes across all canonical targets.

---

## 10. ROBOTS STRATEGY

### Global `app/robots.ts`
```typescript
import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo/site-config';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/moderation',
          '/moderation/',
          '/notifications',
          '/notifications/',
          '/posts/create',
          '/posts/*/edit',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

### Route-Level Metadata Robots Directives
- **Private Layouts/Pages**: `robots: { index: false, follow: false }` added to `app/admin/layout.tsx` and `app/moderation/page.tsx`.
- **Search Page**: `robots: { index: false, follow: true }` in `app/search/layout.tsx`.

---

## 11. SITEMAP STRATEGY

### Dynamic `app/sitemap.ts`
Generates XML sitemap entries using existing services without requiring any backend modifications:
1. **Static Core Pages**: `/`, `/series` (Priority: 1.0 / 0.8, changeFrequency: `daily` / `weekly`).
2. **Dynamic Published Posts**: Fetches latest 100 published posts via `postsService.getFeed({ limit: 100 })` (Priority: 0.9, `lastModified`: `post.updatedAt`).
3. **Dynamic Series**: Fetches all series via `seriesService.getAllSeries({ limit: 50 })` (Priority: 0.8, `lastModified`: `series.updatedAt`).
4. **Dynamic Tags**: Fetches popular tags via `searchService.searchTags('', 50)` (Priority: 0.6, `changeFrequency`: `weekly`).

---

## 12. STRUCTURED DATA / JSON-LD STRATEGY

| Schema Type | Target Route | Generator Function | Data Sources |
|---|---|---|---|
| `WebSite` & `Organization` | `/` (Root Layout) | `generateWebSiteJsonLd()` | Site Config |
| `NewsArticle` / `EducationalArticle` | `/posts/[contentType]/[slug]` | `generateArticleJsonLd(post)` | `PostDetailResponse` |
| `ItemList` | `/series/[slug]` | `generateSeriesItemListJsonLd(series)` | `SeriesDetailResponse` |
| `ProfilePage` & `Person` | `/profile/[username]` | `generateProfileJsonLd(profile)` | `PublicProfile` |
| `BreadcrumbList` | `/posts/*`, `/series/*`, `/profile/*` | `generateBreadcrumbsJsonLd(items)` | Route Hierarchy |

---

## 13. SECURITY CONSIDERATIONS

### JSON-LD XSS Vector Elimination
Standard `JSON.stringify` does not escape characters like `<`, `>`, `&`, or unicode line separators (`\u2028`, `\u2029`). If an attacker authors a post with title `"</script><script>alert(1)</script>"`, raw stringification inside `<script type="application/ld+json">` executes malicious scripts.

### Sanitization Implementation (`lib/seo/json-ld-sanitizer.ts`)
```typescript
export function safeJsonLdReplacer(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
```
All schema rendering will pass strictly through `<JsonLd data={...} />` utilizing this sanitizer.

---

## 14. ACCESSIBILITY REQUIREMENTS

1. **Title Uniqueness**: Every route produces a descriptive, unambiguous `<title>` matching on-screen `<h1>` content for screen readers.
2. **No Layout Shift**: `<JsonLd />` and metadata scripts execute invisibly in `<head>` or inert DOM blocks without generating visual wrappers or layout shifts.
3. **Canonical Heading Alignment**: Schema headlines strictly mirror visible semantic headings to ensure screen reader / crawler parity.

---

## 15. PERFORMANCE CONSIDERATIONS

1. **Zero Extra API Overhead on Dynamic Pages**: In `generateMetadata` and `Page`, data fetching is kept lightweight.
2. **Sitemap Execution Limits**: Sitemap fetching bounds queries with safe limits (`limit: 100`) and graceful try/catch fallbacks so backend transient issues never crash sitemap generation.
3. **Payload Optimization**: JSON-LD scripts are serialized compactly without pretty-printing whitespace.

---

## 16. F16 FEATURE FLAG INTEGRATION

- **Determination**: Core SEO metadata, canonical links, robots directives, and dynamic sitemaps are essential infrastructure and **must NOT be feature-gated**.
- **Rule**: All SEO components and utilities operate unconditionally without depending on `FeatureFlagProvider`.

---

## 17. TESTING PLAN

### Test Suites to Create (`apps/web/tests/seo/`)
1. `site-config.test.ts` (4 tests): Tests URL resolution, environment variable priority, fallback handling.
2. `metadata-helpers.test.ts` (6 tests): Tests canonical URL building, title templating, OG/Twitter object construction.
3. `json-ld-sanitizer.test.ts` (5 tests): Tests XSS injection blocking (`<script>`, unicode separators, quotes).
4. `structured-data.test.ts` (6 tests): Tests Article, Series, Person, and WebSite Schema.org structure validation.
5. `robots.test.ts` (3 tests): Tests `robots()` metadata output, disallow rules, sitemap reference.
6. `sitemap.test.ts` (4 tests): Tests `sitemap()` generator with mocked post, series, and tag responses.
7. `JsonLd.test.tsx` (3 tests): Tests React component rendering, valid `type="application/ld+json"`.

**Expected Test Target Range**: +28 to +35 new passing tests (Total post-F17.1: ~230+ tests).

---

## 18. SCOPE DEFINITION

### IN SCOPE
- Centralized site configuration and canonical URL resolver (`lib/seo/site-config.ts`).
- SEO metadata helper functions (`lib/seo/metadata-helpers.ts`).
- Safe JSON-LD sanitizer and `<JsonLd />` component (`lib/seo/json-ld-sanitizer.ts`, `components/seo/JsonLd.tsx`).
- Schema.org structured data generators for Articles, Series, Profiles, WebSite, Breadcrumbs (`lib/seo/structured-data.ts`).
- App Router dynamic `app/robots.ts` and `app/sitemap.ts`.
- Updating `app/layout.tsx` with centralized site config and WebSite JSON-LD.
- Adding `app/tags/[slug]/layout.tsx` for dynamic tag metadata.
- Adding `app/search/layout.tsx` for search discovery metadata with `noindex`.
- Updating `app/moderation/page.tsx` and `app/admin/layout.tsx` with `robots: { index: false, follow: false }`.
- Upgrading `app/posts/[contentType]/[slug]/page.tsx`, `app/series/[slug]/page.tsx`, and `app/profile/[username]/page.tsx` to use safe `<JsonLd />` and helper utilities.
- Comprehensive test suites under `tests/seo/`.

### OUT OF SCOPE
- Backend modifications (`apps/api` remains immutable).
- Database migrations or schema changes.
- Google Search Console or third-party webmaster verification token injection.
- Analytics or tracking pixel integrations.
- Modifying UI components or visual layouts.

---

## 19. FILE-LEVEL IMPLEMENTATION PLAN

### NEW Files

| File | Purpose | Dependencies | Risk |
|---|---|---|---|
| `apps/web/types/seo.ts` | Type definitions for SEO config, OpenGraph, JSON-LD schemas | None | Very Low |
| `apps/web/lib/seo/site-config.ts` | Canonical URL resolver & site defaults | `types/seo.ts` | Low |
| `apps/web/lib/seo/json-ld-sanitizer.ts` | XSS-safe serialization for JSON-LD | None | Low |
| `apps/web/lib/seo/metadata-helpers.ts` | Reusable Next.js Metadata builders | `site-config.ts` | Low |
| `apps/web/lib/seo/structured-data.ts` | Schema.org payload generators | `types/content.ts`, `types/series.ts`, `types/users.ts` | Low |
| `apps/web/components/seo/JsonLd.tsx` | Declarative safe JSON-LD script component | `json-ld-sanitizer.ts` | Low |
| `apps/web/app/robots.ts` | Next.js dynamic robots handler | `site-config.ts` | Low |
| `apps/web/app/sitemap.ts` | Next.js dynamic sitemap generator | `posts-service.ts`, `series-service.ts`, `search-service.ts` | Low |
| `apps/web/app/tags/[slug]/layout.tsx` | Server layout providing `generateMetadata` for tag pages | `posts-service.ts`, `metadata-helpers.ts` | Low |
| `apps/web/app/search/layout.tsx` | Server layout providing `noindex` metadata for search page | `metadata-helpers.ts` | Low |
| `apps/web/tests/seo/site-config.test.ts` | Unit tests for site config and URL resolution | Vitest | None |
| `apps/web/tests/seo/json-ld-sanitizer.test.ts` | Unit tests for XSS sanitization | Vitest | None |
| `apps/web/tests/seo/metadata-helpers.test.ts` | Unit tests for metadata builders | Vitest | None |
| `apps/web/tests/seo/structured-data.test.ts` | Unit tests for Schema.org generators | Vitest | None |
| `apps/web/tests/seo/robots.test.ts` | Unit tests for robots handler | Vitest | None |
| `apps/web/tests/seo/sitemap.test.ts` | Unit tests for sitemap generator | Vitest | None |
| `apps/web/tests/seo/JsonLd.test.tsx` | Component tests for `<JsonLd />` | React Testing Library | None |

### MODIFIED Files

| File | Change | Rationale |
|---|---|---|
| `apps/web/app/layout.tsx` | Use `getSiteUrlObject()` in `metadataBase`, render root WebSite/Organization `<JsonLd />` | Unify domain configuration and root structured data |
| `apps/web/app/admin/layout.tsx` | Add `robots: { index: false, follow: false }` | Prevent crawler indexing of admin console |
| `apps/web/app/moderation/page.tsx` | Add `robots: { index: false, follow: false }` | Prevent crawler indexing of moderation queue |
| `apps/web/app/posts/[contentType]/[slug]/page.tsx` | Use `buildCanonicalUrl`, safe `<JsonLd />`, and `generateArticleJsonLd` | Fix hardcoded domain and sanitize structured data |
| `apps/web/app/series/[slug]/page.tsx` | Use `buildCanonicalUrl`, safe `<JsonLd />`, and `generateSeriesItemListJsonLd` | Fix hardcoded domain and sanitize structured data |
| `apps/web/app/profile/[username]/page.tsx` | Use `buildCanonicalUrl`, safe `<JsonLd />`, and `generateProfileJsonLd` | Fix hardcoded domain and sanitize structured data |
| `apps/web/app/series/page.tsx` | Use `buildCanonicalUrl` in canonical metadata | Eliminate hardcoded domain string |

---

## 20. IMPLEMENTATION ORDER

1. **Phase 1: Foundation Types & Config**
   - Create `types/seo.ts`
   - Create `lib/seo/site-config.ts`
   - Create `lib/seo/json-ld-sanitizer.ts`
2. **Phase 2: Metadata & Structured Data Utilities**
   - Create `lib/seo/metadata-helpers.ts`
   - Create `lib/seo/structured-data.ts`
   - Create `components/seo/JsonLd.tsx`
3. **Phase 3: Dynamic Next.js Handlers**
   - Create `app/robots.ts`
   - Create `app/sitemap.ts`
4. **Phase 4: Route Layouts & Metadata Updates**
   - Create `app/tags/[slug]/layout.tsx`
   - Create `app/search/layout.tsx`
   - Update `app/admin/layout.tsx` and `app/moderation/page.tsx` (Robots protection)
   - Update `app/layout.tsx`, `app/series/page.tsx`, `app/posts/[contentType]/[slug]/page.tsx`, `app/series/[slug]/page.tsx`, `app/profile/[username]/page.tsx`
5. **Phase 5: Automated Testing Suite**
   - Implement all test files under `tests/seo/`
6. **Phase 6: Verification & Regression Gate**
   - Execute full test suite (`npx vitest run`)
   - Execute TypeScript verification (`npx tsc --noEmit`)
   - Execute production build (`npx next build`)

---

## 21. ROUTE MAP

| Route | Post-F17 SEO Action | Indexable | Canonical Target | JSON-LD Rendered |
|---|---|---|---|---|
| `/` | Root config + WebSite/Org schema | ✅ YES | `https://financepulse.community` | `WebSite`, `Organization` |
| `/(auth)/login` | Preserved | ❌ NO | None | None |
| `/(auth)/register` | Preserved | ❌ NO | None | None |
| `/posts/[contentType]/[slug]` | Dynamic metadata + Safe `<JsonLd />` | ✅ YES | `https://financepulse.community/posts/:type/:slug` | `NewsArticle` / `EducationalArticle`, `BreadcrumbList` |
| `/posts/create` | Preserved | ❌ NO | None | None |
| `/posts/[id]/edit` | Preserved | ❌ NO | None | None |
| `/series` | Static metadata with dynamic site URL | ✅ YES | `https://financepulse.community/series` | `CollectionPage` |
| `/series/[slug]` | Dynamic metadata + Safe `<JsonLd />` | ✅ YES | `https://financepulse.community/series/:slug` | `ItemList`, `BreadcrumbList` |
| `/profile/[username]` | Dynamic metadata + Safe `<JsonLd />` | ✅ YES | `https://financepulse.community/profile/:username` | `ProfilePage`, `Person` |
| `/notifications` | Preserved | ❌ NO | None | None |
| `/moderation` | Added `noindex, nofollow` | ❌ NO | None | None |
| `/admin/*` | Added `noindex, nofollow` in layout | ❌ NO | None | None |
| `/search` | Added `app/search/layout.tsx` (`noindex, follow`) | ❌ NO | None | None |
| `/tags/[slug]` | Added `app/tags/[slug]/layout.tsx` (`generateMetadata`) | ✅ YES | `https://financepulse.community/tags/:slug` | `CollectionPage` |

---

## 22. BACKEND / DATABASE IMPACT

- **Backend Modifications**: **0** (Zero changes to `apps/api`)
- **Database Migrations**: **0** (Zero schema modifications)
- **Rationale**: All required data for dynamic metadata and sitemap generation is fully supported by existing endpoints (`/posts`, `/series`, `/tags`, `/categories`, `/profiles/:username`).

---

## 23. RISK ASSESSMENT

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **XSS via JSON-LD payload** | Low | High | Enforce mandatory unicode escaping for `<, >, &, \u2028, \u2029` via `safeJsonLdReplacer`. |
| **Accidental Private Page Indexing** | Low | High | Apply layout-level `robots: { index: false, follow: false }` to `/admin` and page-level to `/moderation`. Disallow paths in `robots.ts`. |
| **Sitemap Generation Failure** | Low | Medium | Encapsulate service calls in `try/catch` with fallback to static pages if API is unreachable. |
| **Hydration Mismatch in `<JsonLd>`** | Low | Low | Component returns pure `<script type="application/ld+json">` without client-only state dependencies. |
| **Broken Client Components** | Very Low | High | Use Server Component `layout.tsx` wrappers for `/tags/[slug]` and `/search` rather than altering client component declarations. |

---

## 24. ACCEPTANCE CRITERIA

1. **Complete Public Metadata**: All public routes (`/`, `/posts/*`, `/series`, `/series/*`, `/profile/*`, `/tags/*`) return complete title, description, canonical URL, OpenGraph, and Twitter card metadata.
2. **Private Route Protection**: `/admin/*`, `/moderation`, `/notifications`, `/posts/create`, and `/posts/*/edit` return `noindex, nofollow` directives.
3. **Robots & Sitemap**: `GET /robots.txt` and `GET /sitemap.xml` resolve with valid XML/text payloads.
4. **XSS-Safe JSON-LD**: Structured data contains sanitized unicode-escaped strings without raw script injection risk.
5. **Zero Backend/DB Delta**: No modifications to `apps/api` or SQL database schema.
6. **Zero Regression**: All 201 pre-existing tests pass; total test count increases by ~28+ tests.
7. **Production Build Clean**: `npx tsc --noEmit` returns 0 errors; `npx next build` succeeds (exit code 0).

---

## 25. FINAL RECOMMENDATION

### PHASE F17.0 STATUS: **READY FOR HUMAN APPROVAL**

The pre-implementation plan is complete, rigorous, and verified against all actual repository files. No code has been modified. Awaiting human owner review and authorization to proceed to **Phase F17.1 Implementation**.
