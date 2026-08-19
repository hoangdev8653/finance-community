# 🎨 UI/UX Improvement Plan — Finance Community

> **Ngày tạo**: 2026-08-19
> **Đánh giá hiện tại**: 7/10 — Code sạch, kiến trúc tốt, nhưng visual design chưa "premium"
> **Mục tiêu**: Nâng lên 9/10 — Giao diện chuyên nghiệp, hiện đại, tạo ấn tượng mạnh

---

## 0. 🚨 Layout Architecture — VẤN ĐỀ NỀN TẢNG (Ưu Tiên Cao Nhất)

> **Đây là vấn đề cần sửa TRƯỚC tất cả cải thiện visual khác.**
> Layout không nhất quán sẽ khiến mọi polish khác trở nên vô nghĩa.

### 0.1 Vấn Đề Hiện Tại: Không Có Layout Wrapper Thống Nhất

Mỗi trang tự xử lý layout riêng, gây ra trải nghiệm navigation rời rạc:

| Trang | Layout hiện tại | Vấn đề |
|-------|----------------|--------|
| **Home** (`/`) | 3-column grid `max-w-[1280px]` + Sidebar + Right sidebar | Sidebar CHỈ có ở đây |
| **Dashboard** (`/dashboard`) | `<DashboardView>` render trực tiếp | Không container, không padding chuẩn |
| **Series** (`/series`) | `space-y-8` trực tiếp | Không container wrapper |
| **Admin** (`/admin`) | `max-w-6xl px-4 py-8` | Max-width khác với Home |
| **Login** (`/login`) | `<LoginForm>` render trực tiếp | Không padding-top, form dính header |
| **Profile** (`/profile`) | `<ProfileView>` trực tiếp | Tuỳ component tự xử lý |
| **Notifications** | `<NotificationsCenter>` trực tiếp | Không container |

**Hệ quả**:
- Content "nhảy" khi navigate giữa các trang (max-width, padding khác nhau)
- Sidebar chỉ tồn tại trên Home → user mất navigation context ở mọi trang khác
- User ở `/dashboard` muốn về Home phải click logo — không có sidebar navigation
- Root `layout.tsx` quá mỏng: chỉ `Header → {children} → MobileNavigation`

### 0.2 Giải Pháp: 3 Layout Patterns Thống Nhất

#### Pattern A: Sidebar Layout (Trang chính)
**Dùng cho**: Home, Dashboard, Series, Tags, Categories, Posts, Notifications, Search

```
┌─────────────────────────────────────────────┐
│                   Header                    │
├──────────┬──────────────────────┬────────────┤
│ Sidebar  │    Main Content      │   Right    │
│  260px   │     flexible         │  ~300px    │
│  sticky  │   max-w-[1280px]     │ (optional) │
│          │                      │            │
├──────────┴──────────────────────┴────────────┤
│              Mobile Bottom Nav              │
└─────────────────────────────────────────────┘
```

**Implementation**:
- Tạo `components/layout/AppShell.tsx`
- Props: `showRightSidebar?: boolean`, `rightSidebar?: ReactNode`
- Sidebar luôn hiển thị (desktop), ẩn trên mobile
- Right sidebar tuỳ chọn (Home: widgets, Post detail: TOC, others: ẩn)

```tsx
// components/layout/AppShell.tsx
export function AppShell({ children, rightSidebar, showRightSidebar = false }) {
  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar — luôn có trên desktop */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-20">
            <Sidebar />
          </div>
        </aside>

        {/* Main Content */}
        <main className={showRightSidebar ? 'lg:col-span-6' : 'lg:col-span-9'}>
          {children}
        </main>

        {/* Right Sidebar (optional) */}
        {showRightSidebar && (
          <aside className="hidden lg:block lg:col-span-3">
            {rightSidebar}
          </aside>
        )}
      </div>
    </div>
  );
}
```

#### Pattern B: Centered Layout (Auth pages)
**Dùng cho**: Login, Register, Forgot Password, Email Verification

