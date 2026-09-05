# FINANCE COMMUNITY

# Architecture Audit & Improvement Roadmap

**Document:** Architecture Audit
**Version:** 1.0
**Status:** In Progress
**Scope:** Backend / Database / Auth / Security / API / Frontend / Testing / Performance / AI / Production
**Last Updated:** 2026-09-05

---

# 1. Executive Summary

Finance Community hiện tại đã vượt qua mức một CRUD project thông thường.

Hệ thống đang hướng tới một Knowledge & Learning Platform với:

* Learning / Series / Lesson
* Community
* User / Profile
* Authentication / Authorization
* Taxonomy
* Media
* Comments / Reactions
* Moderation
* Notifications
* AI Editorial
* News ingestion
* Market data
* Admin
* SEO
* Caching
* Background processing

Kiến trúc hiện tại phù hợp với mô hình **modular monolith**.

Không nên chuyển sang microservices ở giai đoạn hiện tại.

Mục tiêu của roadmap này không phải là thêm nhiều feature hơn mà là:

> **Tăng độ trưởng thành của hệ thống, giảm technical debt và làm cho kiến trúc có khả năng production hơn.**

---

# 2. Current Architecture Score

| Area             |  Score | Target |
| ---------------- | -----: | -----: |
| Database         | 8.5/10 |    9.0 |
| Backend          | 8.5/10 |    9.0 |
| Auth             | 8.5/10 |    9.0 |
| Security         | 8.5/10 |    9.0 |
| API              | 7.5/10 |    8.5 |
| Frontend         | 8.0/10 |    8.5 |
| Testing          | 7.5/10 |    8.5 |
| Performance      | 7.0/10 |    8.5 |
| AI Pipeline      | 6.5/10 |    8.5 |
| Production Ready | 7.0/10 |    8.5 |

## Overall

**Current:** ~7.8–8.2/10

**Target:** ~8.7–9.0/10

---

# 3. Priority Definitions

## P0 — Critical

Ảnh hưởng trực tiếp tới:

* Security
* Data integrity
* Authentication
* Production correctness
* Khả năng mất dữ liệu
* Khả năng publish sai dữ liệu

P0 phải được xử lý trước khi production.

---

## P1 — High

Ảnh hưởng tới:

* Scalability
* Maintainability
* Reliability
* Performance
* Developer experience

Không nhất thiết block MVP nhưng nên xử lý trước production scale.

---

## P2 — Medium

Bao gồm:

* Refactoring
* Developer experience
* Optimization
* Architecture cleanup
* Code quality

Có thể xử lý sau khi core system ổn định.

---

# 4. P0 — Critical Issues

---

## P0-01 — Financial Market Data Must Never Be Presented as Live When It Is Fallback Data

### Problem

MarketService hiện có fallback/base snapshot data.

Điều này nguy hiểm nếu UI hiển thị dữ liệu fallback giống dữ liệu realtime.

Ví dụ:

```text
VN-INDEX
1,234.56
+12.4
+1.02%
```

nhưng backend thực tế không lấy được dữ liệu live.

User có thể hiểu đây là market data hiện tại.

### Risk

* Misleading financial information
* Data integrity issue
* Legal/compliance risk
* Loss of user trust

### Recommendation

Market response phải chứa metadata:

```ts
{
  symbol: "VNINDEX",
  price: 1234.56,
  change: 12.4,
  changePercent: 1.02,

  source: "YAHOO_FINANCE",
  status: "LIVE",
  fetchedAt: "...",
  staleAt: "...",
}
```

Nếu fallback:

```ts
{
  status: "STALE",
  source: "CACHE",
  fetchedAt: "...",
}
```

Nếu không có dữ liệu hợp lệ:

```ts
{
  status: "UNAVAILABLE"
}
```

### UI

Không được hiển thị:

```text
VN-INDEX 1,234.56
```

mà nên:

```text
VN-INDEX
1,234.56
Data delayed
Updated 12 min ago
```

hoặc:

```text
Market data unavailable
```

### Definition of Done

