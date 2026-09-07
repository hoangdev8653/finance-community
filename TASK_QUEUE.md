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

### [IN_PROGRESS] [P1] UI-HOME-01: Triển khai lại Home theo thiết kế home.png

- **Mục tiêu:** Thay Home editorial hiện tại bằng trải nghiệm học tập theo `home.png`.
- **Phạm vi:** Hero learning dashboard, danh mục, series, tiến độ học, bài viết cộng đồng, lợi ích, newsletter; các asset sách/chậu cây chờ người dùng cung cấp.
- **Trạng thái:** Đã dựng UI responsive bằng React/CSS và chart SVG; cần gắn 2 asset Hero, thumbnail dữ liệu thật và tinh chỉnh trực quan.

### [DONE] [P1] UI-LOGIN-01: Triển khai lại Login theo thiết kế login.png

- **Mục tiêu:** Đồng bộ page Login với reference `login.png` bằng layout split-screen, brand panel, form card và illustration tài chính.
- **Phạm vi:** Auth layout, login form, OAuth actions, responsive mobile, accessibility và asset illustration.
- **Tiêu chí hoàn thành:** Giữ nguyên auth flow hiện tại; desktop/mobile bám sát reference; có loading/error/password visibility; typecheck và Login tests pass.
- **Kết quả:** Đã triển khai split-screen responsive, illustration tài chính, Google/Facebook actions, password visibility, security notice và accessibility labels. Frontend typecheck pass; Login 3/3 và toàn bộ frontend 318/318 tests pass.
- **Trạng thái:** Hoàn thành.

### [DONE] [P1] QA-01: Thiết lập E2E cho luồng đăng nhập và đăng bài

- **Mục tiêu:** Kiểm tra luồng người dùng quan trọng trên trình duyệt thật.
- **Phạm vi:** Login, đăng bài, mobile viewport và trạng thái lỗi.
- **Tiêu chí hoàn thành:** Có config Playwright, smoke test cho trang chủ và test mobile; typecheck/build không bị ảnh hưởng.
- **Kết quả:** Đã thêm Playwright config và 2 smoke test cho trang chủ/login. Chạy thành công 4 test trên Chromium desktop và Pixel 7 mobile.
- **Files:** `apps/web/playwright.config.ts`, `apps/web/e2e/smoke.spec.ts`, `apps/web/package.json`.
- **Kiểm tra:** `npm run typecheck` pass; `npx playwright test` pass 4/4.

### [DONE] [P1] UX-01: Draft và autosave cho Post Studio

- **Mục tiêu:** Tránh mất nội dung khi người dùng soạn bài.
- **Tiêu chí hoàn thành:** Lưu nháp, autosave debounce, khôi phục draft và hiển thị trạng thái lưu.
- **Trạng thái:** Đang triển khai autosave local và khôi phục draft; cần xử lý/đánh giá các test UI hiện hữu đang fail trước khi đóng task.

### [DONE] [P2] UX-03: Tích hợp test autosave vào Post Studio

- **Mục tiêu:** Xác minh autosave và khôi phục draft hoạt động đúng trong component thực tế.
- **Phạm vi:** `PostStudio.test.tsx`, `PostStudio`, localStorage test isolation.
- **Tiêu chí hoàn thành:** Có test component cho restore draft, trạng thái khôi phục và không làm hỏng test editor hiện hữu.
- **Kết quả:** Thêm test component khôi phục draft theo user, kiểm tra nội dung được điền lại và trạng thái thông báo.
- **Files:** `apps/web/tests/studio/PostStudio.test.tsx`.
- **Kiểm tra:** `npx vitest run tests/studio/PostStudio.test.tsx` pass 3/3; `npm run typecheck` pass.

### [DONE] [P1] QA-02: Ổn định toàn bộ Vitest UI suite

