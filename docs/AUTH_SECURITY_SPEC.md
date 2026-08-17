# Phase 2 Authentication & Security Specification

**Version**: 1.2  
**Status**: APPROVED  
**Date**: 2026-08-13  
**Authoritative Baselines**: Architecture Review v2.1, Phase 1 Database Architecture & ERD  

---

## 1. Scope & Security Principles

### 1.1 Scope
This document specifies the authentication, authorization, token lifecycle, account status enforcement, and application-level security architecture for Phase 2 of the Finance Community Platform. It defines the strict boundary between identity management (delegated to Supabase Auth) and application security policy enforcement (handled by the NestJS API backend).

### 1.2 Security Principles
The platform security architecture is grounded in six core engineering principles:

1. **Zero Trust Architecture**: No request—internal or external—is trusted by default. Every inbound request to a protected backend resource MUST undergo stateless cryptographic JWT validation, stateful account status checks, and fine-grained permission evaluation.
2. **Defense-in-Depth**: Security controls are implemented across multiple layers: network level (CORS, TLS), HTTP pipeline level (Helmet, CSP, Rate Limiting), application middleware level (Guards, Interceptors), and data access level (ORM parameters, transaction boundaries).
3. **Principle of Least Privilege**: Users and backend components are granted only the minimum set of permissions necessary to perform their explicit functions. Default user status is assigned the baseline `MEMBER` role.
4. **Fail-Closed Security**: Any authorization ambiguity, invalid token format, missing permission claim, or database lookup failure MUST result in immediate request rejection with appropriate HTTP standard error codes (`401 Unauthorized` or `403 Forbidden`).
5. **Separation of Identity & Application State**: Supabase Auth acts exclusively as the Identity Provider (IdP). PostgreSQL (`public.users`, `public.profiles`, `public.user_roles`) owns application-specific user state, profile data, and Role-Based Access Control (RBAC).
6. **Stateless Authentication with Stateful Authorization**: Cryptographic JWT validation occurs statelessly via Public Key Infrastructure (PKI / JWKS). Authorization, account standing, and RBAC permissions are evaluated statefully against PostgreSQL on every request.

---

## 2. Authentication Architecture

### 2.1 Component Responsibilities & Token Storage Strategy

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT (Next.js)                                 |
| - Manages Supabase Auth JS SDK                                                    |
| - Stores Access Token (JWT) strictly in client memory                             |
| - Stores Refresh Token via Supabase Auth SDK client storage                        |
| - Transmits Access Token strictly via `Authorization: Bearer <JWT>` HTTP header    |
+----------------------------------------+------------------------------------------+
                                         |
                                         | HTTP Requests with Bearer JWT
                                         v
+-----------------------------------------------------------------------------------+
|                                 NESTJS API BACKEND                                |
| - Extracts JWT strictly from `Authorization: Bearer <JWT>` header                 |
| - Validates JWT signature statelessly via Supabase JWKS                           |
| - Executes JIT User Provisioning if `sub` is missing in PostgreSQL                 |
| - Stateful check: `public.users.status` (ACTIVE vs SUSPENDED/BANNED/DEACTIVATED)  |
| - Stateful check: `email_confirmed_at` for state-changing community actions       |
| - Resolves RBAC roles & application permissions (`PermissionGuard`)              |
| - Enforces Rate Limiting, CORS, Security Headers                                  |
+-------------------+-------------------------------------------+-------------------+
                    |                                           |
                    | DB Queries                                | JWKS Key Fetch
                    v                                           v
+---------------------------------------+   +---------------------------------------+
|          POSTGRESQL DATABASE          |   |             SUPABASE AUTH             |
| - `public.users`                      |   | - Issues RS256/ES256 signed JWTs       |
| - `public.profiles`                   |   | - Exposes `/.well-known/jwks.json`    |
| - `public.roles` & `public.user_roles` |   | - Handles Password Hashes & Reset     |
| - `public.audit_logs`                 |   | - Handles OAuth (Google, Facebook)    |
+---------------------------------------+   +---------------------------------------+
```

### 2.2 Detailed Responsibility Matrix

| Security Concern | Supabase Auth (IdP) | NestJS API Backend | PostgreSQL (`public` schema) |
| :--- | :---: | :---: | :---: |
| **Credential Storage (Passwords)** | **OWNER** | MUST NOT store/process | MUST NOT store |
| **OAuth Token Handshake** | **OWNER** | Excluded | Excluded |
| **JWT Issuance & Signing** | **OWNER** | Receives & verifies | Excluded |
| **Email Verification Dispatch** | **OWNER** | Evaluates claim in Guard | Excluded |
| **Password Reset Flows** | **OWNER** | Excluded | Excluded |
| **Application Account Record** | Excluded | Manages via JIT Sync | **OWNER** (`public.users`) |
| **Public Profiles** | Excluded | Manages API endpoints | **OWNER** (`public.profiles`) |
| **Account Status (Ban/Suspend)** | Excluded | Enforces `AccountStatusGuard` | **OWNER** (`status` column) |
| **RBAC Roles & Permissions** | Excluded | Enforces `PermissionGuard` | **OWNER** (`user_roles`, `roles`) |
| **Audit Logging** | Excluded | Writes audit records | **OWNER** (`public.audit_logs`) |

---

## 3. JWT Verification

### 3.1 Mandatory JWT Validation Flow
Every request to an authenticated NestJS endpoint MUST pass through `JwtAuthGuard`. The guard MUST cryptographically validate the incoming Bearer token using Supabase's Json Web Key Set (JWKS).

```
Incoming Request Header -> Extract `Authorization: Bearer <token>`
       |
       v