* [ ] Không có fallback data được đánh dấu LIVE
* [ ] API trả về source
* [ ] API trả về status
* [ ] API trả về fetchedAt
* [ ] API trả về staleAt
* [ ] UI phân biệt LIVE / DELAYED / STALE / UNAVAILABLE
* [ ] Test external API failure
* [ ] Test stale cache
* [ ] Test complete provider failure

---

## P0-02 — Authentication Architecture Must Be Unified

### Problem

Repository hiện có authentication infrastructure liên quan tới:

* JWT
* OAuth
* Refresh tokens
* Token rotation/revocation
* Auth credentials

Trong khi architectural decision trước đây từng định hướng access token runtime memory và không sử dụng backend refresh endpoint.

Đây là dấu hiệu có thể tồn tại **architecture drift**.

### Risk

Có nhiều authentication strategy song song dễ dẫn tới:

* Token lifecycle không rõ
* Security policy không nhất quán
* Refresh token được implement nhưng không được sử dụng đúng
* Frontend/backend contract không đồng bộ

### Recommendation

Phải chọn một authentication model chính.

Ví dụ:

```text
Supabase Auth
      ↓
Access Token
      ↓
Next.js
      ↓
NestJS
      ↓
JWT verification
      ↓
Authorization / RBAC
```

Nếu sử dụng refresh token:

```text
Access Token
     ↓
Expired
     ↓
Refresh Token
     ↓
Rotation
     ↓
New Access Token
```

Nếu không sử dụng refresh token backend:

* Remove unused refresh infrastructure
* Remove dead code
* Document token lifecycle

### Definition of Done

* [ ] Một authentication flow duy nhất
* [ ] Token lifecycle documented
* [ ] Access token lifecycle documented
* [ ] Refresh strategy documented
* [ ] OAuth flow documented
* [ ] Logout/revocation documented
* [ ] Token theft scenario tested
* [ ] Expired token tested
* [ ] Invalid token tested

---

# 5. P1 — Backend Architecture

---

## P1-01 — PostsService Is Too Large

### Current Problem

PostsService đang chịu trách nhiệm nhiều domain:

```text
Authorization
Taxonomy validation
Media validation
Tag resolution
Topic resolution
Sanitization
Content safety
Slug generation
Transaction
Publishing
View counting
Query logic
```

Điều này khiến service trở thành:

> God Service

### Recommendation

Tách thành các domain service:

```text
PostsService
│
├── PostAuthorizationService
├── PostTaxonomyService
├── PostMediaService
├── PostSlugService
├── PostPublishingService
├── PostQueryService
└── PostViewService
```

Ví dụ:

```ts
@Injectable()
export class PostPublishingService {
  async publish(postId: string) {
    // validate
    // moderation
    // state transition
    // audit
  }
}
```

PostsService chỉ orchestration:

```ts
async create(dto, user) {
  await this.authorization.validate(user, dto);
  await this.taxonomy.validate(dto);
  await this.media.validate(dto);

  return this.repository.create(...);
}
```

### Definition of Done

* [ ] PostsService giảm complexity
* [ ] Authorization tách riêng
* [ ] Taxonomy tách riêng
* [ ] Media validation tách riêng
* [ ] Publishing tách riêng
* [ ] View counting tách riêng
* [ ] Unit tests cho từng service

---

# 6. P1 — Database

## P1-01 — Enforce Database Integrity

Application validation không đủ.

Các invariant quan trọng phải được enforce ở database nếu có thể.

### Examples

```text
posts.content_type
posts.status
posts.domain_id
posts.category_id
```

Phải có:

* FK
* CHECK constraint
* UNIQUE constraint
* indexes

### Important constraints

```sql
CHECK (title <> '')
```

```sql
CHECK (view_count >= 0)
```

```sql
UNIQUE(content_type, slug)
```

### Taxonomy Integrity

Đảm bảo:

```text
Category
   ↓
belongs to
   ↓
Domain
```

không thể tạo:

```text
Post.domain_id = Finance
Post.category_id = Technology Category
```

### Definition of Done

* [ ] Critical FK reviewed
* [ ] CHECK constraints reviewed
* [ ] UNIQUE constraints reviewed
* [ ] Indexes reviewed
* [ ] Delete behavior documented
* [ ] Soft-delete behavior documented
* [ ] Transaction boundaries documented

