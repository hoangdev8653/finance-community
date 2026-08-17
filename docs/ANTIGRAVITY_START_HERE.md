# Antigravity --- Start Here

## Objective

Build the project according to the engineering specifications in this
directory.

## IMPORTANT

Do not start by generating the complete application.

The first task is to **inspect, validate and prepare the architecture**.

## Step 1 --- Read the specification

Read these files completely:

``` text
README.md
PRODUCT_SPEC.md
SYSTEM_ARCHITECTURE.md
DOMAIN_ARCHITECTURE.md
AI_ENGINEERING_RULES.md
IMPLEMENTATION_PLAN.md
```

## Step 2 --- Audit the specification

Create a short architecture review containing:

1.  Confirmed decisions
2.  Ambiguous decisions
3.  Potential contradictions
4.  Technical risks
5.  Missing decisions required before database design

Do not silently resolve major ambiguities.

## Step 3 --- Prepare Phase 1

After the audit, prepare:

``` text
docs/DATABASE_SPEC.md
docs/ERD.md
docs/DATABASE_MIGRATION_STRATEGY.md
```

However, do not invent the final schema without first presenting the
proposed entity model for review.

## Step 4 --- Project skeleton

Do not implement business features yet.

After Phase 1 is approved, create:

``` text
apps/
  web/
  api/

packages/
  shared/
  config/

docs/
```

The exact monorepo tooling can be proposed after evaluating the
repository context.

## Step 5 --- Engineering constraints

The backend must use:

-   Node.js
-   NestJS
-   TypeScript
-   REST API
-   PostgreSQL

Authentication must be implemented in the backend.

Supported authentication: - Email/password - Google OAuth - Facebook
OAuth

Media: - Cloudinary

Frontend: - Next.js - React - TypeScript

## Step 6 --- Do not use

Do not introduce: - Supabase Auth - Supabase Storage - Firebase Auth -
direct browser-to-database access - unnecessary microservices -
unnecessary Redis - unnecessary message brokers - unnecessary Kubernetes

unless an explicit architecture revision approves them.

## Step 7 --- Expected first response

Before writing major code, report:

``` text
Architecture understood: YES/NO
Documents reviewed: [...]
Potential conflicts: [...]
Missing decisions: [...]
Recommended Phase 1 entity model: [...]
```

Then wait for approval before implementing the database schema.

## Golden rule

When in doubt:

> Ask or propose. Do not silently invent architecture.
