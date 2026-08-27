# Finance Community — Post ↔ Topic Relationship

## Problem

The repository now has a `topics` table, but `posts` currently expose `domain_id` and `category_id` while topic assignment is not yet a first-class content relationship.

A topic is reusable and a post can discuss more than one topic. Therefore a single `posts.topic_id` column is not the preferred design.

## Required Design

Introduce a many-to-many relationship:

```text
posts
  |
  | 1:N
  v
post_topics
  ^
  | N:1
  |
topics
```

Recommended table:

```text
post_topics
-----------
post_id       UUID NOT NULL
 topic_id      UUID NOT NULL
created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
PRIMARY KEY (post_id, topic_id)
```

Foreign keys:

```text
post_id  -> posts.id   ON DELETE CASCADE
 topic_id -> topics.id ON DELETE CASCADE
```

## Domain Integrity

The database/application layer must prevent cross-domain assignment.

Example:

```text
Post domain = TECH
Topic domain = TECH
=> valid

Post domain = TECH
Topic domain = MONEY
=> invalid
```

If PostgreSQL constraints cannot express this cleanly without triggers, enforce it transactionally in the service layer and cover it with integration tests.

## Repository Requirements

Add support for:

- create/update post with topics
- replace topics on post update
- fetch topics for post detail
- filter posts by topic
- optionally filter by multiple topics if the current API style supports it

Preserve current tag behavior. Topic and tag APIs should remain conceptually distinct.

## API Compatibility

Existing create/update requests without topics must continue to work.

Topics should be optional during migration.

Recommended DTO evolution:

```ts
topics?: string[];
```

Use IDs or slugs consistently with current repository conventions. Do not introduce multiple competing representations.

## Frontend Requirements

The article detail response should be capable of returning topics.

The content editor should eventually allow selecting topics independently from tags.

Do not force a UI redesign in this phase if the existing editor is not ready; ensure backend contracts are ready.

## Tests

Required cases:

```text
[ ] create post without topics
[ ] create post with one topic
[ ] create post with multiple topics
[ ] update post topics
[ ] remove all topics
[ ] fetch post with topics
[ ] filter by topic
[ ] reject cross-domain topic assignment
[ ] deleting a post removes post_topics
[ ] deleting a topic removes post_topics
```

## Why This Matters

This relationship enables the future recommendation system:

```text
Article
  -> Topics
  -> Related concepts
  -> Related articles
  -> Related learning series
```

It also prevents the taxonomy from becoming a flat pile of unrelated tags.