---

# 7. P1 — API Architecture

Current score: **7.5/10**

---

## P1-01 — Standardize API Response

Tất cả API nên sử dụng response contract nhất quán.

### Success

```json
{
  "data": {},
  "meta": {
    "requestId": "..."
  }
}
```

### List

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### Error

```json
{
  "error": {
    "code": "POST_NOT_FOUND",
    "message": "Post not found",
    "requestId": "..."
  }
}
```

Không nên để mỗi controller trả một format khác nhau.

---

## P1-02 — API Contract

Mỗi endpoint phải có:

```text
Method
Path
Authentication
Permission
Request DTO
Response DTO
Error codes
Pagination
Rate limit
```

Ví dụ:

```text
POST /api/v1/posts

Auth:
JWT

Permission:
POST_CREATE

Request:
CreatePostDto

Response:
PostResponseDto

Errors:
POST_NOT_FOUND
CATEGORY_NOT_FOUND
MEDIA_NOT_ALLOWED
CONTENT_INVALID
```

### Definition of Done

* [ ] Response contract thống nhất
* [ ] Error code catalog
* [ ] Pagination contract
* [ ] Swagger đầy đủ
* [ ] DTO validation
* [ ] API integration tests
* [ ] Frontend types synchronized

---

# 8. P1 — API Pagination

Không được sử dụng:

```sql
SELECT *
FROM posts;
```

cho production feed.

Phải có pagination.

MVP:

```text
page
limit
```

Production:

```text
cursor
limit
```

Cursor pagination phù hợp với:

* Feed
* Comments
* Notifications
* Trending
* Infinite scroll

Ví dụ:

```http
GET /posts?cursor=abc123&limit=20
```

Response:

```json
{
  "data": [],
  "meta": {
    "nextCursor": "xyz789",
    "hasNextPage": true
  }
}
```

---

# 9. P1 — Performance

Current score: **7.0/10**

---

## P1-01 — Replace In-Memory View Debounce

Current implementation sử dụng in-memory Map.

```ts
Map<userId:postId, timestamp>
```

### Problem

Khi deploy:

```text
Instance A
Instance B
Instance C
```

mỗi instance có Map riêng.

User có thể bypass debounce bằng cách request sang instance khác.

### Recommendation

Redis:

```text
POST /posts/:id/view
        ↓
Redis SETNX
        ↓
Allowed?
   ↓       ↓
  YES      NO
   ↓
Increment
```

Key:

```text
post:view:{postId}:{userId}
```

TTL:

```text
15 minutes
```

---

## P1-02 — Query Optimization

Review tất cả queries:

```text
posts
comments
reactions
notifications
follows
learning progress
```

Check:

* N+1
* Missing indexes
* Over-fetching
* SELECT *
* Unnecessary joins
* Pagination

### Important indexes

Ví dụ:

```sql
CREATE INDEX idx_posts_status_created
ON posts(status, created_at DESC);
```

```sql
CREATE INDEX idx_comments_post_created
ON comments(post_id, created_at DESC);
```

```sql
CREATE INDEX idx_notifications_user_created
ON notifications(user_id, created_at DESC);
```

Index thực tế phải dựa trên query patterns, không tạo index một cách máy móc.

---

# 10. P1 — Testing

Current score: **7.5/10**

Testing phải được chia:

```text
Unit
Integration
E2E
```

---

## Unit

Test:

* Services
* Validators
* Guards
* Utilities
* Taxonomy logic
* Permission logic

---

## Integration

Test:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

Các flow quan trọng:

```text
Create post
Publish post
Comment
React
Follow
Create lesson
Update learning progress
```

---

## E2E

Critical flows:

```text
Register
Login
OAuth
Create post
Publish
Read lesson
Comment
React
Admin moderation
```

---

## Target

```text
Critical business logic: >= 90%
Backend overall: >= 80%
```

Không nên đặt mục tiêu coverage 100% chỉ vì con số đẹp.

---

# 11. P1 — Frontend Architecture

Current score: **8.0/10**

Frontend cần tránh trở thành:

```text
Page
 └── API calls
      └── business logic
           └── state
```