```
┌─────────────────────────────────────────────┐
│                   Header                    │
│                                             │
│            ┌────────────────┐               │
│            │   Form Card    │               │
│            │   max-w-md     │               │
│            │   centered     │               │
│            │   vertical     │               │
│            └────────────────┘               │
│                                             │
└─────────────────────────────────────────────┘
```

**Implementation**:
- Tạo `components/layout/CenteredLayout.tsx`
- Hoặc dùng route group `(auth)/layout.tsx` có sẵn

```tsx
// components/layout/CenteredLayout.tsx
export function CenteredLayout({ children, maxWidth = 'max-w-md' }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className={`w-full ${maxWidth}`}>
        {children}
      </div>
    </div>
  );
}
```

#### Pattern C: Full-width Admin Layout (đã có, cần chuẩn hoá)
**Dùng cho**: Admin, Moderation

```
┌─────────────────────────────────────────────┐
│                   Header                    │
├─────────────────────────────────────────────┤
│         AdminNav / ModNav (top tabs)        │
├─────────────────────────────────────────────┤
│              Main Content                   │
│              max-w-6xl centered              │
└─────────────────────────────────────────────┘
```

**Hiện tại**: Admin layout (`apps/web/app/admin/layout.tsx`) đã implement pattern này tương đối tốt.
**Cần**: Áp dụng tương tự cho Moderation page.

### 0.3 Kế Hoạch Refactor Layout

#### Bước 1: Tạo shared layout components
| File | Mô tả |
|------|--------|
| `components/layout/AppShell.tsx` | Sidebar + Main + Optional Right sidebar |
| `components/layout/CenteredLayout.tsx` | Centered card container cho auth |
| `components/layout/PageHeader.tsx` | Reusable page header (icon + title + subtitle + actions) |

#### Bước 2: Tạo route group layouts
| Route Group | Layout | Pages |
|-------------|--------|-------|
| `(main)/layout.tsx` | `<AppShell>` | Home, Dashboard, Series, Tags, Categories, Posts, Notifications, Search, Profile |
| `(auth)/layout.tsx` | `<CenteredLayout>` | Login, Register |
| `admin/layout.tsx` | Giữ nguyên (đã có) | Admin pages |
| `moderation/layout.tsx` | Tương tự Admin | Moderation pages |

#### Bước 3: Refactor từng page
| Page | Thay đổi |
|------|----------|
| `app/page.tsx` | Bỏ Sidebar + 3-column grid code → dùng `<AppShell showRightSidebar>` |
| `app/dashboard/page.tsx` | Wrap trong route group `(main)` → tự có Sidebar |
| `app/series/page.tsx` | Wrap trong route group `(main)` → tự có Sidebar |
| `app/notifications/page.tsx` | Wrap trong route group `(main)` → tự có Sidebar |
| `app/(auth)/login/page.tsx` | Dùng `<CenteredLayout>` |
| `app/(auth)/register/page.tsx` | Dùng `<CenteredLayout>` |
| `app/profile/[username]/page.tsx` | Wrap trong route group `(main)` |

#### Bước 4: Chuẩn hoá PageHeader
Hiện tại mỗi trang tự viết page header riêng với style gần giống nhau. Tạo reusable component:

```tsx
// components/layout/PageHeader.tsx
export function PageHeader({ icon: Icon, label, title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
      <div className="space-y-1">
        {Icon && label && (
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-medium">
            <Icon className="h-4 w-4" />
            <span className="uppercase tracking-widest">{label}</span>
          </div>
        )}
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground max-w-2xl">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
```

### 0.4 Files Cần Tạo / Sửa