Decode Header (Unverified) -> Extract `kid` and `alg`
       |
       +--> `alg` in Allowlist `['RS256', 'ES256']`? ---> NO  --> HTTP 401 Unauthorized
       |                                           |
       | YES                                       |
       v                                           |
Fetch Matching Public Key from JWKS Cache ---------+
       |
       v
Verify Signature & Validate Standard Claims:
  - Signature valid against public key? -----------> NO  --> HTTP 401 Unauthorized
  - Current Time < `exp` (Expiration)? ------------> NO  --> HTTP 401 Unauthorized
  - `iss` == `https://<project-ref>.supabase.co/auth/v1` NO --> HTTP 401 Unauthorized
  - `aud` == `authenticated`? ---------------------> NO  --> HTTP 401 Unauthorized
  - `sub` present and valid UUID? -----------------> NO  --> HTTP 401 Unauthorized
       |
       | YES
       v
Attach Decoded Payload to Request Context (`req.user`) -> Proceed to AccountStatusGuard
```

### 3.2 Dynamic Algorithm Attack Mitigation
To prevent algorithm confusion attacks (e.g., signature stripping or symmetric key substitution):
1. **No Trust in `alg` Header**: The backend MUST NOT trust the JWT `alg` header to dynamically select cryptographic verification methods.
2. **Explicit Algorithm Allowlist**: The verification engine MUST enforce an explicit allowlist: `['RS256', 'ES256']`.
3. **Forbidden Algorithms**: The backend MUST explicitly reject:
   - `alg = "none"`
   - Unrecognized asymmetric algorithms
   - Symmetric algorithms (`HS256`, `HS384`, `HS512`) unless explicitly configured and approved in a separate security review.

### 3.3 Public Key Retrieval & Caching Strategy
- **JWKS Endpoint**: Public keys MUST be retrieved from `https://<supabase-project-ref>.supabase.co/auth/v1/.well-known/jwks.json`.
- **In-Memory Key Caching**: To minimize latency and prevent external HTTP requests on every API call, public keys MUST be cached in memory using `jwks-rsa` (or equivalent).
- **Cache Rotation**: Cache MUST support key rotation with `rateLimit: true`, `jwksRequestsPerMinute: 10`, and a cache TTL of 12-24 hours.

---

## 4. JIT (Just-In-Time) User Provisioning

### 4.1 Concept & Boundaries
When a user registers or logs in via Supabase Auth (Email/Password or OAuth), Supabase creates an identity record in `auth.users`. However, NestJS domain operations rely on `public.users` and `public.profiles`.

To guarantee that every validly authenticated identity has a corresponding application account, NestJS executes JIT User Provisioning upon receiving a valid JWT whose `sub` claim does not yet exist in `public.users`.

### 4.2 Provisioning Pipeline & Atomic Concurrency Handling

When concurrent initial API requests with the same Supabase `sub` arrive simultaneously at the NestJS backend, JIT provisioning MUST remain strictly atomic, idempotent, and collision-safe without failing transactions or corrupting database state.

```
Extract JWT `sub` (UUID) & `email`
       |
       v
Query `public.users` by `id = sub`
       |
       +--> Record Exists? ---> YES --> Update `email` if changed -> Continue Pipeline
       |
       | NO
       v
Execute Atomic PostgreSQL Transaction with Upsert Guarantees:

  1. Upsert `public.users`:
     INSERT INTO public.users (id, email, status, created_at, updated_at)
     VALUES (sub, email, 'ACTIVE', NOW(), NOW())
     ON CONFLICT (id) DO UPDATE
     SET email = EXCLUDED.email, updated_at = NOW();

  2. Upsert `public.user_roles`:
     SELECT id FROM public.roles WHERE name = 'MEMBER';
     INSERT INTO public.user_roles (user_id, role_id, assigned_at)
     VALUES (sub, member_role_id, NOW())
     ON CONFLICT (user_id, role_id) DO NOTHING;

  3. Upsert `public.profiles` with Collision Prevention:
     Base Username = Sanitize(email.split('@')[0]) -- lowercased, alphanumeric and underscores only, max 45 chars
     
     NestJS checks if Base Username already exists in `public.profiles` for a different `user_id`:
     - If available: Target Username = Base Username
     - If colliding: Target Username = Base Username + '_' + sub.slice(0, 4)

     INSERT INTO public.profiles (user_id, username, display_name, created_at, updated_at)
     VALUES (sub, Target Username, display_name_from_jwt, NOW(), NOW())
     ON CONFLICT (user_id) DO NOTHING;
       |
       v
Transaction Committed -> Proceed to AccountStatusGuard
```

