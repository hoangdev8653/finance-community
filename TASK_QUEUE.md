# Task Queue — Finance Pulse

> File này dùng để giao và theo dõi các công việc cần thực hiện trong dự án.
> Thêm task mới vào mục **Backlog**. Agent sẽ xử lý lần lượt theo thứ tự ưu tiên.

## Quy ước

- `TODO`: Chưa bắt đầu
- `IN_PROGRESS`: Đang thực hiện
- `BLOCKED`: Đang bị chặn, cần thêm thông tin hoặc quyền truy cập
- `DONE`: Đã hoàn thành và kiểm tra

Mức ưu tiên:

- `P0`: Khẩn cấp, lỗi làm hệ thống không sử dụng được
- `P1`: Quan trọng, ảnh hưởng trực tiếp tới tính năng chính
- `P2`: Cải thiện chất lượng hoặc trải nghiệm
- `P3`: Nice-to-have

## Backlog

<!-- Thêm task mới bên dưới theo mẫu này -->

### [DONE] [P0] BE-01: Chuẩn hóa xử lý tiếng Việt cho Post Slug (slugify)

- **Kết quả:** Xây dựng `SlugifyUtil` chuẩn hóa Unicode NFD, bóc tách dấu thanh tiếng Việt và chuyển đổi đ/Đ thành d, thay ký tự đặc biệt thành dấu gạch ngang và cắt gọt an toàn. Tích hợp trực tiếp vào `PostsService.slugify()`.
- **Files:** `apps/api/src/common/utils/slugify.util.ts`, `apps/api/src/common/utils/slugify.util.spec.ts`, `apps/api/src/modules/posts/services/posts.service.ts`.
- **Kiểm tra:** Jest unit test 5/5 passed (`src/common/utils/slugify.util.spec.ts`), `npm run build` thành công code 0.
- **Ghi chú:** Đã giải quyết triệt để lỗi tiêu đề bài viết tiếng Việt bị cắt cụt dấu làm hỏng SEO.

---

### [DONE] [P0] BE-02: Bổ sung Database Indexes trong Drizzle Schema

- **Kết quả:** Thêm composite indexes và single-column indexes cho các bảng có lưu lượng truy vấn cao:
  - `postsTable`: `idx_posts_status_published_at`, `idx_posts_author_id`, `idx_posts_category_id`, `idx_posts_domain_id`, `idx_posts_created_at`.
  - `commentsTable`: `idx_comments_post_id`, `idx_comments_author_id`, `idx_comments_status_created_at`.
  - `notificationsTable`: `idx_notifications_user_unread` trên `(user_id, is_read, created_at)`.
  - `postReactionsTable`: `idx_post_reactions_post_id`.
  - `commentReactionsTable`: `idx_comment_reactions_comment_id`.
- **Files:** `apps/api/src/database/schema/posts.schema.ts`, `comments.schema.ts`, `notifications.schema.ts`, `post-reactions.schema.ts`, `comment-reactions.schema.ts`.
- **Kiểm tra:** `npm run build` thành công code 0.
- **Ghi chú:** Đã giải quyết nguy cơ Seq Scan (quét toàn bảng) trên PostgreSQL khi dữ liệu feed, comment và thông báo mở rộng.

---

### [DONE] [P0] BE-03: Tối ưu Feed Query — Left Join Author Profile & Cover Media

- **Kết quả:** Cập nhật `PostsRepository` (`findById`, `findBySlug`, `findFeedPaginated`, `findFollowingFeedPaginated`, `findTrendingFeedPaginated`) thực hiện `leftJoin(profilesTable)` và `leftJoin(mediaTable)`. Trả về đầy đủ thông tin `author` (`username`, `displayName`, `avatarMediaId`, `reputationScore`, `badge`) và `coverMedia` (`id`, `secureUrl`) trong 1 câu SQL query duy nhất.
- **Files:** `apps/api/src/database/repositories/posts.repository.ts`.
- **Kiểm tra:** `npm run build` trong `apps/api` thành công code 0, `npm run typecheck` trong `apps/web` thành công code 0.
- **Ghi chú:** Đã loại bỏ hoàn toàn việc frontend phải fallback hiển thị `authorId.slice(0, 8)`. Tên và avatar tác giả hiển thị đầy đủ ngay từ API.

