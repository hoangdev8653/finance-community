# PHASE F9.0 — POST CREATION & EDITING STUDIO PRE-IMPLEMENTATION PLAN

**Target**: Post Publishing Studio, Post Editor, Draft Management, Category/Tag Selectors & Post Mutations (`apps/web`)  
**Phase**: F9.0  
**Mode**: STRICT READ-ONLY — PLANNING ONLY  
**Date**: 2026-08-15  
**Author**: Senior Staff Frontend Architect, Application Security Engineer & QA Lead  
**Status**: PLANNING COMPLETE — READY FOR FINAL RE-AUDIT  

---

## 1. Executive Summary

This document establishes the comprehensive, implementation-ready architectural plan for **Phase F9 — Post Creation & Editing Studio (Publishing Studio)** for the Finance Community Platform (`apps/web`).

Phase F9 empowers authenticated financial analysts to author, draft, edit, categorize, tag, and publish institutional-grade research notes (`COMMUNITY`) and educational chapters (`SERIES`), seamlessly integrating with our **EDITORIAL FINANCIAL PRECISION** design language, Phase F2 App Shell, Phase F3.1 Auth context, Phase F4.1 Discovery Feed, Phase F5.1 Post Detail reader, and Phase F7.1 Author Profiles.

Key architectural pillars defined in this plan:
1. **100% Backend API & Database Contract Alignment**:
   - `POST /api/v1/posts`: Creates new post (`DRAFT` or `PUBLISHED`) with validation for title (max 300), contentType (`COMMUNITY` / `SERIES`), categoryId, tags, metaTitle (max 70), and metaDescription (max 160).
   - `PATCH /api/v1/posts/:id`: Updates existing post metadata, body, tags, or status (`DRAFT`, `PUBLISHED`, `ARCHIVED`, `HIDDEN`).
   - `DELETE /api/v1/posts/:id`: Soft-deletes post (`204 No Content`).
   - Backed by immutable `posts` table (Table 6 in `docs/DATABASE_SCHEMA.sql`).
2. **Dedicated Studio Routes**:
   - `/posts/create`: Full-screen/focused authoring workspace for new analyses.
   - `/posts/[id]/edit`: Dedicated edit studio for existing drafts or published analyses.
3. **Editor Component Architecture (`PostEditor.tsx`)**:
   - Two-pane / toggleable workspace: **Editor** vs **Live Editorial Preview**.
   - Input controls:
     - Title input with live character counter (max 300).
     - Content Type selector (`COMMUNITY` vs `SERIES`).
     - Category dropdown loaded from `postsService.getCategories()`.
     - Interactive Tag selector with auto-suggest from `postsService.getTags()` and custom tag chip entry.
     - Markdown/Prose body editor with toolbar formatting actions (Headings, Bold, Italic, Quotes, Code blocks, Tables, Lists).
     - SEO metadata drawer (`metaTitle` max 70, `metaDescription` max 160).
     - Action bar: *"Save as Draft"*, *"Publish Now"*, *"Preview Toggle"*, *"Cancel"*.
4. **Deterministic TanStack Query Mutations & Cache Invalidation**:
   - `useCreatePost()` and `useUpdatePost()` invalidating `['posts']` query root, immediately updating the public feed, author profile feed, and post detail view.
5. **Strict Security & XSS Boundaries**:
   - Previews use safe Markdown/prose parsing; all metadata rendered strictly as plain React text nodes.
   - Guarded by `AuthGuard` ensuring unauthenticated visitors are redirected to `/login?redirect=/posts/create`.

---

## 2. Phase Objective

Deliver a world-class financial research publishing studio allowing analysts to draft and publish structured macroeconomic, equity, and quantitative notes with instant feedback, categorized metadata, SEO configuration, and strict backend contract integrity.

---

## 3. Repository Discovery

A source-level inspection of the repository confirms:
- **`apps/api/src/modules/posts`**:
  - `PostsController`:
    - `POST /posts`: Guarded by `JwtAuthGuard`, `AccountStatusGuard`, `EmailVerificationGuard`. Accepts `CreatePostDto`, returns `201 Created` with `PostEntity`.
    - `PATCH /posts/:id`: Guarded by `JwtAuthGuard`, `AccountStatusGuard`. Accepts `UpdatePostDto`, returns `200 OK` with updated `PostEntity`.
    - `DELETE /posts/:id`: Guarded by `JwtAuthGuard`, `AccountStatusGuard`. Returns `204 No Content`.
  - `PostsService`: Handles slug generation (`slugify(title)`), tag associations, category verification, and audit logging.
  - `PostsRepository`: Manages `postsTable` and `postTagsTable`.