### 4.3 Identity Data Isolation Rule
- **Supabase Auth**: Source of identity, credential hashes, multi-factor authentication, provider metadata.
- **`public.users`**: Application account anchor, email, status (`ACTIVE`, `SUSPENDED`, `BANNED`, `DEACTIVATED`).
- **`public.profiles`**: Public profile details (username, display name, avatar media ID, bio).
- **STRICT INVARIANT**: Passwords, password hashes, refresh tokens, and third-party OAuth client secrets MUST NEVER be stored in or copied to PostgreSQL.

---

## 5. OAuth — Google & Facebook

### 5.1 OAuth Authentication Architecture
OAuth 2.0 / OpenID Connect login flows are executed strictly between the Next.js Frontend client and Supabase Auth using the PKCE (Proof Key for Code Exchange) flow.

```
+----------+             +---------------+             +------------------+             +-----------------+
| Browser  |             | Next.js App   |             | Supabase Auth    |             | OAuth Provider  |
+----+-----+             +-------+-------+             +--------+---------+             +--------+--------+
     |                           |                              |                                |
     | 1. Click "Login Google"   |                              |                                |
     +--------------------------->                              |                                |
     |                           | 2. Redirect OAuth Request    |                                |
     +----------------------------------------------------------> 3. Redirect to Provider        |
     |                                                          +-------------------------------->
     | 4. User Authenticates & Consents                                                          |
     <-------------------------------------------------------------------------------------------+
     | 5. Authorization Code Callback                                                            |
     +---------------------------------------------------------->                                |
     |                                                          | 6. Exchange Code for Tokens    |
     |                                                          +-------------------------------->
     | 7. Return JWT Access Token + Refresh Token               |
     <----------------------------------------------------------+
     |
     | 8. API Call: HTTP Request with Header `Authorization: Bearer <JWT>`
     +-------------------------------------------------------------------------------------------> NestJS API
```

### 5.2 NestJS Handling of OAuth Users
1. NestJS has zero direct coupling with Google or Facebook APIs.
2. The JWT issued by Supabase Auth for an OAuth user is structurally identical to an email/password JWT.
3. The `sub` claim contains the unique user UUID; `email` and identity provider metadata are embedded in token claims.
4. JIT User Provisioning (Section 4) handles OAuth users seamlessly upon their first API call.

---

## 6. Email Verification Policy

### 6.1 Policy & Access Levels
The application enforces a tiered authorization model based on email verification state:

- **Unverified Users**: MAY authenticate and access public, read-only content (viewing published posts, reading public comments, browsing categories, viewing user profiles).
- **Verified Users**: MAY perform all authenticated community actions that create, modify, or delete platform state.

### 6.2 Authoritative Verification Source & Derivation Rule
Email verification is a Supabase Auth responsibility. Supabase Auth includes the `email_confirmed_at` claim in the signed JWT payload.

NestJS MUST derive the boolean verification state strictly as follows:

```typescript
const isEmailVerified: boolean = 
  jwtPayload.email_confirmed_at !== null && 
  jwtPayload.email_confirmed_at !== undefined && 
  jwtPayload.email_confirmed_at !== '';
```

NestJS MUST NOT query `public.users` or alter the PostgreSQL Phase 1 schema for email verification status.

### 6.3 Restricted Actions for Unverified Users
Unverified users (`isEmailVerified === false`) MUST NOT perform any state-changing community actions, including:
- Creating posts (`posts:create`)
- Updating owned posts (`posts:update:own`)
- Deleting owned posts (`posts:delete:own`)
- Creating comments (`comments:create`)
- Deleting owned comments (`comments:delete:own`)
- Reacting to posts or comments (`reactions:create`)
- Following or unfollowing users (`follows:create`)
- Submitting content or user reports (`reports:create`)