| Loại | File | Mô tả |
|------|------|--------|
| **[NEW]** | `components/layout/AppShell.tsx` | Layout wrapper chính với Sidebar |
| **[NEW]** | `components/layout/CenteredLayout.tsx` | Layout centered cho auth pages |
| **[NEW]** | `components/layout/PageHeader.tsx` | Reusable page header component |
| **[NEW]** | `app/(main)/layout.tsx` | Route group layout áp dụng AppShell |
| **[MODIFY]** | `app/page.tsx` | Bỏ inline Sidebar + grid, dùng AppShell |
| **[MODIFY]** | `app/(auth)/login/page.tsx` | Wrap trong CenteredLayout |
| **[MODIFY]** | `app/(auth)/register/page.tsx` | Wrap trong CenteredLayout |
| **[MODIFY]** | `app/dashboard/page.tsx` | Move vào route group `(main)` |
| **[MODIFY]** | `app/series/page.tsx` | Move vào route group `(main)` |
| **[MODIFY]** | `app/notifications/page.tsx` | Move vào route group `(main)` |
| **[MODIFY]** | `app/profile/[username]/page.tsx` | Move vào route group `(main)` |
| **[MODIFY]** | `components/navigation/Sidebar.tsx` | Bỏ fixed width, để AppShell quản lý |

**Ước tính effort**: 1-2 ngày (chủ yếu là di chuyển file + bỏ inline layout code)

**Lưu ý quan trọng**: Refactor layout KHÔNG thay đổi bất kỳ logic, API call, hay component nào. Chỉ là tổ chức lại cách các page được wrap.

---

## 1. 🎨 Design System — Nâng Cấp `globals.css`

### 1.1 🔴 Đổi Primary Color: Emerald Green → Deep Blue

#### Quyết Định
**Đổi primary từ Emerald Green `hsl(160 84% 39%)` sang Deep Blue `hsl(217 91% 50%)`.**

#### Lý Do
1. **Xung đột văn hoá**: Trong thị trường chứng khoán Việt Nam, 🟢 **xanh lá = giảm giá** (tiêu cực). Dùng làm primary color cho finance platform tạo cảm giác "bearish" vô thức.
2. **Chuẩn ngành**: VnDirect, SSI, Vietstock, Bloomberg, TradingView — tất cả dùng xanh dương. User tài chính đã quen blue = "đáng tin cậy".
3. **Khớp brand tone**: Platform đang dùng ngôn ngữ institutional ("Analyst", "Editorial", "Research", "Intelligence") — Blue phù hợp hơn Green.
4. **Green vẫn được giữ**: Dùng cho `--success` states ("+12% profit", "Published successfully") — đúng ngữ cảnh.

#### Color Palette Mới

```css
/* ========== apps/web/app/globals.css ========== */

:root {
  /* PRIMARY — Deep Blue (ĐỔI TỪ EMERALD) */
  --primary: 217 91% 50%;              /* Royal Blue — #1D6FE5 */
  --primary-foreground: 0 0% 100%;

  /* ACCENT — Indigo (MỚI) */
  --accent: 245 82% 67%;               /* Indigo — cho highlights, badges */
  --accent-foreground: 0 0% 100%;

  /* SUCCESS — Emerald Green (GIỮ — chỉ cho success states) */
  --success: 142 76% 36%;

  /* Các semantic colors khác — GIỮ NGUYÊN */
  --warning: 38 92% 50%;
  --danger: 0 84.2% 60.2%;
  --info: 199 89% 48%;

  /* GRADIENT TOKENS (MỚI) */
  --gradient-primary: linear-gradient(135deg, hsl(217 91% 50%), hsl(230 80% 60%));
  --gradient-accent: linear-gradient(135deg, hsl(245 82% 67%), hsl(280 70% 60%));
  --gradient-surface: linear-gradient(180deg, hsl(var(--surface)), hsl(var(--background)));
  --gradient-hero: linear-gradient(135deg, hsl(217 91% 15%), hsl(230 60% 25%));

  /* GLOW EFFECTS (MỚI) */
  --glow-primary: 0 0 20px hsla(217, 91%, 50%, 0.3);
  --glow-accent: 0 0 20px hsla(245, 82%, 67%, 0.3);
}

.dark {
  /* PRIMARY — sáng hơn trong dark mode để contrast tốt */
  --primary: 217 91% 60%;

  --glow-primary: 0 0 30px hsla(217, 91%, 50%, 0.2);
}
```

