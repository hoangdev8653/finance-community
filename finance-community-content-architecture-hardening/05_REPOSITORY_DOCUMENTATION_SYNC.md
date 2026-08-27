# Finance Community — Documentation Synchronization

## Goal

The code has now moved toward a multi-domain architecture, but repository documentation must describe the same product model.

Do not leave documentation that incorrectly describes the platform as finance-only.

## Documents Requiring Review

At minimum review:

```text
README.md
ROADMAP_CHUC_NANG_BO_SUNG.md
TASK_QUEUE.md
TASK_REPORT.md
news-curation/00_NEWS_CURATION_WORKFLOW.md
news-curation/01_SOURCE_COLLECTION.md
news-curation/02_NEWS_FILTERING.md
news-curation/05_AI_NEWS_ANALYSIS.md
news-curation/06_AI_NEWS_WRITING.md
news-curation/07_NEWS_FACT_CHECK.md
news-curation/08_NEWS_DRAFTING.md
news-curation/09_NEWS_PUBLISHING.md
news-curation/10_SOURCE_MANAGEMENT.md
content/*
.agents/rules/*
```

## Required Product Language

Prefer:

> Multi-domain news, knowledge, and community platform

or equivalent wording.

Avoid repeatedly describing the core architecture as:

> Finance-only platform
> Financial news-only platform
> Financial series-only platform

Finance remains an important founding domain.

## README Updates

The README should explain:

- Money/Finance is a primary domain, not the only domain.
- Other supported domains include Business, Technology, Career, Sports, and Life.
- NEWS, SERIES, and COMMUNITY are independent content types.
- Dynamic domain routes exist.
- The architecture is taxonomy-driven.

## Roadmap Updates

The roadmap should separate:

### Platform capabilities

Examples:

- taxonomy
- source registry
- ingestion
- editorial workflow
- Series engine
- recommendation system
- moderation

from:

### Domain content

Examples:

- Money
- Business
- Technology / AI
- Career
- Sports
- Life

Do not encode domain-specific assumptions in platform infrastructure tasks.

## News Curation Documentation

The existing workflow is a useful foundation but should be generalized from financial-news-only language.

For example, change the conceptual wording from:

```text
RSS -> financial article -> AI financial rewrite
```

to:

```text
source -> news signal -> normalized item -> domain classification -> editorial workflow
```

Domain-specific editorial policies may still exist as configuration.

## Content Documentation

The `content/` directory should distinguish:

```text
NEWS workflow
LEARNING/SERIES workflow
COMMUNITY workflow
```

Do not make all three share one writing prompt.

## AGENTS Rules

Repository rules should be updated so AI coding agents understand:

- Domain is not hard-coded to Finance.
- Learning is a content format, not a domain.
- AI is a Technology category/major editorial vertical unless a future decision changes this.
- Topics and tags have different meanings.
- New domains should use the existing generic architecture.
- Do not create duplicate domain-specific modules when generic services can handle the use case.

## Documentation Acceptance Test

A developer who has never seen the project should be able to answer from the documentation:

1. What are the top-level domains?
2. What are the content types?
3. Where do categories and topics fit?
4. How are News and Learning different?
5. How does an article belong to a domain?
6. How can a new domain be added?
7. Which documents define editorial rules?
