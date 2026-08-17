# PHASE F3.0 — AUTHENTICATION & IDENTITY REVISED PRE-IMPLEMENTATION PLAN

**Target**: Next.js App Router Authentication Architecture, Identity Lifecycle & Route Guards  
**Phase**: F3.0  
**Mode**: STRICT READ-ONLY — PLANNING ONLY  
**Date**: 2026-08-15  
**Author**: Senior Staff Frontend Architect & Application Security Engineer  
**Status**: REVISED PLAN COMPLETED — READY FOR REVIEW  

---

## 1. Executive Summary

This document establishes the authoritative, revised architectural plan for **Phase F3 — Authentication & Identity** for the Finance Community Platform (`apps/web`).

This revision addresses and resolves all architectural contradictions and security considerations identified during the preliminary review:
1. **Token Lifecycle & Session Persistence**: The access token is stored **strictly in runtime memory**. There is no backend `/api/v1/auth/refresh` endpoint. On full page reload, in-memory authentication state is lost unless a valid token is supplied.
2. **Google OAuth Contract**: Fully aligned with the backend `POST /api/v1/auth/google` payload (`{ idToken: string }`), eliminating any client-side backend secrets.
3. **Authorization Boundaries**: Explicitly establishes that Frontend `AuthGuard` and `RoleGuard` are **UX/navigation guards only**, while NestJS backend guards (`JwtAuthGuard`, `AccountStatusGuard`, `EmailVerificationGuard`, `PermissionGuard`) remain the sole authoritative security enforcement layer.
4. **401 Error Handling**: Clearly differentiates credential failure on `POST /auth/login` from session expiration / unauthenticated access on protected endpoints.
5. **Open Redirect Defense**: Enforces strict same-origin internal path validation on `/login?redirect=<path>`.

---

## 2. Revision Changelog

| Revision Area | Previous Draft (F3.0) | Revised Plan (F3.0 Revised) | Rationale |
| :--- | :--- | :--- | :--- |
| **Token Persistence** | Claimed `/users/me` could restore sessions after reload | Clarified: In-memory token only; page reload loses session without token | Eliminates false persistence claims; respects zero-refresh contract |
| **Google OAuth** | Generic OAuth flow | Exact `GoogleAuthDto` (`{ idToken }`) to `POST /api/v1/auth/google` | Aligns directly with backend `auth.service.ts` |
| **Frontend RBAC** | Conflated frontend guards with security | Explicitly documented as UX-only navigation gates; backend is authoritative | Prevents dangerous false security assumptions |
| **401 Handling** | Generic 401 alert | Differentiates login credential error vs. authenticated API session loss | Eliminates confusing error messages |
| **Redirect Security** | Unvalidated redirect param | Strict internal path validation (blocks `//evil.com`, `https://`, `javascript:`) | Protects against Open Redirect vulnerabilities |
| **Registration Schema**| Included `displayName` in DTO | Aligned to `RegisterDto` (`email, password, username`) | Matches actual backend `register.dto.ts` |

---

## 3. Repository & Backend Auth Discovery

A source-level inspection of `apps/api/src/modules/auth` and `apps/api/src/modules/users` confirms the authoritative API contract:

### 3.1 Backend Endpoints

| HTTP Method | Backend Route | Handler | DTO / Payload | Response Contract | Status Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | `register` | `RegisterDto` (`email, password, username`) | `{ accessToken: string, tokenType: 'Bearer', user: { id, email, username, status } }` | `201 Created`, `400 Bad Request`, `409 Conflict` |
| `POST` | `/api/v1/auth/login` | `login` | `LoginDto` (`email, password`) | `{ accessToken: string, tokenType: 'Bearer', user: { id, email, username, status } }` | `200 OK`, `400 Bad Request`, `401 Unauthorized` |
| `POST` | `/api/v1/auth/google` | `authenticateGoogleUser` | `GoogleAuthDto` (`idToken: string`) | `{ accessToken: string, tokenType: 'Bearer', user: { id, email, username, status, provider: 'GOOGLE' } }` | `200 OK`, `401 Unauthorized` |
| `GET` | `/api/v1/users/me` | `getCurrentUserMe` | *None* (`Authorization: Bearer <token>`) | `{ id: string, email: string, status: string, roles: string[], profile?: ProfileEntity }` | `200 OK`, `401 Unauthorized` |