#### Bảng So Sánh Trước / Sau

| Token | Trước (Emerald) | Sau (Deep Blue) | Ghi chú |
|-------|-----------------|-----------------|---------|
| `--primary` | `160 84% 39%` 🟢 | `217 91% 50%` 🔵 | Đổi |
| `--success` | `142 76% 36%` 🟢 | `142 76% 36%` 🟢 | Giữ nguyên |
| `--secondary` | Giữ | Giữ | Không đổi |
| `--danger` | Giữ | Giữ | Không đổi |
| `--accent` | Chưa có | `245 82% 67%` 🟣 | Mới |

#### Files Cần Sửa

| File | Thay đổi |
|------|----------|
| `apps/web/app/globals.css` | Đổi `--primary`, thêm `--accent`, gradients, glows |
| `apps/web/components/ui/Button.tsx` | Sửa `focus-visible:ring-emerald-600` → `focus-visible:ring-blue-600` |
| `apps/web/components/ui/Badge.tsx` | Kiểm tra hardcoded `bg-emerald-700` |
| Tất cả components dùng `text-emerald-*` hoặc `bg-emerald-*` hardcoded | Grep & replace → dùng `text-primary` / semantic tokens |

**Effort**: Thấp — chủ yếu đổi CSS variables + grep replace vài hardcoded colors.

### 1.2 Nâng Shadow System
**Vấn đề**: Chỉ dùng `shadow-2xs` → cards phẳng, không có depth.

**Cải thiện**:
```css
--shadow-card: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);
--shadow-card-hover: 0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04);
--shadow-elevated: 0 20px 40px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.06);
--shadow-glow: 0 0 30px hsla(217, 91%, 50%, 0.15);
```

**File**: `apps/web/app/globals.css`

### 1.3 Animation Tokens
**Vấn đề**: Không có animation utilities ngoài `transition-colors`.

**Cải thiện**:
```css
/* Animation keyframes */
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slide-in-right { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
@keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 0 0 hsla(160,84%,39%,0.4); } 50% { box-shadow: 0 0 0 8px hsla(160,84%,39%,0); } }

/* Utility classes */
.animate-fade-in { animation: fade-in 0.3s ease-out; }
.animate-fade-up { animation: fade-up 0.4s ease-out; }
.animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
.animate-scale-in { animation: scale-in 0.2s ease-out; }
.animate-shimmer { animation: shimmer 2s linear infinite; background-size: 200% 100%; }

/* Staggered children animation */
.stagger-children > * { animation: fade-up 0.4s ease-out both; }
.stagger-children > *:nth-child(1) { animation-delay: 0ms; }
.stagger-children > *:nth-child(2) { animation-delay: 60ms; }
.stagger-children > *:nth-child(3) { animation-delay: 120ms; }
.stagger-children > *:nth-child(4) { animation-delay: 180ms; }
.stagger-children > *:nth-child(5) { animation-delay: 240ms; }
```

**File**: `apps/web/app/globals.css`

### 1.4 Dark Mode Nâng Cao
**Vấn đề**: Dark mode chỉ invert cơ bản, chưa có "premium dark" feel.

**Cải thiện**:
```css
.dark {
  /* Thêm subtle gradient background thay vì flat color */
  --background: 240 10% 3.9%;
  --surface: 240 6% 8%;           /* Nhẹ hơn background */
  --surface-elevated: 240 5% 12%; /* Nhẹ hơn surface */
  
  /* Border tinh tế hơn */
  --border: 240 4% 18%;
  
  /* Primary glow mạnh hơn trong dark mode */
  --glow-primary: 0 0 30px hsla(160, 84%, 39%, 0.2);
}
```

