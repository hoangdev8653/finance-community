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

### [DONE] [P2] BE-08: Chuẩn hóa Backend API Design System & Architectural Standards

- **Kết quả:**
  - Xây dựng danh mục mã lỗi nghiệp vụ chuẩn hóa `ErrorCode` enum (`apps/api/src/common/constants/error-codes.enum.ts`) với phân loại theo miền nghiệp vụ: `AUTH_*`, `POST_*`, `COMMENT_*`, `CATEGORY_*`, `TAG_*`, `MEDIA_*`, `MODERATION_*`, `VALIDATION_*`, `RATE_LIMIT_*`.
  - Thiết kế class ngoại lệ `BusinessException` (`apps/api/src/common/exceptions/business.exception.ts`) kế thừa `HttpException`, tự động đóng gói `errorCode`, `statusCode`, `message` và metadata chi tiết.
  - Xây dựng `CorrelationIdMiddleware` (`apps/api/src/common/middleware/correlation-id.middleware.ts`) tự động cấp phát hoặc bảo lưu `X-Request-Id` (UUID v4) và tính toán thời gian phản hồi máy chủ `X-Response-Time` trong HTTP headers. Đăng ký middleware áp dụng toàn cục trong `AppModule`.
  - Cập nhật `SecurityExceptionFilter` gắn `requestId` trực tiếp vào payload phản hồi lỗi JSON (`{ statusCode, error, message, code, requestId, timestamp, path }`), hỗ trợ truy vết lỗi tức thì.
  - Đồng bộ bảng mã lỗi sang Frontend (`apps/web/lib/constants/error-codes.ts`) và bổ sung trường `requestId` vào `ApiErrorResponse` trong `apps/web/lib/api/client.ts`.
  - Viết unit test suite `test/security/api-design-system.spec.ts` kiểm thử toàn diện.
- **Files:** `apps/api/src/common/constants/error-codes.enum.ts`, `apps/api/src/common/exceptions/business.exception.ts`, `apps/api/src/common/middleware/correlation-id.middleware.ts`, `apps/api/src/common/filters/security-exception.filter.ts`, `apps/api/src/app.module.ts`, `apps/api/test/security/api-design-system.spec.ts`, `apps/web/lib/constants/error-codes.ts`, `apps/web/lib/api/client.ts`.
- **Kiểm tra:** 10/10 test suites trong `test/security` pass 42/42 tests 100%, `npm run build` trong `apps/api` pass 100%, `npm run typecheck` trong `apps/web` pass 100%.

---

### [DONE] [P2] FE-08: Chuẩn hóa Design System, Semantic Tokens & Quy chuẩn 4px Grid

- **Kết quả:**
  - Chuẩn hóa hệ thống Semantic Tokens trong `globals.css`:
    - Thống nhất họ màu nhận diện `--primary` là Signature Emerald Green (`168 80% 28%` cho Light Canvas, `168 75% 42%` cho Dark Canvas), không còn hiện tượng đổi tông sang Teal khi bật Dark Mode.
    - Bổ sung token `--color-ring: hsl(var(--ring));` vào `@theme` hỗ trợ focus rings cho a11y.
    - Gỡ bỏ `stroke-width: 2.25px !important` toàn cục sang `stroke-width: 2px` chuẩn.
  - Chuẩn hóa bộ Form Controls & Primitives nguyên tử:
    - `Button.tsx`: size `md` đạt chuẩn **40px (`h-10 px-4 text-sm`)**, bo góc `rounded-md`, token focus ring ngữ nghĩa `ring-primary`.
    - `Input.tsx`: chuyển sang bo góc `rounded-md`, căn lề 4px grid (`space-y-1`, `px-3`), nhãn label `text-foreground`.
    - `Select.tsx`: nâng trigger height lên **40px (`h-10`)**, bo góc `rounded-md`, thẳng hàng tuyệt đối với `Input` và `Button`.
    - `Badge.tsx`: chuẩn hóa bo góc `rounded-sm`, chuyển các biến thể trạng thái sang semantic classes `bg-success text-white`, `bg-warning text-white`, `bg-danger text-white`.
    - `Dialog.tsx`: chuẩn hóa bo góc `rounded-lg`, spacing `space-y-2` (8px).
  - Loại bỏ các class hardcoded trong component chính:
    - `AppShell.tsx`: thay `bg-slate-100 dark:bg-[#0b0f17]` bằng semantic token `bg-background`.
    - `PostCard.tsx`: chuyển toàn bộ mã màu cứng (`border-slate-200 dark:border-[#253044]`, `text-slate-950 dark:text-slate-100`, `text-teal-700 dark:text-teal-400`) sang semantic tokens (`border-border`, `bg-muted/40`, `text-foreground`, `text-primary`, `text-muted-foreground`).
