# Content Architecture

## Product priority

The primary product is a multi-domain Learning platform. Finance is one category among many; it is not a hard-coded product boundary. Learning content is organized as `Category -> Series -> Lesson` and is distinct from News ingestion and Community posts.

For the current product direction, News/RSS is removed from the runtime. Learning content must be original, licensed, or otherwise explicitly permitted for reuse.

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
  -> topics (many-to-many through post_topics)
  -> tags
```

`categories.scope` remains in the database and API for one compatibility cycle. New code should use `contentTypes` to decide whether a category can classify a post. The migration backfills existing categories with the legacy scope and assigns them to the `MONEY` domain.

## API contracts

- `GET /domains` returns active domains ordered for navigation.
- `GET /categories?domainId=...` filters categories by domain.
- `GET /categories?contentType=NEWS` returns categories usable for news.
- `GET /categories?scope=SERIES` remains supported for existing clients.
- `GET /posts?domainId=...` filters posts independently from content type.
- `GET /posts?topicId=...` filters posts attached to a reusable topic.
- `POST /posts` and `PATCH /posts/:id` accept optional `topics: string[]` containing topic IDs.

## Domain rules

- A category may support one or more content types through `contentTypes`.
- A post may have a domain without a category, which supports uncategorized news and future content pipelines.
- A post topic must belong to the same domain as the post.
- Tags remain free-form labels and must not replace category/topic taxonomy.
- Existing auth, social, moderation, media, and post relationships remain unchanged.
- Domain deletion is restricted when categories or posts still reference it.

- Each structured source carries `domainCode`, `topicSlug`, `sourceName`, `url`, and `language`.
- The default registry now covers MONEY, BUSINESS, TECH, CAREER, LIFE, and SPORTS instead of finance-only feeds.
- A future ingest worker should resolve `domainCode` and `topicSlug` to database IDs before creating `NEWS` posts and `post_topics` rows.

## Migration

Run `apps/api/migrations/0003_generalize_content_taxonomy.sql` after the existing migrations. It creates the domain registry, topics table, additive category fields, post domain support, and the initial domains: MONEY, BUSINESS, TECH, CAREER, LIFE, and SPORTS.

Run `apps/api/migrations/0005_add_post_topics_and_taxonomy_integrity.sql` after moderation migration `0004`. It adds `post_topics` and normalizes the CAREER seed label away from the old `Career & Learning` naming.