**File**: `apps/web/app/globals.css`

---

## 2. 🏠 Home Page — Cần "Wow Factor"

### 2.1 Hero Section
**Vấn đề**: Trang chủ đi thẳng vào feed, không có hero section → thiếu ấn tượng đầu tiên.

**Cải thiện**: Thêm hero section phía trên feed:
- Headline gradient text lớn: "Financial Intelligence, Curated by Experts"
- Subtitle mô tả platform
- 2 CTA buttons: "Explore Research" + "Join Community"
- Background: subtle mesh gradient hoặc animated grid pattern
- Stats bar nhỏ: "1.2K+ Articles | 500+ Members | 50+ Series"

**File**: Tạo mới `apps/web/components/content/HeroSection.tsx`, sửa `apps/web/app/page.tsx`

### 2.2 Featured / Trending Posts Carousel
**Vấn đề**: Tất cả posts hiển thị như nhau, không có highlight.

**Cải thiện**: Thêm section "Featured Analyses" phía trên feed:
- Carousel 3-4 featured posts với cover image lớn
- Gradient overlay trên ảnh với title + author
- Auto-play carousel hoặc manual navigation dots
- Tiêu chí: bài có nhiều views/reactions nhất trong tuần

**File**: Tạo mới `apps/web/components/content/FeaturedCarousel.tsx`

### 2.3 Right Sidebar Động
**Vấn đề**: Right sidebar chỉ có 2 text box tĩnh → lãng phí không gian.

**Cải thiện**: Biến thành dynamic widgets:
- **Trending Tags** — tag cloud với kích thước theo popularity
- **Top Contributors** — avatar + tên 5 tác giả active nhất
- **Recent Activity** — "User X vừa đăng bài Y" real-time feed
- **Quick Stats** — tổng bài viết, members, series đang chạy
- **Newsletter CTA** — form đăng ký nhận email digest

**Files**: Tạo mới trong `apps/web/components/content/`:
- `TrendingTags.tsx`
- `TopContributors.tsx`
- `QuickStatsWidget.tsx`

---

## 3. 📝 PostCard — Cải Thiện Trải Nghiệm Feed

### 3.1 Cover Image Thumbnail
**Vấn đề**: PostCard không hiển thị cover image → feed đơn điệu toàn text.

**Cải thiện**:
- Hiển thị thumbnail cover image bên trái (horizontal card) hoặc phía trên (vertical card)
- Nếu không có cover → hiển thị gradient placeholder với category icon
- Lazy loading + blur placeholder

**File**: `apps/web/components/content/PostCard.tsx`

### 3.2 Author Info Thân Thiện
**Vấn đề**: Author hiển thị là `Analyst #abc12345` (UUID cắt) → không ai nhận ra ai.

**Cải thiện**:
- Hiển thị avatar + display name + username thay vì UUID
- Cần fetch author info kèm theo post (hoặc expand trong API response)
- Tooltip hover hiển thị mini profile card

**File**: `apps/web/components/content/PostCard.tsx`, có thể cần sửa API response type

### 3.3 Engagement Metrics Trên Card
**Vấn đề**: Card chỉ hiển thị view count, thiếu reaction count và comment count.

**Cải thiện**: Thêm footer với:
- 👍 Like count
- 💬 Comment count
- 👁 View count
- 🔖 Bookmark button (khi implement bookmarks)

**File**: `apps/web/components/content/PostCard.tsx`

### 3.4 Hover Effects Premium
**Vấn đề**: Chỉ đổi border color khi hover — quá đơn giản.

**Cải thiện**:
```
Hover → border-primary/40 
      + shadow-card-hover (elevation tăng)
      + slight translateY(-2px) 
      + title đổi sang primary color
      + cover image scale(1.02) với overflow hidden
```

**File**: `apps/web/components/content/PostCard.tsx`

---

## 4. 🧭 Navigation — Polish

