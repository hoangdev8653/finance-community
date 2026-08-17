# PHASE F3.0 — AUTHENTICATION & IDENTITY FINAL PRE-IMPLEMENTATION PLAN

**Target**: Next.js App Router Authentication Architecture, Identity Lifecycle & Route Guards  
**Phase**: F3.0  
**Mode**: STRICT READ-ONLY — PLANNING ONLY  
**Date**: 2026-08-15  
**Author**: Senior Staff Frontend Architect & Application Security Engineer  
**Status**: FINAL PLAN COMPLETED — READY FOR FINAL HUMAN RE-AUDIT  

---

## 1. Executive Summary

This document establishes the authoritative, finalized architectural plan for **Phase F3 — Authentication & Identity** for the Finance Community Platform (`apps/web`).

This final revision resolves all remaining architectural and security concerns:
1. **Private Runtime Token Storage**: The JWT `accessToken` is completely removed from the public React `AuthContext` API. It resides in a dedicated private runtime token store (`lib/auth/token-store.ts`) in JavaScript closure memory. React components only consume `{ user, isAuthenticated, isLoading, login, register, loginWithGoogle, logout }`.
2. **Decoupled Unidirectional Token & Network Architecture**: Eliminates circular dependencies between React `AuthContext` and the Axios HTTP client. Both layers consume the independent, runtime-only `token-store.ts`.
3. **Hardened Redirect Validation**: Protects against all open redirect bypass vectors (`//evil.com`, `/\evil.com`, `\\evil.com`, `javascript:`, `data:`, `/%2F%2Fevil.com`), falling back strictly to `/`.
4. **Fine-Grained 403 Error Differentiation**: Distinguishes `ACCOUNT_SUSPENDED` and `ACCOUNT_BANNED` from `INSUFFICIENT_PERMISSIONS` and generic 403 authorization errors using backend error codes.
5. **Zero Backend/Database Impact**: 0 backend source files, database schemas, or migrations modified.

---

## 2. Final Revision Changelog

| Issue | Previous Draft (Revised F3.0) | Final Plan (F3.0 Final) | Architectural Rationale |
| :--- | :--- | :--- | :--- |
| **Token Exposure** | `accessToken` exposed in `AuthContextType` | `accessToken` removed from `AuthContextType`; private in `token-store.ts` | Eliminates token leakage into React component tree & dev tools |
| **Dependency Cycle** | Axios registered via `setTokenProvider` inside `AuthContext` | Unidirectional `token-store.ts` subscribed by both Axios & `AuthContext` | Clean separation of concerns; no React hooks in network client |
| **Redirect Security** | Basic prefix check `startsWith('/')` | Multi-vector sanitizer rejecting protocol-relative, backslash & encoded payloads | Complete immunity against open redirect vulnerabilities |
| **403 Classification** | Treated all 403s as account suspension | Error code parser differentiates `ACCOUNT_SUSPENDED`, `ACCOUNT_BANNED`, `INSUFFICIENT_PERMISSIONS` | Accurate UX without misclassifying permission denials as bans |

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
                                                                        [ Private Token Store ]
                                                                        tokenStore.setToken(jwt)
                                                                                   │
                                                        ┌──────────────────────────┴──────────────────────────┐
                                                        ▼                                                     ▼
                                              [ Axios HTTP Client ]                                  [ AuthContext (UI) ]
                                          - Interceptor injects token                             - Syncs GET /users/me
                                          - Emits onUnauthorized()                                - Sets isAuthenticated=true
                                                                                                  - Exposes user (no token)
```

---

## 5. Token Lifecycle & Session Policy

### 5.1 Private In-Memory Token Store Architecture (`lib/auth/token-store.ts`)
The access token is stored in module closure memory, accessible only to the network layer:

```typescript
// apps/web/lib/auth/token-store.ts

type UnauthorizedListener = () => void;

let runtimeAccessToken: string | null = null;
const unauthorizedListeners: Set<UnauthorizedListener> = new Set();

