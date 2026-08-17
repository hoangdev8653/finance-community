# PHASE F3.0 — AUTHENTICATION & IDENTITY PRE-IMPLEMENTATION PLAN

**Target**: Next.js App Router Authentication Architecture, Identity Lifecycle & Route Guards  
**Phase**: F3.0  
**Mode**: STRICT READ-ONLY — PLANNING ONLY  
**Date**: 2026-08-15  
**Author**: Senior Staff Frontend Architect & Security Engineer  
**Status**: PLANNING COMPLETE — READY FOR REVIEW  

---

## 1. Executive Summary

This document establishes the comprehensive architectural plan for **Phase F3 — Authentication & Identity** for the Finance Community Platform (`apps/web`).

Phase F3 connects the **AuthContext foundation shell** established in Phase F2 to the actual NestJS Backend REST Authentication API (`apps/api`). The system supports native local registration, credential login, Google OAuth 1-click social authentication, in-memory JWT token lifecycle management, user profile/roles synchronization (`/api/v1/users/me`), route protection guards, and strict defense against XSS vulnerabilities.

In accordance with the approved **F1.1 Contract Reconciliation Audit**, no non-existent endpoints (such as `/api/v1/auth/refresh` or `/api/v1/auth/forgot-password`) are assumed or called.

---

## 2. Repository & Backend Auth Discovery

### 2.1 Backend Controllers & Endpoints Inventory (`apps/api/src/modules/auth`)
A strict source-level inspection of `apps/api/src/modules/auth/controllers/auth.controller.ts` and `apps/api/src/modules/users/controllers/users.controller.ts` confirms the exact backend authentication contract:

| HTTP Method | Backend Route | Handler | Payload / DTO | Response Contract | Status Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | `register` | `RegisterDto` (`email, password, username, displayName?`) | `{ accessToken: string, tokenType: 'Bearer', user: { id, email, username, status } }` | `201 Created`, `400 Bad Request`, `409 Conflict` |
| `POST` | `/api/v1/auth/login` | `login` | `LoginDto` (`email, password`) | `{ accessToken: string, tokenType: 'Bearer', user: { id, email, username, status } }` | `200 OK`, `400 Bad Request`, `401 Unauthorized` |
| `POST` | `/api/v1/auth/google` | `authenticateGoogle` | `GoogleAuthDto` (`idToken: string`) | `{ accessToken: string, tokenType: 'Bearer', user: { id, email, username, status, provider: 'GOOGLE' } }` | `200 OK`, `401 Unauthorized` |
| `GET` | `/api/v1/users/me` | `getCurrentUserMe` | *None* (`Authorization: Bearer <token>`) | `{ id: string, email: string, username: string, displayName: string, avatarUrl?: string, roles: string[], status: string, isEmailVerified: boolean }` | `200 OK`, `401 Unauthorized` |

### 2.2 JWT Validation & Security Guards Pipeline
- **Token Signing**: Native JWT tokens signed with secret (`secConfig.jwtSecret`) with 7-day expiration (`expiresIn: '7d'`).
- **Token Validation**: Passport JWT strategy (`LocalJwtStrategy` and `SupabaseJwksStrategy`) validates `Authorization: Bearer <accessToken>` header, extracts `payload.sub` (UUID), and loads user roles via `JitProvisioningService`.
- **5-Tier Guard Chain**:
  1. `ThrottlerGuard`: Anti-brute-force rate limiting (login/register endpoints).
  2. `JwtAuthGuard`: Validates Bearer token.
  3. `AccountStatusGuard`: Blocks `SUSPENDED` and `BANNED` users with `403 Forbidden`.
  4. `EmailVerificationGuard`: Enforces email verification on mutation actions.
  5. `PermissionGuard`: Enforces RBAC permissions (`categories:manage`, `moderation:manage`, `admin:full`).

---

## 3. Authentication & Identity Lifecycle Flow

```
                                  [ User Action ]
                     ┌───────────────────┴───────────────────┐
                     ▼                                       ▼
            [ Native Login / Register ]             [ Google Social Sign-In ]
                     │                                       │
            POST /api/v1/auth/login                 POST /api/v1/auth/google
            POST /api/v1/auth/register                       │
                     └───────────────────┬───────────────────┘
                                         ▼
                             [ Backend Returns 200/201 ]
                     { accessToken: "jwt...", user: { id, email... } }
                                         │
                                         ▼
                             [ Frontend AuthContext ]
                     - Stores accessToken in memory
                     - Injects token into Axios Client
                     - Fetches GET /api/v1/users/me (roles & profile)
                     - Sets isAuthenticated = true
                                         │
                     ┌───────────────────┴───────────────────┐
                     ▼                                       ▼
             [ Public Routes ]                       [ Protected Routes ]
             Header displays Avatar &                <AuthGuard> verifies status;
             User Menu Dropdown                      <RoleGuard> checks permissions
```

---

## 4. User Flows & State Management

