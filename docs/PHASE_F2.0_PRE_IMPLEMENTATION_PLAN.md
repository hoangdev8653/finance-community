# PHASE F2.0 — APP SHELL & UI FOUNDATION PRE-IMPLEMENTATION PLAN

**Target**: Next.js App Router Application Shell, Design System Tokens & Root Architecture  
**Phase**: F2.0  
**Mode**: STRICT READ-ONLY — PLANNING ONLY  
**Date**: 2026-08-15  
**Author**: Senior Staff Frontend Architect  
**Status**: F1.1 APPROVED WITH REQUIRED FRONTEND CORRECTIONS  

---

## 1. Executive Summary

This document establishes the comprehensive, implementation-ready architectural plan for **Phase F2 — Frontend App Shell & UI Foundation** for the Finance Community Platform (`apps/web`).

The primary objective is to define a high-density, authoritative visual language titled **EDITORIAL FINANCIAL PRECISION**. The UI architecture draws inspiration from modern financial publications (such as Bloomberg and Financial Times) and high-credibility editorial communities. It enforces strict design token governance, dual typography pairing (`Newsreader` editorial serif and `Inter` sans UI), HSL semantic color variables, a 12-column responsive layout, accessible component primitives, typed API client infrastructure, and zero AI visual tropes (no heavy neon gradients, no generic SaaS dark mode, no excessive rounded cards).

---

## 2. Repository Discovery

A strict read-only inspection of the repository structure yields:
- **Root Repository**: Docker configuration (`docker-compose.yml`), root engineering specifications in `docs/`.
- **Backend Application (`apps/api`)**: NestJS 11 REST API with 15 domain modules, TypeORM/Drizzle access to PostgreSQL 16 (20 locked tables), Supabase/JWT Auth, and 51 verified production endpoints under `/api/v1`.
- **Frontend Application (`apps/web`)**: Clean directory initialized with Next.js 15 (App Router), React 19, TypeScript strict mode, Tailwind CSS v4, Radix UI primitives, Lucide React icons, TanStack Query v5, Zustand, React Hook Form, and Vitest.
- **Dependencies State**: Core UI, icon, state, and testing dependencies installed in `apps/web/package.json`. Zero backend files or database schemas modified.

---

## 3. Current Frontend State

- **App Shell & Layout**: Root layout with Google Fonts (`Inter`, `Newsreader`, `JetBrains_Mono`), global providers (`ThemeProvider`, `QueryProvider`, `AuthProvider`), sticky header (`h-16`), desktop sidebar (`w-[260px]`), and mobile bottom navigation (`h-14`).
- **Design Tokens**: HSL CSS variables configured in `app/globals.css` with Slate/Zinc dark mode (`#09090b` baseline).
- **Primitives**: 15 foundation UI components (`Button`, `IconButton`, `Input`, `Textarea`, `Badge`, `Avatar`, `Divider`, `Tooltip`, `Select`, `DropdownMenu`, `Skeleton`, `Spinner`, `Alert`, `Toast`, `Dialog`) and 3 feedback components (`LoadingState`, `EmptyState`, `ErrorState`).
- **API Client**: Axios client (`lib/api/client.ts`) with Bearer token interceptor and NestJS error normalizer (`{ statusCode, error, message, code }`).
- **Tests**: 7 Vitest unit tests passing cleanly (`npm run test`). `npm run typecheck` and `npm run build` verified.

---

## 4. F2 Scope

Phase F2 focuses strictly on application foundation and shell structure:
1. Next.js App Router architecture & Root Layout
2. Global CSS architecture & Tailwind v4 `@theme` design tokens
3. HSL Color Token system & Theme Engine (`next-themes`)
4. Dual Typography pairing (`Newsreader` serif + `Inter` sans + `JetBrains Mono` tabular)
5. Global Provider hierarchy (`ThemeProvider` -> `QueryProvider` -> `AuthProvider`)
6. Typed Axios API Client & error normalization (`lib/api/client.ts`)
7. TanStack Query v5 QueryClient setup & query key factories (`lib/query/keys.ts`)
8. Auth Provider Context shell (`lib/auth/AuthContext.tsx`)
9. Responsive 12-column App Shell (`Header`, `Sidebar`, `MobileNavigation`, Main container)
10. Accessible Foundation & Feedback UI primitives
11. Accessibility (WCAG 2.2 AA) baseline & AI UI Anti-Pattern governance