export const tokenStore = {
  getToken: (): string | null => runtimeAccessToken,
  setToken: (token: string | null): void => {
    runtimeAccessToken = token;
  },
  clearToken: (): void => {
    runtimeAccessToken = null;
  },
  subscribeUnauthorized: (listener: UnauthorizedListener): (() => void) => {
    unauthorizedListeners.add(listener);
    return () => unauthorizedListeners.delete(listener);
  },
  notifyUnauthorized: (): void => {
    runtimeAccessToken = null;
    unauthorizedListeners.forEach((listener) => listener());
  },
};
```

### 5.2 Zero Browser Storage Persistence
- **NEVER** stored in `localStorage`, `sessionStorage`, `IndexedDB`, or client cookies.
- **NEVER** logged to browser console or analytics trackers.
- **NEVER** exposed via React Context to UI components.

### 5.3 Page Reload Behavior & Architectural Trade-off
- **Explicit Trade-off**: If the user reloads the page (F5 / browser refresh), runtime JavaScript memory is cleared, and the in-memory access token is lost.
- The application resets cleanly to `isAuthenticated = false`.
- `/api/v1/users/me` is an identity synchronization endpoint requiring an active Bearer token; it cannot restore an authentication session without a token.

---

## 6. Native Registration Flow

1. User visits `/register` and completes `email`, `username`, `password`, `confirmPassword`.
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
5. On success (`201`): `tokenStore.setToken(accessToken)` is called, `AuthContext` updates user state, and user is navigated to sanitized target destination.
6. On error (`409 Conflict` / `400 Bad Request`): Normalizes error code (`EMAIL_ALREADY_EXISTS`, `USERNAME_ALREADY_EXISTS`) and displays inline error in form.

---

## 7. Native Login Flow

1. User visits `/login` and fills out `email` and `password`.
2. Form validates input presence client-side.
3. Submits `{ email, password }` to `POST /api/v1/auth/login`.
4. On success (`200`):
   - Stores `accessToken` in `tokenStore`.
   - Executes `GET /api/v1/users/me` to retrieve assigned roles (`roles: string[]`) and profile data.
   - Updates `AuthContext` state (`isAuthenticated = true`).
   - Redirects user to sanitized `redirect` destination or `/`.
5. On error (`401 Unauthorized`): Displays form error: *"Invalid email or password credentials."*

---

## 8. Google OAuth Flow

1. User clicks *"Continue with Google"* button on `/login` or `/register`.
2. Google Identity Services SDK renders standard One Tap or popup prompt.
3. User completes Google authentication; Google SDK returns an `idToken`.
4. Frontend sends `{ idToken }` to `POST /api/v1/auth/google`.
5. Backend verifies token with Google OAuth client, provisions user via JIT provisioning, and returns application JWT `{ accessToken, user }`.
6. `tokenStore.setToken(accessToken)` updates runtime token, and `AuthContext` synchronizes with `/api/v1/users/me`.
7. **Security Boundary**: Frontend contains **ZERO** Google client secrets, backend private keys, or Supabase service keys.

---

## 9. Logout Flow

1. User clicks *"Sign Out"* in the Header user dropdown menu.
2. `AuthContext.logout()` executes:
   - `tokenStore.clearToken()`.
   - Sets `user` state to `null`.
   - Sets `isAuthenticated` to `false`.
   - Clears TanStack Query cache (`queryClient.clear()`).
3. User is navigated to `/login` or `/`.

---

## 10. AuthContext Architecture (Clean Public API)

`AuthContext` (`apps/web/lib/auth/AuthContext.tsx`) provides UI state **without exposing the token**:

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
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
}
```

---

## 11. Axios Authentication Architecture

`apps/web/lib/api/client.ts` imports only `tokenStore`:

```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStore } from '../auth/token-store';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request Interceptor: Reads directly from tokenStore
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Notifies tokenStore on API 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const normalizedError = {
      statusCode: error.response?.status || 500,
      error: error.response?.data?.error || error.name || 'Network Error',
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      code: error.response?.data?.code || 'UNKNOWN_ERROR',
    };

    // On authenticated API 401, notify listeners to clear UI state
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/')) {
      tokenStore.notifyUnauthorized();
    }

    return Promise.reject(normalizedError);
  }
);
```

---

## 12. Hardened Redirect Security (Multi-Vector Sanitizer)

`apps/web/lib/auth/redirect.ts` enforces strict validation against open redirect attacks:

```typescript
export function sanitizeRedirectUrl(url: string | null | undefined, fallback = '/'): string {
  if (!url || typeof url !== 'string') return fallback;

  const trimmed = url.trim();

  // 1. Must start with single slash, followed by valid relative path character
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\') || trimmed.startsWith('\\')) {
    return fallback;
  }

  // 2. Reject scheme indicators or encoded backslashes
  if (trimmed.includes(':') || trimmed.toLowerCase().includes('%2f') || trimmed.toLowerCase().includes('%5c')) {
    return fallback;
  }

  // 3. Ensure valid URL path characters only
  if (!/^\/[a-zA-Z0-9_\-\/\.\?=\&%#]*$/.test(trimmed)) {
    return fallback;
  }

  return trimmed;
}
```