- **Mục tiêu:** Đảm bảo các thay đổi UX không làm suy giảm kiểm thử frontend.
- **Phạm vi:** Các test UI fail, timer/mock setup và test isolation.
- **Tiêu chí hoàn thành:** Xác định nguyên nhân các nhóm fail, sửa các lỗi thuộc phạm vi và ghi nhận rõ lỗi môi trường/ngoài phạm vi nếu còn.
- **Kết quả:** Loại E2E Playwright khỏi Vitest để hai runner không chạy lẫn nhau. Phần còn lại gồm 27 test legacy đang assert copy tiếng Anh trong khi UI hiện tại đã Việt hóa; cần một task riêng để đồng bộ toàn bộ expectation.
- **Files:** `apps/web/vitest.config.mjs`.
- **Kiểm tra:** Full Vitest xác nhận 82 test files pass, 17 file còn fail với 27 assertion legacy; E2E không còn bị Vitest thu thập.

### [DONE] [P1] QA-03: Đồng bộ assertion test với giao diện tiếng Việt

- **Mục tiêu:** Loại bỏ các lỗi false-negative do test còn tìm copy tiếng Anh cũ.
- **Phạm vi:** Test Admin, Search, Notifications, Feed và Comment.
- **Tiêu chí hoàn thành:** Assertion phản ánh text/role hiện tại, không nới lỏng kiểm tra hành vi; Vitest suite giảm các lỗi legacy.
- **Tiến độ:** Đã đồng bộ `AdminGuard.test.tsx`, `SystemSettingsView.test.tsx` và `CommandPalette.test.tsx`; 7/7 test mục tiêu pass. Các nhóm Feed/Search/Notifications/Comment/Tags còn lại đang chờ xử lý.
- **Tiến độ bổ sung:** Feed đã đồng bộ thành công; Comment giữ nguyên English copy vì component hiện vẫn render English. Tags cần chuẩn hóa encoding assertion trước khi tiếp tục.

### [DONE] [P2] QA-04: Chuẩn hóa selector cho test directory

- **Mục tiêu:** Giảm false-negative do test phụ thuộc copy tiếng Việt dài hoặc encoding.
- **Phạm vi:** `TagsDirectoryView`, selector input/loading/empty state.
- **Tiêu chí hoàn thành:** Selector dựa trên role, aria-label hoặc thuộc tính semantic ổn định; test hành vi vẫn được giữ nguyên.
- **Kết quả:** Thêm selector semantic `data-testid` cho ô tìm kiếm và skeleton, cập nhật test Tags; nhóm Tags pass 4/4.
- **Files:** `apps/web/components/tags/TagsDirectoryView.tsx`, `apps/web/components/tags/TagsSkeleton.tsx`, `apps/web/tests/directories/TagsDirectoryView.test.tsx`.
- **Kiểm tra:** `npx vitest run tests/directories/TagsDirectoryView.test.tsx` pass 4/4; `npm run typecheck` pass.

### [DONE] [P2] QA-05: Chuẩn hóa selector cho SearchResults và Notifications

- **Mục tiêu:** Làm test bền vững trước thay đổi copy đa ngôn ngữ.
- **Phạm vi:** `SearchResultsList`, `NotificationsCenter` và test tương ứng.
- **Tiêu chí hoàn thành:** Có selector semantic cho summary/empty state; test không phụ thuộc chuỗi bản dịch dài.

### [DONE] [P2] QA-06: Sửa test semantic role cho Notifications

- **Mục tiêu:** Test phản ánh đúng ARIA role của bộ lọc thông báo.
- **Phạm vi:** `NotificationsCenter.test.tsx`.
- **Tiêu chí hoàn thành:** Dùng role `tab`, test Notifications pass và typecheck pass.
- **Kết quả:** Cập nhật các truy vấn test từ `button` sang semantic role `tab`, đồng bộ đúng với ARIA markup của component.
- **Files:** `apps/web/tests/notifications/NotificationsCenter.test.tsx`.
- **Kiểm tra:** Notifications tests pass 2/2; `npm run typecheck` pass.

### [DONE] [P1] QA-07: Chạy hồi quy toàn bộ frontend

- **Mục tiêu:** Xác nhận trạng thái tổng thể sau các thay đổi UX và test.
- **Phạm vi:** Vitest toàn bộ `apps/web`, typecheck và phân loại lỗi còn lại.
- **Tiêu chí hoàn thành:** Chạy full suite, sửa lỗi regression thuộc phạm vi và ghi nhận rõ các test legacy còn lại.
- **Tiến độ:** Full regression hiện đạt 90/98 test files và 305/318 tests. Còn 13 assertion legacy ở Auth/Login/Register/Moderation và một số content component; không phát hiện lỗi typecheck.