### 6.4 Enforcement Mechanism in NestJS
- Email verification state is evaluated statefully by inspecting `jwtPayload.email_confirmed_at`.
- NestJS MUST provide a dedicated `@RequireEmailVerification()` decorator and `EmailVerificationGuard`.
- If an unverified user attempts any restricted endpoint, `EmailVerificationGuard` MUST reject the request immediately with `HTTP 403 Forbidden` and a structured error payload:
  ```json
  {
    "statusCode": 403,
    "error": "Forbidden",
    "message": "Email verification required to perform community actions.",
    "code": "EMAIL_NOT_VERIFIED"
  }
  ```

---

## 7. Password Reset

### 7.1 Architecture & Flow
Password reset flows are managed out-of-band entirely by Supabase Auth:
1. User requests password reset on the frontend (`supabase.auth.resetPasswordForEmail(email)`).
2. Supabase Auth generates a secure, short-lived reset token and dispatches a magic link via SMTP.
3. User clicks the link, lands on the Next.js frontend, and submits a new password directly to Supabase Auth (`supabase.auth.updateUser({ password: newPassword })`).

### 7.2 NestJS Non-Involvement
- NestJS API routes MUST NOT expose endpoints for password reset requests or password updates.
- NestJS handles neither reset token generation, token verification, nor password hashing, ensuring zero exposure of raw credentials to the application backend codebase.

---

## 8. Session & Token Lifecycle

### 8.1 Authoritative Phase 2 Token Strategy
Phase 2 defines one authoritative session and token management strategy:

- **Access Token (JWT)**:
  - Format: Signed JSON Web Token (RS256 / ES256).
  - Lifetime: Short-lived (3600 seconds / 1 hour, configured in Supabase Auth).
  - Storage: Next.js client memory strictly (or Next.js BFF server session context).
  - Transmission: Transmitted from Next.js client to NestJS API strictly via `Authorization: Bearer <JWT>` HTTP header.
  - NestJS Extraction: NestJS MUST extract the token strictly from the `Authorization: Bearer <JWT>` header. NestJS MUST NOT attempt to parse access tokens from request cookies.
- **Refresh Token**:
  - Format: Opaque string managed exclusively by Supabase Auth SDK.
  - Lifetime: Long-lived (30 days) with automatic rotation on reuse.
  - Storage: Managed by `@supabase/supabase-js` client SDK using client-side secure storage or httpOnly cookies on the Supabase Auth domain.

### 8.2 Stateless vs. Stateful Lifecycle Boundary
- **Token Validation**: Stateless. NestJS does not query a database to check if a JWT is valid; it checks signature, claims, and expiration.
- **Session Revocation**: Handled at two levels:
  1. *Immediate Account Suspension*: NestJS queries `public.users.status` on every request. If an account is suspended or banned in PostgreSQL, access is revoked immediately regardless of JWT validity.
  2. *Global Token Revocation*: Managed by Supabase Auth (`supabase.auth.admin.signOut(uid)`), which revokes all issued refresh tokens for that user ID.

---

## 9. Account Status Enforcement

### 9.1 Required Execution Guard Pipeline
To guarantee that revoked, suspended, or banned users are immediately blocked, NestJS MUST execute guards in the exact order specified below for every incoming HTTP request:

```
Incoming Request
       |
       v
1. JwtAuthGuard --------> Signature/Exp/Iss/Aud Invalid? -> HTTP 401 Unauthorized
       |
       | Valid JWT (sub extracted)
       v
2. AccountStatusGuard -> Query `public.users.status` for `id = sub`
       |
       +--> Status == 'SUSPENDED' --------------> HTTP 403 Forbidden ("Account suspended")
       +--> Status == 'BANNED' -----------------> HTTP 403 Forbidden ("Account banned")
       +--> Status == 'DEACTIVATED' ------------> HTTP 403 Forbidden ("Account deactivated")
       +--> Status == 'ACTIVE'
       |
       v
3. EmailVerificationGuard (if endpoint has @RequireEmailVerification())
       |
       +--> `Boolean(jwtPayload.email_confirmed_at)` == false -> HTTP 403 Forbidden ("Email verification required")
       |
       v
4. PermissionGuard (if endpoint has @RequirePermission(...))
       |
       +--> User lacks required permission -----> HTTP 403 Forbidden ("Insufficient permissions")
       |
       v
5. Controller Route Execution
```

### 9.2 Status Enforcement Rules
- **Stateless JWT Validity DOES NOT Equal Account Active State**: A valid, unexpired JWT signature alone MUST NOT grant access to application resources if `public.users.status` is non-ACTIVE.
- **Immediate Enforcement**: Because `AccountStatusGuard` queries `public.users.status` on every authenticated request, account suspension, banning, or deactivation takes effect immediately on the next API call without requiring complex JWT blacklist/revocation infrastructure.

---

## 10. Role-Based Access Control (RBAC)