- **Files:** `apps/web/app/globals.css`, `apps/web/components/ui/Button.tsx`, `Input.tsx`, `Select.tsx`, `Badge.tsx`, `Dialog.tsx`, `apps/web/components/layout/AppShell.tsx`, `apps/web/components/content/PostCard.tsx`.
- **Kiểm tra:** `npm run typecheck` trong `apps/web` thành công code 0, toàn bộ test suite `Button`, `Input`, `PostCard` pass 100%.

---

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

### [DONE] [P1] Hoàn thiện User Governance trong Dashboard Admin

- **Kết quả:**
  - Chuẩn hóa toàn diện màn hình quản trị `/admin/users` với component `UserManagementView`, đưa bảng người dùng thành giao diện chính thay vì form nhập UUID thủ công.
  - Tích hợp `AdminSearchInput` với debounce 350ms tìm kiếm theo email/username/tên/ID và các bộ lọc trạng thái (ACTIVE, SUSPENDED, BANNED, DEACTIVATED), role (MODERATOR, ADMIN, SUPER_ADMIN), và login method (LOCAL, GOOGLE).
  - Có modal xem chi tiết hồ sơ người dùng (`Eye`), hiển thị avatar, email, username, display name, login provider, các role được gán và thời điểm tạo tài khoản.
  - Hỗ trợ thao tác nhanh Khóa / Mở khóa tài khoản trực tiếp trên từng dòng (`Lock` / `LockKeyhole`) kèm modal xác nhận và ghi lý do kiểm toán (audit reason).
  - Hỗ trợ thao tác nhanh Gán / Thu hồi quyền Moderator (`ShieldPlus` / `ShieldMinus`) và phân quyền RBAC chi tiết trong modal.
  - Thực thi nghiêm ngặt các nguyên tắc bảo mật và quyền hạn: ngăn admin tự khóa hoặc tự thay đổi role của chính mình, chỉ tài khoản `SUPER_ADMIN` mới được phép thao tác trên các role cấp cao (`ADMIN`, `SUPER_ADMIN`).
  - Loại bỏ hoàn toàn khối nhập UUID thủ công cũ; phản hồi trạng thái loading, empty, toast feedback mượt mà.
- **Files:** `apps/web/components/admin/UserManagementView.tsx`, `apps/web/tests/admin/UserManagementView.test.tsx`.
- **Kiểm tra:** `npx vitest run tests/admin/UserManagementView.test.tsx` pass 3/3, `npm run typecheck` trong `apps/web` pass 100%, `npm run build` trong `apps/api` pass 100%.
- **Ghi chú:** Hoàn thành trọn vẹn màn hình quản trị tài khoản người dùng trong Admin.

---

### [DONE] [P1] Đồng bộ layout các trang Admin theo Post Moderation

- **Kết quả:**
  - Chuẩn hóa toàn bộ các màn hình admin (`FeatureFlagsView`, `SystemSettingsView`, `ModerationQueueTable`, `AuditLogsTable`, `CategoryManagementView`, `AdminCommentsTable`, `LearningEditorialQueue`, `LearningPathsManager`) theo cấu trúc vàng của `PostModerationTable` và `AdminPostsTable`:
    - Header chuẩn: icon chuyên biệt bọc trong container `p-2 rounded-lg bg-primary/10 text-primary`, tiêu đề `h1 font-heading text-xl font-bold text-foreground`, subtitle `text-xs text-muted-foreground font-mono mt-1`, kèm thanh tab trạng thái hoặc nút action ở góc phải.
    - Thanh tóm tắt dữ liệu & tìm kiếm debounce (`summary bar`): `rounded-xl border border-border bg-surface/70 p-3` với `AdminSearchInput` (350ms debounce), thông tin tổng số lượng, trạng thái bộ lọc và nút "Làm mới dữ liệu" tiện lợi.
    - Bảng dữ liệu / Danh sách thẻ: `rounded-xl border border-border bg-surface overflow-hidden shadow-2xs` với thead chuẩn `bg-muted/50 border-b border-border text-muted-foreground font-mono text-xs uppercase`, padding ô `py-3 px-4`, badge trạng thái và nút thao tác nhất quán.
    - Trạng thái loading skeletons, empty state viền đứt nét kèm icon, error state kèm nút Thử lại đồng bộ.
    - Tích hợp bộ chuyển đổi chế độ xem (Bảng dữ liệu / Theo Lĩnh vực) trong quản lý danh mục và responsive mobile cards hoàn chỉnh.