---

### [TODO] [P1] BE-04: Loại bỏ In-Memory Fallback & Fix EmailVerificationGuard

- **Mục tiêu:** Đảm bảo hệ thống tuân thủ nguyên tắc Stateless, không lưu thông tin người dùng trong RAM Node process, đồng thời fix lỗi contract ở `EmailVerificationGuard`.
- **Phạm vi:** `apps/api/src/modules/auth/services/auth.service.ts`, `jit-provisioning.service.ts`, `email-verification.guard.ts`.
- **Yêu cầu:**
  - Loại bỏ biến `fallbackMemoryCredentials` và các map/set in-memory trong JIT service.
  - Fail fast khi DB có lỗi kết nối.
  - Thêm `email_confirmed_at` vào JWT payload để `EmailVerificationGuard` không chặn nhầm người dùng.
- **Tiêu chí hoàn thành:** Không còn fallback lưu thông tin user/mật khẩu trong RAM; JWT chứa thông tin xác thực email chính xác.

---

### [TODO] [P1] BE-05: Quản lý Phiên đăng nhập (Refresh Token Rotation & Revocation)

- **Mục tiêu:** Ngăn chặn việc refresh token bị lạm dụng khi user đăng xuất, đổi mật khẩu hoặc bị cấm tài khoản.
- **Phạm vi:** Bảng schema `refresh_tokens`, `auth.service.ts`, `auth.controller.ts`.
- **Yêu cầu:** Lưu trữ refresh token (hash), hỗ trợ cơ chế rotation (cấp mới hủy cũ), endpoint `POST /auth/logout` thu hồi token.
- **Tiêu chí hoàn thành:** Refresh token cũ không thể tái sử dụng; logout thu hồi token thành công.

---

### [TODO] [P1] BE-06: Bổ sung Facebook OAuth API (`POST /auth/facebook`)

- **Mục tiêu:** Cho phép người dùng đăng nhập bằng tài khoản Facebook theo đúng Roadmap mục 5.
- **Phạm vi:** `apps/api/src/modules/auth/`, `auth.controller.ts`, `auth.service.ts`.
- **Yêu cầu:** Tiếp nhận Facebook access token, xác thực với Facebook Graph API (`/me`), tự động tạo tài khoản hoặc liên kết tài khoản theo email, cấp phát JWT.
- **Tiêu chí hoàn thành:** API endpoint `POST /api/v1/auth/facebook` hoạt động và trả về JWT hợp lệ.

---

### [TODO] [P2] BE-07: Nâng cấp Live Data Adapter cho Market Ticker

- **Mục tiêu:** Thay thế dữ liệu giả lập `Math.random()` bằng nguồn cấp dữ liệu thị trường thực tế cho VN-Index và cổ phiếu VN.
- **Phạm vi:** `apps/api/src/modules/market/market.service.ts`.
- **Yêu cầu:** Tích hợp adapter gọi API chứng khoán (VNDirect / CafeF / SSI open endpoints) có fallback an toàn khi sàn đóng cửa hoặc rate limit.
- **Tiêu chí hoàn thành:** Dữ liệu chỉ số VN-Index và cổ phiếu phản ánh đúng giá thị trường.

---

### [TODO] [P1] Xây dựng search component dùng chung cho Admin

- **Mục tiêu:** Tạo một component tìm kiếm thống nhất và áp dụng cho tất cả trang Admin có dữ liệu cần tìm kiếm.
- **Phạm vi:** Admin dashboard, Post Moderation, User Governance, Report Queue, Audit Logs, Categories và các trang Admin khác khi có nhu cầu search.
- **Yêu cầu:**
  - Tạo component search dùng chung, có trạng thái nhập, loading, clear và empty state.
  - Hỗ trợ placeholder, label, icon và query parameter tùy theo từng màn hình.
  - Tạo hoặc tái sử dụng hook `useDebounce` để trì hoãn truy vấn sau khi người dùng ngừng nhập.
  - Không gọi API ở mỗi lần gõ phím.
  - Reset pagination về trang đầu khi query thay đổi.
  - Giữ giá trị tìm kiếm đồng bộ với URL khi phù hợp để có thể deep-link và refresh trang.
  - Có trạng thái mobile/responsive và hỗ trợ keyboard/focus accessibility.