### 10.1 Application Roles
The platform defines four hierarchical application roles:
1. `MEMBER`: Default role for all registered users upon JIT provisioning. Can create posts/comments, react, and manage own content (subject to email verification for state changes).
2. `MODERATOR`: Elevated role. Can review content reports, hide/delete violating posts/comments, and manage moderation flags.
3. `ADMIN`: Administrative role. Can manage categories, tags, platform settings, view audit logs, and manage user statuses (`SUSPENDED`, `DEACTIVATED`).
4. `SUPER_ADMIN`: System-level role. Can assign administrative and moderator roles, perform system resets, and manage all user accounts.

### 10.2 Disambiguation: Supabase Role vs. Application Role
- **Supabase JWT `role` claim**: Is set to `"authenticated"` for all logged-in users. This claim indicates only that the user has passed Supabase Auth.
- **CRITICAL INVARIANT**: NestJS MUST NEVER use the JWT `role` claim (`"authenticated"`) for RBAC authorization decisions. Application RBAC roles MUST be resolved exclusively from `public.user_roles` joined with `public.roles`.

### 10.3 Role & Permission Resolution Pipeline
1. `JwtAuthGuard` attaches user ID (`sub`) to request context (`req.user.id`).
2. `PermissionGuard` intercepts execution:
   - Fetches user roles from PostgreSQL: `SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = req.user.id`.
   - Maps resolved roles to the application's configuration-level permission matrix.
   - Evaluates whether the requested action (e.g. `posts:delete:any`) is granted to any of the user's assigned roles.
   - Grants access if permission is present; otherwise rejects with `HTTP 403 Forbidden`.

---

## 11. Permission Matrix

The application permissions follow the standardized naming convention `<plural_domain>:<action>[:<scope>]`.

All state-changing actions performed by `MEMBER` users require a verified email (`Boolean(jwtPayload.email_confirmed_at) === true`).

| Standardized Permission Name | MEMBER | MODERATOR | ADMIN | SUPER_ADMIN |
| :--- | :---: | :---: | :---: | :---: |
| `posts:read:published` | ✅ | ✅ | ✅ | ✅ |
| `posts:create` | ✅ (verified) | ✅ | ✅ | ✅ |
| `posts:update:own` | ✅ (verified) | ✅ | ✅ | ✅ |
| `posts:delete:own` | ✅ (verified) | ✅ | ✅ | ✅ |
| `posts:delete:any` | ❌ | ✅ | ✅ | ✅ |
| `comments:create` | ✅ (verified) | ✅ | ✅ | ✅ |
| `comments:delete:own` | ✅ (verified) | ✅ | ✅ | ✅ |
| `comments:delete:any` | ❌ | ✅ | ✅ | ✅ |
| `reactions:create` | ✅ (verified) | ✅ | ✅ | ✅ |
| `follows:create` | ✅ (verified) | ✅ | ✅ | ✅ |
| `reports:create` | ✅ (verified) | ✅ | ✅ | ✅ |
| `reports:review` | ❌ | ✅ | ✅ | ✅ |
| `moderation:action` | ❌ | ✅ | ✅ | ✅ |
| `categories:manage` | ❌ | ❌ | ✅ | ✅ |
| `tags:manage` | ❌ | ❌ | ✅ | ✅ |
| `users:suspend` | ❌ | ❌ | ✅ | ✅ |
| `users:ban` | ❌ | ❌ | ✅ | ✅ |
| `users:assign_role` | ❌ | ❌ | ❌ | ✅ |
| `audit_logs:read` | ❌ | ❌ | ✅ | ✅ |

---

## 12. Rate Limiting

### 12.1 Phase 2 Baseline Specification
- Phase 2 MUST implement rate limiting using `@nestjs/throttler` with in-memory storage (`ThrottlerModule.forRoot(...)`).
- Rate limiting MUST be configured as an application-level guard (`ThrottlerGuard`).

### 12.2 Architectural Limitations & Explicit Warnings
> [!WARNING]
> **Single-Instance Limitation**: In-memory rate limiting operates strictly within the memory space of a single NestJS process. It IS NOT a distributed rate-limiting solution.

- **Multi-Instance Behavior**: If the application scales horizontally to multiple API instances, each instance will maintain isolated in-memory hit counts, effectively multiplying allowable request thresholds by the instance count.
- **Distributed Solution Requirement**: Production multi-instance deployments MUST use shared storage (such as Redis) via `throttler-storage-redis`.
- **Phase 2 Scope**: Redis integration is **intentionally deferred** and MUST NOT be introduced in Phase 2. The single-instance in-memory baseline is explicitly accepted for Phase 2 development and single-server evaluation.

### 12.3 Endpoint Tier Configuration Policy
Endpoint rate limits MUST be defined as configuration-level policies via environment variables or central configuration objects, rather than hardcoded magic numbers inside controller decorators.

