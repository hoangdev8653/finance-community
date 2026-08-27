# Finance Community — Taxonomy Model

## 1. Taxonomy Principle

The repository must use a clear hierarchy:

```text
DOMAIN
  -> CATEGORY
      -> TOPIC
          -> TAG
```

These levels have different responsibilities and must not be collapsed into one concept.

## 2. Domain

A `Domain` is a major editorial area and a primary navigation boundary.

Initial domains:

| Code | Display Name | Purpose |
|---|---|---|
| `MONEY` | Tài chính | Personal finance, investing, banking, markets, macroeconomics, real estate finance |
| `BUSINESS` | Kinh doanh | Companies, startups, business strategy, commerce, entrepreneurship |
| `TECH` or equivalent existing code | Công nghệ | AI, software, internet, digital products, devices |
| `CAREER` | Việc làm | Jobs, labor market, career development, workplace, skills |
| `SPORTS` | Thể thao | Football, tennis, basketball, motorsport, esports, other sports |
| `LIFE` | Đời sống | Lifestyle, travel, health, education, relationships, society, consumer topics |

Do not create a separate `AI` domain unless a later product decision explicitly requires it. AI should initially be a major category under Technology.

## 3. Category

A category is an editorial subdivision inside a domain.

Examples:

```text
MONEY
  - Tài chính cá nhân
  - Chứng khoán
  - Ngân hàng
  - Bất động sản
  - Vĩ mô

BUSINESS
  - Doanh nghiệp
  - Startup
  - Thị trường
  - Khởi nghiệp

TECH
  - AI
  - Phần mềm
  - Internet
  - Thiết bị
  - An ninh mạng

CAREER
  - Thị trường lao động
  - Tuyển dụng
  - Nghề nghiệp
  - Kỹ năng
  - Nơi làm việc

SPORTS
  - Bóng đá
  - Tennis
  - Bóng rổ
  - F1
  - Esports

LIFE
  - Đời sống
  - Du lịch
  - Sức khỏe
  - Giáo dục
  - Lifestyle
  - Quan hệ & Gia đình
  - Tiêu dùng
```

Categories should support:

- `domain_id`
- optional `parent_id`
- slug
- Vietnamese/English names where supported
- description
- ordering
- active/inactive
- promoted/not promoted
- allowed content types

## 4. Topic

A topic is a more specific subject or concept.

Examples:

```text
TECH -> AI -> Large Language Models
TECH -> AI -> AI Agents
MONEY -> Tài chính cá nhân -> Lãi kép
MONEY -> Vĩ mô -> Lạm phát
CAREER -> Thị trường lao động -> Remote Work
SPORTS -> Bóng đá -> Premier League
LIFE -> Du lịch -> Du lịch tự túc
```

Topics may be hierarchical and should support:

- `domain_id`
- optional `category_id`
- optional `parent_id`
- name
- slug
- description
- order
- active/inactive

A topic must be reusable by multiple content items.

## 5. Tag

Tags are cross-cutting metadata.

Example:

```text
Post domain: TECH
Category: AI
Topics: LLM, AI Agents
Tags: OpenAI, developer-tools, productivity
```

Do not use tags as a replacement for categories.

## 6. Content Type Is Separate

Taxonomy and content type are independent:

```text
Domain: TECH
Content Type: NEWS

Domain: TECH
Content Type: SERIES

Domain: TECH
Content Type: COMMUNITY
```

The same domain can support multiple content types.

## 7. Header Navigation Is Not the Taxonomy

The public header should expose only major editorial areas. Backend taxonomy may contain many more categories.

Target primary navigation:

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

The `AI` label may point into the Technology domain, while `Học` is a content-format destination rather than a domain.

## 8. Required Invariants

Enforce these rules at application or database level where practical:

1. A category should belong to one domain.
2. A topic must belong to one domain.
3. A topic's category, when present, must belong to the same domain.
4. A child category must share the same domain as its parent.
5. A child topic must share the same domain as its parent.
6. A post's category, when present, must belong to the same domain as the post.
7. A post topic relationship must reference a topic whose domain matches the post domain.
8. Tags remain domain-agnostic unless a future requirement explicitly changes this.

## 9. Migration Safety

Do not perform a destructive taxonomy rewrite.

Existing Finance categories should map to `MONEY`.
Existing Finance posts should retain their content and gain the correct domain reference.

Do not leave migration logic that permanently assumes every unknown category is `MONEY`; use that only as a one-time compatibility migration and validate the resulting data.