### 4.1 Native Registration Flow (`/register`)
1. User enters `email`, `username`, `password`, and `confirmPassword`.
2. Form validates client-side using `Zod` (email format, password minimum 8 chars with letters/numbers, alphanumeric username 3-30 chars).
3. Submits payload to `POST /api/v1/auth/register`.
4. On success (`201`): `AuthContext.setAuth(user, accessToken)` is called, user is redirected to `/dashboard` or return URL.
5. On error (`400`/`409`): Field errors are mapped directly to form fields (`EMAIL_ALREADY_EXISTS`, `USERNAME_ALREADY_EXISTS`).

### 4.2 Native Login Flow (`/login`)
1. User enters `email` and `password`.
2. Form validates client-side and submits to `POST /api/v1/auth/login`.
3. On success (`200`): Stores in-memory token, fetches `/api/v1/users/me`, redirects to target destination.
4. On error (`401`): Displays high-contrast alert: *"Invalid email or password credentials"*.

### 4.3 Google OAuth 1-Click Flow
1. User clicks *"Continue with Google"*.
2. Initiates Google Identity Services / OAuth client to acquire Google `idToken`.
3. Sends `POST /api/v1/auth/google` with `{ idToken }`.
4. Backend verifies ID token, provisions user via JIT provisioning, and returns Bearer token.
5. `AuthContext` updates session seamlessly.

### 4.4 Logout Flow
1. User clicks *"Sign Out"* in user menu dropdown.
2. `AuthContext.clearAuth()` is invoked:
   - In-memory `accessToken` set to `null`.
   - `user` set to `null`.
   - TanStack Query cache cleared (`queryClient.clear()`).
3. User is redirected to `/login` or `/`.

### 4.5 Session Restoration & Refresh Policy
- **Token Storage**: In-memory only (eliminates localStorage XSS token theft).
- **Session Duration**: Access token is valid for 7 days (`7d`).
- **F1.1 Contract Compliance**: No `/auth/refresh` endpoint is called. If a request returns `401 Unauthorized`, `AuthContext` clears session and redirects to `/login?redirect=<path>`.

---

## 5. Target File Structure for Phase F3

```
apps/web/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx                    # Minimalist editorial auth layout (no full sidebar)
│   │   ├── login/
│   │   │   └── page.tsx                  # Sign In Page
│   │   └── register/
│   │       └── page.tsx                  # Sign Up Page
│   └── (protected)/
│       └── layout.tsx                    # Protected Route Boundary Wrapper
│
├── components/
│   └── auth/
│       ├── LoginForm.tsx                 # Login Form Component (React Hook Form + Zod)
│       ├── RegisterForm.tsx              # Register Form Component
│       ├── GoogleAuthButton.tsx          # Google Social Auth Trigger Button
│       ├── AuthGuard.tsx                 # Route Protection Guard (Client Component)
│       ├── RoleGuard.tsx                 # RBAC Permission Guard (e.g. admin/moderation)
│       └── UserMenu.tsx                  # Header User Profile & Logout Dropdown
│
├── lib/
│   ├── auth/
│   │   ├── auth-service.ts               # Typed Auth API calls (login, register, google, me)
│   │   ├── auth-schemas.ts               # Zod validation schemas for forms
│   │   └── use-auth-redirect.ts          # Redirect helper hook for protected routes
│   └── api/
│       └── client.ts                     # Existing Axios Client with Bearer token interceptor
│
├── types/
│   └── auth.ts                           # Auth DTO and User Session Type definitions
│
└── tests/
    ├── auth/
    │   └── auth-service.test.ts          # Unit tests for auth API service calls
    └── components/
        ├── LoginForm.test.tsx            # Unit tests for LoginForm validation & submission
        ├── RegisterForm.test.tsx         # Unit tests for RegisterForm validation & error display
        └── AuthGuard.test.tsx            # Unit tests for AuthGuard route protection
```

---

## 6. Route Protection & RBAC Guards

### 6.1 `AuthGuard` Component
Wraps authenticated routes (`/dashboard`, `/posts/create`, `/notifications`, `/settings/*`).
- If `isLoading === true`: Renders `LoadingState message="Verifying session..."`.
- If `isAuthenticated === false`: Redirects to `/login?redirect=<currentPath>`.
- If `user.status === 'SUSPENDED'` or `'BANNED'`: Renders high-contrast account suspended alert banner.

### 6.2 `RoleGuard` Component
Wraps privileged administrative routes (`/admin/*`, `/moderation/*`).
- Evaluates `user.roles` against required role (e.g., `ADMIN`, `MODERATOR`).
- If unauthorized: Renders `ErrorState title="Access Restricted" message="You do not have permission to view this administrative area."`.

---

## 7. Form Validation Schemas (`Zod`)

```typescript
// lib/auth/auth-schemas.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
```

---

## 8. Security & Vulnerability Defenses