| Tier Name | Description | Default Threshold (Phase 2) | Target Endpoints |
| :--- | :--- | :--- | :--- |
| **Tier 1: Public Read** | High volume, static/cached reads | 120 req / 60 sec | `GET /api/v1/posts`, `GET /api/v1/categories` |
| **Tier 2: Authenticated Read** | User-specific stateful queries | 300 req / 60 sec | `GET /api/v1/profiles/me`, `GET /api/v1/notifications` |
| **Tier 3: Authenticated Write** | State-changing community mutations | 30 req / 60 sec | `POST /api/v1/posts`, `POST /api/v1/comments` |
| **Tier 4: Sensitive Operations** | High-impact security/upload actions | 10 req / 60 sec | `POST /api/v1/media/upload`, `POST /api/v1/reports` |

---

## 13. CORS (Cross-Origin Resource Sharing) Policy

### 13.1 Configuration Rules & Credentials Rationale
NestJS MUST enforce strict CORS validation in `main.ts` using `app.enableCors()`:

- **Allowed Origins (`origin`)**: MUST be strictly bounded to an explicit whitelist loaded from environment variables (e.g. `PROCESS.ENV.FRONTEND_URL`, such as `http://localhost:3000` or `https://app.financecommunity.com`). Wildcards (`*`) MUST NOT be used in production.
- **Allowed Methods (`methods`)**: `GET, POST, PUT, PATCH, DELETE, OPTIONS`.
- **Allowed Headers (`allowedHeaders`)**: `Authorization, Content-Type, Accept, X-Requested-With`.
- **Exposed Headers (`exposedHeaders`)**: `X-Total-Count, Content-Range`.
- **Credentials (`credentials: true`)**: Enabled specifically because the Next.js Frontend client and NestJS API run on separate origins/subdomains (e.g., `app.domain.com` vs `api.domain.com`). When fetch requests from the browser set `credentials: 'include'` (required for cross-origin request credentials and Supabase Auth session handling), the CORS specification mandates `Access-Control-Allow-Credentials: true` and an explicit non-wildcard `Access-Control-Allow-Origin`.
- **Max Age (`maxAge`)**: 86400 seconds (24 hours) to reduce preflight `OPTIONS` request frequency.

---

## 14. Security Headers & Helmet Integration

### 14.1 Helmet Middleware Specification
NestJS MUST integrate `helmet()` in `main.ts` to attach standard security headers to every HTTP response.

### 14.2 Mandatory HTTP Response Headers

| Header | Configured Value | Security Purpose |
| :--- | :--- | :--- |
| `X-Frame-Options` | `DENY` | Prevents Clickjacking attacks by forbidding iframe framing. |
| `X-Content-Type-Options` | `nosniff` | Blocks MIME-type sniffing attacks. |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Forces HTTPS communication (HSTS). |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits cross-origin referrer information leakage. |
| `X-Permitted-Cross-Domain-Policies` | `none` | Blocks Flash/Adobe cross-domain policy execution. |
| `X-DNS-Prefetch-Control` | `off` | Disables browser DNS prefetching. |

---

## 15. Content Security Policy (CSP)

### 15.1 API Backend Defense-in-Depth CSP
Because NestJS serves a REST JSON API (and not HTML pages), CSP directives attached via Helmet serve strictly as defense-in-depth to restrict resource loading or iframe framing if an API response route is opened directly in a browser:

```javascript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'none'"],
    scriptSrc: ["'none'"],
    styleSrc: ["'none'"],
    imgSrc: ["'none'"],
    fontSrc: ["'none'"],
    connectSrc: ["'self'"],
    frameAncestors: ["'none'"],
    formAction: ["'none'"],
    baseUri: ["'none'"],
  }
}
```

### 15.2 Clarification of CSP Responsibility Scope
The backend API CSP header DOES NOT replace, override, or dictate the HTML rendering CSP policy maintained by the Next.js frontend application. The Next.js frontend enforces its own independent CSP for HTML page rendering, script execution, styling, and Cloudinary media loading.

---

## 16. Common Attack Mitigations

### 16.1 XSS (Cross-Site Scripting)
- **API Output Encoding**: All JSON responses MUST be properly serialized by NestJS.
- **Rich Text Sanitization**: Body content submitted for posts or comments MUST be sanitized on the backend using an HTML sanitizer (such as `DOMPurify` / `sanitize-html`) before persistence if HTML markup is permitted. Plaintext fields MUST disallow raw HTML.

### 16.2 CSRF (Cross-Site Request Forgery)
- **Header-Based Authentication**: Requests to NestJS API endpoints rely strictly on `Authorization: Bearer <JWT>` HTTP headers. Browsers DO NOT automatically attach Bearer headers to cross-site requests, rendering the REST API inherently immune to standard cross-site request forgery attacks.
- **Cookie Security**: Refresh tokens and identity sessions managed by Supabase Auth SDK in cookies MUST use `HttpOnly = true`, `Secure = true`, and `SameSite = Strict`.

