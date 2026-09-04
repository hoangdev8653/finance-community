# Finance Community – Backend System Architecture

## 1. Tổng quan

Backend hiện tại được xây dựng bằng **NestJS**, sử dụng **PostgreSQL** làm database và **Drizzle ORM** để truy vấn dữ liệu.

```text
Next.js Frontend
      │
      │ HTTP /api/v1 + JWT
      ▼
NestJS API
      │
      ├── Guards bảo mật
      ├── Controllers
      ├── Services
      ├── Repositories
      ▼
PostgreSQL
```

Backend mặc định chạy tại:

```text
http://localhost:4000/api/v1
```

Swagger:

```text
http://localhost:4000/api/docs
```

## 2. Các file khởi động và cấu hình chính

| File | Vai trò |
|---|---|
| `apps/api/src/main.ts` | Khởi động NestJS, CORS, Helmet, validation, Swagger |
| `apps/api/src/app.module.ts` | Đăng ký toàn bộ module backend |
| `apps/api/src/database/database.module.ts` | Kết nối PostgreSQL/Drizzle |
| `apps/api/src/database/schema/` | Định nghĩa bảng database |
| `apps/api/src/database/repositories/` | Các truy vấn dữ liệu dùng lại |
| `apps/api/src/modules/` | Các module nghiệp vụ |

## 3. Kiến trúc module

Mỗi module thường đi theo luồng:

```text
Controller → Service → Repository/Drizzle → PostgreSQL
```

Các module chính:

- `auth`: đăng nhập, đăng ký, JWT.
- `users`: hồ sơ và trạng thái người dùng.
- `posts`: tạo, sửa, xuất bản và đọc bài viết.
- `categories`: quản lý danh mục.
- `topics`: chủ đề gắn với nội dung.
- `tags`: thẻ phân loại.
- `comments`: bình luận.
- `reactions`: lượt thích/phản ứng.
- `reports`: báo cáo nội dung/người dùng.
- `moderation`: kiểm duyệt bài viết.
- `admin`: dashboard, quản trị user, audit logs.
- `learning`: quiz, tiến độ học và nguồn tham khảo.
- `series`: lộ trình học và thứ tự bài học.
- `ai-editorial`: hỗ trợ biên tập nội dung học.
- `audit`: nhật ký hành động hệ thống.

## 4. Luồng bảo mật

Các guard toàn cục được chạy theo thứ tự:

```text
ThrottlerGuard
      ↓
JwtAuthGuard
      ↓
AccountStatusGuard
      ↓
EmailVerificationGuard
      ↓
PermissionGuard
```

Một request admin thường cần:

1. JWT hợp lệ.
2. Tài khoản đang hoạt động.
3. Email hợp lệ nếu endpoint yêu cầu.
4. Permission phù hợp.

Các permission quan trọng:

```text
admin:full
learning:manage
categories:manage
```

## 5. Database và quan hệ nội dung

Các bảng quan trọng:

```text
users
profiles
roles
posts
categories
domains
topics
tags
comments
reactions
reports
audit_logs
learning_series
learning_series_posts
learning_progress
media
```

Quan hệ nội dung:

```text
Domain
  └── Category
        └── Post
              ├── Topics
              ├── Tags
              ├── Comments
              ├── Reactions
              └── Reports
```

Một bài viết có thể có:

- Một `category`.
- Một `domain`.
- Nhiều `topics`.
- Nhiều `tags`.
- Nhiều comments, reactions và reports.

## 6. Dashboard admin

API dashboard chính:

```text
GET /api/v1/admin/overview
```

API này đang tính:

- Tổng số bài viết.
- Người dùng đang hoạt động.
- Bài viết chờ duyệt.
- Báo cáo đang mở.
- Người dùng mới trong 7 ngày.
- Bài viết mới trong 7 ngày.
- Phân bố trạng thái user.
- Phân bố trạng thái bài viết.
- Tổng bình luận, media, category và tag.

Frontend sử dụng:

```text
apps/web/lib/admin/admin-service.ts
apps/web/lib/admin/use-admin.ts
apps/web/app/admin/page.tsx
```

## 7. Bài viết phổ biến

API:

```text
GET /api/v1/admin/analytics/popular-posts?limit=5
```

Logic hiện tại:

```sql
SELECT id, title, slug, content_type, view_count
FROM posts
WHERE status = 'PUBLISHED'
  AND deleted_at IS NULL
ORDER BY view_count DESC
LIMIT 5;
```

Kết luận:

- Dữ liệu lấy từ database.
- Sắp xếp theo `posts.view_count`.
- Nếu `view_count` được seed hoặc tăng không chính xác, dashboard cũng sẽ không chính xác.

## 8. Thống kê theo danh mục

API:

```text
GET /api/v1/admin/analytics/posts-by-category
```

Logic:

```text
categories
    LEFT JOIN posts
    WHERE posts.status = 'PUBLISHED'
      AND posts.deleted_at IS NULL
    GROUP BY category
```

Kết luận:

- Đây là số lượng bài viết đã xuất bản theo danh mục.
- Không phải số lượt xem theo danh mục.
- Không nên tính từ 5 bài trending.
- Danh mục không có bài vẫn có thể được trả về với số lượng bằng 0, tùy query/frontend.

## 9. Lượt xem bài viết

Hiện tại lượt xem nằm trong:

```text
posts.view_count
```

Khi mở bài viết, backend tăng:

```sql
UPDATE posts
SET view_count = view_count + 1
WHERE id = $1;
```

Hạn chế hiện tại:

- Không có lịch sử lượt xem theo ngày.
- Không phân biệt người dùng duy nhất.
- Cùng một người có thể làm tăng nhiều lượt.
- Không có dữ liệu theo nguồn truy cập.
- Một số giá trị có thể là dữ liệu seed ban đầu.

### Đề xuất analytics lượt xem

Tạo bảng:

```text
post_view_events
├── id
├── post_id
├── user_id nullable
├── visitor_hash nullable
├── viewed_at
├── ip_hash nullable
└── user_agent nullable
```

Sau đó:

- `posts.view_count`: tổng lượt xem nhanh.
- `post_view_events`: biểu đồ, unique views và thống kê theo ngày.

## 10. Docker và migration

PostgreSQL chạy trong Docker với volume:

```text
postgres_data
```

Các file trong `/docker-entrypoint-initdb.d/` chỉ tự chạy khi PostgreSQL khởi tạo database lần đầu.

Vì vậy:

```text
Schema trong code ≠ luôn luôn schema trong database đang chạy
```

Nếu thêm migration mới nhưng volume cũ vẫn tồn tại, migration có thể chưa được chạy.

Khi gặp lỗi thiếu bảng/cột, cần kiểm tra:

1. Database container đang dùng volume nào.
2. Migration đã chạy chưa.
3. Bảng/cột thực tế có tồn tại không.
4. API đang chạy source mới hay Docker image cũ.

## 11. Các vấn đề cần ưu tiên chỉnh sửa

### Ưu tiên 1: Đồng bộ database

Kiểm tra các bảng:

```text
posts
categories
learning_series
learning_progress
audit_logs
```

Đặc biệt:

```text
posts.view_count
posts.category_id
posts.status
categories.is_active
```

### Ưu tiên 2: Sửa analytics view

Nếu cần số liệu chính xác, nên thêm `post_view_events` thay vì chỉ dùng `view_count`.

### Ưu tiên 3: Chuẩn hóa taxonomy

Nên thống nhất quan hệ:

```text
Domain → Category → Topic → Tag
```

Không nên dùng topic, category và tag thay thế lẫn nhau.

### Ưu tiên 4: Tách API analytics

Nên duy trì các API riêng:

```text
GET /admin/analytics/overview
GET /admin/analytics/popular-posts
GET /admin/analytics/posts-by-category
GET /admin/analytics/views
GET /admin/analytics/system-health
```

Frontend dashboard không nên tự suy luận dữ liệu từ các API public nếu đã có nhu cầu quản trị.

## 12. Kết luận

Backend hiện đã có nền tảng tốt:

- NestJS.
- PostgreSQL.
- Drizzle ORM.
- JWT/RBAC.
- Audit logs.
- Content taxonomy.
- Learning editorial workflow.
- Learning paths and learner progress.

Các điểm cần cải thiện chính là:

1. Đồng bộ migration với database thực tế.
2. Xây dựng analytics lượt xem có lịch sử.
3. Đảm bảo dashboard dùng dữ liệu admin chính xác.
4. Chuẩn hóa quan hệ Domain → Category → Topic → Tag.
5. Phân biệt rõ empty state và API error trên frontend.
