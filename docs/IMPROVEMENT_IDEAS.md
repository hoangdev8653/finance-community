# 🔍 Ý Tưởng Hoàn Thiện — Finance Community

> **Ngày tạo**: 2026-08-19
> **Baseline**: MVP 92.8% complete | 263 tests passing | 0 TS errors | 23 routes
> **Mục đích**: Danh sách ý tưởng để hoàn thiện platform khi có thời gian.

---

## 1. 🔴 Tính Năng Sản Phẩm Còn Thiếu

### 1.1 Bookmarks / Reading List *(Dead link `/bookmarks` đã có trên Sidebar)*
- Tạo bảng `bookmarks` (user_id, post_id, created_at)
- API CRUD bookmarks
- Trang `/bookmarks` hiển thị bài đã lưu
- Nâng cao: tính năng "collections" để user phân loại bookmarks (VD: "Đầu tư cổ phiếu", "Quản lý chi tiêu")
- **Ưu tiên**: 🔴 Cao — dead link trên UI

### 1.2 Subscription Feed *(Dead link `/subscriptions` đã có trên Sidebar)*
- Feed cá nhân hoá chỉ hiển thị bài viết từ tác giả/tags/categories user đã follow
- Khác biệt rõ với public feed `/` — đây là "timeline riêng" của mỗi user
- **Ưu tiên**: 🔴 Cao — dead link + tính năng retention quan trọng

### 1.3 Facebook OAuth *(Khai báo trong Product Spec, chưa implement)*
- Implement `passport-facebook` strategy tương tự Google OAuth flow
- **Ưu tiên**: 🟡 Trung bình — quan trọng nếu target audience Việt Nam

### 1.4 Email Verification & Password Reset *(Chưa có email service)*
- Integrate email provider (Resend / SendGrid / Nodemailer)
- Email xác nhận đăng ký
- Email reset password (token có TTL)
- Notification email digest (tuỳ chọn user)
- **Ưu tiên**: 🔴 Cao — auth flow chưa hoàn chỉnh nếu thiếu

### 1.5 Badges & Reputation System *(Product Spec đánh dấu "future")*
- Reputation point: đăng bài +10, nhận like +2, comment hữu ích +5...
- Badges tự động: "First Post", "100 Likes", "Series Author", "Top Contributor"
- Trust levels: unlock quyền hạn theo reputation
- **Ưu tiên**: 🟡 Trung bình

### 1.6 Direct Messaging / Chat
- Tin nhắn 1-1 giữa users, bắt đầu đơn giản text-only
- Nâng cao: group chat, đính kèm file
- **Ưu tiên**: 🟢 Thấp

### 1.7 Polls / Surveys trong Community Posts
- Cho phép user tạo poll trong bài viết community
- VD: "Bạn đầu tư vào đâu năm 2026?" với các options vote
- **Ưu tiên**: 🟢 Thấp — tăng engagement

---

## 2. 🟠 Kỹ Thuật Backend Cần Bổ Sung

### 2.1 Email Service (Transactional Email)
- Module `EmailService` tích hợp Resend/SendGrid/Nodemailer
- Welcome email, verification, password reset, notification digest
- **Complexity**: Trung bình

### 2.2 Background Job Queue
- `@nestjs/bull` hoặc `BullMQ` + Redis
- Use cases: gửi email async, analytics aggregation, cleanup expired tokens, resize ảnh, notification fanout
- **Complexity**: Trung bình

### 2.3 WebSocket / Real-time Notifications
- `@nestjs/websockets` hoặc Socket.io gateway
- Real-time notification push, live comment updates, typing indicators, online presence
- **Complexity**: Trung bình-Cao

### 2.4 Caching Layer (Redis)
- Cache public feed (30-60s), category/tag lists (5 phút), feature flags
- Token blacklist, rate limiting state (hiện in-memory, mất khi restart)
- **Complexity**: Trung bình