### 16.3 SQL Injection
- **Parameterized Queries**: All database access in NestJS MUST be executed through parameterized query builders or ORMs (e.g. Prisma / TypeORM / Kysely).
- **No String Concatenation**: Raw SQL string concatenation with user-supplied input is STRICTLY FORBIDDEN.

### 16.4 Mass Assignment Vulnerabilities
- **Global Validation Pipe**: NestJS MUST enable global `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true`.
- **DTO Binding**: Controllers MUST accept strictly typed Data Transfer Objects (DTOs) decorated with `class-validator`. Excess payload fields MUST be automatically stripped or trigger HTTP 400 Bad Request.

---

## 17. Error Handling & Information Disclosure

### 17.1 HTTP Status Code Semantics

#### `401 Unauthorized`
Returned when authentication fails or credentials are missing/invalid:
- Missing `Authorization` header
- Malformed Bearer token format
- Invalid cryptographic JWT signature
- Expired token (`exp`)
- Invalid issuer (`iss`) or audience (`aud`)
- Invalid or unparseable subject (`sub`)

#### `403 Forbidden`
Returned when authentication succeeded, but authorization policy blocks access:
- Authenticated user account is `SUSPENDED`
- Authenticated user account is `BANNED`
- Authenticated user account is `DEACTIVATED`
- Authenticated user has not completed required Email Verification (`Boolean(jwtPayload.email_confirmed_at) === false`)
- Authenticated user lacks required RBAC permission for requested endpoint (`INSUFFICIENT_PERMISSIONS`)

### 17.2 Information Disclosure Prevention
- **Production Error Masking**: In production (`NODE_ENV=production`), NestJS filters MUST NOT expose internal stack traces, database driver errors, raw SQL queries, or internal file system paths in HTTP responses.
- **Standardized Error Structure**: All error responses MUST follow a uniform response contract:
  ```json
  {
    "statusCode": 403,
    "error": "Forbidden",
    "message": "You do not have permission to perform this action.",
    "code": "PERMISSION_DENIED",
    "timestamp": "2026-08-13T21:30:00.000Z",
    "path": "/api/v1/admin/users"
  }
  ```

---

## 18. Security Logging & Audit Integration

### 18.1 Mandatory Audit Log Targets
All security-sensitive administrative and moderation actions MUST produce an immutable record in `public.audit_logs`.

Mandatory audited events:
1. **User Status Modifications**: Account suspension, ban, deactivation, or reactivation.
2. **Role Assignments**: Granting or revoking roles (`MODERATOR`, `ADMIN`, `SUPER_ADMIN`) in `public.user_roles`.
3. **Moderation Overrides**: Deleting user content, hiding posts, or resolving moderation reports.
4. **Administrative Setting Changes**: System-wide configuration changes.

### 18.2 Audit Log Schema Alignment (Phase 1 Baseline)
Audit records MUST write directly to the Phase 1 `public.audit_logs` table:
- `id` (UUID): Primary key (`gen_random_uuid()`).
- `actor_id` (UUID): ID of performing user (`req.user.id`).
- `action` (VARCHAR(100)): Action identifier (e.g., `USER_SUSPEND`, `ROLE_ASSIGN`).
- `entity_type` (VARCHAR(50)): Target entity (e.g., `users`, `user_roles`, `posts`).
- `entity_id` (UUID): Target entity UUID.
- `metadata` (JSONB): Structured contextual snapshot (previous status, new status, changed attributes).
- `ip_address` (VARCHAR(45)): Client IP address (IPv4 / IPv6).
- `reason` (TEXT): Mandatory or optional administrative justification.
- `created_at` (TIMESTAMPTZ): Event timestamp.

---

## 19. Threat Model

| Threat ID | Threat Vector | Risk Level | Mitigation Strategy |
| :--- | :--- | :---: | :--- |
| **TM-01** | **Token Tampering / Forgery** | **CRITICAL** | Stateless JWKS signature verification with explicit algorithm allowlist (`RS256`, `ES256`). Rejection of `alg=none`. |
| **TM-02** | **Bypassing Banned Status with Active JWT** | **CRITICAL** | `AccountStatusGuard` checks `public.users.status` in PostgreSQL on every request, revoking access immediately. |
| **TM-03** | **Unverified User Community Spam** | **HIGH** | `EmailVerificationGuard` blocks state-changing endpoints for unverified users. |
| **TM-04** | **Privilege Escalation** | **CRITICAL** | Rigid RBAC matrix enforced via `PermissionGuard`. `MEMBER` role cannot assign roles. Self-elevation blocked server-side. |
| **TM-05** | **Resource Ownership Hijacking** | **CRITICAL** | Controllers strictly derive user ID from validated JWT `sub`, never from user-supplied payload strings. |
| **TM-06** | **Denial of Service (DoS) via API Flooding** | **MEDIUM** | In-memory `@nestjs/throttler` rate limiting per client IP/User across tiered endpoints. |
| **TM-07** | **Mass Assignment / DTO Injection** | **HIGH** | Global `ValidationPipe(whitelist: true, forbidNonWhitelisted: true)` strips unexpected fields. |

