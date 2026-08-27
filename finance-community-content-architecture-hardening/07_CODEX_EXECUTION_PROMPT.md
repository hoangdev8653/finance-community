# CODEX EXECUTION PROMPT — CONTENT ARCHITECTURE HARDENING

You are working inside the existing repository:

`hoangdev8653/finance-community`

Your task is to **harden the existing multi-domain content architecture**. Do not rebuild the application.

## Product Direction

The product is evolving from a finance-centric platform into a multi-domain News + Learning + Community platform for young adults and working-age internet users.

Primary domains:

```text
MONEY
BUSINESS
TECHNOLOGY (existing code may remain TECH)
CAREER
SPORTS
LIFE
```

Primary content types:

```text
NEWS
SERIES
COMMUNITY
```

Important:

- `NEWS` answers "What is happening?"
- `SERIES` / Learning answers "What does it mean and how does it work?"
- `COMMUNITY` answers "What do people think, ask, or experience?"

Finance is an important domain, but it must not remain a hard-coded assumption of the core content architecture.

## Current Repository Context

The repository already contains:

- `domains` module and domain-aware schema
- category/domain relationships
- topics table
- post domain support
- dynamic `/{domainSlug}` and `/{domainSlug}/bai-viet/{postSlug}` routes
- `NEWS | SERIES | COMMUNITY`
- `news-curation/`
- admin/moderation systems
- existing series and social architecture

The latest architecture-generalization work is already committed. This phase is about **hardening and completing the design**, not repeating that work.

## Mandatory First Step — Audit

Before editing code:

1. Inspect the current source tree.
2. Inspect database schemas and migrations.
3. Inspect `domains`, `categories`, `topics`, `posts`, `tags`, `series` modules.
4. Inspect frontend dynamic domain routes and navigation.
5. Inspect `news-curation/` documentation and implementation.
6. Inspect `content/` documentation.
7. Inspect `.agents/rules/`.
8. Inspect tests and API/Postman contract artifacts.
9. Compare documentation against code.

Do not assume old documentation is current.

First produce a concise architecture impact report containing:

- Current state
- Current finance-specific assumptions
- Gaps
- Required changes
- Migration risks
- Backward-compatibility risks
- Exact files/modules likely to change

Do not perform a destructive refactor.

## Required Change 1 — Taxonomy Integrity

The conceptual taxonomy is:

```text
DOMAIN
  -> CATEGORY
      -> TOPIC
          -> TAG
```

Do not collapse these concepts.

Requirements:

- Category belongs to a domain.
- Category may have a parent category.
- Topic belongs to a domain and may belong to a category.
- Topic may have a parent topic.
- Parent/child taxonomy items must remain in the same domain.
- Post domain must match post category domain when category exists.

Keep tags separate from topics.

## Required Change 2 — Post ↔ Topic Relationship

The current repository has `topics`, but posts need a reusable many-to-many relationship.

Implement:

```text
post_topics
-----------
post_id
 topic_id
created_at
```

Use a composite primary key or equivalent uniqueness constraint on `(post_id, topic_id)`.

Foreign keys should preserve data integrity.

Do not add a single `topic_id` directly to posts unless the repository has a compelling existing convention that requires it.

Support:

- create with topics
- update/replace topics
- fetch topics on detail
- filter by topic
- cross-domain validation

Existing requests that omit topics must continue working.

## Required Change 3 — Domain and Category Architecture

The initial domain set is:

```text
MONEY
BUSINESS
TECH / TECHNOLOGY
CAREER
SPORTS
LIFE
```

Do not create separate core modules for each domain.

Do not create:

```text
FinancePostsModule
SportsPostsModule
CareerPostsModule
AINewsModule
```

when the existing generic modules can serve all domains.

## AI Domain Decision

Do NOT create a separate `AI` domain in this phase.

AI should be a major category under Technology, for example:

```text
TECH
  -> AI
     -> Generative AI
     -> LLM
     -> AI Agents
     -> AI Tools
```

This preserves room for broader Technology content.

If an existing public route or code name already uses `technology`, do not perform unnecessary renaming.

## Career Naming

Do not treat "Learning" as part of the Career domain.

Career is a domain.

Learning is a content format/destination.

Do not preserve a model where the domain is effectively `CAREER_AND_LEARNING`.

## Required Change 4 — Navigation

Primary header should remain compact:

```text
Tin mới
Tài chính
Kinh doanh
AI / Công nghệ
Việc làm
Thể thao
Đời sống
Học
```

Do not expose every category in the primary header.

`Tin mới` is an aggregate view, not a domain.

`Học` is a learning destination, not a domain.

Subcategories belong inside domain/category pages or dropdown/mega menus.

Navigation should be configuration/taxonomy driven where practical.

Do not hard-code every future category into navigation.

## Required Change 5 — Dynamic Domain Pages

Preserve the existing generic routes:

