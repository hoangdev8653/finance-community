# Content Architecture

The platform treats finance as the first content domain, not as a permanent product boundary.

## Taxonomy model

```text
Domain
  -> Category (hierarchical, reusable across content types)
      -> Topic (optional, domain-specific)
  -> Tag (free-form cross-domain label)

Post
  -> contentType: NEWS | COMMUNITY | SERIES
  -> domainId (optional)
  -> categoryId (optional)
  -> tags
```

`categories.scope` remains in the database and API for one compatibility cycle. New code should use `contentTypes` to decide whether a category can classify a post. The migration backfills existing categories with the legacy scope and assigns them to the `MONEY` domain.

## API contracts

- `GET /domains` returns active domains ordered for navigation.
- `GET /categories?domainId=...` filters categories by domain.
- `GET /categories?contentType=NEWS` returns categories usable for news.
- `GET /categories?scope=SERIES` remains supported for existing clients.
- `GET /posts?domainId=...` filters posts independently from content type.

## Domain rules

- A category may support one or more content types through `contentTypes`.
- A post may have a domain without a category, which supports uncategorized news and future content pipelines.
- Existing auth, social, moderation, media, and post relationships remain unchanged.
- Domain deletion is restricted when categories or posts still reference it.

## Migration

Run `apps/api/migrations/0003_generalize_content_taxonomy.sql` after the existing migrations. It creates the domain registry, topics table, additive category fields, post domain support, and the initial domains: MONEY, BUSINESS, TECH, CAREER, LIFE, and SPORTS.