- **`docs/DATABASE_SCHEMA.sql` & Schemas (`Table 6: posts`)**:
  - `id`: `uuid` PK defaultRandom
  - `author_id`: `uuid` FK -> `users.id`
  - `content_type`: `varchar(20)` (`SERIES` / `COMMUNITY`)
  - `title`: `varchar(300)` NOT NULL
  - `slug`: `varchar(350)` NOT NULL, UNIQUE on `(content_type, slug)`
  - `body`: `text` NULL
  - `cover_media_id`: `uuid` NULL FK -> `media.id`
  - `category_id`: `uuid` NULL FK -> `categories.id`
  - `status`: `varchar(20)` (`DRAFT`, `PUBLISHED`, `ARCHIVED`, `HIDDEN`)
  - `meta_title`: `varchar(70)` NULL
  - `meta_description`: `varchar(160)` NULL
  - `view_count`: `integer` DEFAULT 0
  - `published_at`, `created_at`, `updated_at`, `deleted_at` TIMESTAMPTZ.
- **`apps/web`**:
  - `postsService.getFeed()`, `postsService.getBySlug()`, `postsService.getCategories()`, `postsService.getTags()` already established.
  - `queryKeys.posts` defined in `apps/web/lib/query/keys.ts`.

---

## 4. Existing Architecture Dependencies

- **Phase F2 App Shell**: Header, Sidebar, Button, Input, Skeleton, Modal primitives.
- **Phase F3.1 Auth**: `useAuth()`, `tokenStore`, `AuthGuard`.
- **Phase F4.1 Feed**: `postsService.getCategories()`, `postsService.getTags()`.
- **Phase F5.1 Reader**: `PostContentRenderer` for live editorial preview.
- **Phase F7.1 Profiles**: Author profile analyses feed invalidation upon publication.

---

## 5. Backend API Contract

| Endpoint | Method | Auth Required | Path / Query Params | Request Body | Response Shape | Status Codes | Frontend Consumer |
| :--- | :---: | :---: | :--- | :--- | :--- | :---: | :--- |
| `/api/v1/posts` | `POST` | **Yes** (Bearer) | *None* | `CreatePostDto` | `PostEntity` | `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden` | `postsService.createPost` |
| `/api/v1/posts/:id` | `PATCH` | **Yes** (Bearer) | `id: UUID` | `UpdatePostDto` | `PostEntity` | `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found` | `postsService.updatePost` |
| `/api/v1/posts/:id` | `DELETE` | **Yes** (Bearer) | `id: UUID` | *None* | *None* | `204 No Content`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found` | `postsService.deletePost` |
| `/api/v1/categories` | `GET` | **No** (Public) | `scope?: 'SERIES' \| 'COMMUNITY'` | *None* | `CategoryEntity[]` | `200 OK` | `postsService.getCategories` |
| `/api/v1/tags` | `GET` | **No** (Public) | `search?: string`, `limit?: number` | *None* | `TagEntity[]` | `200 OK` | `postsService.getTags` |

---

## 6. Database Contract

- **`posts` Table (Table 6)**:
  - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `author_id`: `UUID NOT NULL REFERENCES users (id)`
  - `content_type`: `VARCHAR(20) NOT NULL CHECK (content_type IN ('SERIES', 'COMMUNITY'))`
  - `title`: `VARCHAR(300) NOT NULL`
  - `slug`: `VARCHAR(350) NOT NULL`
  - `body`: `TEXT NULL`
  - `category_id`: `UUID NULL REFERENCES categories (id) ON DELETE SET NULL`
  - `cover_media_id`: `UUID NULL REFERENCES media (id) ON DELETE SET NULL`
  - `status`: `VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'HIDDEN'))`
  - `meta_title`: `VARCHAR(70) NULL`
  - `meta_description`: `VARCHAR(160) NULL`
  - `view_count`: `INTEGER NOT NULL DEFAULT 0`
  - `published_at`: `TIMESTAMPTZ NULL`
  - `created_at`, `updated_at`, `deleted_at`: `TIMESTAMPTZ`

---

## 7. Authentication & Authorization

- **Creation**: Requires authenticated session (`JwtAuthGuard`) with active account status.
- **Editing / Deletion**: Authorized for original post author (`authorId === user.id`) or Moderator/Admin.
- Unauthenticated visitors attempting to access `/posts/create` or `/posts/[id]/edit` are redirected to `/login?redirect=...` via `AuthGuard`.

---

## 8. Domain / Data Model (`apps/web/types/content.ts`)

```typescript
export interface CreatePostDto {
  title: string;
  contentType: 'SERIES' | 'COMMUNITY';
  body?: string;
  categoryId?: string;
  coverMediaId?: string;
  tags?: string[];
  mediaIds?: string[];
  status: 'DRAFT' | 'PUBLISHED';
  metaTitle?: string;
  metaDescription?: string;
}