```text
/{domainSlug}
/{domainSlug}/bai-viet/{postSlug}
```

Do not create separate page implementations for each domain.

The page should load its domain from the generic domain API and then query content by domain.

## Required Change 6 — Series Generalization

The Series engine must support all domains.

Valid examples:

```text
Series: Hiểu về lạm phát
Domain: MONEY

Series: Hiểu về LLM
Domain: TECH

Series: Hiểu về thị trường lao động
Domain: CAREER

Series: Hiểu về hành vi con người
Domain: LIFE
```

Do not make Learning a Finance-only system.

Do not require a new schema for every domain.

## Required Change 7 — News vs Learning Separation

The News pipeline is:

```text
Source
-> Collection
-> Normalize
-> Filter
-> Deduplicate
-> Extract
-> Classify
-> Score
-> Fact Check
-> AI Draft
-> BTV Review
-> Publish
```

The Learning pipeline is:

```text
Topic
-> Research
-> Primary Sources
-> Cross-check
-> Definition Lock
-> Knowledge Map
-> Curriculum
-> Lesson Blueprint
-> AI Draft
-> Fact Review
-> Editorial Review
-> Publish
```

Do not merge these workflows into one writing prompt or one indistinguishable pipeline.

## Required Change 8 — News Source Generalization

The source registry must support:

```text
RSS
ATOM
API
OFFICIAL_WEBSITE
NEWSROOM
WEB
MANUAL
```

Sources must carry enough metadata for:

- publisher
- source type
- trust level
- language
- country
- feed/homepage URL
- active state
- domain/category mapping
- usage notes

Trust levels may include:

```text
PRIMARY
PROFESSIONAL
SECONDARY
COMMUNITY
```

Do not automatically publish merely because a source is marked trusted.

## Copyright / Source Usage

Do not build an architecture that assumes an RSS feed permits full article republication.

Use feeds primarily as source signals and metadata unless the source's usage rights permit more.

The editorial pipeline should produce original synthesis and respect source terms.

## Required Change 9 — Documentation Sync

Update documentation that still presents the product as finance-only.

At minimum inspect:

```text
README.md
ROADMAP_CHUC_NANG_BO_SUNG.md
TASK_QUEUE.md
TASK_REPORT.md
news-curation/*.md
content/*.md
.agents/rules/*.md
```

The documentation must explain:

- six supported domains
- three content types
- taxonomy hierarchy
- News vs Learning separation
- domain-neutral architecture
- future extensibility

Do not erase historical context, but do not leave current architecture described incorrectly.

## Required Change 10 — Tests

Add or update tests for:

### Taxonomy

```text
[ ] category belongs to domain
[ ] parent category same-domain validation
[ ] topic belongs to domain
[ ] topic category same-domain validation
[ ] post category/domain consistency
```

### Post Topics

```text
[ ] create no topics
[ ] create one topic
[ ] create multiple topics
[ ] update topics
[ ] remove topics
[ ] retrieve topics
[ ] filter by topic
[ ] reject cross-domain topic
```

### Multi-domain content

```text
[ ] Money news
[ ] Business news
[ ] Technology/AI news
[ ] Career news
[ ] Sports news
[ ] Life news
[ ] non-finance Series
```

### Regression

```text
[ ] existing Finance content
[ ] existing Series
[ ] Community
[ ] comments/reactions
[ ] moderation
[ ] admin
[ ] SEO/domain routes
```

## Backward Compatibility

Preserve:

- existing IDs
- existing Finance data
- existing API contracts unless an additive change is necessary
- authentication
- RBAC
- social architecture
- Cloudinary/media architecture
- Next.js/NestJS stack
- current testing conventions

Prefer additive migrations.

Never reset the database to simplify implementation.

## Do Not Over-Engineer

Do not introduce:

- microservices
- event buses
- graph databases
- Elasticsearch
- separate databases per domain
- duplicate frontend applications
- separate post models per domain

unless an existing project requirement already demands them.

## Implementation Order

Implement in this order after the audit is approved:

```text
1. Taxonomy integrity
2. post_topics relation
3. Domain/category API hardening
4. Navigation hardening
5. Series generalization
6. News source/pipeline generalization
7. Documentation synchronization
8. Tests and verification
```

## Final Report Required

After implementation, report:

```text
IMPLEMENTATION SUMMARY

CHANGED FILES

DATABASE / MIGRATIONS

API CHANGES

FRONTEND CHANGES

EDITORIAL/DOCUMENTATION CHANGES

TEST RESULTS

BACKWARD COMPATIBILITY RESULTS

REMAINING LIMITATIONS

NEXT RECOMMENDED PHASE
```

## Critical Final Condition

The architecture should make it possible to add a new future domain such as `SCIENCE` by primarily adding:

```text
domain
categories/topics
sources
navigation metadata
editorial policy
```

without creating a new post engine, news engine, series engine, or separate application.