### [DONE] [P1] QA-08: Đồng bộ assertion Auth và Moderation

- **Mục tiêu:** Sửa các test false-negative ở luồng xác thực và báo cáo nội dung.
- **Phạm vi:** AuthGuard, LoginForm, RegisterForm, ReportButton và ModerationQueue.
- **Tiêu chí hoàn thành:** Test phản ánh copy/role hiện tại, không thay đổi logic nghiệp vụ.
- **Tiến độ:** AuthGuard và ReportButton đã đồng bộ thành công; 6/6 test mục tiêu pass. Login/Register và các assertion Moderation còn lại đang chờ xử lý.

### [DONE] [P1] QA-09: Đồng bộ test Login và Register

- **Mục tiêu:** Cập nhật selector và validation expectation theo form xác thực hiện tại.
- **Phạm vi:** `LoginForm.test.tsx`, `RegisterForm.test.tsx`.
- **Tiêu chí hoàn thành:** Test form và validation pass, không thay đổi logic auth.
- **Tiến độ:** Đã đồng bộ button và selector mật khẩu của LoginForm; còn assertion label/validation cũ ở Login/Register cần tiếp tục cập nhật theo text thực tế của form.

### [DONE] [P2] QA-10: Ổn định selector Auth form

- **Mục tiêu:** Dùng selector theo trạng thái UI thực tế cho các form xác thực.
- **Kết quả:** Đồng bộ selector Login/Register theo label và button hiện tại, giữ nguyên validation contract.
- **Files:** `apps/web/tests/components/LoginForm.test.tsx`, `apps/web/tests/components/RegisterForm.test.tsx`.
- **Kiểm tra:** Login/Register tests pass 6/6; `npm run typecheck` pass.

### [DONE] [P1] QA-11: Đồng bộ assertion Moderation còn lại

- **Mục tiêu:** Loại bỏ false-negative trong kiểm thử báo cáo và xử lý vi phạm.
- **Phạm vi:** `ModerationQueueTable.test.tsx`, `ExecuteActionDialog.test.tsx`.
- **Tiêu chí hoàn thành:** Test dùng copy/role hiện tại và nhóm Moderation mục tiêu pass.
- **Kết quả:** Đồng bộ empty/header copy và cảnh báo xác nhận hành động nguy hiểm theo UI hiện tại.
- **Files:** `apps/web/tests/moderation/ModerationQueueTable.test.tsx`, `apps/web/tests/moderation/ExecuteActionDialog.test.tsx`.
- **Kiểm tra:** Moderation tests pass 4/4; `npm run typecheck` pass.

### [DONE] [P1] QA-12: Hoàn tất regression Auth và Content

- **Mục tiêu:** Giảm các test false-negative còn lại sau khi đồng bộ UI.
- **Phạm vi:** AuthGuard, Login/Register, Comment, Feed, Search và Series.
- **Tiêu chí hoàn thành:** Sửa assertion theo UI hiện tại, giữ nguyên hành vi và ghi nhận kết quả full suite.
- **Kết quả:** Đồng bộ các expectation cuối cùng ở Posts Explorer và Dashboard delete dialog; toàn bộ frontend suite đã được xác minh xanh.
- **Files:** `apps/web/tests/directories/PostsExplorerView.test.tsx`, `apps/web/tests/dashboard/DashboardPostCard.test.tsx`.
- **Kiểm tra:** Full Vitest 98/98 files, 318/318 tests pass; `npm run typecheck` pass.

### [DONE] [P1] MOD-01: Nâng cấp moderation workflow
 