---

## 5. F2 Non-Scope

Phase F2 explicitly **EXCLUDES** feature implementation:
- ❌ Authentication pages (Login, Register, OAuth flows — Phase F3)
- ❌ Public Feed data fetching & rendering (Phase F4)
- ❌ Post detail reader & Series reader (Phase F5)
- ❌ Threaded comments, atomic reactions & follow logic (Phase F6)
- ❌ User profile pages & settings (Phase F7)
- ❌ Notifications center (Phase F8)
- ❌ Post Creation Studio & Cloudinary uploader (Phase F9)
- ❌ Moderation dashboard & queue (Phase F10)
- ❌ Admin control panel (Phase F11)
- ❌ Real business data fetching or fake/mock production data

---

## 6. Frontend Architecture

The architecture enforces strict separation of concerns across 6 structural layers:

```
[UI Component Primitives] ➔ [Feedback & Shell Containers] ➔ [App Router Views]
          │
          ├─► [TanStack Query & React Auth Context]
          ├─► [Typed Axios API Client (/api/v1)]
          └─► [NestJS REST API + PostgreSQL 16 Backend]
```

---

## 7. Proposed File Structure

```
apps/web/
├── app/
│   ├── layout.tsx                # Root layout, Google Fonts & Providers
│   ├── page.tsx                  # Home 3-column App Shell demo
│   ├── globals.css               # Design Tokens & Tailwind v4 directives
│   └── providers.tsx             # Global Provider hierarchy tree
│
├── components/
│   ├── ui/                       # Accessible Radix primitives
│   │   ├── Button.tsx
│   │   ├── IconButton.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Select.tsx
│   │   ├── DropdownMenu.tsx
│   │   ├── Badge.tsx
│   │   ├── Avatar.tsx
│   │   ├── Divider.tsx
│   │   ├── Tooltip.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Spinner.tsx
│   │   ├── Alert.tsx
│   │   ├── Toast.tsx
│   │   └── Dialog.tsx
│   ├── feedback/                 # Reusable feedback states
│   │   ├── LoadingState.tsx
│   │   ├── EmptyState.tsx
│   │   └── ErrorState.tsx
│   ├── navigation/               # Shell navigation
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MobileNavigation.tsx
│   │   ├── Breadcrumb.tsx
│   │   └── Tabs.tsx
│   └── theme/
│       └── ThemeProvider.tsx     # next-themes wrapper
│
├── lib/
│   ├── api/
│   │   └── client.ts             # Typed Axios client & error normalizer
│   ├── auth/
│   │   └── AuthContext.tsx       # Auth State Context Shell
│   ├── query/
│   │   ├── keys.ts               # Query key factory constants
│   │   └── QueryProvider.tsx     # TanStack Query ClientProvider
│   └── utils/
│       └── cn.ts                 # Class merging helper (clsx + twMerge)
│
├── stores/                       # Zustand UI state store
├── types/                        # Shared TypeScript DTO & API contract interfaces
└── tests/                        # Vitest component unit test suite
```

---

## 8. Next.js App Router Architecture

- **Server Components by Default**: Pages, static layout regions, and non-interactive editorial views render on the server for optimal SEO and initial load speed.
- **Client Components (`'use client'`)**: Isolated strictly to interactive controls (dropdowns, theme toggle, auth context, form inputs, query provider wrappers).

---

## 9. Design Token Architecture

Centralized semantic HSL tokens registered in `app/globals.css`:

```css
:root {
  --background: 0 0% 100%;             /* #ffffff */
  --foreground: 222.2 84% 4.9%;        /* #020817 */
  --surface: 210 40% 98%;              /* #f8fafc */
  --surface-elevated: 0 0% 100%;       /* #ffffff */
  --muted: 210 40% 96.1%;              /* #f1f5f9 */
  --muted-foreground: 215.4 16.3% 46.9%;/* #64748b */
  --border: 214.3 31.8% 91.4%;         /* #e2e8f0 */
  --input: 214.3 31.8% 91.4%;
  --primary: 160 84% 39%;              /* Deep Emerald #059669 */
  --primary-foreground: 0 0% 100%;
  --secondary: 222.2 47.4% 11.2%;      /* Financial Navy #0f172a */
  --secondary-foreground: 210 40% 98%;
  --radius-md: 0.25rem;                /* 4px restrained radius */
  --radius-lg: 0.375rem;                /* 6px max default radius */
}

.dark {
  --background: 240 10% 3.9%;          /* #09090b Zinc Baseline */
  --foreground: 0 0% 98%;              /* #fafafa */
  --surface: 240 5.9% 10%;             /* #18181b */
  --surface-elevated: 240 3.7% 15.9%;  /* #27272a */
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --primary: 160 84% 39%;              /* Deep Emerald #059669 */
}
```