### 3.2 Backend Security Pipeline
- **JWT Verification**: `LocalJwtStrategy` validates symmetric JWT tokens signed with `secConfig.jwtSecret` (7-day lifespan `7d`). `SupabaseJwksStrategy` handles RS256 JWKS tokens if configured.
- **Authoritative Guards**:
  - `JwtAuthGuard`: Rejects unauthenticated requests with `401 Unauthorized`.
  - `AccountStatusGuard`: Blocks `SUSPENDED` and `BANNED` users with `403 Forbidden` (`ACCOUNT_SUSPENDED`, `ACCOUNT_BANNED`).
  - `EmailVerificationGuard`: Enforces email verification on mutations.
  - `PermissionGuard`: Verifies role permissions (`categories:manage`, `moderation:manage`, `admin:full`).

---

## 4. Authentication & Identity Lifecycle

```
[ User Interaction ]
   │
   ├── Native Login (email, password) ──────────► POST /api/v1/auth/login ──────────┐
   ├── Native Register (email, username, pwd) ──► POST /api/v1/auth/register ──────┤
   └── Google Sign-In (Google SDK idToken) ─────► POST /api/v1/auth/google ────────┤
                                                                                   ▼
                                                                  [ Backend Returns 200/201 ]
                                                        { accessToken: "...", user: { id, email... } }
                                                                                   │
                                                                                   ▼
                                                                        [ AuthContext Runtime ]
                                                                1. Store accessToken in memory
                                                                2. Register with Axios interceptor
                                                                3. GET /api/v1/users/me (sync roles)
                                                                4. Set isAuthenticated = true
                                                                                   │
                                                              ┌────────────────────┴────────────────────┐
                                                              ▼                                         ▼
                                                      [ Public UI ]                             [ Protected UI ]
                                               Header displays UserMenu                  AuthGuard / RoleGuard
                                               with Avatar & Logout                      renders guarded view
```

---

## 5. Token Lifecycle & Session Policy

### 5.1 In-Memory Storage Rule
- The access token resides **exclusively in runtime memory** (`AuthContext` React state).
- **NEVER** stored in `localStorage`, `sessionStorage`, `IndexedDB`, or client-accessible cookies.
- **NEVER** logged to the browser console or analytics trackers.

### 5.2 Zero Refresh Endpoint Baseline
- There is **NO** `/api/v1/auth/refresh` endpoint in the backend.
- F3 will **NOT** implement refresh tokens, silent refresh timers, background refresh workers, or fake session restoration.

### 5.3 Page Reload Behavior & Architectural Trade-off
- **Explicit Trade-off**: If the user performs a hard page reload (F5 / browser refresh), the runtime JavaScript memory is wiped, and the in-memory access token is lost.
- The application will transition cleanly to the unauthenticated state (`isAuthenticated = false`).
- `/api/v1/users/me` is an **identity synchronization endpoint**; it requires an active Bearer token and cannot restore authentication on its own without one.

---

## 6. Native Registration Flow

1. User visits `/register` and fills out `email`, `username`, `password`, and `confirmPassword`.
2. **Frontend UX Validation (`Zod`)**:
   - `email`: valid email string.
   - `username`: 3–30 characters, alphanumeric & underscores (`/^[a-zA-Z0-9_]+$/`).
   - `password`: minimum 6 characters (matches backend `@MinLength(6)` in `RegisterDto`).
   - `confirmPassword`: must match `password`.
3. Client submits payload `{ email, username, password }` to `POST /api/v1/auth/register`.
4. **Backend Authoritative Validation**:
   - Validates DTO via `class-validator`.
   - Checks local username/email uniqueness in database/store.
   - Provisions User, Profile, and `MEMBER` role.
   - Returns `{ accessToken, user }`.
5. On success (`201`): `AuthContext.setAuth(user, accessToken)` is invoked, and user is redirected to `/` or the validated redirect target.
6. On error (`409 Conflict` / `400 Bad Request`): Normalizes error code (`EMAIL_ALREADY_EXISTS`, `USERNAME_ALREADY_EXISTS`) and displays inline error in form.

---

## 7. Native Login Flow

1. User visits `/login` and fills out `email` and `password`.
2. Form validates input presence client-side.
3. Submits `{ email, password }` to `POST /api/v1/auth/login`.
4. On success (`200`):
   - Stores `accessToken` in memory.
   - Executes `GET /api/v1/users/me` to retrieve assigned roles (`roles: string[]`) and profile data.
   - Redirects user to sanitized `redirect` destination or `/`.
5. On error (`401 Unauthorized`): Displays form error: *"Invalid email or password credentials."*

