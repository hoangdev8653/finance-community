# Product Specification v1.0

## 1. Product concept

A finance knowledge and community platform where:

-   Administrators publish structured knowledge through Series.
-   Members publish discussions through Community.
-   Visitors can read public content without authentication.
-   Authentication is required for interactive actions such as posting,
    commenting, reacting and other protected actions.

The platform is initially a personal project / knowledge system, but its
architecture must be capable of growing into a public community.

## 2. Primary product areas

### Series

Admin-authored educational content.

Initial categories may include: - Investing - Personal Finance - Stock
Market

A Series article can support: - title - cover image - rich content -
category - tags - author - views - reactions - comments - sharing -
publication status

### Community

Member-generated content.

Initial subtopics may include: - Spending - Investing - Saving - General
discussion

A Community post can support: - title - content - images - author -
category - tags - views - reactions - comments - reports - moderation
status

### User profile

The profile area is intended to contain: - display name - username -
avatar - biography - joined date - published posts - activity - future
badges / reputation

Badges and reputation are architectural extensions, not mandatory for
the first implementation.

## 3. Authentication

Supported registration/login methods: - Email + password - Google
OAuth - Facebook OAuth

Email registration must support: - duplicate email protection - password
hashing - verification email - email verification state - password reset

Authentication is implemented by the backend. Supabase Auth is not used.

## 4. Public access

Unauthenticated visitors should be able to: - browse the homepage -
browse Series - read Series articles - browse Community - read Community
posts - view public profiles where allowed

Authentication is required for protected interactions.

## 5. Community quality

The platform should be designed to support: - reports - moderation -
user restrictions - content status - audit logs - future
reputation/badge systems

The moderation system must be extensible even if only basic moderation
is enabled initially.

## 6. Social / growth capabilities

The architecture should support: - share links - Open Graph metadata -
UTM tracking - traffic source analytics - future following of
users/categories/tags - notifications

## 7. Product philosophy

Do not build unnecessary complexity merely for the appearance of being
scalable.

Instead: - design extension points early - implement reliable
foundations - keep domain boundaries clear - avoid premature
infrastructure - preserve a clean migration path to Redis, queues,
search engines and multiple backend instances