### 4.1 Header Micro-Interactions
**Cải thiện**:
- Logo: thêm subtle hover animation (icon rotate hoặc color pulse)
- Theme toggle: thêm rotate animation khi chuyển đổi (Sun → Moon xoay)
- Search bar: thêm focus glow effect
- Notification bell: thêm animation "ring" nhẹ khi có notification mới

**File**: `apps/web/components/navigation/Header.tsx`

### 4.2 Sidebar Cải Thiện
**Cải thiện**:
- Active state: thêm left border accent thay vì chỉ bg color
- Hover: thêm subtle scale effect
- Section headers: thêm icon nhỏ bên cạnh
- Collapsible sections (click header để thu gọn)
- Badge count cho Notifications, Drafts

**File**: `apps/web/components/navigation/Sidebar.tsx`

### 4.3 Mobile Navigation Mở Rộng
**Vấn đề**: Chỉ 5 items, thiếu Dashboard, Notifications. Không có hamburger menu.

**Cải thiện**:
- Thêm hamburger menu button → mở slide-over sidebar panel
- Bottom nav: thêm notification badge dot khi có unread
- Swipe gestures: swipe up để xem thêm options
- Account item: hiển thị avatar thay vì generic icon khi đã login

**File**: `apps/web/components/navigation/MobileNavigation.tsx`

---

## 5. 📄 Post Detail Page — Nâng Cấp Reading Experience

### 5.1 Cover Image Full-Width
**Cải thiện**:
- Cover image full-width với gradient overlay fade-to-background
- Title overlay lên ảnh (kiểu Medium) hoặc ảnh hero full bleed
- Parallax scroll nhẹ cho cover image

**File**: `apps/web/components/content/PostCoverMedia.tsx`

### 5.2 Table of Contents (Sidebar)
**Cải thiện**:
- Parse headings từ body content
- Hiển thị TOC sticky ở right sidebar (thay 2 text box tĩnh hiện tại)
- Highlight heading đang visible khi scroll
- Click heading → smooth scroll đến section

**File**: Tạo mới `apps/web/components/content/TableOfContents.tsx`

### 5.3 Author Card Chi Tiết
**Vấn đề**: Author chỉ hiển thị `Analyst #uuid` — không personal.

**Cải thiện**: Thêm author card phía dưới bài viết:
- Avatar lớn + display name + bio
- Follow button
- Link đến profile
- Số bài viết + followers

**File**: Tạo mới `apps/web/components/content/AuthorCard.tsx`

### 5.4 Related Posts
**Cải thiện**: Section "Related Analyses" cuối bài viết:
- 3-4 bài cùng category hoặc cùng tags
- Card nhỏ với thumbnail + title + date

**File**: Tạo mới `apps/web/components/content/RelatedPosts.tsx`

### 5.5 Social Share Bar
**Cải thiện**: Floating share bar (hoặc cuối bài):
- Copy link, Twitter/X, Facebook, LinkedIn, Telegram
- Share count (nếu track)

**File**: Tạo mới `apps/web/components/content/ShareBar.tsx`

---

## 6. 🔐 Auth Pages — Cải Thiện Visual

### 6.1 Login/Register Page Layout
**Vấn đề**: Form đơn giản trên nền trắng, không có visual interest.

**Cải thiện**:
- Split layout: trái là illustration/branding panel, phải là form
- Branding panel: gradient background + platform stats + testimonials carousel
- Hoặc: full-page gradient background với form card center có glassmorphism effect
- Animated background: subtle particle effect hoặc moving mesh gradient

**Files**: Sửa `apps/web/app/(auth)/login/page.tsx`, `apps/web/app/(auth)/register/page.tsx`

### 6.2 Form Interactions
**Cải thiện**:
- Input focus: border-primary + subtle glow shadow
- Password strength indicator thanh màu (đỏ → vàng → xanh)
- Success state: green checkmark animation sau đăng ký thành công
- Social login buttons: icon branded colors (Google rainbow, Facebook blue)

