# Content Architecture

## Product direction

Finance Community is a Learning and Community platform. Learning content is organized as `Domain -> Category -> Learning path -> Lesson`; Community posts are independent discussion content.

RSS, automated news ingestion and the `NEWS` content type are no longer part of the product or runtime. Learning content must be original, licensed, or explicitly permitted for reuse.

## Supported content types

```text
SERIES     Learning lessons
COMMUNITY  Community posts
```

Posts may have a domain, category, topics and tags. Categories are scoped to either `SERIES` or `COMMUNITY`.

## Learning paths

```text
Learning path
  -> ordered lessons (SERIES posts)
  -> required or optional lesson
  -> learner progress
```

Required lessons are completed in order. The client uses the learner progress API to surface the next available lesson and lock later lessons until prerequisites are complete.

## API contracts

- `GET /domains` returns active domains.
- `GET /categories?domainId=...` filters categories by domain.
- `GET /categories?scope=SERIES` returns learning categories.
- `GET /posts?domainId=...` filters published content.
- `GET /series/learning/paths` lists published learning paths.
- `GET /series/learning/paths/:slug` returns a public path and its published lessons.
- `GET /series/learning/:id/progress` returns the signed-in learner's path progress.

## Historical migrations

Migrations `0001` and `0006`–`0010` reference former RSS/news tables and are retained only as deployment history. Migration `0019_remove_legacy_rss_pipeline.sql` removes those tables, and migration `0028_finalize_learning_community_content.sql` removes NEWS data and restricts content types to `SERIES` and `COMMUNITY`.
