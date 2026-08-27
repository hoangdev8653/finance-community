# Finance Community — Navigation and Domain UX Contract

## Product Principle

The header should be compact. It must not expose every backend category.

Primary navigation target:

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

Optional utilities:

```text
Search
Account
```

## Navigation Semantics

### Tin mới

A time-based aggregate view across supported domains.

It is not a domain.

### Tài chính

Points to the Money domain.

### Kinh doanh

Points to Business.

### AI / Công nghệ

Initially maps to the Technology domain, with AI as a promoted category.

### Việc làm

Points to Career.

### Thể thao

Points to Sports.

### Đời sống

Points to Life.

### Học

Points to learning/Series discovery.

It is a content-format destination, not a domain.

## Header Rules

1. Do not hard-code a long list of backend categories in the main header.
2. Do not make every new category a header item.
3. Use domain/category metadata (`is_promoted`, ordering, active state) or a dedicated navigation configuration source.
4. A category may exist without appearing in the header.
5. A category may later be promoted without changing the core schema.
6. Header labels must use i18n conventions.

## Domain Landing Pages

The current dynamic route pattern is appropriate:

```text
/{domainSlug}
/{domainSlug}/bai-viet/{postSlug}
```

Do not create separate hard-coded page implementations for `/finance`, `/sports`, `/ai`, etc.

The domain page should load its domain from the API and then query content by `domainId`.

## Domain Landing Page Requirements

At minimum:

- domain title
- description
- latest content
- optional promoted categories
- pagination or load-more strategy consistent with current feed APIs

Future target:

```text
Domain Page
  Hero / lead story
  Latest
  Category sections
  Trending
  Learning
```

Do not overbuild this in the taxonomy hardening phase.

## Slugs

Keep slugs stable and SEO-friendly.

Examples:

```text
/money
/business
/technology
/career
/sports
/life
```

Do not change a working slug merely for cosmetic reasons.

For the existing `TECH` domain, prefer keeping the current database code while using a stable public slug such as `technology`.

## Học / Learning Navigation

`Học` should discover Series across domains:

```text
Học
  -> Tài chính
  -> AI / Công nghệ
  -> Việc làm
  -> Kinh doanh
  -> Đời sống
```

A Series must not be restricted to Finance.