---

## 8. Google OAuth Flow

1. User clicks *"Continue with Google"* button on `/login` or `/register`.
2. Google Identity Services SDK renders standard One Tap or popup prompt.
3. User completes Google authentication; Google SDK returns an `idToken`.
4. Frontend sends `{ idToken }` to `POST /api/v1/auth/google`.
5. Backend verifies token with Google OAuth client, provisions user via JIT provisioning, and returns application JWT `{ accessToken, user }`.
6. `AuthContext` stores access token in memory and fetches `/api/v1/users/me`.
7. **Security Boundary**: Frontend contains **ZERO** Google client secrets, backend private keys, or Supabase service keys.

---

## 9. Logout Flow

1. User clicks *"Sign Out"* in the Header user dropdown menu.
2. `AuthContext.clearAuth()` executes:
   - Sets `accessToken` to `null`.
   - Sets `user` to `null`.
   - Sets `isAuthenticated` to `false`.
   - Injects `null` token into Axios client interceptor.
   - Clears TanStack Query cache (`queryClient.clear()`).
3. User is navigated to `/login` or `/`.

---

## 10. AuthContext Architecture

`AuthContext` (`apps/web/lib/auth/AuthContext.tsx`) is a Client Component provider owning runtime auth state:

```typescript
export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  roles: string[];
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  isEmailVerified: boolean;
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
}
```

### Responsibility Boundaries
- **AuthContext OWNS**: Current user state, in-memory access token, loading indicator, auth actions.
- **AuthContext DOES NOT OWN**: Persistent browser storage, password hashing, Google token verification, backend authorization rules.

---

## 11. Axios Authentication Architecture

`apps/web/lib/api/client.ts` interacts directly with `AuthContext` via `TokenProvider`:
1. **Request Interceptor**:
   ```typescript
   apiClient.interceptors.request.use((config) => {
     const token = tokenProvider.getAccessToken();
     if (token && config.headers) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });
   ```
2. **Response Interceptor (401 Handling)**:
   - For authenticated API calls (e.g. `GET /posts`, `GET /users/me`), a `401 Unauthorized` triggers session clearing:
     - In-memory token is cleared.
     - Auth state is set to unauthenticated.
     - User is redirected to `/login?redirect=<currentPath>`.
   - Zero calls to non-existent `/auth/refresh`.

---

## 12. Session Initialization & Page Reload Behavior

1. App Mounts (`RootLayout` -> `AuthProvider`).
2. `AuthContext` initializes with `accessToken = null`, `user = null`, `isLoading = false`.
3. Application starts in clean unauthenticated state.
4. No background network requests are fired until the user initiates an action.

---

## 13. Route Protection (UX Only)

`AuthGuard` (`components/auth/AuthGuard.tsx`) wraps client views:
- **`isLoading === true`**: Displays `LoadingState message="Verifying session..."`.
- **`isAuthenticated === false`**: Redirects to `/login?redirect=<currentPath>`.
- **`user.status === 'SUSPENDED' | 'BANNED'`**: Displays account restriction notice.

> ⚠️ **CRITICAL ARCHITECTURAL RULE**: `AuthGuard` is a UX helper to prevent screen flicker and guide users. It is **NOT** a security boundary. Any client can bypass frontend JavaScript guards. Real authorization is enforced on every request by the backend `JwtAuthGuard`.

---

## 14. RBAC / Permission Guard Architecture

`RoleGuard` (`components/auth/RoleGuard.tsx`) restricts privileged UI sections (e.g., `/admin` links):
- Reads `user.roles` returned by `GET /api/v1/users/me`.
- Checks if `user.roles` includes required roles (e.g. `['ADMIN']`, `['MODERATOR']`).
- If missing: Renders `ErrorState title="Access Restricted" message="You do not have permission to view this section."`.
- **Limitation Note**: Because `GET /api/v1/users/me` exposes `roles: string[]` rather than fine-grained permissions, frontend guards operate on role-level evaluation (`ADMIN`, `MODERATOR`, `MEMBER`). Backend `PermissionGuard` remains the authoritative permission validator.

---

## 15. Account Status Handling

- Backend `AccountStatusGuard` statefully checks user status on every authenticated request and throws `403 Forbidden` (`ACCOUNT_SUSPENDED`, `ACCOUNT_BANNED`) if inactive.
- Frontend intercepts this 403 error code and displays a dedicated account suspended banner explaining that authenticated actions are locked.

---

## 16. 401 & Error Handling Policy