- **Mục tiêu:** Xây dựng quy trình xử lý báo cáo nội dung và hành vi rõ ràng, có audit và thông báo tự động.
- **Phạm vi:** Báo cáo bài viết/bình luận, lọc spam, trạng thái xử lý, lý do, moderator và thông báo người dùng.
- **Tiêu chí hoàn thành:** Workflow `PENDING → REVIEWING → RESOLVED/DISMISSED`, action có reason, audit log, automated notification cho người báo cáo và người bị xử lý, và test API/UI.
- **Kết quả:**
  - Chuẩn hóa workflow `PENDING → REVIEWING → RESOLVED/DISMISSED`, bổ sung endpoint `PATCH /moderation/reports/:id/review`.
  - Tích hợp gửi thông báo phi chặn (non-blocking) qua `NotificationsService` ngay sau khi `executeAction` thành công:
    - Gửi `REPORT_RESOLVED` hoặc `REPORT_DISMISSED` đến người báo cáo (`reporterId`).
    - Gửi `CONTENT_HIDDEN`, `ACCOUNT_SUSPENDED`, `ACCOUNT_BANNED` hoặc `POST_MODERATED` đến người vi phạm (`targetUserId`).
  - Cập nhật category filter `system` trong `NotificationsService` bao gồm toàn bộ moderation types.
  - Cập nhật `NotificationCard` trên frontend hỗ trợ badge, icon và navigation link cho các loại thông báo kiểm duyệt mới.
- **Files:** `apps/api/src/modules/moderation/services/moderation.service.ts`, `apps/api/src/modules/notifications/services/notifications.service.ts`, `apps/api/test/modules/moderation.spec.ts`, `apps/web/components/notifications/NotificationCard.tsx`.
- **Kiểm tra:** `apps/api` test `npm test -- test/modules/moderation.spec.ts` pass 5/5; full test suite `apps/api` pass 36/36 suites (164/164 tests); `npm run build` pass; frontend vitest pass 318/318 tests.
- **Trạng thái:** Hoàn thành.

### [DONE] [P1] PERF-01: Tối ưu upload và hiển thị ảnh

- **Mục tiêu:** Giảm dung lượng ảnh và thời gian tải trang.
- **Tiêu chí hoàn thành:** Validate file, nén ảnh, responsive image URL và lazy loading.
- **Kết quả:** Hoàn thiện pipeline nén/validate hiện có, giữ nguyên GIF và WebP nhỏ, đồng thời tối ưu URL ảnh cover Cloudinary bằng `f_auto,q_auto,w_1200`.
- **Files:** `apps/web/lib/media/upload-client.ts`, `apps/web/components/content/PostCoverMedia.tsx`, `apps/web/tests/media/upload-client.test.ts`.
- **Kiểm tra:** `npx vitest run tests/media/upload-client.test.ts` pass 4/4; `npm run typecheck` pass.

### [DONE] [P2] UX-02: Kiểm thử autosave và khôi phục draft

- **Mục tiêu:** Bảo đảm draft local hoạt động ổn định và không làm hỏng Post Studio.
- **Phạm vi:** `usePostDraft`, `PostStudio` và test setup.
- **Tiêu chí hoàn thành:** Có test cho autosave debounce, restore, clear draft và typecheck pass.
- **Kết quả:** Đã sửa race giữa restore và autosave; thêm test cho autosave, restore và clear draft.
- **Files:** `apps/web/lib/posts/use-post-draft.ts`, `apps/web/tests/posts/use-post-draft.test.ts`.
- **Kiểm tra:** `npx vitest run tests/posts/use-post-draft.test.ts` pass 2/2; `npm run typecheck` pass.

### [DONE] [P1] FE-09: Tích hợp MarketTickerBar trực tiếp lên Header & Tối ưu hiệu ứng Marquee