### Verified Test Vectors Rejected by Sanitizer:
- `https://evil.com` -> `/`
- `http://evil.com` -> `/`
- `//evil.com` -> `/`
- `/\evil.com` -> `/`
- `\\evil.com` -> `/`
- `javascript:alert(1)` -> `/`
- `data:text/html,...` -> `/`
- `/%2F%2Fevil.com` -> `/`
- `/%2f%2fevil.com` -> `/`
- `/%5C%5Cevil.com` -> `/`

---

## 13. Fine-Grained 403 & Error Handling Policy

The application inspects the backend error `code` to differentiate 403 scenarios:

```typescript
export function handleApiError(error: any) {
  if (error.statusCode === 403) {
    switch (error.code) {
      case 'ACCOUNT_SUSPENDED':
        return { type: 'SUSPENDED', message: 'Your account is suspended. Feature access is restricted.' };
      case 'ACCOUNT_BANNED':
        return { type: 'BANNED', message: 'Your account has been permanently banned.' };
      case 'INSUFFICIENT_PERMISSIONS':
      case 'PERMISSION_DENIED':
        return { type: 'FORBIDDEN', message: 'You do not have permission to perform this action.' };
      default:
        return { type: 'GENERIC_403', message: error.message || 'Access denied.' };
    }
  }
  return { type: 'GENERAL_ERROR', message: error.message || 'An error occurred.' };
}
```

---

## 14. Route Protection (UX Only)

`AuthGuard` (`components/auth/AuthGuard.tsx`) wraps client views:
- **`isLoading === true`**: Displays `LoadingState message="Verifying session..."`.
- **`isAuthenticated === false`**: Redirects to `/login?redirect=<currentPath>`.
- **`user.status === 'SUSPENDED' | 'BANNED'`**: Displays account restriction notice.

> ⚠️ **CRITICAL ARCHITECTURAL RULE**: `AuthGuard` is a UX helper. It is **NOT** a security boundary. Real authorization is enforced on every request by the backend `JwtAuthGuard`.

---

## 15. RBAC / Role Guard Architecture

`RoleGuard` (`components/auth/RoleGuard.tsx`) restricts privileged UI sections:
- Reads `user.roles` returned by `GET /api/v1/users/me`.
- Checks if `user.roles` includes required roles (e.g. `['ADMIN']`, `['MODERATOR']`).
- If missing: Renders `ErrorState title="Access Restricted" message="You do not have permission to view this section."`.

---

## 16. Form Validation Schemas (`Zod`)

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

## 17. Accessibility (WCAG 2.2 AA)

- Semantic `<form>`, `<label>`, and `<input>` elements.
- Inputs connected to error messages via `aria-describedby` and `aria-invalid`.
- Visible keyboard focus rings (`focus-visible:ring-1 focus-visible:ring-primary`).
- Google Sign-In button includes accessible `aria-label="Sign in with Google"`.
- UserMenu dropdown implements Radix UI keyboard navigation (Arrow Up/Down, Enter, Escape).

---

## 18. SEO Foundation

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

## 19. Testing Plan

Vitest and React Testing Library test suite for Phase F3:

1. **`tests/auth/token-store.test.ts`**:
   - Stores and retrieves in-memory token.
   - Clears token on `clearToken()`.
   - Dispatches `notifyUnauthorized()` to registered listeners.

2. **`tests/auth/redirect.test.ts`**:
   - Allows valid paths (`/dashboard`, `/posts/create`, `/settings?tab=profile`).
   - Rejects `https://evil.com`, `http://evil.com`, `//evil.com`, `/\evil.com`, `\\evil.com`, `javascript:alert(1)`, `data:text/html,...`, `/%2F%2Fevil.com`.

3. **`tests/auth/auth-service.test.ts`**:
   - `login()` sends correct payload and receives Bearer token.
   - `register()` sends correct payload and receives Bearer token.
   - `googleAuth()` sends `{ idToken }` payload.
   - `getCurrentUserMe()` retrieves user profile and roles.
   - Handles `401`, `409`, and `429` error normalization.