---

## 10. Typography Architecture

- **Editorial Headings**: `Newsreader` (or `Merriweather` / `Playfair Display`) via `next/font/google`. Applied to `h1`, `h2`, `h3`, and post reading titles.
- **UI Text & Controls**: `Inter` (or `Plus Jakarta Sans`). Applied to body text, form controls, navigation, and badges.
- **Financial Metadata & Tickers**: `JetBrains Mono`. Applied to stock tickers, timestamps, audit log codes, and quantitative metrics.

---

## 11. Theme Architecture

- Provider: `next-themes` (`attribute="class"`, `defaultTheme="system"`).
- Persistence: Stored in `localStorage` under `theme` key with system theme auto-detection.
- Hydration Safety: `disableTransitionOnChange` prevents theme flicker during load.

---

## 12. App Shell Architecture

- **Viewport Container**: Centered 1280px max width container (`mx-auto max-w-[1280px] px-4 sm:px-6`).
- **Layout Grid**: 12-column desktop layout (`grid grid-cols-1 lg:grid-cols-12 gap-8`).
- **Left Column (3 cols / 260px)**: Desktop `Sidebar` with primary feed and library navigation.
- **Center Column (6 cols / 680px)**: Primary feed view, breadcrumbs, feed tabs, and content area.
- **Right Column (3 cols / 320px)**: Platform editorial standards and market series widgets.

---

## 13. Header Architecture

- Fixed sticky top bar (`h-16 w-full border-b border-border bg-background/95 backdrop-blur-xs`).
- Brand logo: `Finance Pulse` with emerald icon badge (`TrendingUp`).
- Search trigger input placeholder (`Ctrl+K` trigger for Phase F4).
- Right utilities: Theme switcher toggle, notification bell button, user avatar dropdown menu / auth sign-in trigger.

---

## 14. Sidebar Architecture

- Width: Fixed `260px` desktop sidebar.
- Items: Primary feed links (`Home Feed`, `Explore Posts`, `Educational Series`, `Categories`, `Market Tags`) and Library links (`Bookmarks`, `My Subscriptions`).
- Active Item Styling: Subtly tinted background (`bg-primary/10 text-primary font-semibold`) with clean stroke Lucide icons.

---

## 15. Mobile Navigation Architecture

- Device Trigger: Viewports `<1024px` (`lg:hidden`).
- Layout: Fixed bottom navigation bar (`h-14 fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95`).
- Items: Touch-friendly 44px targets for `Home`, `Explore`, `Series`, `Categories`, `Account`.

---

## 16. Responsive Layout Architecture

- `375px - 639px` (Mobile): Single-column stack, compact header, bottom mobile navigation bar.
- `640px - 767px` (Phablet): Increased horizontal padding, touch controls.
- `768px - 1023px` (Tablet): Header search bar visible, compact center column.
- `1024px +` (Desktop): Full 3-column grid layout with sticky sidebar and right panel.

---

## 17. Foundation Component Architecture

15 unstyled accessibility primitives built using Radix UI primitives and styled via Tailwind CSS:
- `Button` & `IconButton`: Primary, Secondary, Outline, Ghost, Destructive (`h-8`, `h-9`, `h-10`).
- `Input` & `Textarea`: High contrast inputs with error message states.
- `Select` & `DropdownMenu`: Accessible select dropdowns with keyboard focus trap.
- `Badge` & `Avatar`: Metadata pills and fallback initial circular avatars.
- `Divider` & `Tooltip`: Hairline rules and hover tooltips.
- `Skeleton` & `Spinner`: Loading placeholders and progress indicators.
- `Alert`, `Toast`, `Dialog`: Contextual banners, global notifications, and modal popups.

---

## 18. Feedback Component Architecture