- **Tiêu chí hoàn thành:**
  - Component search dùng chung được tái sử dụng ở tối thiểu các trang có search thực tế.
  - API chỉ được gọi sau khoảng debounce hợp lý, đề xuất 300–500ms.
  - Có thể xóa query và khôi phục danh sách ban đầu.
  - Không gây request trùng hoặc race condition khi nhập nhanh.
  - Có test cho hook debounce và component search.
  - Frontend typecheck, test và build thành công.
- **Ghi chú:** Cần kiểm tra các API hiện tại đã hỗ trợ tham số search chưa; nếu chưa, bổ sung query DTO/service tương ứng ở backend.

---

### [TODO] [P1] Tên task

- **Mục tiêu:** Mô tả ngắn gọn kết quả cần đạt.
- **Phạm vi:** Các màn hình, module hoặc file liên quan.
- **Yêu cầu:** Các điều kiện hoặc hành vi bắt buộc.
- **Tiêu chí hoàn thành:** Cách xác nhận task đã xong.
- **Ghi chú:** Thông tin bổ sung nếu có.

---

## Đang thực hiện

<!-- Agent chuyển task đang làm vào đây -->

## Đã hoàn thành

<!-- Agent chuyển task đã hoàn thành vào đây và ghi kết quả kiểm tra -->

## Blocked

<!-- Các task đang bị chặn sẽ được ghi lý do tại đây -->

## Quy trình xử lý

1. Đọc các task trong `Backlog`.
2. Ưu tiên theo `P0 → P1 → P2 → P3`.
3. Nếu cùng mức ưu tiên, xử lý task xuất hiện trước.
4. Chuyển task sang `Đang thực hiện` và cập nhật trạng thái `IN_PROGRESS`.
5. Triển khai, kiểm thử và kiểm tra giao diện/tích hợp nếu cần.
6. Chuyển sang `Đã hoàn thành` khi đạt đủ tiêu chí.
7. Ghi rõ file đã thay đổi và lệnh kiểm tra đã chạy.

## Mẫu ghi nhận hoàn thành

```md
### [DONE] [P1] Tên task

- **Kết quả:** Mô tả ngắn gọn những gì đã thực hiện.
- **Files:** `path/to/file.ts`, `path/to/component.tsx`
- **Kiểm tra:** `npm run typecheck`, `npm run build`
- **Ghi chú:** Vấn đề còn lại hoặc bước tiếp theo nếu có.
```

### [TODO] [P1] Quản trị bài viết trong Dashboard Admin

- **Mục tiêu:** Bổ sung khu vực quản lý bài viết đầy đủ trong `/admin/posts`.
- **Phạm vi:** Trang admin posts, bảng bài viết, API/mutation liên quan.
- **Yêu cầu:**
  - Có nút thêm bài viết ngay trong dashboard admin.
  - Có thể xem toàn bộ nội dung bài viết bằng modal.
  - Có thể ẩn bài viết thông qua trạng thái moderation.
  - Có thể xóa mềm bài viết, kèm xác nhận và tự cập nhật danh sách.
  - Phân biệt rõ thao tác ẩn bài và xóa mềm.
  - Chỉ người dùng có quyền admin phù hợp mới được thao tác.
- **Tiêu chí hoàn thành:** Typecheck/build thành công, các thao tác gọi đúng API, danh sách tự refresh sau mutation, không xóa cứng dữ liệu ngoài chủ đích.
- **Ghi chú:** Chưa triển khai; chỉ thực hiện khi task được giao rõ ràng.

### [TODO] [P1] Hoàn thiện User Governance trong Dashboard Admin

- **Mục tiêu:** Xây dựng màn hình quản trị user đầy đủ thay cho form thao tác theo UUID hiện tại.
- **Phạm vi:** `/admin/users`, component quản trị user, API user administration, phân quyền và audit log.
- **Yêu cầu:**
  - Hiển thị danh sách user có phân trang, tìm kiếm debounce theo email/username và bộ lọc theo trạng thái/role.
  - Xem hồ sơ chi tiết user: email, username, role, trạng thái, ngày tạo, hoạt động gần đây.
  - Thêm user mới.
  - Sửa thông tin user được phép cập nhật.
  - Xóa hoặc vô hiệu hóa user theo cơ chế an toàn, có xác nhận và phân biệt soft delete với hard delete.
  - Khóa/mở khóa hoặc chuyển đổi trạng thái tài khoản.
  - Reset password và đặt mật khẩu tạm thời theo chính sách bảo mật.
  - Gán role, thu hồi role và cập nhật nhiều role nếu hệ thống hỗ trợ.
  - Quản lý quyền đặc biệt, bảo vệ tài khoản SUPER_ADMIN và ngăn admin tự hạ quyền/xóa chính mình ngoài chính sách.
  - Ghi audit log cho mọi hành động quản trị user, bao gồm actor email, đối tượng, lý do và thời gian.
  - Có loading, empty, error, confirmation và success feedback nhất quán với dashboard admin.