### 2.5 Full-text Search Engine
- **Ngắn hạn**: PostgreSQL `tsvector` + `tsquery` — zero thêm infrastructure
- **Dài hạn**: Meilisearch hoặc Elasticsearch
- Hỗ trợ: fuzzy matching, tiếng Việt, weighted ranking (title > body > tags)
- **Complexity**: Trung bình

### 2.6 Database Migrations
- `drizzle-kit` migration system
- Version control schema changes, rollback an toàn, CI/CD tự động migrate
- **Complexity**: Thấp — Drizzle hỗ trợ sẵn

### 2.7 API Response Standardization
- Format chuẩn: `{ data, meta: { page, limit, total, totalPages }, error }`
- Cursor-based pagination cho feed (hiệu quả hơn offset khi data lớn)
- **Complexity**: Thấp-Trung bình

### 2.8 Health Check & Graceful Shutdown
- `@nestjs/terminus` health check endpoint (`/health`)
- Kiểm tra: DB connectivity, Redis, disk space, memory
- Graceful shutdown: đóng DB connections, drain queue trước khi tắt
- **Complexity**: Thấp

---

## 3. 🟡 Hạ Tầng & DevOps

### 3.1 CI/CD Pipeline
- GitHub Actions: lint + typecheck, test suites, build verification, auto deploy
- **Complexity**: Trung bình

### 3.2 Monitoring & Observability
- APM: Sentry cho error tracking (FE + BE)
- Metrics: Prometheus + Grafana hoặc managed service
- Structured logging: Winston/Pino thay `console.log`
- Request tracing: Correlation IDs
- **Complexity**: Trung bình

### 3.3 Environment Management
- `.env.example` cho cả web app
- Environment validation (Zod validate env vars khi boot)
- Secrets management — loại bỏ hardcoded mock secrets trong code
- **Complexity**: Thấp

### 3.4 Database Backup & Recovery
- Automated daily pg_dump cron job
- Point-in-time recovery config
- Disaster recovery plan documented
- **Complexity**: Thấp-Trung bình

---

## 4. 🔐 Bảo Mật Nâng Cao

### 4.1 Two-Factor Authentication (2FA)
- TOTP-based (Google Authenticator, Authy) cho Admin/Moderator
- Tuỳ chọn cho member
- **Ưu tiên**: 🟡 Trung bình

### 4.2 CAPTCHA
- reCAPTCHA v3 / hCaptcha / Cloudflare Turnstile
- Chống: bot registration, brute force login, content spam
- **Ưu tiên**: 🟡 Trung bình — cần trước public launch

### 4.3 Production CSP Hardening
- Tách CSP config giữa production và development
- Production không nên có `unsafe-eval` (hiện cho Swagger dùng)
- **Complexity**: Thấp

### 4.4 Session Management Cải Thiện
- Token rotation strategy
- Refresh token reuse detection (revoke tất cả nếu bị reuse)
- Device/session management UI
- Maximum concurrent sessions limit
- **Complexity**: Trung bình

### 4.5 Content Security
- Rate limit riêng cho content creation
- AI-assisted content moderation (phát hiện spam, ngôn ngữ không phù hợp)
- Link scanning trong comments (chống phishing)
- **Complexity**: Trung bình-Cao

---

## 5. 🎨 UX / UI & Frontend

### 5.1 Internationalization (i18n)
- `next-intl` hoặc `react-i18next` cho EN + VI
- **Complexity**: Trung bình — refactor hardcoded strings

### 5.2 Rich Text Editor Nâng Cao
- Tích hợp **Tiptap** hoặc **Editor.js** cho WYSIWYG
- Code blocks + syntax highlighting, LaTeX/KaTeX, table, image inline, @mention, slash commands
- **Complexity**: Trung bình-Cao

### 5.3 PWA (Progressive Web App)
- Service worker + manifest
- Install as app trên mobile, offline reading, push notifications
- **Complexity**: Trung bình

