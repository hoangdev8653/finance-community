# PHASE F1 — FRONTEND COMPONENT ARCHITECTURE

**Target**: Component Hierarchy, Design Token Binding & Responsibilities  
**Mode**: STRICT ARCHITECTURAL SPECIFICATION  
**Date**: 2026-08-15  
**Status**: APPROVED & LOCKED FOR FRONTEND IMPLEMENTATION  

---

## 1. Component Hierarchy Architecture

The component architecture is structured into 7 distinct functional layers:

```
[1. FOUNDATION PRIMITIVES] ➔ [2. FEEDBACK & OVERLAYS] ➔ [3. NAVIGATION]
            │
            ├─► [4. CONTENT DOMAIN]
            ├─► [5. USER & SOCIAL]
            ├─► [6. MEDIA ENGINE]
            └─► [7. ADMIN & MODERATION]
```

---

## 2. Component Taxonomy & Responsibilities

### 2.1 Foundation Primitives (`/components/ui`)
Core unstyled accessibility primitives powered by Radix UI and bound to semantic tokens:

- `Button` / `IconButton`: Primary, Secondary, Ghost, Destructive variants (`h-9` or `h-10`, `rounded-md`).
- `Input` / `Textarea`: High contrast input controls (`border-input`, focus ring `ring-primary`).
- `Select` / `DropdownMenu`: Accessible select dropdowns (`shadow-sm`, `bg-surface-elevated`).
- `Checkbox` / `RadioGroup` / `Switch`: Crisp boolean toggle controls.
- `Badge` / `Tag`: Compact metadata containers (`radius-sm`, `text-xs`, mono font support).
- `Avatar`: Circular user image wrapper with fallback initials (`radius-full`).
- `Divider`: Hairline rule (`h-[1px]` or `w-[1px]` `bg-border`).
- `Tooltip`: Hover helper for icons and status indicators (`shadow-sm`, `text-xs`).

### 2.2 Feedback & Overlay Layer (`/components/feedback`)
- `Alert`: Contextual inline warnings/notices (Success, Info, Warning, Danger).
- `Toast`: Global notification popup dispatcher (Targeting `shadow-lg`).
- `Modal` / `Dialog`: Accessible modal overlay (`shadow-md`, backdrop blur `backdrop-blur-sm`).
- `Skeleton`: Content placeholder pulsing animation for asynchronous loading states.
- `Spinner`: Compact inline loading indicator.
- `EmptyState`: Standardized empty visual block with icon, headline, and call-to-action button.
- `ErrorState`: Failure boundary visual block with retry trigger.

### 2.3 Navigation Layer (`/components/navigation`)
- `Header`: Fixed top bar with logo, search trigger, notification bell, user avatar menu.
- `Sidebar`: Collapsible left column desktop navigation (Feed, Series, Categories, Bookmarks).
- `MobileNavigation`: Bottom mobile bar or slide-over drawer (`sm` breakpoint trigger).
- `Breadcrumb`: Accessible path navigation (`Home > Series > Personal Finance`).
- `Tabs`: Accessible tab navigation control for feed filters and profile sub-views.
- `Pagination`: Compact page index controller (`Previous`, `1`, `2`, `3`, `Next`).

### 2.4 Content Domain Layer (`/components/content`)
- `PostCard`: Feed item displaying title, excerpt, category badge, author avatar, reaction count, comment count.
- `PostHeader`: Article view title, metadata bar (published date, read time, view count), author block.
- `PostContent`: Rich text HTML/Markdown renderer with high-contrast typography styling.
- `PostMeta`: Metadata strip containing stock ticker tags, category, and publication state.
- `ReactionsBar`: Atomic reaction trigger bar (Like, Helpful, Bookmark, Share counts).
- `Comment`: Single comment bubble supporting markdown content, author badge, soft-delete mask.
- `CommentThread`: Nested comment tree with reply toggles and depth indicators.
- `CommentComposer`: Rich comment authoring textarea with submit control.
- `SeriesCard`: Multi-part educational series container showing chapter counts and progress bar.
- `CategoryBadge` / `Tag`: Category pill and hash tag link.
- `AuthorCard`: Bio card displaying author avatar, follower count, and quick follow button.

### 2.5 User & Social Layer (`/components/user`)
- `ProfileHeader`: User profile banner, avatar, display name, `@username`, bio, join date.
- `ProfileStats`: Stat counters (Posts, Followers, Following, Reputation badges).
- `FollowButton`: Optimistic follow/unfollow toggle button (`Follow` / `Following`).
- `UserCard`: Compact user summary card used in follower/following lists and admin tables.

### 2.6 Media Engine (`/components/media`)
- `Image`: Next.js optimized image wrapper with Cloudinary transformations and fallback loader.
- `MediaGallery`: Grid/carousel display for post attachment images.
- `MediaUploader`: Drag-and-drop upload zone acquiring signed Cloudinary tokens from NestJS backend.

### 2.7 Admin & Moderation (`/components/admin`)
- `ModerationTable`: Data table displaying pending user reports and target preview links.
- `ReportCard`: Detailed report review card with reporter comments and target content snippet.
- `ModerationActionPanel`: Moderator execution panel (`Approve`, `Remove Content`, `Warn User`, `Ban Account`).
- `UserStatusBadge`: Status pill (`ACTIVE` green, `SUSPENDED` yellow, `BANNED` red).
- `AuditLogTable`: High-density tabular view displaying audit timestamps, actor IDs, action strings, and IP logs.

---

## 3. Accessibility (a11y) Rules for Components

1. All interactive buttons and inputs MUST have unique `id` and `aria-label` or `htmlFor` association.
2. Dialogs and Modals MUST trap keyboard focus using Radix UI Focus Scope.
3. Color combinations MUST pass WCAG 2.2 AA contrast ratios (Minimum `4.5:1` for normal body text, `3:1` for large headings).
4. Animations MUST respect `prefers-reduced-motion: reduce`.