The application distinguishes between two types of 401 errors:

| Context | Triggering Route | Error Interpretation | Frontend UX Behavior |
| :--- | :--- | :--- | :--- |
| **Auth Action** | `POST /api/v1/auth/login` | Bad credentials | Displays: *"Invalid email or password credentials."* |
| **Auth Action** | `POST /api/v1/auth/google` | Invalid Google ID token | Displays: *"Google authentication failed. Please try again."* |
| **Authenticated API** | `GET /api/v1/users/me`, `POST /posts` | Session expired / missing token | Clears in-memory session and redirects to `/login?redirect=<path>` |

---

## 17. Redirect Security (Open Redirect Defense)

The redirect parameter on `/login?redirect=<path>` is validated using `validateRedirectUrl(url)`:
```typescript
export function sanitizeRedirectUrl(redirect: string | null, fallback = '/'): string {
  if (!redirect) return fallback;
  // Must start with exactly one forward slash (disallows protocol-relative '//evil.com')
  if (redirect.startsWith('/') && !redirect.startsWith('//') && !redirect.startsWith('/\\')) {
    return redirect;
  }
  return fallback;
}
```
Rejects: `https://evil.com`, `//evil.com`, `javascript:alert(1)`.

---

## 18. XSS & Token Exposure Prevention

- Access tokens are never rendered into HTML markup or JSX.
- Access tokens are never stored in browser persistent storage (`localStorage` / `sessionStorage`).
- Access tokens are never included in URL query parameters.
- Backend error responses are sanitized through `lib/api/client.ts` to prevent raw database stack traces or SQL snippets from rendering.

---

## 19. Form Validation Schemas (`Zod`)

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
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
```

---

## 20. Accessibility (WCAG 2.2 AA)

- Semantic `<form>`, `<fieldset>`, `<label>`, and `<input>` elements.
- Inputs connected to error messages via `aria-describedby` and `aria-invalid`.
- Visible keyboard focus rings (`focus-visible:ring-1 focus-visible:ring-primary`).
- Google Sign-In button includes accessible `aria-label="Sign in with Google"`.
- UserMenu dropdown implements Radix UI keyboard navigation (Arrow Up/Down, Enter, Escape).

---

## 21. SEO Foundation

- Auth pages (`/login`, `/register`) configure App Router metadata:
  ```typescript
  export const metadata: Metadata = {
    title: 'Sign In',
    robots: {
      index: false,
      follow: false,
    },
  };
  ```

---

## 22. Testing Plan

Vitest and React Testing Library test suite for Phase F3:

1. **`tests/auth/auth-service.test.ts`**:
   - `login()` sends correct payload and receives Bearer token.
   - `register()` sends correct payload and receives Bearer token.
   - `googleAuth()` sends `{ idToken }` payload.
   - `getCurrentUserMe()` retrieves user profile and roles.
   - Handles `401`, `409`, and `429` error normalization.

2. **`tests/auth/AuthContext.test.tsx`**:
   - Initial state is unauthenticated.
   - `login()` sets `isAuthenticated = true` and updates user state.
   - `logout()` wipes in-memory token and resets state.
   - API `401` clears in-memory state.

3. **`tests/components/LoginForm.test.tsx`**:
   - Renders email and password fields with labels.
   - Rejects invalid emails client-side.
   - Displays backend error alert on `401`.

4. **`tests/components/RegisterForm.test.tsx`**:
   - Enforces 6+ char password and matching confirm password.
   - Displays username conflict alert on `409`.

5. **`tests/components/AuthGuard.test.tsx`**:
   - Shows loading spinner when `isLoading === true`.
   - Redirects to `/login` when unauthenticated.
   - Renders children when authenticated.

6. **`tests/auth/redirect.test.ts`**:
   - Allows `/dashboard` and `/posts/create`.
   - Rejects `https://evil.com` and `//evil.com`.

---

## 23. Implementation Sequence

1. **Types**: Create `apps/web/types/auth.ts` with DTOs and User interfaces.
2. **Schemas**: Create `apps/web/lib/auth/auth-schemas.ts` (Zod schemas).
3. **API Service**: Create `apps/web/lib/auth/auth-service.ts` (Axios calls to `/auth/login`, `/auth/register`, `/auth/google`, `/users/me`).
4. **Redirect Utility**: Create `apps/web/lib/auth/redirect.ts` with open redirect sanitization.
5. **AuthContext Integration**: Update `apps/web/lib/auth/AuthContext.tsx` to provide `login`, `register`, `loginWithGoogle`, `logout` handlers.
6. **Form Components**:
   - Create `apps/web/components/auth/LoginForm.tsx`
   - Create `apps/web/components/auth/RegisterForm.tsx`
   - Create `apps/web/components/auth/GoogleAuthButton.tsx`
   - Create `apps/web/components/auth/UserMenu.tsx`
