# Tài liệu dự án

Thư mục này hiện có tài liệu đang dùng, tài liệu thiết kế ban đầu và các tệp phục vụ khởi tạo dữ liệu. Không phải tài liệu cũ nào cũng có thể xóa an toàn: một số SQL được Docker Compose dùng khi tạo database mới.

## Tài liệu tham khảo hiện tại

- [Định hướng sản phẩm](PRODUCT_DIRECTION.md)
- [Kiến trúc hiện tại và mục tiêu](architecture.md)
- [Backend](BACKEND_SYSTEM_ARCHITECTURE.md)
- [Nội dung](CONTENT_ARCHITECTURE.md)
- [Quy tắc kỹ thuật cho AI](AI_ENGINEERING_RULES.md)
- [Bảo mật xác thực](AUTH_SECURITY_SPEC.md)
- [Hướng dẫn kiểm thử](TESTING_GUIDE.md)
- [Bộ sưu tập Postman](finance_community_postman_collection.json)

Tài liệu đặc tả sản phẩm và kiến trúc v1/Phase 1 đã lỗi thời hoặc trùng với các tài liệu trên đã được dọn khỏi thư mục.

## Database và dữ liệu khởi tạo

- [DATABASE_SCHEMA.sql](DATABASE_SCHEMA.sql) là baseline SQL được mount trong `docker-compose.yml` khi khởi tạo PostgreSQL lần đầu. Không xóa hoặc thay nội dung nếu chưa thay cấu hình khởi tạo tương ứng.
- [DATABASE_SCHEMA_FULL.sql](DATABASE_SCHEMA_FULL.sql) là bản tổng hợp tham khảo, chưa được trích xuất từ database đang chạy.
- [DATABASE_SCHEMA.dbml](DATABASE_SCHEMA.dbml) và [DATABASE_ERD.md](DATABASE_ERD.md) dùng để xem sơ đồ tham khảo; cần đối chiếu database live trước khi coi là chuẩn.
- Migration `0035_add_daily_post_views.sql` tạo bộ đếm lượt xem bài viết theo ngày cho biểu đồ quản trị. Bảng này chỉ tích lũy từ lúc migration được áp dụng; không thể suy ra lịch sử theo ngày từ `posts.view_count` hiện có.
- `SEED_*.sql` chứa dữ liệu mẫu/seed; kiểm tra nội dung và nơi sử dụng trước khi xóa.

## Tài liệu kiến trúc

Tài liệu kiến trúc tổng quan và quyết định modular monolith được gom trong [`architecture.md`](architecture.md). Trạng thái triển khai cần xác nhận trực tiếp trong code và migrations.