**File**: `apps/web/components/auth/LoginForm.tsx`, `RegisterForm.tsx`

---

## 7. 📊 Dashboard — Premium Feel

### 7.1 KPI Cards Visual
**Cải thiện**:
- Mỗi KPI card có icon riêng với background gradient tròn
- Số liệu lớn bold + trend indicator (↑ +12% so với tháng trước)
- Hover: card elevate + show sparkline chart mini
- Animated counter khi load (số chạy từ 0 lên giá trị thực)

**File**: `apps/web/components/dashboard/DashboardMetricsBar.tsx`

### 7.2 Activity Chart
**Cải thiện**:
- Thêm activity heatmap hoặc line chart cho views/posts theo thời gian
- Dùng lightweight chart lib: `recharts` hoặc `@visx/xychart`
- Tuần này vs tuần trước comparison

**File**: Tạo mới `apps/web/components/dashboard/ActivityChart.tsx`

---

## 8. 🧩 UI Components — Polish Chung

### 8.1 Skeleton Shimmer Effect
**Vấn đề**: Skeleton chỉ là block tĩnh.

**Cải thiện**:
- Thêm shimmer gradient animation chạy qua skeleton
- Content-aware skeleton (skeleton PostCard giống shape thật)

**File**: `apps/web/components/ui/Skeleton.tsx`

### 8.2 Toast Notifications
**Cải thiện**:
- Slide-in animation từ phải hoặc trên
- Icon theo variant (✓ success, ⚠ warning, ✕ error)
- Progress bar auto-dismiss
- Stacking khi nhiều toast

**File**: `apps/web/components/ui/Toast.tsx`

### 8.3 Empty States
**Cải thiện**:
- Thêm illustrations (simple SVG) cho mỗi empty state
- Mỗi context có illustration khác nhau (empty feed, empty bookmarks, no results...)
- Subtle animation cho illustration

**File**: `apps/web/components/feedback/EmptyState.tsx`

### 8.4 Loading States
**Cải thiện**:
- Logo animation (Finance Pulse logo pulse/breathe) thay vì generic spinner
- Skeleton matching real content layout
- Progressive loading: hiển thị partial content sớm

---

## 9. 📱 Responsive & Mobile

### 9.1 Touch-Friendly Targets
- Đảm bảo tất cả clickable elements ≥ 44x44px trên mobile
- Swipe gestures: swipe left để bookmark, swipe right để share
- Pull-to-refresh cho feed

### 9.2 Mobile-Optimized Cards
- Stack layout (vertical) trên mobile thay vì horizontal
- Larger touch targets cho reaction buttons
- Sticky bottom bar cho post actions (like, comment, share, bookmark)

### 9.3 Bottom Sheet Modals
- Trên mobile: dùng bottom sheet thay vì center modal
- Drag handle để dismiss
- Smooth spring animation

---

## 10. ⚡ Performance UX

### 10.1 Image Optimization
- Next.js `<Image>` component với `blurDataURL` placeholder
- Responsive `sizes` attribute cho các breakpoints
- WebP/AVIF format tự động

### 10.2 Infinite Scroll Cải Thiện
- Intersection Observer thay vì "Load More" button
- Scroll position restore khi back navigation
- Virtual scrolling cho feed rất dài (>100 posts)

### 10.3 Prefetching
- Prefetch post detail khi hover PostCard (Next.js Link prefetch)
- Prefetch next page data khi scroll gần cuối

---

## 📊 Ma Trận Ưu Tiên UI