- **Files:** `apps/web/components/admin/FeatureFlagsView.tsx`, `apps/web/components/admin/SystemSettingsView.tsx`, `apps/web/components/moderation/ModerationQueueTable.tsx`, `apps/web/components/admin/AuditLogsTable.tsx`, `apps/web/components/admin/CategoryManagementView.tsx`, `apps/web/components/admin/AdminCommentsTable.tsx`, `apps/web/components/admin/LearningEditorialQueue.tsx`, `apps/web/components/admin/LearningPathsManager.tsx`.
- **Kiểm tra:** Toàn bộ 9/9 test suites trong `tests/admin` pass 28/28 tests 100%, `npm run typecheck` trong `apps/web` pass 100% không lỗi.
- **Ghi chú:** Đã loại bỏ hoàn toàn tình trạng layout riêng lẻ hoặc lệch chuẩn trong dashboard admin.

---
### [DONE] [P2] Đồng bộ font-family giữa Website và Dashboard Admin

- **Kết quả:**
  - Đồng bộ thống nhất hệ font typography giữa Website người dùng và Dashboard Admin qua `Inter` (`--font-sans`), tối ưu hiển thị chữ tiếng Việt đầy đủ thanh dấu Unicode và số liệu tài chính.
  - Tách biệt rõ ràng `--font-mono` cho các trường kỹ thuật (slug, UUID, timestamp, mã chứng khoán, JSON metadata) với font monospace hệ thống (`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`).
  - Thiết lập font tokens chuẩn trên `globals.css` (`--font-heading`, `--font-sans`, `--font-mono`) loại bỏ tình trạng font tải chắp vá hoặc giật layout shift.
- **Files:** `apps/web/app/globals.css`, `apps/web/app/layout.tsx`.
- **Kiểm tra:** `npm run typecheck` pass 100%, 28/28 tests admin pass 100%.

---

### [DONE] [P2] Tăng kích thước chữ Dashboard Admin

- **Kết quả:**
  - Nâng cấp tỷ lệ kích thước chữ cho Admin Workspace (`.admin-light-mode`) từ cỡ chữ nhỏ/mờ (loại bỏ hoàn toàn các cỡ chữ siêu nhỏ `text-3xs` 9px) lên chuẩn đọc thoải mái trên màn hình desktop và laptop:
    - Base typography admin: `15px` (`0.9375rem`), line-height 1.5.
    - Cỡ chữ nội dung ô bảng và form inputs: `text-sm` (14px).
    - Tiêu đề cột thead: `text-xs font-semibold uppercase tracking-wider` (12px).
    - Nhãn badge và trạng thái: `text-xs font-medium font-mono` (12px).
    - Thanh điều hướng admin (`AdminNav`): link menu `text-sm font-medium` (14px), tiêu đề nhóm `text-xs font-semibold uppercase tracking-wider` (12px).
    - Header admin (`AdminHeader`): phân cấp rõ ràng giữa tên dự án và workspace subtitle.
- **Files:** `apps/web/app/globals.css`, `apps/web/components/admin/AdminNav.tsx`, `apps/web/components/admin/AdminHeader.tsx`, `apps/web/components/admin/FeatureFlagsView.tsx`, `apps/web/components/admin/CategoryManagementView.tsx`, `apps/web/components/admin/LearningPathsManager.tsx`, `apps/web/components/admin/AuditLogsTable.tsx`.
- **Kiểm tra:** `npm run typecheck` pass 100%, tất cả test suites admin pass 28/28 tests.

---

### [DONE] [P0] Audit và hoàn thiện chức năng Backend toàn hệ thống