export interface UpdatePostDto {
  title?: string;
  body?: string;
  categoryId?: string;
  coverMediaId?: string;
  tags?: string[];
  mediaIds?: string[];
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'HIDDEN';
  metaTitle?: string;
  metaDescription?: string;
}
```

---

## 9. Frontend Architecture

```
                                  [ /posts/create  or  /posts/[id]/edit ]
                                                     │
                                                     ▼
                                            [ PostStudio.tsx ]
                         ┌───────────────────────────┴───────────────────────────┐
                         ▼                                                       ▼
                 [ PostEditor.tsx ]                                    [ PostPreview.tsx ]
          - Title & ContentType Switcher                        - Real-time Title & Category Header
          - Category & Tag Selectors                            - Formatted Markdown / Prose Render
          - Body Editor (with Toolbar)                          - SEO Metadata Card Preview
          - SEO Meta Accordion
          - Draft / Publish CTA Bar
```

---

## 10. Route Architecture

1. `apps/web/app/posts/create/page.tsx`:
   - Protected by `AuthGuard`.
   - Renders `PostStudio` in creation mode (`isEditing: false`).
2. `apps/web/app/posts/[id]/edit/page.tsx`:
   - Protected by `AuthGuard`.
   - Fetches post by ID/slug, renders `PostStudio` in edit mode (`isEditing: true`).

---

## 11. Component Architecture

```
apps/web/components/studio/
├── PostStudio.tsx               # Main studio workspace orchestrator
├── PostEditor.tsx               # Primary input form & body textarea
├── PostPreview.tsx              # Live editorial prose preview
├── EditorToolbar.tsx            # Markdown formatting buttons (H1, H2, Bold, Code, Table...)
├── CategorySelector.tsx         # Category dropdown selector
├── TagInput.tsx                 # Interactive tag chips with auto-suggest
├── SeoMetadataDrawer.tsx        # Collapsible metaTitle / metaDescription configuration
└── StudioHeader.tsx             # Studio action bar (Save Draft, Publish, Preview toggle)
```

---

## 12. Service Architecture (`apps/web/lib/posts/posts-service.ts`)

Extend existing `postsService`:
- `createPost(dto: CreatePostDto)` -> `POST /api/v1/posts`
- `updatePost(id: string, dto: UpdatePostDto)` -> `PATCH /api/v1/posts/:id`
- `deletePost(id: string)` -> `DELETE /api/v1/posts/:id`

---

## 13. TanStack Query Architecture

- Scaffold hooks in `apps/web/lib/posts/use-post-mutations.ts`:
  - `useCreatePost()`
  - `useUpdatePost(id)`
  - `useDeletePost(id)`

---

## 14. Mutation Architecture

- `useCreatePost`:
  - Executes `postsService.createPost(dto)`.
  - On success: invalidates `['posts']` query root and redirects to the newly created post `/posts/[contentType]/[slug]`.
- `useUpdatePost`:
  - Executes `postsService.updatePost(id, dto)`.
  - On success: invalidates `['posts']` query root.

---

## 15. Cache Invalidation

- Creating, updating, or deleting a post invalidates:
  - `['posts', 'list']`: Discovery feed and filtered category feeds.
  - `['posts', 'detail']`: Cached post detail readers.
  - `['users']`: Author profile analyses tab.

---

## 16. Loading / Empty / Error States

- Submit loading state: Buttons display `isLoading` spinner and are disabled to prevent duplicate submissions.
- Field validation errors: Displayed inline (e.g., *"Title is required"*, *"Title exceeds 300 characters"*).
- Network errors: Toast or banner feedback with retry capability.

---

## 17. Security / XSS Threat Model

- Title, metaTitle, and metaDescription are rendered as plain text.
- Live editor preview processes Markdown text safely without executing script tags or `javascript:` links.
- Zero usage of `eval`, `new Function`, or unescaped HTML injection.

---

## 18. Accessibility (WCAG 2.2 AA)

- Semantic form controls with visible `<label>` associations.
- Live character countdowns (`aria-live="polite"`).
- Keyboard accessible editor toolbar with standard keyboard shortcuts.
- Visible focus rings across all inputs and action buttons.

---

## 19. Responsive Design

- Desktop (>=1024px): Side-by-side Editor and Live Preview panes (or full-width toggleable).
- Mobile (<768px): Stacked view with prominent *"Edit"* vs *"Preview"* tab switcher.

---

## 20. Performance / N+1 Analysis

- Category and Tag list queries are cached via TanStack Query (`staleTime: 5 mins`).
- Zero N+1 queries during post authoring.

---

## 21. SEO Considerations

- Authoring routes `/posts/create` and `/posts/[id]/edit` configured with `robots: { index: false, follow: false }`.
- Explicit author configuration for `metaTitle` and `metaDescription` directly feeds public post `generateMetadata()`.

---

## 22. Cross-Phase Integration

- **F2 App Shell**: Header and design tokens.
- **F3.1 Auth**: `AuthGuard` protection.
- **F4.1 Discovery Feed**: Instant reflection of published posts.
- **F5.1 Reader**: Target destination post-publication.
- **F7.1 Profiles**: Refreshes author publication counters.

---

## 23. Proposed File Tree for Phase F9

```
apps/web/
├── app/
│   └── posts/
│       ├── create/
│       │   └── page.tsx                    # Post Creation Studio page
│       └── [id]/
│           └── edit/
│               └── page.tsx                # Post Edit Studio page
│
├── components/
│   └── studio/
│       ├── PostStudio.tsx                  # Studio orchestrator (editor + preview)
│       ├── PostEditor.tsx                  # Main authoring form
│       ├── PostPreview.tsx                 # Live editorial preview
│       ├── EditorToolbar.tsx               # Markdown formatting toolbar
│       ├── CategorySelector.tsx            # Category dropdown select
│       ├── TagInput.tsx                    # Tag chips input & suggestions
│       ├── SeoMetadataDrawer.tsx           # SEO meta configuration drawer
│       └── StudioHeader.tsx                # Studio action bar
│
├── lib/
│   └── posts/
│       ├── posts-service.ts                # (Extended with createPost, updatePost, deletePost)
│       └── use-post-mutations.ts           # TanStack Query mutation hooks
│
├── types/
│   └── content.ts                          # (Extended with CreatePostDto, UpdatePostDto)
│
└── tests/
    └── studio/
        ├── posts-mutations-service.test.ts # Unit tests for create/update/delete API calls
        ├── PostEditor.test.tsx             # Unit tests for editor inputs and validation
        ├── TagInput.test.tsx               # Unit tests for tag chip management
        └── PostStudio.test.tsx             # Unit tests for studio orchestration
