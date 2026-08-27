# Finance Community — Content Architecture Hardening

## Purpose

This documentation package defines the required hardening phase for the existing `hoangdev8653/finance-community` repository.

The goal is **not** to rebuild the system. The goal is to make the existing content platform structurally ready for a broader editorial model:

- Money / Finance
- Business
- Technology / AI
- Career / Jobs
- Sports
- Life

The platform must support three distinct content modes:

- `NEWS` — current, time-sensitive information
- `SERIES` — structured, evergreen learning/knowledge
- `COMMUNITY` — user-generated discussion and experience

## Current Repository Baseline

The repository already contains a strong foundation:

- Domain model and `domains` table
- Domain-aware categories
- Topics table
- Domain-aware posts
- `NEWS | SERIES | COMMUNITY` content types
- Dynamic domain routes such as `/{domainSlug}`
- Domain-aware article routes
- `news-curation/` editorial workflow
- Admin and moderation infrastructure
- Existing source metadata and news pipeline documentation

The latest architecture-generalization commit introduced the six domains `MONEY`, `BUSINESS`, `TECH`, `CAREER`, `LIFE`, and `SPORTS`, plus `domain_id` on categories/posts and a `topics` table.

## Hardening Goals

1. Make taxonomy relationships explicit and consistent.
2. Ensure topics are actually usable by content, not only stored as standalone records.
3. Keep header navigation small while allowing a richer backend taxonomy.
4. Remove finance-only assumptions from reusable content infrastructure.
5. Separate News ingestion/editorial logic from Learning/Series production logic.
6. Keep existing Finance content and APIs backward-compatible.
7. Synchronize documentation and repository rules with the new architecture.
8. Prepare the project for future source ingestion across multiple domains.

## Target Architecture

```text
                         CONTENT PLATFORM
                                |
              +-----------------+-----------------+
              |                 |                 |
             NEWS            LEARNING          COMMUNITY
              |                 |                 |
        time-sensitive       SERIES/LESSON      UGC
              |                 |                 |
              +-----------------+-----------------+
                                |
                           TAXONOMY
                                |
                   DOMAIN -> CATEGORY -> TOPIC
                                |
                               TAG
```

## Target Domains

```text
MONEY
BUSINESS
TECHNOLOGY
CAREER
SPORTS
LIFE
```

Use the repository's existing `TECH` code if changing it to `TECHNOLOGY` would create unnecessary migration risk; do not rename identifiers casually. The important requirement is that Technology is a broad domain that contains AI as a major category/topic.

## Non-Goals

Do not introduce:

- microservices
- graph databases
- a second database
- Elasticsearch solely for this phase
- domain-specific duplicate post systems
- separate news modules for every domain
- a destructive database reset

## Definition of Done

The hardening phase is complete when:

- existing Finance content still works
- all six domains can be used through the same content infrastructure
- categories can belong to domains and support hierarchy
- topics can be attached to content through a proper relationship
- header navigation is configuration/taxonomy driven rather than hard-coded per domain
- Series are not finance-only
- News ingestion is domain-neutral
- documentation no longer describes the product as finance-only
- tests cover multi-domain behavior and backward compatibility