- **Tiêu chí hoàn thành:** UI không yêu cầu nhập UUID thủ công cho thao tác thường ngày; mọi mutation kiểm tra quyền ở backend; typecheck/build/test thành công; dữ liệu và audit log cập nhật chính xác.
- **Ghi chú:** Chưa triển khai; chỉ thực hiện khi task được giao rõ ràng.
### [TODO] [P1] Bổ sung trang Post trong Dashboard Admin

- **Mục tiêu:** Xây dựng trang quản lý bài viết riêng trong dashboard admin.
- **Phạm vi:** Điều hướng admin, trang danh sách bài viết, API và các thao tác quản trị liên quan.
- **Yêu cầu:** Hiển thị danh sách bài viết có tìm kiếm, bộ lọc và phân trang; xem chi tiết; thêm, sửa, ẩn và xóa bài viết theo quyền admin.
- **Tiêu chí hoàn thành:** UI đồng bộ dashboard admin, dữ liệu thật từ API, có loading/error/empty state, xác nhận trước thao tác nguy hiểm và audit log phù hợp.
- **Ghi chú:** Chưa triển khai; chỉ thực hiện khi được giao rõ ràng.

#### Định hướng UI

- Ưu tiên tái sử dụng visual pattern của trang `Post Moderation`: sidebar admin cố định, header có icon và mô tả, filter tabs theo trạng thái, summary bar, bảng dữ liệu full-width.
- Bảng nên có thumbnail bài viết, tiêu đề/slug, tác giả, ngày đăng, trạng thái, lý do/ghi chú và nhóm thao tác rõ ràng.
- Giữ phong cách dark admin hiện tại, spacing, badge và button action nhất quán với màn hình chờ duyệt.
### [TODO] [P1] Đồng bộ layout các trang Admin theo Post Moderation

- **Mục tiêu:** Chuẩn hóa các màn hình admin còn lại theo layout và trải nghiệm của trang Post Moderation.
- **Phạm vi:** User Governance, Report Queue, Categories, Audit Logs, Feature Flags, System Settings và các trang admin liên quan.
- **Yêu cầu:**
  - Dùng sidebar admin cố định và vùng nội dung full-width thống nhất.
  - Header có icon, tiêu đề, mô tả và action chính rõ ràng.
  - Dùng summary bar, filter tabs, bảng/card dữ liệu và pagination chung khi phù hợp.
  - Đồng bộ thumbnail/icon, badge trạng thái, button action, modal xác nhận và feedback.
  - Có loading, empty, error state nhất quán.
  - Responsive tốt trên desktop/tablet/mobile và hỗ trợ keyboard/focus.
- **Tiêu chí hoàn thành:** Các trang có cùng design language, không còn layout riêng lệch khỏi admin console, typecheck/build thành công.
- **Ghi chú:** Chưa triển khai; chỉ thực hiện khi được giao rõ ràng.
### [TODO] [P2] Đồng bộ font-family giữa Website và Dashboard Admin

- **Mục tiêu:** Làm cho typography của website chính và dashboard admin sử dụng cùng font-family, weight và cảm giác hiển thị.
- **Phạm vi:** Global CSS, layout, font loading, design tokens, `font-heading`, `font-sans`, `font-mono` và các component admin.
- **Yêu cầu:**
  - Kiểm tra font-family hiện tại của website chính và dashboard.
  - Chọn một hệ font thống nhất phù hợp với Finance Pulse.
  - Đồng bộ font heading, body, label, table và button.
  - Đồng bộ các font weight, line-height và letter-spacing cần thiết.
  - Giữ font mono chỉ cho dữ liệu kỹ thuật như slug, ID, timestamp nếu phù hợp.
  - Đảm bảo font loading không gây layout shift và có fallback an toàn.