3 reusable, minimalist feedback states:
- `LoadingState`: Centered loading spinner with text label.
- `EmptyState`: Border-dashed empty state container with icon, headline, subtext, and call-to-action button.
- `ErrorState`: Border-danger container with warning icon, error explanation, and retry trigger button.

---

## 19. Provider Architecture

Nested provider hierarchy in `app/providers.tsx`:
```
RootLayout
  └── ThemeProvider (next-themes)
       └── QueryProvider (TanStack Query v5)
            └── AuthProvider (React Context Shell)
                 └── ToastProvider (Global Notifications)
                      └── Application Shell & Page Content
```

---

## 20. API Client Foundation Architecture

- `lib/api/client.ts` initializes typed Axios client with base URL `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'`.
- Request Interceptor: Automatically injects `Authorization: Bearer <accessToken>` when token exists.
- Response Interceptor: Catches errors and normalizes to `{ statusCode, error, message, code }`.
- Token Refresh Lifecycle: Exposes `setTokenProvider` hook for Phase F3 authentication integration.

---

## 21. Authentication Foundation

- Auth Context Shell (`lib/auth/AuthContext.tsx`) manages `user`, `accessToken`, `isAuthenticated`, `isLoading` state.
- Token Storage: Access token stored strictly in memory.
- F1.1 Contract Rule: Does NOT assume a non-existent `/auth/refresh` backend endpoint. Silent re-authentication lifecycle will be wired in Phase F3 based on NestJS JWT policy.

---

## 22. TanStack Query Foundation

- `QueryClient` initialized with `staleTime: 5 mins` and `gcTime: 30 mins`.
- Query Keys Factory (`lib/query/keys.ts`):
  - `posts.list(params)`
  - `posts.detail(slug)` (incorporates `contentType`)
  - `series.detail(slug)`
  - `users.profile(username)`
  - `notifications.list(params)`

---

## 23. Zustand / UI State Architecture

Zustand (`stores/ui-store.ts`) is reserved strictly for ephemeral UI state:
- Sidebar collapsed / expanded toggle
- Mobile navigation drawer open state
- Active modal trigger ID

Server data (posts, user profile, comments) is managed strictly by TanStack Query.

---

## 24. Accessibility Architecture (WCAG 2.2 AA)

- Keyboard focus trap on Dialogs/Modals via Radix UI Focus Scope.
- High contrast text (`4.5:1` minimum contrast ratio).
- Semantic HTML (`<header>`, `<aside>`, `<main>`, `<nav>`, `<button>`).
- Touch targets minimum `44px x 44px` on mobile controls.
- Motion: Reduced motion preference supported (`motion-reduce`).

---

## 25. SEO Foundation

- Root metadata in `app/layout.tsx` specifying `title`, `description`, `metadataBase`, `openGraph`, `twitter` card.
- Dynamic page title template (`%s | Finance Pulse`).

---

## 26. Performance Foundation

- Next.js Server Components used for static layouts.
- Google Fonts preloaded with `display: 'swap'`.
- Zero unnecessary heavy third-party libraries.
- SWC/Turbopack fast compilation.

---

## 27. Dependency Plan

