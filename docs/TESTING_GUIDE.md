# Chiến Lược & Cẩm Nang Kiểm Thử Toàn Diện (Testing Strategy & Roadmap)
Dự án: **Finance Community (Finance Pulse)**

Tài liệu này tổng hợp toàn bộ các phương pháp kiểm thử phần mềm từ cơ bản đến nâng cao, hướng dẫn cấu hình, mã nguồn mẫu và kế hoạch triển khai để áp dụng trong tương lai khi dự án mở rộng quy mô.

---

## Mục Lục
1. [Mô hình Tháp Kiểm Thử (Testing Pyramid)](#1-mô-hình-tháp-kiểm-thử-testing-pyramid)
2. [Tầng 1: Unit Testing & Logic Rời Rạc](#2-tầng-1-unit-testing--logic-rời-rạc-đã-có)
3. [Tầng 2: Security & API Integration Testing](#3-tầng-2-security--api-integration-testing-đã-có)
4. [Tầng 3: End-to-End (E2E) Browser & Mobile Testing](#4-tầng-3-end-to-end-e2e-browser--mobile-testing-chưa-có)
5. [Tầng 4: Visual Regression Testing (Chống vỡ giao diện)](#5-tầng-4-visual-regression-testing-chống-vỡ-giao-diện)
6. [Tầng 5: Performance & Load Testing (Kiểm thử chịu tải)](#6-tầng-5-performance--load-testing-kiểm-thử-chịu-tải)
7. [Tầng 6: Accessibility (A11y - Trợ năng WCAG)](#7-tầng-6-accessibility-a11y---trợ-năng-wcag)
8. [Tầng 7: Security Scanning & Vulnerability Assessment](#8-tầng-7-security-scanning--vulnerability-assessment)
9. [Tầng 8: Resilience & Chaos Testing](#9-tầng-8-resilience--chaos-testing-kiểm-thử-độ-bền-khi-lỗi-mạnghạ-tầng)
10. [Pipeline CI/CD Tự Động Hóa Mẫu (GitHub Actions)](#10-pipeline-cicd-tự-động-hóa-mẫu-github-actions)
11. [Checklist Sẵn Sàng Ra Mắt (Production Readiness Checklist)](#11-checklist-sẵn-sàng-ra-mắt-production-readiness-checklist)

---

## 1. Mô hình Tháp Kiểm Thử (Testing Pyramid)

```
                       / \
                      /   \       Tầng 8: Resilience / Chaos Testing
                     /     \      Tầng 7: Security Scanning (DAST/SAST)
                    /       \     Tầng 6: Accessibility (a11y)
                   /  E2E    \    Tầng 5: Performance & Load (k6)
                  / & Visual  \   Tầng 4: Visual Regression
                 /-------------\  Tầng 3: E2E Browser & Mobile (Playwright)
                /  Integration  \ Tầng 2: Security & API Module Tests (Jest/Supertest)
               /-----------------\
              /    Unit Tests     \ Tầng 1: Utils, Helpers, Hooks, DTOs (Vitest/Jest)
             /---------------------\
```

---

## 2. Tầng 1: Unit Testing & Logic Rời Rạc (ĐÃ CÓ)

### Mục tiêu
Kiểm tra từng hàm tính toán, hàm xử lý chuỗi, state store, parser, transformer chạy đúng logic toán học và nghiệp vụ độc lập, không phụ thuộc database.

### Công nghệ sử dụng
- **Backend (`apps/api`):** Jest
- **Frontend (`apps/web`):** Vitest + `@testing-library/react` + `jsdom`

### Các bài test trọng tâm
- Xử lý tiếng Việt: `apps/api/src/common/utils/slugify.util.spec.ts` (NFD Unicode, bóc dấu tiếng Việt, ký tự đặc biệt).
- Chống mã độc XSS: `apps/api/src/common/utils/sanitizer.util.spec.ts` (Sanitize HTML rich text TipTap).
- Định dạng ngày tháng, SEO Structured Data, UI State Zustand.

### Lệnh chạy
```powershell
# Chạy unit test backend
npm --prefix apps/api test

# Chạy unit test frontend
npm --prefix apps/web test
```

---

## 3. Tầng 2: Security & API Integration Testing (ĐÃ CÓ)

### Mục tiêu
Kiểm tra tính toàn vẹn của các Endpoint API, bộ lọc phân quyền (Guards), kiểm soát truy cập (RBAC), chu kỳ xác thực người dùng và kết nối Database Drizzle.

### Công nghệ sử dụng
- NestJS Testing Module, Supertest, Jest.

### Các bài test trọng tâm
- `rate-limit.guard.spec.ts`: Chống spam brute-force.
- `permission.guard.spec.ts`: Kiểm soát quyền Admin / Moderator / User.
- `account-status.guard.spec.ts`: Chặn tài khoản `BANNED`, `SUSPENDED`.
- `email-verification.guard.spec.ts`: Bắt buộc xác thực email khi đăng bài.
- `facebook-auth.spec.ts` & `jit-provisioning.spec.ts`: Đăng nhập mạng xã hội và cấp phát tài khoản tự động.
- `refresh_tokens.spec.ts`: Xoay vòng Refresh Token (Token Rotation) và thu hồi Token Family khi bị lộ.

---

## 4. Tầng 3: End-to-End (E2E) Browser & Mobile Testing (CHƯA CÓ)

### Mục tiêu
Khởi chạy một trình duyệt thật (Headless Chromium, Safari WebKit, Firefox) và giả lập một người dùng thật trên cả **Desktop** và **Điện thoại di động (iPhone, Pixel)**. Bắt trọn vẹn lỗi:
- Tràn viền màn hình (horizontal scroll overflow).
- Click nhầm nút, bàn phím ảo che khuất form đăng nhập.
- Luồng hoàn chỉnh: Đăng nhập -> Viết bài -> Thêm ảnh -> Đăng bài -> Xuất hiện trên trang chủ.

### Công nghệ khuyến nghị: Playwright

### Cài đặt
```powershell
cd apps/web
npm install -D @playwright/test
npx playwright install --with-deps
```

### File cấu hình `apps/web/playwright.config.ts`
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Safari (iPhone 14)',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'Mobile Chrome (Pixel 7)',
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Kịch bản mẫu 1: Kiểm tra chống tràn viền Mobile (`apps/web/e2e/mobile-viewport.spec.ts`)
```typescript
import { test, expect } from '@playwright/test';

test.describe('Mobile Viewport & Layout Compliance', () => {
  test('Trang chủ không có thanh cuộn ngang ngoài ý muốn', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(isOverflowing).toBe(false);
  });

  test('Thanh điều hướng Mobile (Bottom/Header Nav) hiển thị đúng chuẩn', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });
});
```

### Kịch bản mẫu 2: Luồng người dùng đăng bài (`apps/web/e2e/post-creation.spec.ts`)
```typescript
import { test, expect } from '@playwright/test';

test('User có thể tạo bài viết mới', async ({ page }) => {
  // 1. Đi đến trang đăng nhập
  await page.goto('/login');
  await page.fill('input[type="email"]', 'testuser@example.com');
  await page.fill('input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');

  // 2. Chuyển sang Studio tạo bài
  await page.goto('/studio/posts/new');
  await page.fill('input[placeholder*="Tiêu đề"]', 'Phân tích cổ phiếu FPT quý 3/2026');
  
  // 3. Nhập nội dung TipTap Editor
  const editor = page.locator('.ProseMirror');
  await editor.fill('FPT duy trì đà tăng trưởng 20% nhờ khối công nghệ thông tin nước ngoài.');

  // 4. Bấm xuất bản
  await page.click('button:has-text("Xuất bản")');

  // 5. Kiểm tra thông báo thành công hoặc URL chuyển hướng
  await expect(page).toHaveURL(/.*posts\/.*/);
});
```

---

## 5. Tầng 4: Visual Regression Testing (Chống vỡ giao diện)

### Mục tiêu
Tự động chụp ảnh giao diện (pixel screenshot) và so sánh với ảnh chuẩn gốc. Nếu lập trình viên vô tình đổi CSS làm lệch nút 5px hoặc vỡ font chữ, hệ thống lập tức báo đỏ kèm ảnh so sánh khác biệt (diff map).

### Tích hợp ngay bằng Playwright Snapshot
Tạo file `apps/web/e2e/visual-regression.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';

test('Snapshot trang chủ Desktop', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  // So sánh toàn bộ trang với ảnh baseline
  await expect(page).toHaveScreenshot('homepage-desktop.png', { fullPage: true });
});

test('Snapshot Bảng điều khiển Quản trị (Admin)', async ({ page }) => {
  await page.goto('/admin/posts');
  await expect(page.locator('table')).toHaveScreenshot('admin-table.png');
});
```

Lệnh cập nhật ảnh gốc khi có cập nhật thiết kế chủ động:
```powershell
npx playwright test --update-snapshots
```

---

## 6. Tầng 5: Performance & Load Testing (Kiểm thử chịu tải)

### Mục tiêu
Kiểm tra khả năng chịu tải của Backend NestJS, PostgreSQL Pool và In-memory Cache khi có hàng ngàn người dùng truy cập đồng thời.

### Công nghệ khuyến nghị: k6 (Grafana)

### Cài đặt k6
- Windows: `winget install k6 --source winget`
- Mac: `brew install k6`
- Linux: `sudo apt-get install k6`

### Kịch bản kiểm thử tải: `tests/load/feed-and-market-stress.js`
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // Kịch bản tải dạng bậc thang (Spike & Load test)
  stages: [
    { duration: '30s', target: 50 },   // Khởi động với 50 người dùng đồng thời
    { duration: '1m', target: 200 },   // Tăng vọt lên 200 người
    { duration: '2m', target: 500 },   // Duy trì 500 người dùng liên tục
    { duration: '30s', target: 0 },    // Hạ nhiệt về 0
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],    // Tỷ lệ lỗi phải dưới 1%
    http_req_duration: ['p(95)<300'],  // 95% request phải phản hồi dưới 300ms
  },
};

export default function () {
  const BASE_URL = 'http://localhost:3001/api/v1';

  // 1. Kiểm tra API Ticker Thị trường (Có cache in-memory 15s)
  const marketRes = http.get(`${BASE_URL}/market/summary`);
  check(marketRes, {
    'market status 200': (r) => r.status === 200,
    'market duration < 100ms': (r) => r.timings.duration < 100,
  });

  // 2. Kiểm tra API Feed bài viết (Query PostgreSQL JOIN)
  const feedRes = http.get(`${BASE_URL}/posts/feed?limit=20&page=1`);
  check(feedRes, {
    'feed status 200': (r) => r.status === 200,
    'feed duration < 350ms': (r) => r.timings.duration < 350,
  });

  sleep(1);
}
```

### Chạy kiểm thử:
```powershell
k6 run tests/load/feed-and-market-stress.js
```

---

## 7. Tầng 6: Accessibility (A11y - Trợ năng WCAG)

### Mục tiêu
Đảm bảo website tài chính tuân thủ chuẩn WCAG 2.1 cấp độ AA (hỗ trợ người khiếm thị dùng Screen Reader, độ tương phản màu chuẩn, phím Tab dễ điều hướng).

### Cài đặt
```powershell
cd apps/web
npm install -D @axe-core/playwright
```

### Kịch bản kiểm tra: `apps/web/e2e/accessibility.spec.ts`
```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Audits', () => {
  test('Trang chủ đạt tiêu chuẩn WCAG 2.1 AA', async ({ page }) => {
    await page.goto('/');
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
```

---

## 8. Tầng 7: Security Scanning & Vulnerability Assessment

### Mục tiêu
Tự động rà quét các lỗ hổng bảo mật trong mã nguồn, thư viện dependency và giao thức HTTP trước khi đưa ra Internet.

### 1. Quét Dependency (SCA - Software Composition Analysis)
```powershell
# Quét lỗ hổng dependency
npm audit

# Quét sâu với Snyk (cần cài npm install -g snyk)
snyk test
```

### 2. Kiểm tra Header bảo mật HTTP
Sử dụng test script để xác nhận `helmet` backend đã kích hoạt đủ:
- `Content-Security-Policy`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security` (HSTS)
- `X-Content-Type-Options: nosniff`

---

## 9. Tầng 8: Resilience & Chaos Testing (Kiểm thử độ bền khi lỗi mạng/hạ tầng)

### Mục tiêu
Kiểm tra khả năng phục hồi của hệ thống khi dịch vụ bên thứ ba hoặc database gặp sự cố gián đoạn.

### Các kịch bản cần test:
1. **Third-party API Failure (Yahoo Finance / Binance API die):**
   - *Kỳ vọng:* `MarketService` ngắt kết nối sau 3500ms thông qua `AbortController`, trả về snapshot baseline lưu trữ trước đó. Server không bị crash hoặc treo luồng (hanging requests).
2. **PostgreSQL Connection Lost:**
   - *Kỳ vọng:* Backend ném lỗi HTTP 503 (Service Unavailable) rõ ràng, không lưu dữ liệu người dùng tạm bợ vào memory, tự động tái kết nối qua connection pool khi DB hồi phục.
3. **Mạng người dùng bị chập chờn (Flaky 3G):**
   - Dùng tính năng Network Throttling của Playwright để giả lập mạng 3G chậm chạp, kiểm tra các trạng thái Skeleton Loading và nút Retry hoạt động mượt mà.

---

## 10. Pipeline CI/CD Tự Động Hóa Mẫu (GitHub Actions)

Tạo file `.github/workflows/quality-gates.yml`:
```yaml
name: Quality & Testing Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  static-and-unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Typecheck Backend & Frontend
        run: |
          npm --prefix apps/api run build
          npm --prefix apps/web run typecheck

      - name: Run Backend Unit & Security Tests
        run: npm --prefix apps/api test

      - name: Run Frontend Unit Tests
        run: npm --prefix apps/web test

  e2e-and-visual-tests:
    needs: static-and-unit-tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run Playwright E2E & Mobile Tests
        run: npm --prefix apps/web run test:e2e
        env:
          CI: true

      - name: Upload Test Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: apps/web/playwright-report/
```

---

## 11. Checklist Sẵn Sàng Ra Mắt (Production Readiness Checklist)

Trước khi chính thức phát hành phiên bản Production, hãy đối soát danh sách này:

- [ ] **Typecheck & Linter:** Không còn bất kỳ lỗi TypeScript nào (`tsc --noEmit` thoát mã 0).
- [ ] **Security Tests:** Toàn bộ test suite bảo mật (`rate-limit`, `jwt`, `permission`, `email-verification`) pass 100%.
- [ ] **Mobile Visual Check:** Đã duyệt qua màn hình iPhone và Android, không bị tràn thanh cuộn ngang (`overflow-x`).
- [ ] **Sanitization:** Đã kiểm tra trình soạn thảo bài viết TipTap loại bỏ triệt để các thẻ `<script>` và `javascript:` URI.
- [ ] **Database Indexes:** Đã chạy migration đầy đủ các index hiệu năng trên Drizzle ORM (`postsTable`, `commentsTable`, `notificationsTable`).
- [ ] **Token Rotation:** Đã kiểm thử chức năng Đăng xuất và thu hồi Refresh Token trên DB.
- [ ] **Load Test Baseline:** Backend đáp ứng tối thiểu 200 RPS với độ trễ p95 < 300ms.