7. **Guard Components**:
   - Create `apps/web/components/auth/AuthGuard.tsx`
   - Create `apps/web/components/auth/RoleGuard.tsx`
8. **Auth Pages**:
   - Create `apps/web/app/(auth)/layout.tsx`
   - Create `apps/web/app/(auth)/login/page.tsx`
   - Create `apps/web/app/(auth)/register/page.tsx`
9. **Header Integration**: Connect `Header.tsx` to render `UserMenu` when authenticated, or *"Sign In"* button when unauthenticated.
10. **Test Execution**: Write and run all Vitest tests, run `npm run typecheck`, and run `npm run build`.

---

## 24. Explicit Non-Scope for Phase F3

- ❌ Password reset / forgot password flow (Backend endpoint not implemented; gated)
- ❌ Facebook OAuth (Backend endpoint not implemented; gated)
- ❌ Silent token refresh / background refresh cookies (Backend endpoint not implemented; gated)
- ❌ Public post feed fetching (Phase F4)
- ❌ Post detail reader & Series detail (Phase F5)
- ❌ Comments & reactions (Phase F6)
- ❌ Public user profiles & follow logic (Phase F7)
- ❌ Notifications center (Phase F8)
- ❌ Post creation studio (Phase F9)
- ❌ Moderation queue & Admin dashboard (Phases F10 & F11)
- ❌ Backend source modifications or database migrations

---

## 25. Risks & Architectural Decisions

- **Risk A (In-Memory Token Lost on Full Page Reload)**:  
  *Decision*: Accepted for Phase F3. The backend does not currently support refresh tokens or session cookies.
- **Risk B (Frontend RBAC Bypass)**:  
  *Decision*: Accepted. Frontend guards are treated strictly as UX aids. Backend `PermissionGuard` and `JwtAuthGuard` are the authoritative security enforcement mechanisms.
- **Risk C (Deferred Password Recovery)**:  
  *Decision*: The `/login` page displays a static help notice: *"Need password recovery? Contact platform administration."* without calling non-existent endpoints.
- **Risk D (Google Identity Services Dependency)**:  
  *Decision*: Frontend only fetches Google `idToken`; backend verifies authenticity and provisions user.

---

## 26. Acceptance Checklist for Phase F3

- [ ] No `/auth/refresh` endpoint called or implemented
- [ ] No refresh token or background refresh worker implemented
- [ ] No auth token in `localStorage` or `sessionStorage`
- [ ] In-memory token lifecycle strictly enforced
- [ ] Page reload behavior explicitly documented
- [ ] Google OAuth uses exact `idToken` payload (`POST /api/v1/auth/google`)
- [ ] Zero backend secrets or private keys in frontend
- [ ] Frontend `AuthGuard` and `RoleGuard` explicitly documented as UX-only
- [ ] Backend remains the sole authoritative authorization layer
- [ ] 401 handling differentiates login credentials failure from API session loss
- [ ] Open redirect protection validates same-origin internal paths
- [ ] AuthContext owns runtime authentication state
- [ ] Axios client attaches in-memory Bearer token
- [ ] `/login` and `/register` have `noindex, nofollow` SEO metadata
- [ ] Zero backend source files or database schemas modified
- [ ] All Vitest tests pass cleanly
- [ ] TypeScript typecheck passes with 0 errors
- [ ] Next.js production build succeeds

---

## 27. Human Approval Gate

```text
============================================================
PHASE F3.0 — REVISED HUMAN APPROVAL GATE
============================================================

Planning: COMPLETE
Repository Inspection: COMPLETE
Backend Contract Verification: COMPLETE

Source Code Changes: 0
Backend Changes: 0
Database Changes: 0
Migrations: 0
Dependency Changes: 0

Token Persistence Model:
IN-MEMORY ONLY

Refresh Endpoint:
NOT AVAILABLE — NOT IMPLEMENTED

Frontend Authorization:
UX ONLY

Backend Authorization:
AUTHORITATIVE

Status:
READY FOR FINAL HUMAN RE-AUDIT

STOP — DO NOT IMPLEMENT CODE.
============================================================
```