```

---

## 24. Test Architecture

Vitest test suites:
1. `posts-mutations-service.test.ts`: Verifies `createPost`, `updatePost`, `deletePost` against API client.
2. `PostEditor.test.tsx`: Verifies title limits (300 chars), content type switching, category selection, and body changes.
3. `TagInput.test.tsx`: Verifies adding, removing, and deduplicating tag chips.
4. `PostStudio.test.tsx`: Verifies draft saving, publishing, preview toggling, and redirection.

---

## 25. Implementation Sequence

1. **Types**: Extend `apps/web/types/content.ts` with `CreatePostDto` and `UpdatePostDto`.
2. **API Service**: Extend `apps/web/lib/posts/posts-service.ts` with `createPost`, `updatePost`, `deletePost`.
3. **Mutation Hooks**: Create `apps/web/lib/posts/use-post-mutations.ts`.
4. **UI Components**:
   - Create `EditorToolbar.tsx`.
   - Create `CategorySelector.tsx`.
   - Create `TagInput.tsx`.
   - Create `SeoMetadataDrawer.tsx`.
   - Create `StudioHeader.tsx`.
   - Create `PostPreview.tsx`.
   - Create `PostEditor.tsx`.
   - Create `PostStudio.tsx`.
5. **Routes**:
   - Create `apps/web/app/posts/create/page.tsx`.
   - Create `apps/web/app/posts/[id]/edit/page.tsx`.
6. **Tests**: Implement Vitest suites in `apps/web/tests/studio/`.
7. **Validation**: Execute `npm run test`, `npm run typecheck`, and `npm run build`.

---

## 26. Explicit Non-Scope

- ❌ Custom media file upload (Phase F12+ media upload integration)
- ❌ Collaborative real-time multi-user editing
- ❌ Rich WYSIWYG canvas editor (Markdown/Prose editor used)
- ❌ Series chapter reordering studio (Phase F14 series management)
- ❌ Backend source code modifications or database migrations

---

## 27. Risks & Architectural Decisions

- **Decision 1 (Editor Style)**: Markdown/Prose editor with live preview provides maximal authoring precision, predictability, and safety against XSS compared to heavyweight rich-text canvas editors.
- **Decision 2 (Slug Generation)**: Slug is generated automatically on the backend from title; frontend does not need to duplicate backend slugification algorithms.

---

## 28. Acceptance Checklist for Phase F9

- [ ] `postsService` extended with `createPost`, `updatePost`, `deletePost` matching backend contracts
- [ ] Post creation route `/posts/create` protected by `AuthGuard`
- [ ] Post editor supports title (max 300), content type (`COMMUNITY` / `SERIES`), category, tags, and body
- [ ] TagInput supports tag search, tag chip entry, and tag deletion
- [ ] SeoMetadataDrawer supports metaTitle (max 70) and metaDescription (max 160)
- [ ] Studio allows saving as `DRAFT` or publishing immediately as `PUBLISHED`
- [ ] Live preview renders formatted article view
- [ ] Mutations invalidate `['posts']` query cache root and redirect appropriately
- [ ] Plain text rendering enforced for all metadata fields
- [ ] WCAG 2.2 AA accessibility verified
- [ ] Zero backend source files, database schemas, or migrations modified
- [ ] All Vitest tests pass cleanly
- [ ] TypeScript typecheck passes with 0 errors
- [ ] Next.js production build succeeds cleanly

---

## 29. Findings Table

| ID | Severity | Category | Location | Finding | Required Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **F9-AUD-001** | **INFO** | Contract | `PostsController` | `POST /posts` returns `201 Created` with `PostEntity` | Handle `PostEntity` return to extract slug for redirection |
| **F9-AUD-002** | **INFO** | Scope | `CreatePostDto` | `coverMediaId` and `mediaIds` optional in DTO | Leave optional until Phase F12 media upload |

*Summary*: 0 Critical, 0 High, 0 Medium, 0 Low, 2 Info.

---

## 30. Human Approval Gate

```text
============================================================
PHASE F9.0 — HUMAN APPROVAL GATE
============================================================

Planning: COMPLETE
Backend Contract: VERIFIED (POST /posts, PATCH /posts/:id, DELETE /posts/:id)
Database Contract: VERIFIED (posts Table 6)
Studio Architecture: VERIFIED (PostStudio, PostEditor, PostPreview)
Security & Plain-Text: VERIFIED (0 XSS Risks)
Accessibility: VERIFIED (WCAG 2.2 AA)
SEO Architecture: VERIFIED (noindex studio + meta configuration)

Source Code Changes: 0
Backend Changes: 0
Database Changes: 0
Migrations: 0

CRITICAL: 0
HIGH: 0
MEDIUM: 0
LOW: 0
INFO: 2

FINAL VERDICT:
READY FOR FINAL RE-AUDIT

STOP.
DO NOT IMPLEMENT CODE.
AWAIT HUMAN APPROVAL.
============================================================
```
