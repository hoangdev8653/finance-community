# Finance Community — Implementation Plan

## Phase Objective

Harden the already-generalized architecture before expanding real-world ingestion sources for AI, Career, Sports, Life, and additional Business/Money sources.

## Phase 0 — Repository Audit

Before coding:

```text
[ ] inspect current schemas
[ ] inspect current migrations
[ ] inspect category repository/service/controller
[ ] inspect domains module
[ ] inspect posts repository/service/controller
[ ] inspect series module
[ ] inspect tags module
[ ] inspect current navigation
[ ] inspect news-curation docs/code
[ ] inspect content/ docs/code
[ ] inspect tests
```

Produce an impact report before large changes.

## Phase 1 — Taxonomy Integrity

```text
[ ] verify domains schema
[ ] verify category.domain_id
[ ] verify category.parent_id
[ ] verify topic domain/category/parent
[ ] enforce same-domain parent/child relationships
[ ] validate post.domain_id vs category.domain_id
[ ] normalize seeded domains/categories
```

## Phase 2 — Post Topics

```text
[ ] add post_topics table
[ ] add repository methods
[ ] add service handling
[ ] add DTO support
[ ] add response support
[ ] add topic filtering
[ ] add cross-domain validation
[ ] add tests
```

## Phase 3 — Domain / Category API Hardening

Review:

```text
GET /domains
GET /categories
```

They should support active/promotion/domain/content-type semantics consistently with the current API conventions.

Do not create duplicate APIs for each domain.

## Phase 4 — Navigation Hardening

```text
[ ] remove unnecessary hard-coded domain assumptions
[ ] make primary navigation configuration-driven
[ ] keep header compact
[ ] keep subcategories out of primary header
[ ] ensure dynamic domain routing remains generic
[ ] preserve SEO canonical paths
```

## Phase 5 — Series Generalization

```text
[ ] remove finance-only assumptions from Series data and services
[ ] ensure Series can have a domain
[ ] ensure lessons/posts work across domains
[ ] keep current series navigation
[ ] verify existing Finance Series
```

## Phase 6 — News Curation Generalization

```text
[ ] source registry is domain-neutral
[ ] ingestion pipeline is domain-neutral
[ ] source trust is explicit
[ ] classification returns domain/category/topic candidates
[ ] finance-specific prompts become policy/configuration
[ ] AI/sports/career/life sources can reuse the same pipeline
```

Do not add dozens of sources yet. First make the pipeline generic.

## Phase 7 — Editorial Documentation

```text
[ ] update README
[ ] update roadmap
[ ] update news-curation docs
[ ] update content docs
[ ] update AI agent rules
[ ] add multi-domain examples
```

## Phase 8 — Verification

Run repository-standard checks, including whichever of these are defined by the current project:

```text
Backend build
Backend unit tests
Frontend typecheck
Frontend tests
Lint
Migration validation
API contract/Postman synchronization
```

## Regression Checks

```text
[ ] existing Finance articles render
[ ] existing Finance categories render
[ ] existing Finance Series work
[ ] Community posts work
[ ] comments/reactions still work
[ ] moderation still works
[ ] admin content management still works
[ ] SEO metadata still works
[ ] domain routes return 404 for unknown domains
```

## New Multi-Domain Checks

```text
[ ] AI news can use Technology domain
[ ] Career news can use Career domain
[ ] Sports news can use Sports domain
[ ] Life news can use Life domain
[ ] Business news can use Business domain
[ ] Money news can use Money domain
[ ] AI learning series can exist
[ ] Career learning series can exist
[ ] Life learning series can exist
```

## Definition of Done

The phase is complete when adding a new domain such as `SCIENCE` would primarily require:

```text
add domain
add categories/topics
add sources
add navigation metadata if needed
add editorial policy
```

and would NOT require:

```text
new posts module
new news module
new database
new content type
new frontend application
```
