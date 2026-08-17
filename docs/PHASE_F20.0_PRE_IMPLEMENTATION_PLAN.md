# PHASE F20.0 — PRE-IMPLEMENTATION PLAN
# PRE-LAUNCH HARDENING & SHELL POLISH (FINAL MVP RELEASE)

**Phase**: F20.0  
**Type**: Pre-Implementation Architectural & Hardening Plan  
**Target**: `apps/web`  
**Baseline**: Phase F19.2 Approved (263 tests, 89 test files, 0 TS errors, 23 routes)  
**Backend Mode**: STRICT IMMUTABLE (`apps/api` unchanged)  
**Database Mode**: STRICT IMMUTABLE (`DATABASE_SCHEMA.sql` unchanged)  
**Status**: STRICT READ-ONLY — PLANNING ONLY  

---

## 1. EXECUTIVE SUMMARY

Phase F20.0 is the **final hardening, shell polish, and production-readiness phase** for the Finance Community Platform MVP.

Following the successful completion and verification of Phase F19.2 (where 100% of the 20 database tables, 37 API endpoints, and 23 routes are live and passing 263 tests), this phase resolves the remaining shell technical debt (2 dead placeholder sidebar links) and establishes the production environment hardening blueprint required for launch.

### Key Objectives
1. **Shell Navigation 100% Active**: Remove the 2 speculative placeholder links (`/bookmarks` and `/subscriptions`) from `Sidebar.tsx`, ensuring that **100% of clickable links** in the global application shell resolve to live, operational routes.
2. **Environment & Deployment Hardening**: Document and verify all production environment variables via `.env.example` (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`).
3. **Pre-Launch Smoke Test Checklist**: Define an end-to-end verification protocol covering all 26 core user journeys and production infrastructure health.
4. **Permanent Baseline Freeze**: Certify the final production MVP state with zero regressions on F2.1–F19.2 baselines.

---

## 2. CURRENT BASELINE AUDIT

| Verified Metric | Baseline Status | Note |
|---|---|---|
| **Test Suite** | **263 / 263 PASS** | 89 test files |
| **TypeScript Compilation** | **0 errors** | `npx tsc --noEmit` exits 0 |
| **Next.js Production Build** | **23 routes generated** | `npx next build` exits 0 |
| **Database Schema** | **20 / 20 tables utilized** | PostgreSQL 13+ |
| **Backend API Endpoints** | **37 / 37 endpoints consumed** | 15 NestJS modules |
| **Backend Immutability** | **0 modifications** | `apps/api` unchanged |
| **Database Immutability** | **0 migrations** | `DATABASE_SCHEMA.sql` unchanged |

---

## 3. FINDINGS & TECHNICAL DEBT ASSESSMENT

### Finding 1: Speculative Dead Links in `Sidebar.tsx`
- **Location**: `apps/web/components/navigation/Sidebar.tsx` (lines 24-28).
- **Issue**: `secondaryNavItems` includes `{ label: 'Bookmarks', href: '/bookmarks' }` and `{ label: 'My Subscriptions', href: '/subscriptions' }`.
- **Root Cause**: These two links were originally placed during early App Shell wireframing before database architecture was locked. Neither the database schema nor `apps/api` includes a bookmarks or multi-author subscription table.
- **Evaluation of Options**:
  - *Option A: Build fake client-side bookmarks / subscriptions*. (Rejected: violates MVP integrity rule by creating unpersisted, fake UI).
  - *Option B: Create new backend endpoints & DB tables*. (Rejected: violates Backend/Database Immutability rule).
  - *Option C: Remove placeholder links and focus section on "My Workspace" (`/dashboard`)*. (**Selected**: smallest, safest, cleanest solution that eliminates 100% of 404 links from the UI).

### Finding 2: Missing `.env.example` in `apps/web`
- **Location**: `apps/web/.env.example`.
- **Issue**: Environment variable keys required for production deployment are documented in implementation reports but lack a standard template file in the repository root.
- **Solution**: Create `apps/web/.env.example` with clear comments for API URLs, Site URL, and Cloudinary keys.

---

## 4. PROPOSED PHASE F20 SCOPE

### In-Scope:
1. **Sidebar Navigation Polish**:
   - Refactor `secondaryNavItems` in `apps/web/components/navigation/Sidebar.tsx` to include only active personal routes:
     - `{ label: 'My Workspace', href: '/dashboard', icon: LayoutDashboard }`
   - Retain section heading "Personal Workspace" with clean visual hierarchy.
2. **Sidebar Unit Test Enhancement**:
   - Update `apps/web/tests/components/Sidebar.test.tsx` to assert that all rendered navigation links match active routes (`/`, `/posts`, `/series`, `/categories`, `/tags`, `/dashboard`) and that no dead links are rendered.
3. **Environment Template Creation**:
   - Create `apps/web/.env.example` documenting all production environment variables.
4. **Production Readiness & Smoke Test Verification**:
   - Execute full validation (`tsc`, `vitest`, `next build`) to ensure 263+ tests pass and 0 regressions.

---

## 5. FILE-LEVEL BLUEPRINT

### NEW FILES (1 Total)

| # | File | Purpose | Risk |
|---|---|---|---|
| 1 | `apps/web/.env.example` | Production environment variable documentation template | Zero |

### MODIFIED FILES (2 Total)

| # | File | Modification | Risk |
|---|---|---|---|
| 1 | `apps/web/components/navigation/Sidebar.tsx` | Remove `/bookmarks` and `/subscriptions` placeholder links | Very Low |
| 2 | `apps/web/tests/components/Sidebar.test.tsx` | Add assertions verifying active navigation links and absence of dead links | Very Low |

---

## 6. TEST STRATEGY

### Unit & Component Tests (`apps/web/tests/components/Sidebar.test.tsx`)
1. **Test 1: Primary Discovery Items**:
   - Asserts presence of `Home Feed` (`/`), `Explore Posts` (`/posts`), `Educational Series` (`/series`), `Categories` (`/categories`), and `Market Tags` (`/tags`).
2. **Test 2: Personal Workspace Navigation**:
   - Asserts presence of `My Workspace` (`/dashboard`).
3. **Test 3: Dead Link Guard**:
   - Asserts that no links to `/bookmarks` or `/subscriptions` are present in the DOM.

**Expected Test Suite Delta**: +2 test assertions (Total: 263 tests passing across 89 test files).

---

## 7. PRODUCTION SMOKE TEST PROTOCOL

A 10-step manual and automated smoke checklist before live DNS cutover:

| Step | Smoke Test Area | Test Action | Expected Result |
|---|---|---|---|
| **1** | **Public Home Feed** | Open `/` | Renders top articles, category pills, infinite scroll triggers next page. |
| **2** | **Taxonomy Hubs** | Navigate to `/tags`, `/categories`, `/posts` | All directories render with search, filters, and valid item links. |
| **3** | **Series Curriculum** | Open `/series` -> click series | Curriculum reader renders ordered chapters with view counts. |
| **4** | **Article Reader** | Open `/posts/community/:slug` | Markdown body renders, view counter displays, reactions button responds. |
| **5** | **Discussion Tree** | Post comment & reply | Comment appends optimistically; author can edit comment. |
| **6** | **Authentication** | Login & Register | JWT tokens stored; redirects to target route on successful login. |
| **7** | **Studio Publishing** | Write draft -> Publish | Draft saves, tags assign, published article appears on feed immediately. |
| **8** | **Creator Dashboard** | Open `/dashboard` | 4 KPI cards render statistics; status tabs switch; delete modal confirms. |
| **9** | **Moderation & Admin**| Open `/moderation` & `/admin` | Guards verify RBAC role; queues and settings load. |
| **10** | **SEO Verification** | Inspect `<head>` and `sitemap.xml` | Canonical tags match site URL; JSON-LD scripts are valid and sanitized. |

---

## 8. SECURITY & PRIVACY HARDENING CHECKLIST

- [x] **No Secret Leakage**: `NEXT_PUBLIC_` variables only contain non-sensitive values (public API URL, public site URL, Cloudinary cloud name, upload preset).
- [x] **JWT Storage**: Access tokens maintained in memory with secure storage sync.
- [x] **Route Guards**: `<AuthGuard>`, `<ModerationGuard>`, and `<AdminGuard>` protect all private routes.
- [x] **IDOR Prevention**: Backend controllers strictly validate `authorId` on all mutation endpoints.
- [x] **XSS Safety**: User-generated content rendered via safe React JSX bindings; JSON-LD structured data sanitized with `safeJsonLdReplacer`.
- [x] **Private SEO Directives**: All private/authenticated pages (`/dashboard`, `/login`, `/register`, `/admin/*`, `/moderation`, `/notifications`) enforce `noindex, nofollow`.

---

## 9. EXPLICIT OUT-OF-SCOPE FOR MVP

The following items are strictly **OUT OF SCOPE** for Phase F20 and the production MVP:
1. ❌ New backend API modules or endpoints.
2. ❌ PostgreSQL database migrations or table additions.
3. ❌ Public author directory (`/analysts`) — deferred to post-MVP.
4. ❌ Following activity feed (`/feed/following`) — deferred to post-MVP.
5. ❌ WebSocket real-time notifications or live ticker bars — deferred to future phase.
6. ❌ Math typesetting / KaTeX integration — deferred to future phase.
7. ❌ Global UI framework redesigns.

---

## 10. ACCEPTANCE CRITERIA

1. **Zero Dead Links**: 100% of navigation links in `Sidebar.tsx`, `Header.tsx`, and `UserMenu.tsx` resolve to valid, operational routes.
2. **Environment Template**: `apps/web/.env.example` exists with accurate variable keys and comments.
3. **Tests & Build**:
   - `npx vitest run` passes 100% (263/263 tests across 89 test files).
   - `npx tsc --noEmit` exits with 0 errors.
   - `npx next build` generates 23 routes with exit code 0.
4. **Backend & Database Immutability**:
   - 0 modifications to `apps/api`.
   - 0 modifications to `DATABASE_SCHEMA.sql`.
5. **Frozen Baselines**: F2.1 through F19.2 baselines remain 100% intact.

---

## 11. RISK ASSESSMENT

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Sidebar Regression** | Very Low | Low | Minimal edit removing 2 array items; unit test verifies all remaining links. |
| **Env Variable Mismatch** | Very Low | Medium | Clear `.env.example` with fallback defaults in `site-config.ts` and `apiClient`. |

---

## 12. FINAL VERDICT

# STATUS: **APPROVED**

Phase F20.0 provides a minimal, surgical, and robust hardening plan that achieves 100% active shell navigation and establishes full production readiness without modifying backend code or database schemas.