| # | Hạng mục | Impact | Effort | Ưu tiên |
|---|----------|--------|--------|---------|
| **0** | **Layout Architecture refactor (AppShell, CenteredLayout, route groups)** | **Rất Cao** | **Trung bình** | **🔴🔴 NỀN TẢNG — Làm đầu tiên** |
| 1 | Animation tokens + hover effects (globals.css) | Cao | Thấp | 🔴 Cao |
| 2 | PostCard: cover image + author info + metrics | Cao | Trung bình | 🔴 Cao |
| 3 | Shadow system nâng cấp | Cao | Thấp | 🔴 Cao |
| 4 | Home Hero Section | Cao | Trung bình | 🔴 Cao |
| 5 | Skeleton shimmer effect | Trung bình | Thấp | 🔴 Cao |
| 6 | Dark mode premium | Trung bình | Thấp | 🟡 TB |
| 7 | Login/Register visual upgrade | Trung bình | Trung bình | 🟡 TB |
| 8 | Right sidebar dynamic widgets | Trung bình | Trung bình | 🟡 TB |
| 9 | Featured posts carousel | Trung bình | Trung bình | 🟡 TB |
| 10 | Post detail: TOC + Author card | Trung bình | Trung bình | 🟡 TB |
| 11 | Dashboard KPI animations + chart | Trung bình | Trung bình | 🟡 TB |
| 12 | Header micro-interactions | Thấp | Thấp | 🟡 TB |
| 13 | Sidebar polish (active state, badges) | Thấp | Thấp | 🟡 TB |
| 14 | Related Posts section | Thấp | Trung bình | 🟢 Thấp |
| 15 | Social Share Bar | Thấp | Thấp | 🟢 Thấp |
| 16 | Mobile bottom sheet modals | Thấp | Trung bình | 🟢 Thấp |
| 17 | Virtual scrolling | Thấp | Cao | 🟢 Thấp |
| 18 | Empty state illustrations | Thấp | Trung bình | 🟢 Thấp |

---

## 🗺️ Đề Xuất Thực Hiện Theo Đợt

### Đợt 0 — Layout Foundation (1-2 ngày) ⚠️ LÀM ĐẦU TIÊN
Nền tảng bắt buộc trước khi làm bất kỳ cải thiện visual nào:
1. Tạo `AppShell.tsx` (Sidebar + Main + Optional Right sidebar)
2. Tạo `CenteredLayout.tsx` (Auth pages)
3. Tạo `PageHeader.tsx` (Reusable page header)
4. Tạo route group `(main)/layout.tsx` áp dụng AppShell
5. Refactor tất cả pages: bỏ inline layout code, dùng shared layouts
6. Đảm bảo Sidebar hiển thị nhất quán trên tất cả trang chính
7. Chuẩn hoá max-width, padding, spacing xuyên suốt app

### Đợt 1 — Quick Wins (1-2 ngày)
Impact lớn, effort nhỏ. Làm xong sẽ thấy khác biệt rõ rệt:
1. Thêm animation keyframes + utility classes vào `globals.css`
2. Nâng shadow system
3. PostCard hover effects (elevation + translateY)
4. Skeleton shimmer animation
5. Dark mode tinh chỉnh

### Đợt 2 — Visual Overhaul (3-5 ngày)
Thay đổi lớn về visual:
1. Home Hero Section
2. PostCard redesign (cover image, author info, engagement metrics)
3. Login/Register page visual upgrade (dùng CenteredLayout + branding panel)
4. Right sidebar dynamic widgets
5. Header micro-interactions

### Đợt 3 — Reading Experience (2-3 ngày)
Nâng trải nghiệm đọc bài:
1. Post detail: Table of Contents sidebar (dùng AppShell rightSidebar)
2. Author Card cuối bài
3. Related Posts section
4. Share Bar
5. Cover image full-width hero

### Đợt 4 — Dashboard & Polish (2-3 ngày)
1. KPI cards animation + trend indicators
2. Activity chart
3. Toast improvements
4. Empty state illustrations
5. Mobile navigation improvements

---

> **Ghi chú**: Đợt 0 (Layout) là nền tảng — nếu bỏ qua, tất cả cải thiện sau đều bị ảnh hưởng.
> Tất cả cải thiện không cần thay đổi backend hay database. Chỉ là CSS, component markup, layout restructuring, và thêm một vài component mới.