---

## 20. Security Invariants

The following security invariants represent non-negotiable rules for the codebase. Any code review finding that violates an invariant MUST result in immediate PR rejection:

1. **Invariant 1**: Never trust client-provided user IDs for ownership checks.
2. **Invariant 2**: The JWT `sub` claim is the sole authoritative representation of authenticated identity.
3. **Invariant 3**: Application user identity and account standing MUST originate from `public.users`.
4. **Invariant 4**: Authorization enforcement MUST be performed server-side by NestJS guards; frontend UI checks are purely for presentation.
5. **Invariant 5**: Account status (`public.users.status`) MUST be checked on every authenticated request after JWT verification.
6. **Invariant 6**: Users MUST NOT be capable of elevating their own RBAC roles or permissions.
7. **Invariant 7**: Users with the `MEMBER` role MUST NOT assign or alter user roles under any circumstances.
8. **Invariant 8**: Permission checks MUST NOT rely on frontend guards or unverified client assertions.
9. **Invariant 9**: Plaintext passwords, password hashes, and reset tokens MUST NEVER be stored in or processed by NestJS or PostgreSQL.
10. **Invariant 10**: Refresh token rotation and session revocation MUST be delegated exclusively to Supabase Auth.
11. **Invariant 11**: OAuth provider credentials (client secrets) MUST remain strictly inside Supabase Auth settings and NEVER touch PostgreSQL or client code.
12. **Invariant 12**: Audit-sensitive administrative actions (role changes, bans, content deletions) MUST be written to `public.audit_logs`.

---

## 21. Phase 2 Verification Checklist

Before Phase 2 implementation code is marked complete, the implementation MUST be verified against this checklist:

- [ ] **JWT Verification Test**: Request with no token returns `401 Unauthorized`.
- [ ] **JWT Verification Test**: Request with invalid signature returns `401 Unauthorized`.
- [ ] **JWT Verification Test**: Request with `alg=none` or symmetric algorithm returns `401 Unauthorized`.
- [ ] **JIT Provisioning Test**: First-time valid JWT automatically creates records in `public.users`, `public.user_roles` (`MEMBER`), and `public.profiles`.
- [ ] **Concurrent JIT Test**: Concurrent initial API requests with identical `sub` succeed without duplicate key errors or transaction failures.
- [ ] **Account Status Test**: Setting `users.status = 'SUSPENDED'` immediately blocks valid JWT requests with `403 Forbidden`.
- [ ] **Account Status Test**: Setting `users.status = 'BANNED'` immediately blocks valid JWT requests with `403 Forbidden`.
- [ ] **Email Verification Test**: Unverified user (`email_confirmed_at === null`) can perform `GET /api/v1/posts` successfully.
- [ ] **Email Verification Test**: Unverified user receives `403 Forbidden` (`EMAIL_NOT_VERIFIED`) when attempting `POST /api/v1/posts`, `PATCH /api/v1/posts/:id`, or `DELETE /api/v1/posts/:id`.
- [ ] **RBAC Guard Test**: `MEMBER` attempting `posts:delete:any` (belonging to another user) receives `403 Forbidden`.
- [ ] **RBAC Guard Test**: `MODERATOR` attempting `posts:delete:any` (any post) succeeds and writes an audit log to `public.audit_logs`.
- [ ] **Rate Limit Test**: Exceeding tier request limit triggers `429 Too Many Requests`.
- [ ] **Mass Assignment Test**: Sending extra payload fields to POST endpoints triggers validation error or strips fields.

---

## 22. Deferred Security Infrastructure

The following architectural capabilities are explicitly out-of-scope for Phase 2 and are deferred to future phases:

1. **Redis Distributed Rate Limiting**: Replacing in-memory `@nestjs/throttler` storage with `throttler-storage-redis` for multi-instance cluster deployments.
2. **WebAuthn / Passkeys / FIDO2**: Adding hardware security key capabilities.
3. **Automated Anomaly & Fraud Detection**: Machine learning IP reputation scoring or automated behavioral bot mitigation.
4. **Centralized SIEM Integration**: Streaming `public.audit_logs` to Datadog, AWS CloudWatch, or Splunk.
5. **Real-time Webhook Token Revocation**: Supabase Webhook listening for global user delete/logout events to invalidate local memory caches.

---

Phase 2 Authentication & Security Specification  
Status: APPROVED  