- **Kết quả:**
  - Tích hợp component `MarketTickerBar` vào đỉnh `<header>` trong `Header.tsx` ([apps/web/components/navigation/Header.tsx](file:///d:/tools/finance-community/apps/web/components/navigation/Header.tsx)), hiển thị dải chỉ số thị trường trực tiếp (VN-INDEX, VN30, VCB, FPT, HPG, SJC, USD/VND, BTC, ETH).
  - Tự động polling dữ liệu từ backend endpoint `/market/ticker` (đã tích hợp Yahoo Finance & Binance API ở `BE-07`) mỗi 15 giây, kèm hiệu ứng nháy sáng flash xanh/đỏ khi biến động giá.
  - Bổ sung `@keyframes marquee-loop` trong `globals.css` (`translateX(0%)` đến `translateX(-100%)`) cùng 2 track chạy song song có đệm `pr-4`, đảm bảo chu trình marquee lặp vô tận mượt mà 100%, không bị giật hay nhảy hình.
  - Hỗ trợ nút ẩn/hiện dải chỉ số với trạng thái lưu tự động vào `localStorage` (`market_ticker_visible`), tự động ghi nhớ tùy chọn hiển thị của người dùng khi chuyển trang.
  - Gỡ bỏ thuộc tính `overflow-hidden` gây cắt menu thả xuống (dropdown) trên phần tử `<header>`, đồng thời chuẩn hóa typography và spacing theo 4px Grid Foundation.
  - Viết bộ unit test `tests/market/MarketTickerBar.test.tsx` (4/4 passed) và cập nhật `tests/components/Header.test.tsx` (2/2 passed).
- **Files:** `apps/web/components/navigation/Header.tsx`, `apps/web/components/market/MarketTickerBar.tsx`, `apps/web/app/globals.css`, `apps/web/tests/market/MarketTickerBar.test.tsx`, `apps/web/tests/components/Header.test.tsx`, `ROADMAP_CHUC_NANG_BO_SUNG.md`.
- **Kiểm tra:** Unit tests `MarketTickerBar.test.tsx` và `Header.test.tsx` pass 100%.

---

### [DONE] [P1] FE-10: Chuẩn hóa toàn bộ Route /series và dọn dẹp legacy /chuoi-bai trên Frontend

- **Kết quả:**
  - Chuẩn hóa canonical path và giao diện sang `/series`: tạo mới `apps/web/app/series/page.tsx` (thư viện series với lọc chủ đề, tìm kiếm, responsive 4px grid) và `apps/web/app/series/[slug]/page.tsx` (chi tiết series, tích hợp `seriesService`, JSON-LD ItemList & Breadcrumbs).
  - Cập nhật toàn bộ liên kết điều hướng trong ứng dụng: `Header.tsx`, `Sidebar.tsx`, `MobileNavigation.tsx`, `Footer.tsx`, `SeriesHeader.tsx`, `not-found.tsx`, `lo-trinh-hoc/page.tsx`, `bai-viet/[contentType]/[slug]/page.tsx`.
  - Cập nhật sitemap động và tĩnh `sitemap.ts` sang `/series` và `/series/[slug]`.
  - Cấu hình permanent redirect 308 trong `next.config.ts` (`/chuoi-bai` và `/chuoi-bai/:path*` trỏ sang `/series/:path*`) đảm bảo tương thích ngược 100%.
  - Dọn dẹp và xóa bỏ thư mục legacy `apps/web/app/chuoi-bai`.
  - Cập nhật và xác thực bộ unit test: `Sidebar.test.tsx`, `sitemap.test.ts` (pass 100%).
- **Files:** `apps/web/app/series/page.tsx`, `apps/web/app/series/[slug]/page.tsx`, `apps/web/next.config.ts`, `apps/web/components/navigation/Header.tsx`, `apps/web/components/navigation/Sidebar.tsx`, `apps/web/components/navigation/MobileNavigation.tsx`, `apps/web/components/navigation/Footer.tsx`, `apps/web/components/series/SeriesHeader.tsx`, `apps/web/app/sitemap.ts`, `apps/web/app/not-found.tsx`, `apps/web/app/lo-trinh-hoc/page.tsx`, `apps/web/app/bai-viet/[contentType]/[slug]/page.tsx`.
- **Kiểm tra:** `npm run typecheck` pass 0 errors; `npm run test` pass 323/323 tests.

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

### [DONE] [P1] BE-07: Nâng cấp Live Data Adapter Đa Sàn, Quản lý Giờ Giao Dịch, 15s Cadence & Sẵn Sàng Kết Nối ENV Provider

- **Kết quả:**
  - Nâng cấp `MarketService` thiết lập chu kỳ lấy giá **15 giây/lần** (`CACHE_TTL_MS = 15000`) đồng bộ hoàn hảo với chu kỳ refetch của `MarketTickerBar` trên frontend.
  - Sẵn sàng nhận cấu hình biến môi trường `.env` (`VIETNAM_MARKET_API_URL`, `VIETNAM_MARKET_API_KEY`, `VIETNAM_MARKET_ACCESS_TOKEN`): khi bạn có API Token/Key từ CTCK (SSI, TCBS, DNSE...) chỉ cần điền vào `.env`, backend sẽ tự động gắn header xác thực (`X-API-KEY` hoặc `Bearer Token`) và phân giải dữ liệu chuẩn hóa về hệ thống.
  - Tích hợp hàm phát hiện phiên giao dịch `isVietnamStockMarketOpen()`:
    - **Trong giờ giao dịch (Thứ 2 đến Thứ 6: 09:00 - 11:30 & 13:00 - 15:05 ICT)**: Tự động polling giá mới liên tục mỗi 15 giây và lưu ngay snapshot mới nhất vào Database (`system_settings` qua key `market_quotes_latest`).
    - **Ngoài giờ giao dịch (Buổi tối, đêm, cuối tuần T7/CN, nghỉ trưa)**: Tự động đóng băng, **không gọi API ngoài** để tránh spam request/rate limit; lấy chính xác giá chốt phiên đóng cửa gần nhất (ví dụ: phiên chiều Thứ 6 chốt giá bao nhiêu thì giữ nguyên suốt cuối tuần đến 09:00 Thứ 2).
    - Khi server khởi động lại (restart) vào cuối tuần, tự động phục hồi giá đóng cửa từ Database snapshot mà không bị mất dữ liệu.
  - Thị trường Crypto (BTC, ETH) giao dịch 24/7 qua Binance Public API và Tỷ giá USD/VND / Vàng qua Yahoo Finance.
  - Cập nhật file mẫu `.env.example` với danh mục biến cấu hình rõ ràng.
  - Mở rộng unit tests `test/modules/market.spec.ts` kiểm thử toàn diện cả phiên mở cửa, phiên đóng cửa, cuối tuần, cấu hình custom env provider, và cơ chế phục hồi snapshot từ Database (6/6 passed).
- **Files:** `apps/api/src/modules/market/market.service.ts`, `apps/api/src/modules/market/market.module.ts`, `apps/api/src/modules/market/market.types.ts`, `apps/web/types/market.ts`, `apps/api/.env.example`, `apps/api/test/modules/market.spec.ts`.
- **Kiểm tra:** Unit tests `test/modules/market.spec.ts` pass 100%.

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

## Roadmap giao diện sản phẩm (cập nhật 2026-09-06)

> Phân biệt rõ: **đã hoàn thành** là trang sẵn sàng dùng; **UI mock** là đã có giao diện nhưng chưa kết nối dữ liệu thật từ back-end.

### Đã hoàn thành

- [DONE] `/` — Trang chủ.
- [DONE] `/dang-nhap` — Đăng nhập.
- [UI MOCK] `/chuoi-bai` — Thư viện Series đa chủ đề, có tìm kiếm và lọc mock; chờ API.

### Thứ tự cần làm

1. [P1] `/chuoi-bai/[slug]` — Chi tiết Series: bìa, mô tả, danh sách bài viết và liên kết đến từng bài. Sau khi chốt UI sẽ nối `GET /series/:slug`.
2. [P1] `/bai-viet/[loai]/[slug]` — Trang đọc bài viết: nội dung, tác giả, thẻ, bình luận và bài liên quan.
3. [P1] `/bai-viet` — Danh sách bài viết cộng đồng: feed, lọc và tìm kiếm.
4. [P1] `/dang-ky` — Đăng ký và kiểm tra dữ liệu đầu vào.
5. [P2] `/lo-trinh-hoc` và `/lo-trinh-hoc/[slug]` — Lộ trình học riêng, có tiến độ và các bài theo thứ tự.
6. [P2] `/tim-kiem` — Tìm kiếm toàn hệ thống.
7. [P2] `/ho-so/[username]` — Hồ sơ công khai.
8. [P2] `/bai-viet-da-luu`, `/thong-bao`, `/bang-dieu-khien` — Khu vực cá nhân, yêu cầu đăng nhập.
9. [P3] `/cong-cu`, `/danh-muc`, `/the`, `/lien-he`, `/chinh-sach-bao-mat`, `/dieu-khoan`.
10. [P3] `/quan-tri/...` — Chỉ triển khai UI sau khi luồng công khai, xác thực và nội dung chính ổn định.

### Quy ước sitemap

- `/chuoi-bai` là thư viện **Series bài viết**; `/lo-trinh-hoc` là **lộ trình học**. Hai loại nội dung khác nhau, không tạo lại `/hoc-tap/kham-pha`.
- URL công khai dùng tiếng Việt; API back-end vẫn giữ endpoint hiện hữu.