Nên tổ chức:

```text
UI
 ↓
Feature
 ↓
Query / Mutation
 ↓
API Client
 ↓
Backend
```

Ví dụ:

```text
features/posts/
├── components/
├── hooks/
├── api/
├── schemas/
├── types/
└── utils/
```

Không để API calls rải rác trong component.

---

# 12. P1 — Frontend Data Strategy

Phân biệt rõ:

### Server state

Dùng TanStack Query:

```text
Posts
Lessons
Comments
Notifications
User profile
```

### Client state

Dùng Zustand:

```text
Theme
UI state
Sidebar
Modal
Editor state
Temporary preferences
```

Không dùng Zustand để cache server data nếu TanStack Query đã đảm nhiệm việc đó.

---

# 13. P1 — AI Editorial Pipeline

Current score: **6.5/10**

Đây là phần cần cải thiện mạnh nhất.

---

## Current

```text
HTTP Request
      ↓
Gemini
      ↓
Generate Content
      ↓
Generate Image Plan
      ↓
Return Draft
```

### Problems

* Synchronous
* Long request
* Timeout risk
* No robust retry
* No job status
* No generation history
* No prompt version
* Weak JSON parsing
* Difficult observability

---

# Recommended Architecture

```text
Admin
  ↓
POST /ai/editorial/jobs
  ↓
Create Job
  ↓
Queue
  ↓
Worker
  ↓
Gemini
  ↓
Validate Output
  ↓
Persist Draft
  ↓
Editorial Review
  ↓
Publish
```

---

# AI Job State

```text
PENDING
   ↓
PROCESSING
   ↓
COMPLETED
```

Failure:

```text
PROCESSING
   ↓
FAILED
   ↓
RETRY
```

---

# AI Generation Record

Mỗi generation nên lưu:

```text
job_id
model
prompt_version
input
output
status
error
started_at
completed_at
latency_ms
token_usage
temperature
```

Nếu provider hỗ trợ usage metadata.

---

# Prompt Versioning

Không hard-code prompt mà không có version.

Ví dụ:

```text
financial_article_v1
financial_article_v2
lesson_writer_v1
image_planner_v1
```

Database:

```text
prompt_version
```

Cho phép biết:

> Bài viết này được tạo bằng model nào và prompt version nào?

---

# AI Output Validation

Không tin tưởng output của AI.

Pipeline:

```text
Gemini
  ↓
JSON parse
  ↓
Schema validation
  ↓
Content validation
  ↓
Safety validation
  ↓
Persist
```

Dùng schema validation.

Ví dụ:

```ts
const result = ArticleGenerationSchema.safeParse(output);

if (!result.success) {
  throw new AIOutputValidationError();
}
```

---

# AI Must Never Auto Publish

Luôn:

```text
AI
 ↓
DRAFT
 ↓
Human Review
 ↓
PUBLISHED
```

Không:

```text
AI
 ↓
PUBLISHED
```

---

# 14. P1 — Background Jobs

Các task lâu không nên chạy trực tiếp trong HTTP request.

Candidates:

```text
AI generation
News ingestion
RSS fetching
Content extraction
Image processing
Email
Notification fan-out
Analytics aggregation
Market refresh
```

Architecture:

```text
API
 ↓
Queue
 ↓
Worker
 ↓
Database
```

Có thể sử dụng:

```text
Redis
+
BullMQ
```

---

# 15. P1 — News Ingestion

Recommended pipeline:

```text
RSS
 ↓
Fetch
 ↓
Normalize
 ↓
Deduplicate
 ↓
Extract
 ↓
Clean HTML
 ↓
Store raw content
 ↓
AI processing
 ↓
Draft
 ↓
Editorial review
 ↓
Publish
```

Mỗi ingestion job phải có:

```text
source
source_url
external_id
fetched_at
content_hash
status
error
retry_count
```

---

# 16. P1 — Idempotency

Các job ingestion phải idempotent.

Nếu chạy:

```text
Job A
Job A
Job A
```

không được tạo:

```text
Article 1
Article 2
Article 3
```

mà phải:

```text
Article 1
```

Có thể dùng:

```text
unique(source_id, external_id)
```

hoặc:

```text
content_hash
```

---

# 17. P1 — Production Reliability

Cần bổ sung:

```text
Health Check
Readiness
Liveness
Structured Logging
Request ID
Error Monitoring
Metrics
Database Backup
Migration Strategy
```

Endpoints:

```text
GET /health
GET /health/live
GET /health/ready
```

---

# 18. P1 — Observability

Production phải trả lời được:

> "Tại sao request này lỗi?"

Mỗi request:

```text
requestId
userId
route
method
statusCode
latency
```

Log:

```json
{
  "requestId": "...",
  "route": "/api/v1/posts",
  "method": "POST",
  "status": 500,
  "latency": 421,
  "userId": "..."
}
```

Không log:

```text
password
access token
refresh token
API keys
secrets
```

---

# 19. P1 — Error Monitoring

Cần phân biệt:

```text
Expected Error
```

và:

```text
Unexpected Error
```

Ví dụ:

```text
400 → validation
401 → authentication
403 → authorization
404 → resource
409 → conflict
429 → rate limit
500 → server error
```

Unexpected errors phải được monitoring.

---

# 20. P2 — Technical Debt

---

## TD-01 — PostsService Complexity

Priority: P1

Refactor thành smaller domain services.

---

## TD-02 — In-memory View Debounce

Priority: P1

Move to Redis.

---

## TD-03 — Synchronous AI Generation

Priority: P1

Move to queue + worker.

---

## TD-04 — AI Prompt Hardcoding

Priority: P1

Introduce prompt versioning.

---

## TD-05 — AI JSON Parsing

Priority: P1

Use schema validation and robust parsing.

---

## TD-06 — Missing AI Generation History

Priority: P1

Persist generation metadata.

---

## TD-07 — API Contract Drift

Priority: P1

Synchronize:

```text
DB
 ↓
Drizzle
 ↓
Repository
 ↓
Service
 ↓
DTO
 ↓
Controller
 ↓
Swagger
 ↓
Frontend types
```

---

## TD-08 — Inconsistent Loading / Error UX

Priority: P2

Create reusable:

```text
LoadingState
ErrorState
EmptyState
Skeleton
Retry
```

---

## TD-09 — Homepage Scope

Priority: P2

Homepage currently tries to represent too many concepts:

```text
Learning
News
Community
Trending
Contributors
Editorial
Finance
```

Need a primary user journey.

Recommended:

```text
Discover
 ↓
Topic
 ↓
Series
 ↓
Lesson
 ↓
Save / Learn
 ↓
Discuss
 ↓
Follow
```

Community should support the learning experience instead of competing with it.

---

# 21. Security Hardening

Current score: **8.5/10**

Existing strengths:

* Helmet
* CORS
* ValidationPipe
* Throttling
* JWT guards
* RBAC
* Request IDs
* Security exception handling

Need additional review:

---

## Authentication

* [ ] Brute-force protection
* [ ] Login rate limiting
* [ ] OAuth state validation
* [ ] Token expiration
* [ ] Token revocation
* [ ] Refresh token rotation if used
* [ ] Session invalidation

---

## Authorization

Test:

```text
MEMBER
MODERATOR
ADMIN
SUPER_ADMIN
```

against every privileged endpoint.

Never trust frontend guards.

---

## Input

Validate:

```text
body
params
query
headers
uploaded files
HTML
URLs
```

---

## Upload

Validate:

```text
MIME
extension
size
content type
ownership
purpose
```

Never trust:

```text
filename
Content-Type
client-provided metadata
```

---

# 22. Database Performance Audit

For every important query run:

```sql
EXPLAIN ANALYZE
```

Focus on:

```text
Feed
Post detail
Comments
Notifications
Search
Learning progress
Admin lists
Moderation queue
```

Record:

```text
execution time
rows scanned
rows returned
index usage
```

---

# 23. Caching Strategy

Do not add Redis everywhere.

Use caching only where beneficial.

Good candidates:

```text
Taxonomy
Trending tags
Featured series
Homepage widgets
Market data
Public read-heavy content
```

Avoid caching:

```text
Personalized private data
Rapidly changing authorization data
Data where invalidation is difficult
```

---

# 24. Cache Rules

Every cache should define:

```text
Key
TTL
Invalidation
Owner
Fallback
Stale behavior
```

Example:

```text
Key:
homepage:featured-series

TTL:
5 minutes

Invalidation:
on publish/update

Fallback:
database
```

---

# 25. Deployment Architecture

Recommended initial architecture:

```text
                    Internet
                       │
                       ▼
                Cloudflare / CDN
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
          Next.js              NestJS
          Vercel                VPS
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
                PostgreSQL      Redis        Worker
```

Media:

```text
Next/Nest
   ↓
Cloudinary
```

Do not introduce Kubernetes at this stage.

---

# 26. Database Backup

Production PostgreSQL must have:

```text
Automated backup
Retention policy
Restore procedure
Backup verification
```

A backup that has never been restored is not considered verified.

Test:

```text
Backup
 ↓
Restore
 ↓
Verify tables
 ↓
Verify application
```

---

# 27. CI/CD

Recommended pipeline:

```text
Push
 ↓
Lint
 ↓
Typecheck
 ↓
Unit tests
 ↓
Build
 ↓
Integration tests
 ↓
Docker build
 ↓
Deploy
```

Production deployment should not happen if:

```text
typecheck failed
tests failed
build failed
migration failed
```

---

# 28. Environment Management

Environment:

```text
.env.local
.env.test
.env.production
```

Never commit:

```text
GEMINI_API_KEY
DATABASE_URL
JWT_SECRET
SUPABASE_SECRET
CLOUDINARY_SECRET
```

Use:

```text
Environment variables
Secret manager
CI/CD secrets
```

---

# 29. API Rate Limiting

Rate limits should be different by endpoint.

Example:

```text
Login
       → strict

AI generation
       → very strict

Post creation
       → moderate

Comments
       → moderate

Public GET
       → higher

Health check
       → special
```

AI generation must never have the same rate limit as normal GET requests.

---

# 30. Content Moderation

Community content should follow:

```text
Create
 ↓
Validate
 ↓
Safety check
 ↓
Publish / Pending moderation
 ↓
Report
 ↓
Moderator
 ↓
Action
```

Actions:

```text
APPROVE
HIDE
DELETE
WARN
SUSPEND
```

Every moderation action should create an audit record.

---

# 31. Audit Log

Audit sensitive actions:

```text
Login
Logout
Role change
Permission change
Post publish
Post hide
Post delete
User suspend
User ban
AI generation
AI approval
Moderation action
```

Example:

```json
{
  "actorId": "...",
  "action": "POST_PUBLISHED",
  "targetId": "...",
  "metadata": {},
  "createdAt": "..."
}
```

---

# 32. API Testing Matrix

Every protected endpoint should be tested against:

| Scenario             | Expected              |
| -------------------- | --------------------- |
| No token             | 401                   |
| Invalid token        | 401                   |
| Expired token        | 401                   |
| MEMBER               | Depends on permission |
| MODERATOR            | Depends on permission |
| ADMIN                | Depends on permission |
| SUPER_ADMIN          | Depends on permission |
| Wrong resource owner | 403                   |
| Missing resource     | 404                   |
| Invalid DTO          | 400                   |
| Duplicate resource   | 409                   |

---

# 33. Data Integrity Testing

Test:

```text
Post → Domain mismatch
Post → Category mismatch
Post → Topic mismatch
Post → Unauthorized media
Post → Deleted media
Post → Invalid tags
```

Expected behavior:

```text
Reject request
+
No partial database mutation
```

Transactions must guarantee:

```text
All succeed
OR
All rollback
```

---

# 34. Learning Domain

Learning should become one of the strongest parts of the platform.

Core flow:

```text
Domain
 ↓
Category
 ↓
Series
 ↓
Lesson
 ↓
Assessment
 ↓
Progress
 ↓
Completion
```

Need to define:

```text
Lesson state
Progress state
Assessment state
Completion criteria
```

Example:

```text
NOT_STARTED
IN_PROGRESS
COMPLETED
```

---

# 35. Search

Search should eventually become a first-class domain.