1. **Zero Client Secret Exposure**: Zero backend JWT secrets or private keys embedded in frontend code.
2. **In-Memory Token Storage**: Access tokens reside strictly in memory/React Context. Never written to `localStorage` or `sessionStorage` (preventing XSS exfiltration).
3. **Normalized Error Sanitization**: Error payloads display clean user-friendly messages without exposing database internals or backend stack traces.
4. **Rate Limit Defense**: Handled automatically via NestJS `ThrottlerGuard` returning `429 Too Many Requests` handled by `client.ts` toast notifications.

---

## 9. Accessibility (WCAG 2.2 AA)

- Accessible form labels associated with inputs via `htmlFor` and `id`.
- Inline error messages associated with inputs via `aria-describedby` and `aria-invalid="true"`.
- Visible focus rings on submit buttons and social auth buttons.
- Keyboard navigation supported across all form fields and user menu dropdowns.

---

## 10. SEO & Metadata Policy

- Auth pages (`/login`, `/register`) configured with `robots: { index: false, follow: false }` to prevent search engine indexing of private auth entry points.
- Title: `Sign In | Finance Pulse` and `Join Community | Finance Pulse`.

---

## 11. Testing Plan

Vitest and React Testing Library tests for Phase F3:
1. `auth-service.test.ts`: Mocked Axios tests validating request payloads and token reception for login, register, and google auth.
2. `LoginForm.test.tsx`: Validates email/password field requirements, client-side validation errors, and submit triggers.
3. `RegisterForm.test.tsx`: Validates password strength rules, confirm password matching, and conflict error handling.
4. `AuthGuard.test.tsx`: Validates redirect behavior for unauthenticated sessions and loading state rendering.

---

## 12. Implementation Sequence

1. Define auth TypeScript types in `types/auth.ts`.
2. Define Zod validation schemas in `lib/auth/auth-schemas.ts`.
3. Implement typed auth API service in `lib/auth/auth-service.ts`.
4. Connect `AuthContext.tsx` to `auth-service.ts` for login, register, googleAuth, and logout actions.
5. Create `GoogleAuthButton.tsx` social component.
6. Create `LoginForm.tsx` and `RegisterForm.tsx` components.
7. Create `AuthGuard.tsx` and `RoleGuard.tsx` components.
8. Assemble `app/(auth)/login/page.tsx` and `app/(auth)/register/page.tsx` pages.
9. Wire Header user menu dropdown to display authenticated profile and logout trigger.
10. Write and execute Vitest unit test suite.
11. Execute `npm run typecheck` and `npm run build` validation.

---

## 13. Explicit Non-Scope for Phase F3

- ❌ Post creation or rich text editing (Phase F9)
- ❌ Public feed post fetching (Phase F4)
- ❌ Article reader & Series detail (Phase F5)
- ❌ Comments & reactions (Phase F6)
- ❌ User profile public views & followers (Phase F7)
- ❌ Notifications center (Phase F8)
- ❌ Moderation & Admin dashboards (Phases F10 & F11)
- ❌ Password reset / forgot password flow (Backend endpoint not implemented; gated)
- ❌ Facebook OAuth (Backend endpoint not implemented; gated)

---

## 14. Risks & Architectural Decisions

- **Risk 1: Token Persistence across Page Refreshes**:  
  *Decision*: On app load, `AuthContext` can read session state or request `/api/v1/users/me` if an active cookie/session token exists.
- **Risk 2: Gated Backend Features (Forgot Password & Facebook OAuth)**:  
  *Decision*: The UI will display a clean disabled/gated note: *"Password recovery is coming soon. Please contact administrator if locked out"* without sending requests to non-existent endpoints.

---

## 15. Acceptance Checklist for Phase F3

- [ ] `LoginForm` renders with email/password inputs, client-side validation, and error alert.
- [ ] `RegisterForm` renders with email, username, password, confirmPassword validation.
- [ ] `GoogleAuthButton` triggers social login against `/api/v1/auth/google`.
- [ ] Successful login updates `AuthContext` in-memory state and attaches Bearer token to Axios client.
- [ ] `Header` user dropdown displays user avatar, displayName, username, and Sign Out button.
- [ ] `AuthGuard` protects authenticated routes and redirects unauthenticated users to `/login`.
- [ ] `RoleGuard` restricts access based on user RBAC roles.
- [ ] Auth pages have `noindex` SEO robots metadata.
- [ ] Vitest unit tests pass for forms, services, and guards.
- [ ] `npm run typecheck` and `npm run build` pass with 0 errors.
- [ ] Zero backend files or database schemas modified.

---

## 16. Human Approval Gate

```text
============================================================
HUMAN APPROVAL GATE
============================================================

PHASE F3.0 — AUTHENTICATION & IDENTITY PRE-IMPLEMENTATION PLAN

Architecture Plan: COMPLETED
Repository Inspection: COMPLETED
Backend Contract Verification: COMPLETED
Source Code Changes: 0
Database Changes: 0
Migrations: 0

STATUS: READY FOR HUMAN REVIEW

STOP — DO NOT IMPLEMENT CODE.
Awaiting explicit human approval before Phase F3 implementation.
============================================================
```
