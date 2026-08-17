# AI Engineering Rules v1.0

These rules are mandatory guidance for Antigravity and any AI-assisted
implementation.

## Rule 1 --- Read before modifying

Before changing architecture, database, authentication, or core modules,
read:

-   README.md
-   PRODUCT_SPEC.md
-   SYSTEM_ARCHITECTURE.md
-   DOMAIN_ARCHITECTURE.md
-   this file

## Rule 2 --- Do not invent approved architecture

Do not treat assumptions as approved decisions.

If a decision is not documented, identify it as a proposal.

## Rule 3 --- Database is a contract

Never casually: - rename tables - remove columns - change
relationships - change enum semantics - remove indexes - alter
constraints

Database changes require an explicit migration and documentation update.

## Rule 4 --- Backend owns business logic

Do not implement authoritative business rules only in the frontend.

Frontend validation improves UX.

Backend validation enforces correctness and security.

## Rule 5 --- Controllers stay thin

NestJS controllers should: - receive request - validate/transform
input - invoke application service - return response

Controllers should not contain complex business logic or raw database
queries.

## Rule 6 --- No direct database access from frontend

Never connect Next.js browser code directly to PostgreSQL.

All protected data access goes through the backend API.

## Rule 7 --- Secrets

Never commit or expose: - database passwords - JWT secrets - OAuth
client secrets - Cloudinary API secret - SMTP credentials - private API
keys

Use environment variables and documented `.env.example` files.

## Rule 8 --- API versioning

New production API resources belong under:

``` text
/api/v1
```

## Rule 9 --- Reuse before duplication

Before creating a new service/module: 1. search existing domains 2.
identify reusable logic 3. extend existing abstractions when appropriate

Do not duplicate authentication, media, authorization, validation, or
content logic.

## Rule 10 --- Security first

Every protected endpoint must define: - authentication requirement -
authorization requirement - ownership rules - validation rules

Never rely on hidden UI buttons for security.

## Rule 11 --- Media

Images and other uploaded media must use Cloudinary.

Never store binary image data inside PostgreSQL unless an explicit
architecture decision says otherwise.

## Rule 12 --- Tests

New critical business logic should include tests.

Critical flows include: - registration - login - OAuth - email
verification - authorization - create post - edit/delete post -
comments - reactions - moderation

## Rule 13 --- No premature infrastructure

Do not introduce Redis, Kafka, Elasticsearch, microservices, Kubernetes
or other infrastructure merely because the system may scale later.

First establish clean boundaries.

## Rule 14 --- Preserve extension points

When practical, isolate external providers behind interfaces/services:

``` text
MediaProvider
SearchProvider
EmailProvider
OAuthProvider
CacheProvider
```

This allows providers to change without rewriting business logic.

## Rule 15 --- Small, reviewable changes

Implement features in small phases.

Each phase should: - compile - pass relevant tests - preserve existing
functionality - document architectural changes

## Rule 16 --- Never silently fix architecture

If implementation reveals an architectural problem: 1. stop 2. explain
the problem 3. propose the change 4. update the relevant specification
5. then implement

## Rule 17 --- Avoid overengineering

Do not create abstractions with no current or realistic future purpose.

The objective is: - clean boundaries - understandable code - safe
evolution - predictable maintenance

Not maximum abstraction.

## Rule 18 --- Documentation is part of the system

When an architectural decision changes, update the corresponding
specification.

Code and architecture documentation must not intentionally drift apart.
