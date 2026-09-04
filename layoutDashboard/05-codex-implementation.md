# 05 — Codex Implementation Guide

## 1. Repository context

Repo:

`hoangdev8653/finance-community`

Frontend:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS 4
- Zustand
- TanStack Query
- Lucide React

Đây là các dependency đã có trong `apps/web/package.json`, nên ưu tiên dùng lại thay vì thêm thư viện UI mới.

## 2. Existing admin structure

Repo hiện đã có:

```text
apps/web/app/admin/
  layout.tsx
  page.tsx
  posts/
  learning/
  moderation/
  users/
  categories/
  audit-logs/
  feature-flags/
  settings/
```

và các component:

```text
apps/web/components/admin/
  AdminGuard.tsx
  AdminHeader.tsx
  AdminNav.tsx
  AdminPagination.tsx
  AdminPostsTable.tsx
  AdminSearchInput.tsx
  AdminContentTrendChart.tsx
  AdminUserGrowthChart.tsx
  AuditLogsTable.tsx
  ...
```

Không tạo một admin app mới. Refactor/compose từ cấu trúc hiện có.

## 3. Visual implementation priorities

### P0

1. Match global shell.
2. Match sidebar dimensions and active state.
3. Match typography.
4. Match KPI row.
5. Match analytics row.
6. Match latest lessons table.
7. Match right rail.

### P1

1. Micro interactions.
2. Responsive behavior.
3. Loading states.
4. Empty/error states.
5. Keyboard focus.

## 4. Suggested component tree

```text
AdminLayout
├── AdminHeader
│   ├── MenuButton
│   ├── AdminSearch
│   ├── NotificationButton
│   └── AdminAvatar
├── AdminSidebar
│   ├── Brand
│   ├── AdminNav
│   └── CurrentAdminCard
└── AdminDashboardPage
    ├── DashboardHeader
    │   ├── PageTitle
    │   └── DateRangePicker
    ├── DashboardKpiGrid
    │   ├── KpiCard
    │   ├── KpiCard
    │   ├── KpiCard
    │   └── KpiCard
    ├── DashboardAnalyticsGrid
    │   ├── ViewsAnalyticsCard
    │   ├── ContentDistributionCard
    │   └── RecentActivityCard
    └── DashboardBottomGrid
        ├── LatestLessonsCard
        └── QuickActionsCard
```

## 5. Data model mapping

Dashboard phải dùng data thật từ API, không hard-code số liệu reference.

Suggested mapping:

```text
Total lessons      → count published learning lessons
Total series       → count learning series/path
Users              → users count
Community posts    → community posts count
Views              → analytics/views endpoint
Content breakdown  → learning/community/other counts
Recent activity    → audit/activity feed
Latest lessons     → latest published/draft learning posts
Quick actions      → route-based navigation
```

## 6. Important product rule

Finance Community hiện tại là Learning + Community platform.

### Learning

- User MEMBER không được tạo Series.
- User MEMBER không được tạo Lesson.
- Learning chỉ do Admin/Editorial tạo và publish.

### Community

- MEMBER được tạo Community Post.
- Community Post nên đi qua moderation trước khi publish.

Dashboard phải phản ánh rule này. Vì vậy quick action `Tạo series` và `Tạo bài học` là admin/editorial action, không phải User action.

## 7. Routing

Dashboard root:

```text
/admin
```

Use existing `AdminGuard`.

Admin navigation nên route tới existing pages; không tạo duplicate pages.

## 8. Implementation details

### Tailwind

Ưu tiên utility classes, nhưng nếu dashboard cần nhiều token lặp lại thì tạo semantic utility/class trong admin-specific stylesheet.

Không hard-code quá nhiều inline styles.

### Charts

Repo hiện đã có chart components. Trước khi thêm chart library mới, tái sử dụng chart implementation hiện tại nếu đáp ứng được visual requirement.

### Icons

Use `lucide-react`.

### Typography

Kế thừa font variables từ root layout:

```text
--font-heading
--font-sans
--font-mono
```

## 9. Reference fidelity checklist

Codex phải self-check sau implementation:

- [ ] Sidebar width gần 232px.
- [ ] Header cao khoảng 68px.
- [ ] Main title khoảng 28px.
- [ ] KPI 4 cards desktop.
- [ ] KPI cards khoảng 128–132px height.
- [ ] Analytics 3-column desktop.
- [ ] Green primary chart.
- [ ] Donut chart ở giữa card.
- [ ] Recent activity ở right rail.
- [ ] Latest lessons table full-width left.
- [ ] Quick actions 2×3.
- [ ] Border 1px rất nhẹ.
- [ ] Shadow nhẹ.
- [ ] Radius 8–12px.
- [ ] Spacing theo 4px grid.
- [ ] Không dùng gradient mạnh.
- [ ] Không dùng dark background.
- [ ] Không thêm RSS/News widgets.
- [ ] Không có quick action cho MEMBER.

## 10. Definition of done

Trang `/admin` được xem là đạt khi:

1. Visual hierarchy giống reference.
2. Responsive từ desktop tới mobile.
3. Không phá `AdminGuard`.
4. Không bypass backend permissions.
5. Dùng data thật từ API hoặc typed mock adapter rõ ràng trong development.
6. Không tạo duplicated design system.
7. `npm run typecheck` pass.
8. Existing tests liên quan pass.