MVP:

```text
PostgreSQL full-text search
```

Later:

```text
Dedicated search engine
```

Do not introduce Elasticsearch/OpenSearch until query complexity and scale justify it.

Search should support:

```text
Lesson
Series
Post
Topic
Tag
```

---

# 36. Recommended Architecture

```text
                    CLIENT
                       │
                       ▼
                  Next.js
                       │
             ┌─────────┴─────────┐
             │                   │
       TanStack Query         Zustand
             │
             ▼
             API Client
             │
             ▼
          NestJS API
             │
    ┌────────┼────────┐
    │        │        │
   Auth    Content   Learning
    │        │        │
    │        │        ├── Assessment
    │        │        └── Progress
    │        │
    │        ├── Posts
    │        ├── Series
    │        ├── Lessons
    │        └── Taxonomy
    │
    ├── Community
    ├── Moderation
    ├── Notifications
    ├── Admin
    ├── AI Editorial
    └── Market
             │
             ▼
         PostgreSQL
             │
        ┌────┴────┐
        ▼         ▼
      Redis    Cloudinary

AI / News
    │
    ▼
 Queue
    │
    ▼
 Worker
    │
    ├── Gemini
    ├── RSS
    └── Content Extraction
```

---

# 37. Recommended Roadmap

## Phase 0 — Architecture Freeze

**Duration: 1 week**

Tasks:

* [ ] Freeze core domain
* [ ] Freeze authentication strategy
* [ ] Freeze API contract
* [ ] Freeze database ownership
* [ ] Define module boundaries
* [ ] Document architecture decisions

Output:

```text
docs/architecture/
├── overview.md
├── authentication.md
├── database.md
├── api.md
├── frontend.md
├── ai-pipeline.md
└── decisions/
```

---

# Phase 1 — P0 Fixes

**Duration: 1–2 weeks**

* [ ] Fix market data status
* [ ] Resolve authentication architecture drift
* [ ] Review token lifecycle
* [ ] Security regression tests
* [ ] Data integrity tests

Goal:

> No critical correctness/security ambiguity.

---

# Phase 2 — Backend Refactor

**Duration: 2–3 weeks**

* [ ] Refactor PostsService
* [ ] Standardize API responses
* [ ] Standardize errors
* [ ] Improve DTO contracts
* [ ] Review transactions
* [ ] Review authorization boundaries

Goal:

> Backend should be easier to extend without creating God Services.

---

# Phase 3 — Database & Performance

**Duration: 2–3 weeks**

* [ ] Query audit
* [ ] EXPLAIN ANALYZE
* [ ] Add missing indexes
* [ ] Review constraints
* [ ] Replace view debounce with Redis
* [ ] Review pagination
* [ ] Identify N+1 queries

Goal:

> Production-safe database access patterns.

---

# Phase 4 — Testing

**Duration: 2–4 weeks**

Implement:

```text
Unit
Integration
E2E
```

Priority:

```text
Auth
Posts
Learning
Permissions
Moderation
AI
```

Goal:

> Critical business logic protected by automated tests.

---

# Phase 5 — AI Pipeline

**Duration: 3–4 weeks**

Implement:

```text
AI Job
 ↓
Queue
 ↓
Worker
 ↓
Gemini
 ↓
Validation
 ↓
Persist
 ↓
Human Review
```

Add:

* [ ] Prompt versioning
* [ ] Generation history
* [ ] Retry
* [ ] Timeout
* [ ] Error handling
* [ ] Usage tracking
* [ ] AI output validation

Goal:

> AI becomes a reliable subsystem instead of an HTTP utility.

---

# Phase 6 — Production Hardening

**Duration: 2–3 weeks**

* [ ] Health checks
* [ ] Logging
* [ ] Monitoring
* [ ] Backup
* [ ] Restore testing
* [ ] CI/CD
* [ ] Security audit
* [ ] Rate limiting
* [ ] Load testing

Goal:

> System can be deployed and operated reliably.

---

# 38. Final Priority Matrix