- **Kết quả:**
  - Hoàn thiện toàn diện 7 hạng mục cốt lõi của Backend:
    - `BE-01`: Chuẩn hóa xử lý tiếng Việt cho Post Slug (`SlugifyUtil` NFD + unit tests).
    - `BE-02`: Bổ sung composite và foreign key indexes trong Drizzle Schema (`posts`, `comments`, `notifications`, `reactions`).
    - `BE-03`: Tối ưu hóa feed queries với LEFT JOIN `profilesTable` và `mediaTable`, loại bỏ N+1 query.
    - `BE-04`: Loại bỏ in-memory credentials fallback trong production, tích hợp `email_confirmed_at` vào token JWT và chặn user bị khóa.
    - `BE-05`: Quản lý phiên đăng nhập Refresh Token Rotation & Revocation với bảng `refresh_tokens`, bảo vệ tài khoản khi bị lộ token hoặc bấm Đăng xuất.
    - `BE-06`: Bổ sung Facebook OAuth API (`POST /api/v1/auth/facebook`) kết nối Facebook Graph API và deterministic user provisioning.
    - `BE-07`: Nâng cấp live market data adapter đa sàn (Yahoo Finance cho chứng khoán Việt Nam VN-Index, VN30, Bluechips VCB, FPT, HPG; Binance API cho Crypto BTC, ETH), timeout an toàn và fallback resilient.
- **Files:** Toàn bộ các module `apps/api/src/` (Auth, Posts, Database, Market, Users).
- **Kiểm tra:** 100% tests security và module tests pass, `npm run build` trong `apps/api` thành công code 0.

---
### [DONE] [P1] Bổ sung phân trang cho các trang chưa có

- **Kết quả:**
  - Tái sử dụng đồng bộ `AdminPagination` và bộ metadata chuẩn (`page`, `limit`, `totalItems`, `totalPages`, `hasNextPage`, `hasPreviousPage`) trên toàn bộ các trang quản trị:
    - Quản lý bài viết (`AdminPostsTable`)
    - Hàng đợi duyệt bài (`PostModerationTable`)
    - Quản trị người dùng (`UserManagementView`)
    - Quản lý danh mục (`CategoryManagementView`)
    - Quản lý thẻ tag (`AdminTagsTable`)
    - Quản lý bình luận (`AdminCommentsTable`)
    - Hàng đợi báo cáo vi phạm (`ModerationQueueTable`)
    - Nhật ký kiểm toán bảo mật (`AuditLogsTable`)
  - Trung tâm thông báo (`NotificationsCenter`) hỗ trợ phân trang tải thêm (load-more pagination) mượt mà với metadata backend.
  - Tự động reset trang về 1 khi thay đổi bộ lọc hoặc từ khóa tìm kiếm trên tất cả các màn hình.
- **Files:** `apps/web/components/admin/AdminPagination.tsx`, `apps/web/components/admin/AdminPostsTable.tsx`, `apps/web/components/admin/PostModerationTable.tsx`, `apps/web/components/admin/UserManagementView.tsx`, `apps/web/components/admin/CategoryManagementView.tsx`, `apps/web/components/admin/AdminTagsTable.tsx`, `apps/web/components/admin/AdminCommentsTable.tsx`, `apps/web/components/moderation/ModerationQueueTable.tsx`, `apps/web/components/admin/AuditLogsTable.tsx`.
- **Kiểm tra:** `npm run typecheck` thành công code 0, 28/28 tests trong `tests/admin` pass 100%.
- **Ghi chú:** Hoàn thành trọn vẹn task bổ sung phân trang dùng chung.
### Quy ước nghiệp vụ: Posts và Post Moderation

- **Posts:** Là trang quản lý toàn bộ bài viết trong hệ thống. Có danh sách tất cả bài viết, tìm kiếm, lọc, phân trang và các thao tác thêm, sửa, xóa/ẩn bài viết.
- **Post Moderation:** Là hàng đợi kiểm duyệt bài viết. Chỉ tập trung vào xem nội dung và quyết định `Duyệt` hoặc `Không duyệt/Ẩn`; không thêm, sửa hoặc xóa bài viết.
- Hai trang phải có route, UI action và permission tách biệt; không dùng nút CRUD của Posts trong Post Moderation.