### 5.4 Accessibility Audit
- Lighthouse accessibility score 90+
- Keyboard navigation hoàn chỉnh
- Screen reader testing, color contrast WCAG AA, focus management
- **Complexity**: Trung bình

### 5.5 Error Boundary & Offline Handling
- Global error boundary component
- Offline indicator banner
- Retry mechanism cho failed requests
- **Complexity**: Thấp-Trung bình

---

## 6. 📈 Tính Năng Đặc Thù Tài Chính (Differentiators)

### 6.1 Market Data Widget
- Tích hợp API market data (VNIndex, S&P 500, crypto) real-time ticker
- Nguồn: Yahoo Finance, CoinGecko, VNDirect/SSI API

### 6.2 Financial Calculator Tools
- Compound interest calculator
- Loan amortization calculator
- Investment return simulator
- Retirement planning calculator

### 6.3 Portfolio Tracker
- User tạo portfolio ảo, track hiệu suất
- Chia sẻ portfolio performance trong community posts

### 6.4 Financial Glossary / Wiki
- Từ điển thuật ngữ tài chính
- Hover-tooltip khi đọc bài viết (VD: hover "P/E ratio" → giải thích ngắn)

### 6.5 Curated Learning Paths
- Lộ trình học có thứ tự (VD: "Từ 0 đến Đầu tư Chứng khoán" gồm 10 bài)
- Track progress của user qua từng bài

### 6.6 Expert Verification / Certified Authors
- Badge "Verified Expert" cho tác giả có chứng chỉ (CFA, ACCA...)
- Tăng trust cho content

---

## 📊 Ma Trận Ưu Tiên

| # | Hạng mục | Ưu tiên | Complexity |
|---|----------|---------|------------|
| 1 | Bookmarks + Subscriptions Feed | 🔴 Cao | Thấp |
| 2 | Email Service (verification, reset) | 🔴 Cao | Trung bình |
| 3 | Database Migrations (drizzle-kit) | 🔴 Cao | Thấp |
| 4 | CI/CD Pipeline | 🔴 Cao | Trung bình |
| 5 | Env Validation & Secrets cleanup | 🔴 Cao | Thấp |
| 6 | Health Check endpoint | 🟡 TB | Thấp |
| 7 | Background Job Queue | 🟡 TB | Trung bình |
| 8 | Redis Caching | 🟡 TB | Trung bình |
| 9 | CAPTCHA | 🟡 TB | Thấp |
| 10 | Facebook OAuth | 🟡 TB | Thấp |
| 11 | Structured Logging | 🟡 TB | Thấp |
| 12 | Sentry Error Tracking | 🟡 TB | Thấp |
| 13 | Full-text Search (tsvector) | 🟡 TB | Trung bình |
| 14 | Badges & Reputation | 🟡 TB | Trung bình-Cao |
| 15 | Rich Text Editor (Tiptap) | 🟡 TB | Cao |
| 16 | i18n (EN + VI) | 🟡 TB | Trung bình |
| 17 | 2FA cho Admin | 🟡 TB | Trung bình |
| 18 | WebSocket Notifications | 🟢 Thấp | Trung bình-Cao |
| 19 | PWA Support | 🟢 Thấp | Trung bình |
| 20 | Market Data Widget | 🟢 Thấp | Trung bình |
| 21 | Financial Calculators | 🟢 Thấp | Trung bình |
| 22 | Direct Messaging | 🟢 Thấp | Cao |
| 23 | Polls / Surveys | 🟢 Thấp | Trung bình |
| 24 | Portfolio Tracker | 🟢 Thấp | Cao |

---

> **Ghi chú**: Ưu tiên 🔴 nên hoàn thành trước khi launch production.
> Ưu tiên 🟡 có thể ra ngay sau MVP. Ưu tiên 🟢 là post-MVP / growth phase.
