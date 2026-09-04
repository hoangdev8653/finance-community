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

### [DONE] [P1] BE-04: Loại bỏ In-Memory Fallback & Fix EmailVerificationGuard

- **Kết quả:** 
  - Cập nhật `AuthService` và `JitProvisioningService`: trong môi trường production, hệ thống tuyệt đối không lưu dữ liệu người dùng tạm bợ vào RAM (loại bỏ `fallbackMemoryCredentials` tĩnh), ném lỗi 503 khi DB gặp sự cố kết nối thay vì âm thầm ghi memory.
  - Chuẩn hóa việc cấp phát JWT: thêm `email_confirmed_at` vào JWT payload trong hàm `issueTokens()` cho cả Access Token và Refresh Token, giúp `EmailVerificationGuard` đọc chính xác trạng thái xác thực email mà không bị chặn nhầm.
  - Kiểm tra trạng thái tài khoản (`BANNED`, `SUSPENDED`, `DEACTIVATED`) ngay trong hàm `refresh()` để ngăn chặn tài khoản bị cấm tiếp tục gia hạn token.
- **Files:** `apps/api/src/modules/auth/services/auth.service.ts`, `apps/api/src/modules/users/services/jit-provisioning.service.ts`.
- **Kiểm tra:** Chạy 8/8 test suites trong `test/security` pass 36/36 tests, `npm run build` thành công code 0.
- **Ghi chú:** Kiến trúc Stateless được bảo toàn, tránh nguy cơ mất tài khoản người dùng khi server restart hoặc scale nhiều container.

---

### [DONE] [P1] BE-05: Quản lý Phiên đăng nhập (Refresh Token Rotation & Revocation)

- **Kết quả:**
  - Thiết kế bảng `refresh_tokens` trong PostgreSQL schema Drizzle lưu trữ `tokenHash` (SHA-256), `family` (UUID cho cơ chế Token Rotation), `isRevoked` và `expiresAt`.
  - Xây dựng `RefreshTokensRepository` quản lý tạo mới, tra cứu hash, thu hồi token đơn lẻ và thu hồi toàn bộ token family khi phát hiện token reuse.
  - Cập nhật `AuthService.refresh()`: xoay vòng token khi cấp phát mới, tự động phát hiện và thu hồi toàn bộ family nếu kẻ tấn công cố tình tái sử dụng refresh token đã cũ/đã hủy.
  - Bổ sung endpoint `POST /api/v1/auth/logout` thu hồi refresh token của người dùng.
- **Files:** `apps/api/src/database/schema/refresh-tokens.schema.ts`, `apps/api/src/database/schema/index.ts`, `apps/api/src/database/repositories/refresh-tokens.repository.ts`, `apps/api/src/modules/auth/auth.module.ts`, `apps/api/src/modules/auth/dto/logout.dto.ts`, `apps/api/src/modules/auth/services/auth.service.ts`, `apps/api/src/modules/auth/controllers/auth.controller.ts`.
- **Kiểm tra:** `npm run build` thành công code 0, 8/8 test suites trong `test/security` pass 36/36.
- **Ghi chú:** Đã ngăn chặn rủi ro rò rỉ token kéo dài 30 ngày và bảo vệ tài khoản người dùng ngay khi bấm Đăng xuất hoặc bị lộ token.

---

### [DONE] [P1] BE-06: Bổ sung Facebook OAuth API (`POST /auth/facebook`)

- **Kết quả:**
  - Bổ sung `FacebookAuthDto` nhận `accessToken` từ Facebook SDK trên client.
  - Xây dựng `AuthService.authenticateFacebookUser()`: xác thực access token qua Facebook Graph API (`graph.facebook.com/me?fields=id,name,email,picture`), bóc tách danh tính, tự động ánh xạ deterministic UUID và provision user tài khoản với `provider: 'FACEBOOK'`.
  - Mở endpoint public `POST /api/v1/auth/facebook` trên `AuthController`.
  - Viết unit test E2E `test/security/facebook-auth.spec.ts` kiểm thử đầy đủ.
- **Files:** `apps/api/src/modules/auth/dto/facebook-auth.dto.ts`, `apps/api/src/modules/auth/services/auth.service.ts`, `apps/api/src/modules/auth/controllers/auth.controller.ts`, `apps/api/test/security/facebook-auth.spec.ts`.
- **Kiểm tra:** Test `facebook-auth.spec.ts` pass 2/2, `npm run build` trong `apps/api` thành công code 0, `npm run typecheck` trong `apps/web` thành công code 0.
- **Ghi chú:** Hoàn thành mục 5 trong Feature Roadmap.

---

### [DONE] [P2] BE-07: Nâng cấp Live Data Adapter cho Market Ticker

- **Kết quả:**
  - Nâng cấp `MarketService` tích hợp adapter cấp dữ liệu chứng khoán Việt Nam và chỉ số qua Yahoo Finance chart endpoint (`^VNINDEX.VN`, `VCB.VN`, `FPT.VN`, `HPG.VN`, `VND=X`, `GC=F`) song song với Binance Public API (`BTCUSDT`, `ETHUSDT`).
  - Phản ánh đúng giá thị trường thực tế, bước nhảy giá, tỷ lệ phần trăm thay đổi và điều phối liên chỉ số (VN30 theo VN-Index).
  - Tích hợp timeout an toàn bằng `AbortController` (3500ms) kèm xử lý `finally { clearTimeout(timeoutId) }` giải phóng timer triệt để, tránh open handles.
  - Caching in-memory với TTL (15 giây) và cơ chế resilient fallback về baseline snapshot khi mất mạng hoặc nhà cung cấp đóng sàn.
  - Mở rộng unit tests `test/modules/market.spec.ts` kiểm thử đầy đủ cả kịch bản API phản hồi thành công và kịch bản mạng lỗi ngoại lệ.
