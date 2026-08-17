# System Architecture v1.0

## 1. High-level architecture

``` text
                    INTERNET
                        |
                        v
                 +-------------+
                 |   Next.js   |
                 |  FRONTEND   |
                 +------+------+ 
                        |
                   HTTPS / REST
                        |
                        v
                 +-------------+
                 |   NestJS    |
                 |   BACKEND   |
                 +------+------+ 
                        |
          +-------------+-------------+
          |             |             |
          v             v             v
     PostgreSQL     Cloudinary    External OAuth
                                    Google/Facebook
```

## 2. Application separation

There are two independent applications:

``` text
/apps
  /web
  /api
```

The frontend must communicate with the backend through documented APIs.

The frontend must not access PostgreSQL directly.

The frontend must not contain: - database credentials - Cloudinary API
secret - OAuth client secret - JWT signing secret - SMTP credentials -
other private infrastructure credentials

## 3. Frontend responsibility

The frontend owns: - UI - routing - rendering - user interaction -
client-side validation - presentation state - API consumption - SEO
metadata - Open Graph metadata - responsive behavior

The frontend does NOT own: - authorization decisions - business rules
that affect security - database access - privileged operations

## 4. Backend responsibility

The backend owns: - authentication - authorization - business rules -
validation - database access - moderation - media authorization -
notification generation - audit logging - API contracts

## 5. Backend architectural layers

Preferred request flow:

``` text
Controller
    |
    v
Application Service / Use Case
    |
    v
Domain Rules
    |
    v
Repository Interface
    |
    v
Infrastructure / Database
```

Controllers must remain thin.

Business logic must not be placed directly inside controllers.

## 6. Domain modules

Initial NestJS modules:

``` text
auth
users
profiles
content
series
community
categories
tags
comments
reactions
follows
search
media
notifications
moderation
admin
analytics
system
audit
```

Modules may be combined during implementation if a smaller module
boundary is demonstrably cleaner. Do not create modules only to increase
folder count.

## 7. Content abstraction

Series and Community should share a reusable content foundation where
practical.

Conceptually:

``` text
                 CONTENT
                 /     \
             SERIES   COMMUNITY
```

Shared concerns may include: - author - title - body/content - media -
category - tags - publication state - views - reactions - comments -
timestamps

Series and Community may still have different business rules and UI.

## 8. Media architecture

Cloudinary is the media provider.

Preferred flow:

``` text
Frontend
   |
   | request upload permission / signed parameters
   v
NestJS Media Service
   |
   v
Cloudinary
   |
   v
media metadata saved to PostgreSQL
```

Never expose Cloudinary API secrets to the browser.

## 9. Future scaling path

Do not deploy these components prematurely, but preserve interfaces that
allow:

``` text
CDN
Load Balancer
Multiple API instances
Redis
Background Queue
Search Engine
Object/media CDN
Observability stack
```

Potential future architecture:

``` text
                 CDN
                  |
              Next.js
                  |
             Load Balancer
                  |
        +---------+---------+
        |         |         |
      API-1     API-2     API-3
        |         |         |
        +---------+---------+
                  |
              Redis
                  |
             PostgreSQL
          /             \
     Cloudinary        Queue
```

## 10. API versioning

All public backend endpoints should begin under:

``` text
/api/v1
```

Do not create unversioned production endpoints unless there is a
documented reason.

## 11. Architecture decision rule

When adding a feature, first ask:

1.  Does an existing domain already own this responsibility?
2.  Can the feature be implemented by extending an existing module?
3.  Does it require a new database entity?
4.  Does it require a new API resource?
5.  Does it introduce a new security boundary?
6.  Does it introduce a new external dependency?

Only then should a new module or infrastructure component be introduced.