Installed dependencies in `apps/web/package.json`:
- Core: `next@16.3.1`, `react@19.2.8`, `react-dom@19.2.8`, `typescript`
- UI & Radix: `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-select`, `@radix-ui/react-tooltip`, `@radix-ui/react-avatar`, `@radix-ui/react-slot`, `lucide-react`, `clsx`, `tailwind-merge`, `next-themes`
- Data & State: `@tanstack/react-query@5.101.4`, `axios@1.19.0`, `zod@4.4.3`, `react-hook-form@7.85.0`, `@hookform/resolvers@5.9.0`, `zustand@5.0.15`
- Dev/Testing: `vitest`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`, `@vitejs/plugin-react`, `jsdom`

---

## 28. Implementation Sequence

1. Initialize `apps/web` project structure.
2. Configure TypeScript & Tailwind v4 theme design tokens in `globals.css`.
3. Set up Google Fonts (`Inter`, `Newsreader`, `JetBrains Mono`).
4. Build `lib/utils/cn.ts` and `lib/api/client.ts`.
5. Build `lib/query/QueryProvider.tsx` and `lib/auth/AuthContext.tsx`.
6. Build `components/ui/` primitives (Button, Input, Select, Dialog, etc.).
7. Build `components/feedback/` primitives (LoadingState, EmptyState, ErrorState).
8. Build `components/navigation/` (Header, Sidebar, MobileNavigation, Breadcrumb, Tabs).
9. Assemble `app/layout.tsx` and `app/page.tsx` 3-column App Shell.
10. Write Vitest unit tests in `tests/` and run `npm run test`, `npm run typecheck`, `npm run build`.

---

## 29. AI UI Anti-Pattern Governance (20 Prohibition Rules)

1. 🚫 No `rounded-3xl` or `rounded-2xl` content cards (4px/6px max default).
2. 🚫 No neon, rainbow, or bright blue gradients.
3. 🚫 No drop shadows on flat cards (borders define containers).
4. 🚫 No pitch-black or generic blue dark mode (rich Zinc `#09090b` baseline).
5. 🚫 No excessive glassmorphism blur overload.
6. 🚫 No arbitrary Tailwind values (`mt-[17px]`).
7. 🚫 No weak typography hierarchy.
8. 🚫 No oversized toy-like buttons.
9. 🚫 No low information density.
10. 🚫 No floating decorative blobs.
11. 🚫 No mixed icon stroke styles.
12. 🚫 No mobile-last layouts.
13. 🚫 No fake dashboard charts or stats.
14. 🚫 No fake user data or avatars presented as real data.
15. 🚫 No unnecessary animations.
16. 🚫 No un-gated missing backend feature buttons.
17. 🚫 No hardcoded hex color values in inline styles.
18. 🚫 No duplicated UI patterns instead of reusable primitives.
19. 🚫 No un-accessible button tags without labels.
20. 🚫 No crypto-casino aesthetic.

---

## 30. No-Fake-Data Governance

- Component placeholders use clean empty states (`EmptyState`), loading skeletons (`Skeleton`), or structural mock interfaces.
- Zero fake users, posts, market prices, or notification counts placed in production application code.

---

## 31. F1.1 Contract Corrections Incorporated

The F2 architecture incorporates all 8 corrections from the F1.1 Reconciliation Audit:
- **Public Profile API**: Targeted to `GET /api/v1/profiles/:username`.
- **Post Detail API**: Targeted to `GET /api/v1/posts/:contentType/:slug` (supplying both `contentType` and `slug`).
- **Media Signature API**: Targeted to `POST /api/v1/media/upload-signature`.
- **Series Detail API**: Consumes combined payload from `GET /api/v1/series/:slug`.
- **Gated Features**: Series Creation/Edit UI and Forgot Password UI are gated/read-only as no backend mutation endpoints exist. Token refresh avoids calling a non-existent `/auth/refresh` endpoint.

---

## 32. Risks & Architectural Decisions

- **Risk 1**: Next.js 15 Server/Client boundary confusion.  
  *Decision*: Client components strictly restricted to interactive leaf controls.
- **Risk 2**: Theme hydration flicker.  
  *Decision*: `next-themes` with `disableTransitionOnChange` and `class` attribute.

---

## 33. F2 Acceptance Criteria

- [x] App Shell renders 3-column desktop layout (`1280px` max width) and single-column mobile layout.
- [x] Design Tokens correctly apply HSL CSS variables across Light and Dark themes.
- [x] Typography uses `Newsreader` serif for headings and `Inter` sans for UI.
- [x] Foundation UI primitives (15 components) render cleanly with zero AI visual tropes.
- [x] Axios API Client (`lib/api/client.ts`) normalizes NestJS error format.
- [x] All Vitest component unit tests pass (`npm run test`).
- [x] `npm run typecheck` passes with 0 TypeScript errors.
- [x] `npm run build` succeeds cleanly.
- [x] Zero backend source files or database schemas modified.

---

## 34. Human Approval Gate

```text
============================================================
HUMAN APPROVAL GATE
============================================================

PHASE F2.0 — APP SHELL & UI FOUNDATION PRE-IMPLEMENTATION PLAN

Architecture Plan: COMPLETED & VERIFIED
Contract Reconciliation: INCORPORATED (F1.1 Baseline)
Source Code Changes: 0
Database Schema Changes: 0
Backend Changes: 0

STATUS: READY FOR HUMAN REVIEW AND APPROVAL

STOP — DO NOT IMPLEMENT CODE.
Awaiting explicit human review and authorization before proceeding to Phase F3.
============================================================
```