- **Files:** `apps/api/src/modules/market/market.service.ts`, `apps/api/test/modules/market.spec.ts`.
- **Kiểm tra:** `npm test -- test/modules/market.spec.ts` pass 5/5, `npm run build` trong `apps/api` code 0, `npm run typecheck` trong `apps/web` code 0.
- **Ghi chú:** Hoàn thành trọn vẹn toàn bộ 7 task backend (BE-01 đến BE-07).

---

### [DONE] [P1] Xây dựng search component dùng chung cho Admin

- **Kết quả:**
  - Xây dựng hook `useDebounce` và `useDebouncedCallback` tại `apps/web/lib/hooks/use-debounce.ts` với delay mặc định 350ms, tự động dọn dẹp timer và tránh re-render lặp.
  - Viết unit test cho `useDebounce` tại `apps/web/tests/utils/use-debounce.test.ts` (4/4 passed).
  - Nâng cấp `AdminSearchInput` (`apps/web/components/admin/AdminSearchInput.tsx`) tuân thủ nghiêm ngặt 4px Grid System (`h-10`, `pl-10`, `pr-10`, `rounded-lg`), hỗ trợ:
    - Trạng thái tải `isLoading` với spinner `Loader2`.
    - Nút xóa nhanh `X` kèm phím tắt `Escape` xóa dữ liệu tìm kiếm.
    - Hỗ trợ đồng bộ tham số URL (`syncWithUrl`, `queryParamKey`), tự động reset phân trang về trang 1.
  - Viết unit test cho `AdminSearchInput` tại `apps/web/tests/admin/AdminSearchInput.test.tsx` (6/6 passed).
  - Tích hợp và chuẩn hóa tìm kiếm debounce trên toàn bộ các trang quản trị:
    - `PostModerationTable.tsx`: bổ sung `AdminSearchInput` tìm bài viết theo tiêu đề, slug, tác giả.
    - `AuditLogsTable.tsx`: áp dụng debounce cho bộ lọc action, entityType, actorId ngăn chặn spam request API khi nhập.
    - `AdminCommentsTable.tsx`: áp dụng `useDebounce` và `isLoading` cho tìm kiếm bình luận.
    - `AdminPostsTable.tsx`: áp dụng `useDebounce`, `isLoading` và sửa lỗi lọc bài viết theo loại nội dung.
    - `UserManagementView.tsx`: thay thế timer thủ công bằng `useDebounce`, hiển thị `isLoading`.
    - `CategoryManagementView.tsx`: áp dụng `useDebounce` và `isLoading` cho tìm kiếm danh mục.
- **Files:** `apps/web/lib/hooks/use-debounce.ts`, `apps/web/tests/utils/use-debounce.test.ts`, `apps/web/components/admin/AdminSearchInput.tsx`, `apps/web/tests/admin/AdminSearchInput.test.tsx`, `apps/web/components/admin/PostModerationTable.tsx`, `apps/web/components/admin/AuditLogsTable.tsx`, `apps/web/components/admin/AdminCommentsTable.tsx`, `apps/web/components/admin/AdminPostsTable.tsx`, `apps/web/components/admin/UserManagementView.tsx`, `apps/web/components/admin/CategoryManagementView.tsx`.
- **Kiểm tra:** 29/29 tests trong `tests/admin` và `tests/utils` pass 100%, `npm run typecheck` trong `apps/web` code 0, `npm run build` trong `apps/api` code 0.
- **Ghi chú:** Hoàn thành trọn vẹn task xây dựng search component dùng chung cho Admin.

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

### [DONE] [P1] Quản trị bài viết trong Dashboard Admin

- **Kết quả:**
  - Hoàn thiện toàn diện trang `/admin/posts` với component `AdminPostsTable` tuân thủ 4px Grid Foundation.
  - Có nút "Thêm bài viết" ngay trên header (`AdminCreatePostModal`) tạo bài viết mới và tự động refetch.
  - Hỗ trợ xem chi tiết toàn bộ bài viết bằng modal (`mode === 'view'`), hiển thị ảnh bìa, tiêu đề, metadata và nội dung đầy đủ.
  - Hỗ trợ sửa bài viết (`mode === 'edit'`), cập nhật tiêu đề, nội dung, ảnh bìa với `useUpdatePost`.
  - Bổ sung thao tác **Ẩn bài viết / Bỏ ẩn** qua trạng thái kiểm duyệt (`useBanPost` / `useApprovePost`), kèm modal nhập lý do vi phạm rõ ràng.
  - Bổ sung thao tác **Xóa mềm (soft-delete)** qua `useDeletePostFromAdmin`, có modal xác nhận nguy hiểm riêng biệt, phân biệt hoàn toàn với thao tác ẩn bài.
  - Tích hợp `AdminSearchInput` với debounce 350ms, bộ lọc loại nội dung, trạng thái bài viết, trạng thái kiểm duyệt và phân trang `AdminPagination`.
  - Viết unit test `apps/web/tests/admin/AdminPostsTable.test.tsx` (3/3 passed).
- **Files:** `apps/web/components/admin/AdminPostsTable.tsx`, `apps/web/tests/admin/AdminPostsTable.test.tsx`.
- **Kiểm tra:** `npx vitest run tests/admin/AdminPostsTable.test.tsx` pass 3/3, `npm run typecheck` pass 100%, `npm run build` trong `apps/api` pass 100%.
- **Ghi chú:** Hoàn thành trọn vẹn khu vực quản lý bài viết riêng trong dashboard admin.

---

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

---

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