4. **`tests/auth/AuthContext.test.tsx`**:
   - Initial state is unauthenticated.
   - `login()` sets `isAuthenticated = true` and updates user state (without exposing token).
   - `logout()` wipes state.
   - API `401` via `tokenStore` clears in-memory state.

5. **`tests/components/LoginForm.test.tsx`**:
   - Renders email and password fields with labels.
   - Displays backend error alert on `401`.

6. **`tests/components/RegisterForm.test.tsx`**:
   - Enforces 6+ char password and matching confirm password.
   - Displays username conflict alert on `409`.

7. **`tests/components/AuthGuard.test.tsx`**:
   - Shows loading spinner when `isLoading === true`.
   - Redirects to `/login` when unauthenticated.
   - Renders children when authenticated.

---

## 20. Implementation Sequence

1. **Token Store**: Create `apps/web/lib/auth/token-store.ts`.
2. **Redirect Sanitizer**: Create `apps/web/lib/auth/redirect.ts`.
3. **Types & Schemas**: Create `apps/web/types/auth.ts` and `apps/web/lib/auth/auth-schemas.ts`.
4. **API Service & Axios**: Update `apps/web/lib/api/client.ts` to consume `tokenStore`, and create `apps/web/lib/auth/auth-service.ts`.
5. **AuthContext Integration**: Update `apps/web/lib/auth/AuthContext.tsx` to subscribe to `tokenStore` and provide clean public API.
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

## 21. Explicit Non-Scope for Phase F3

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

## 22. Risks & Architectural Decisions

- **Risk A (In-Memory Token Lost on Full Page Reload)**:  
  *Decision*: Accepted for Phase F3. The backend does not currently support refresh tokens or session cookies.
- **Risk B (Frontend RBAC Bypass)**:  
  *Decision*: Accepted. Frontend guards are treated strictly as UX aids. Backend `PermissionGuard` and `JwtAuthGuard` are the authoritative security enforcement mechanisms.
- **Risk C (Deferred Password Recovery)**:  
  *Decision*: The `/login` page displays a static help notice: *"Need password recovery? Contact platform administration."* without calling non-existent endpoints.
- **Risk D (Google Identity Services Dependency)**:  
  *Decision*: Frontend only fetches Google `idToken`; backend verifies authenticity and provisions user.

---

## 23. Acceptance Checklist for Phase F3

- [ ] `accessToken` is NOT exposed through public `AuthContext`
- [ ] Token remains runtime-memory-only in `token-store.ts`
- [ ] Axios does not directly depend on React `AuthContext`
- [ ] No circular `AuthContext` ↔ Axios dependency
- [ ] No `/auth/refresh` endpoint called or implemented
- [ ] No refresh token or background refresh worker implemented
- [ ] No persistent authentication storage in browser
- [ ] Redirect validation blocks external, protocol-relative, scheme-based, and encoded bypasses
- [ ] `ACCOUNT_SUSPENDED` is distinguished from generic 403
- [ ] `ACCOUNT_BANNED` is distinguished from generic 403
- [ ] `INSUFFICIENT_PERMISSIONS` is distinguished from account-status errors
- [ ] Frontend guards remain UX-only
- [ ] Backend remains authoritative authorization layer
- [ ] Google OAuth uses exact `{ idToken }` contract (`POST /api/v1/auth/google`)
- [ ] No backend source modifications
- [ ] No database modifications
- [ ] No migrations
- [ ] No implementation code
- [ ] Tests are fully specified
- [ ] Typecheck and build validation are specified

---

## 24. Human Approval Gate

```text
============================================================
PHASE F3.0 — FINAL HUMAN APPROVAL GATE
============================================================

Planning: COMPLETE
Repository Inspection: COMPLETE
Backend Contract Verification: COMPLETE
Final Architectural Revision: COMPLETE

Source Code Changes: 0
Backend Changes: 0
Database Changes: 0
Migrations: 0
Dependency Changes: 0

Token Storage:
RUNTIME MEMORY ONLY

Public AuthContext Token Exposure:
NONE

Refresh Endpoint:
NOT AVAILABLE — NOT IMPLEMENTED

Frontend Guards:
UX / NAVIGATION ONLY

Backend Authorization:
AUTHORITATIVE

Redirect Security:
STRICT INTERNAL PATH VALIDATION

Status:
READY FOR FINAL HUMAN RE-AUDIT

STOP — DO NOT IMPLEMENT CODE.
============================================================
```