| Issue                       | Priority | Area           | Target |
| --------------------------- | -------- | -------------- | ------ |
| Market fallback correctness | P0       | Market         | 1      |
| Auth architecture drift     | P0       | Auth           | 1      |
| PostsService complexity     | P1       | Backend        | 2      |
| API response contract       | P1       | API            | 2      |
| DB integrity                | P1       | Database       | 2      |
| View debounce → Redis       | P1       | Performance    | 3      |
| Query optimization          | P1       | Performance    | 3      |
| AI → Queue/Worker           | P1       | AI             | 5      |
| Prompt versioning           | P1       | AI             | 5      |
| AI output validation        | P1       | AI             | 5      |
| Background jobs             | P1       | Infrastructure | 5      |
| Testing expansion           | P1       | QA             | 4      |
| Observability               | P1       | Production     | 6      |
| Backup/restore              | P1       | Production     | 6      |
| API type synchronization    | P1       | DX             | 2      |
| Frontend feature boundaries | P2       | Frontend       | 4      |
| Homepage UX simplification  | P2       | Product        | Later  |
| Advanced search             | P2       | Search         | Later  |
| Recommendation system       | P2       | Product        | Later  |

---

# 39. What NOT To Do

Do NOT:

```text
❌ Microservices
❌ Kubernetes
❌ Kafka
❌ Elasticsearch immediately
❌ GraphQL migration
❌ Event sourcing
❌ CQRS everywhere
❌ Over-engineered DDD
```

unless there is a concrete requirement.

Current architecture should remain:

> **Modular Monolith + PostgreSQL + Redis + Queue/Worker**

This is sufficient for the current stage.

---

# 40. Target Architecture Maturity

The goal is not:

> "Have more technologies."

The goal is:

```text
                CURRENT
                   │
                   ▼
          Modular Monolith
                   │
                   ▼
          Strong boundaries
                   │
                   ▼
       Reliable API contracts
                   │
                   ▼
        Correct data integrity
                   │
                   ▼
       Automated critical tests
                   │
                   ▼
      Redis + Background Workers
                   │
                   ▼
        Observable production
                   │
                   ▼
           Production v1
```

---

# 41. Definition of Production Ready

The project should not be considered production-ready until:

## Security

* [ ] Authentication strategy finalized
* [ ] Authorization tested
* [ ] Rate limits configured
* [ ] Secrets protected
* [ ] Upload validation complete

## Database

* [ ] Constraints reviewed
* [ ] Indexes reviewed
* [ ] Transactions verified
* [ ] Backup configured
* [ ] Restore tested

## Backend

* [ ] No critical God Services
* [ ] API contracts stable
* [ ] Error handling standardized
* [ ] Background jobs implemented where necessary

## Frontend

* [ ] Loading states
* [ ] Error states
* [ ] Empty states
* [ ] Server/client state separated
* [ ] API types synchronized

## AI

* [ ] Async processing
* [ ] Retry
* [ ] Timeout
* [ ] Output validation
* [ ] Prompt versioning
* [ ] Generation history
* [ ] Human review

## Operations

* [ ] Health checks
* [ ] Logging
* [ ] Monitoring
* [ ] CI/CD
* [ ] Backup
* [ ] Restore procedure

## Testing

* [ ] Unit
* [ ] Integration
* [ ] E2E
* [ ] Security regression
* [ ] Critical business flow coverage

---

# 42. Final Engineering Principle

Finance Community should be developed according to:

> **Correctness → Reliability → Maintainability → Performance → Scale**

Not:

> **Features → Features → Features → More Features**

The next stage of this project should therefore focus less on adding functionality and more on understanding and hardening the existing system.

The most important engineering milestone is:

```text
"I can explain every important architectural decision
and I can debug the entire request lifecycle."
```

For example:

```text
User
 ↓
Next.js
 ↓
API Client
 ↓
NestJS Controller
 ↓
Guard
 ↓
DTO Validation
 ↓
Service
 ↓
Repository
 ↓
Drizzle
 ↓
PostgreSQL
 ↓
Transaction
 ↓
Response DTO
 ↓
TanStack Query
 ↓
UI
```

If the developer can trace, debug, test and modify this flow confidently, the project demonstrates substantially stronger **Middle Full-stack engineering ability** than simply having a large number of features.
