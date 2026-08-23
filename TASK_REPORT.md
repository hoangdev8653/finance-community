# Báo cáo thực hiện task — Finance Pulse

Ngày lập: 2026-08-23

## Kết quả kiểm tra

- Frontend: `npm run typecheck` — đạt.
- Backend: `npm run build` — đạt.

## Đã có hoặc đã triển khai

- Đã tách nghiệp vụ Posts và Post Moderation:
  - `/admin/posts`: quản lý danh sách bài viết, thêm bài, xem, xóa mềm và phân trang.
  - `/admin/moderation`: chỉ duyệt hoặc không duyệt/ẩn bài viết.
- Đã có `AdminPagination` dùng chung và đang được dùng ở Post Moderation, Report Queue và Audit Logs.
- Categories đã có thêm, sửa, xóa và audit log.
- Tags đã được bổ sung API sửa và xóa.
- Admin dashboard đã có số liệu thật từ API cho posts, users, review queue và reports.
- Admin sidebar cố định, layout full màn hình và ẩn footer ở khu vực admin/moderation.
- Audit log có actor email và cleanup log cũ sau 7 ngày.
- Notification backend/frontend cơ bản đã tồn tại: lấy danh sách, unread count, đánh dấu một/tất cả đã đọc.

## Chưa hoàn tất

- Search component dùng chung với debounce chưa được tích hợp đầy đủ vào các màn hình admin.
- Pagination backend/frontend cho Categories, Users, Tags, Notifications, Comments và Reports chưa hoàn tất đồng bộ.
- User Governance chưa có đầy đủ CRUD, danh sách user, reset password và xóa mềm user.
- Auth chưa có đầy đủ forgot password, reset password bằng token, đổi password và email delivery.
- Posts admin chưa có backend admin-specific cho mọi thao tác sửa/xóa; một số luồng hiện vẫn dựa trên endpoint theo owner/moderation.
- Reports, comments, notifications và media chưa có đầy đủ admin management workflow.
- Font-family và font-size admin chưa được chuẩn hóa toàn diện theo một design token duy nhất.

## Ghi chú kỹ thuật

Reset password cần token một lần có thời hạn, lưu hash token và email provider; không nên trả mật khẩu tạm hoặc token nhạy cảm trực tiếp trong response. Các task backend còn lại cần tiếp tục theo từng module để kiểm tra permission, transaction, audit log và test hồi quy.