- **Tiêu chí hoàn thành:** Hai khu vực có cảm giác typography nhất quán trên desktop/mobile; không phát sinh lỗi font loading; typecheck/build thành công.
- **Ghi chú:** Chưa triển khai; chỉ thực hiện khi được giao rõ ràng.
### [TODO] [P2] Tăng kích thước chữ Dashboard Admin

- **Mục tiêu:** Cải thiện khả năng đọc của dashboard admin trên màn hình desktop và laptop.
- **Phạm vi:** Admin layout, sidebar, header, card KPI, bảng dữ liệu, badge, button, modal và trạng thái loading/error/empty.
- **Yêu cầu:**
  - Tăng font-size cho body text, label, table cell và navigation ở mức hợp lý.
  - Giữ hierarchy rõ ràng giữa heading, subheading, metadata và nội dung chính.
  - Đảm bảo không làm vỡ layout bảng, nút thao tác hoặc sidebar.
  - Kiểm tra responsive trên desktop, tablet và mobile.
  - Kết hợp với task đồng bộ font-family để typography toàn hệ thống nhất quán.
- **Tiêu chí hoàn thành:** Nội dung dashboard dễ đọc hơn, không tràn/chồng chữ, giữ đúng design system và typecheck/build thành công.
- **Ghi chú:** Chưa triển khai; chỉ thực hiện khi được giao rõ ràng.
### [IN_PROGRESS] [P0] Audit và hoàn thiện chức năng Backend toàn hệ thống

- **Mục tiêu:** Kiểm tra toàn bộ module backend, bổ sung các chức năng CRUD và quản trị còn thiếu, đồng thời cập nhật frontend khi đã có màn hình tương ứng.
- **Phạm vi:** Auth, Users/Admin, Posts, Categories, Tags, Reports, Comments, Notifications, Media, Moderation, Audit Logs, Settings và Feature Flags.
- **Yêu cầu:** Có validation, permission, audit log, soft delete an toàn, trạng thái loading/error/empty ở frontend; không trả dữ liệu nhạy cảm.
- **Kế hoạch:** Ưu tiên Auth/User và các CRUD quản trị; các luồng cần email provider hoặc storage provider phải có fallback an toàn và ghi rõ giới hạn.
- **Trạng thái:** Đang thực hiện.
### [TODO] [P1] Bổ sung phân trang cho các trang chưa có

- **Mục tiêu:** Đảm bảo các danh sách dữ liệu lớn trong frontend đều có phân trang dùng chung.
- **Phạm vi:** Categories, User Governance, Tags, Notifications, Comments, Reports và các danh sách admin còn thiếu.
- **Yêu cầu:**
  - Tái sử dụng `AdminPagination` ở frontend.
  - Bổ sung `page`, `limit` và metadata `totalItems`, `totalPages`, `hasNextPage`, `hasPreviousPage` cho API còn thiếu.
  - Đồng bộ trạng thái trang khi thay đổi bộ lọc hoặc tìm kiếm.
  - Kết hợp với search debounce khi màn hình có chức năng tìm kiếm.
  - Có loading, empty và error state phù hợp.
  - Không tải toàn bộ dữ liệu khi danh sách lớn.
- **Tiêu chí hoàn thành:** Các trang trong phạm vi đều phân trang bằng component dùng chung, API trả metadata chính xác, typecheck/build/test thành công.
- **Ghi chú:** Chưa triển khai; chỉ thực hiện khi được giao rõ ràng.
### Quy ước nghiệp vụ: Posts và Post Moderation

- **Posts:** Là trang quản lý toàn bộ bài viết trong hệ thống. Có danh sách tất cả bài viết, tìm kiếm, lọc, phân trang và các thao tác thêm, sửa, xóa/ẩn bài viết.
- **Post Moderation:** Là hàng đợi kiểm duyệt bài viết. Chỉ tập trung vào xem nội dung và quyết định `Duyệt` hoặc `Không duyệt/Ẩn`; không thêm, sửa hoặc xóa bài viết.
- Hai trang phải có route, UI action và permission tách biệt; không dùng nút CRUD của Posts trong Post Moderation.
