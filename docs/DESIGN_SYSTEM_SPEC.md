# Báo Cáo Đánh Giá & Kế Hoạch Chuẩn Hóa Design System

> **Dự án:** Finance Community (MorningView)  
> **Phiên bản:** 1.0.0  
> **Mục tiêu:** Chuẩn hóa hệ thống thiết kế (Design System), thống nhất bảng màu Semantic Tokens, đồng bộ kích thước Component nguyên tử và tuân thủ tuyệt đối quy tắc 4-Point Grid theo tài liệu quy ước.  
> **Tham chiếu nền tảng:** `.agents/rules/ui_4pt_grid.md`

---

## 1. Tổng Quan Đánh Giá (Audit Summary)

Hệ thống giao diện hiện tại có nền tảng ban đầu tốt:
- Đã ứng dụng **Tailwind CSS v4** với `@theme` và `@custom-variant dark`.
- Xây dựng tầng Atomic UI trên nền tảng Accessible Primitives của `@radix-ui/react-*`.
- Phong cách trực quan mang hơi hướng cổng thông tin tài chính hiện đại (editorial/financial portal).

Tuy nhiên, **ở tầng kiến trúc và bảo trì (Systemic Design Integrity), hệ thống đang bộc lộ nhiều điểm đứt gãy lớn**:

| Hạng mục | Thực trạng | Đánh giá | Rủi ro |
| :--- | :--- | :---: | :--- |
| **Semantic Tokens** | Biến màu bị đảo tông giữa Light & Dark; thiếu token `--ring`. | ⚠️ Cần sửa | Chuyển đổi theme làm biến dạng màu nhận diện thương hiệu. |
| **Hardcoded Values** | Hơn 40+ component tự viết class hex và Tailwind cơ bản (`dark:bg-[#0b0f17]`, `border-slate-200`). | ⚠️ Cần sửa | Không thể re-theme toàn trang từ CSS variables. |
| **Component Harmony** | Form control lệch độ cao (`Input` 40px vs `Select`/`Button` 36px); fallback radius sai toán học. | ⚠️ Cần sửa | Giao diện bị so le khi đặt nút và ô nhập liệu cạnh nhau. |
| **4px Grid Compliance** | Xuất hiện nhiều class phân số (`1.5`, `2.5`, `3.5`) vi phạm quy chuẩn thiết kế. | ⚠️ Cần sửa | Phá vỡ nhịp điệu thị giác (visual rhythm). |
| **CSS Specificity** | `globals.css` chứa nhiều CSS cục bộ và `!important` cưỡng chế toàn cục. | ⚠️ Cần sửa | Khó debug, khó ghi đè style khi mở rộng component mới. |

---

## 2. Chi Tiết Các Lỗ Hổng Kỹ Thuật

### 2.1. Đảo ngược vai trò màu (Color Role Inversion) trong `globals.css`
* **Vấn đề:**
  * Tại `:root` (Light Mode): `--primary` là Slate Navy (`215 35% 20%`), `--accent` là Emerald Green (`160 84% 30%`).
  * Tại `.dark` (Dark Mode): `--primary` đổi thành Teal (`174 72% 38%`), `--accent` đổi thành Amber Gold (`38 92% 50%`).
  * Tại `.admin-light-mode`: Cả `--primary` lẫn `--accent` đều là Emerald Green (`160 84% 30%`).
* **Hậu quả:** Màu sắc thương hiệu bị đảo lộn theo theme thay vì chỉ điều chỉnh độ tương phản (luminance).

### 2.2. Bỏ qua Token và Hardcode màu sắc rải rác
* Rất nhiều component chính (như `AppShell.tsx`, `PostCard.tsx`, `EditorialHeroGrid.tsx`, `Header.tsx`, `TagsDirectoryView.tsx`) đang dùng:
  * Nền: `bg-slate-100 dark:bg-[#0b0f17]`, `bg-white dark:bg-[#111827]`, `bg-slate-100 dark:bg-[#162033]` thay vì `bg-background`, `bg-card`, `bg-surface`.
  * Viền: `border-slate-200 dark:border-[#253044]` thay vì `border-border`.
  * Chữ: `text-slate-950 dark:text-slate-100`, `text-slate-700 dark:text-slate-300` thay vì `text-foreground`, `text-muted-foreground`.
  * Accent/Action: `text-teal-700 dark:text-teal-400`, `text-teal-900` thay vì `text-primary` hoặc `text-accent`.

### 2.3. Lệch pha độ cao Form Controls & Sai số Fallback Radius
1. **Độ cao Controls:**
   * `Input.tsx`: `h-10` (40px).
   * `Select.tsx`: `h-9` (36px).
   * `Button.tsx` (kích thước `md`): `h-9` (36px).
   * **Chuẩn hóa cần đạt:** Mọi control cơ bản kích thước trung bình (`md`) phải có cùng chiều cao **40px (`h-10`)**.
2. **Fallback Border Radius:**
   * `globals.css` định nghĩa: `--radius-sm: 0.25rem` (4px), `--radius-md: 0.5rem` (8px), `--radius-lg: 0.75rem` (12px).
   * Các component lại viết fallback sai tỷ lệ:
     * `Button.tsx`: `rounded-[var(--radius-md,0.25rem)]` (0.25rem = 4px, lệch với biến 8px).
     * `Badge.tsx`: `rounded-[var(--radius-sm,0.125rem)]` (0.125rem = 2px, lệch với biến 4px).
     * `Dialog.tsx`: `rounded-[var(--radius-lg,0.375rem)]` (0.375rem = 6px, lệch với biến 12px).
     * `Input.tsx`: dùng trực tiếp `rounded-xl` (12px) không thông qua token.

### 2.4. Vi phạm 4-Point Grid
Tài liệu `.agents/rules/ui_4pt_grid.md` quy định không dùng các giá trị phân số của Tailwind cho spacing layout thông thường:
* `Input.tsx`: `space-y-1.5` (6px), `px-3.5` (14px).
* `Header.tsx`: `h-4.5 w-4.5` (18px), `-bottom-2.5` (-10px).
* `EditorialHeroGrid.tsx`: `gap-1.5` (6px), `min-h-[420px] sm:min-h-[460px]`.
* `Badge.tsx`: `py-0.5` (2px).

### 2.5. Ô nhiễm Specificity trong `globals.css`
* Lệnh ép toàn cục `svg.lucide, svg[class*="lucide-"] { stroke-width: 2.25px !important; }` tước bỏ quyền kiểm soát stroke của từng component icon con.
* Hơn 50 dòng CSS chọn cứng theo thuộc tính `aria-label` của trang Admin (`select[aria-label="Lọc loại nội dung"] option[value="COMMUNITY"] { color: #cbd5e1; }`) làm phình to file CSS chung của toàn ứng dụng.

---

## 3. Bản Đồ Chuẩn Hóa Thiết Kế (Target Design Specifications)

### 3.1. Bảng màu Semantic Tokens Chuẩn (Nhất quán tông thương hiệu)

| Token Name | Vai trò | Light Mode (`:root`) | Dark Mode (`.dark`) |
| :--- | :--- | :--- | :--- |
| `--background` | Nền canvas toàn trang | `210 25% 96%` (Slate-100 dịu mắt) | `220 36% 7%` (#0b0f17) |
| `--surface` | Nền thanh điều hướng / modal | `0 0% 100%` (Trắng) | `221 39% 11%` (#111827) |
| `--surface-elevated`| Nền dropdown / popover / card nổi | `0 0% 100%` (Trắng) | `219 36% 14%` (#162033) |
| `--card` | Nền thẻ bài viết / bảng | `0 0% 100%` (Trắng) | `221 39% 11%` (#111827) |
| `--foreground` | Màu chữ chính | `222 47% 11%` (#0f172a) | `210 40% 98%` (#f8fafc) |
| `--muted-foreground` | Màu chữ phụ, thời gian, mô tả | `215 25% 35%` (#475569) | `217 19% 65%` (#94a3b8) |
| `--border` | Viền ngăn cách card, ô nhập liệu | `214 20% 84%` (#cbd5e1) | `218 28% 21%` (#253044) |
| `--primary` | Màu nhận diện chính (Thương hiệu) | `168 80% 28%` (Forest Emerald) | `168 75% 42%` (Luminous Emerald) |
| `--primary-foreground`| Chữ trên nền Primary | `0 0% 100%` | `0 0% 100%` |
| `--accent` | Màu điểm nhấn / Tương tác phụ | `215 35% 20%` (Deep Slate Navy) | `215 25% 75%` (Muted Slate) |
| `--ring` | Vòng sáng focus accessibility | `168 80% 28%` | `168 75% 42%` |

> **Quy tắc:** Màu `--primary` giữ nguyên họ màu xanh ngọc lục bảo (Emerald) đại diện cho tài chính & tăng trưởng trên cả 2 theme, chỉ nâng sáng (Lightness) ở Dark mode để đảm bảo độ tương phản WCAG AA (4.5:1).

### 3.2. Chuẩn hóa kích thước Form Controls (Height & Radius Matrix)

| Kích thước | Chiều cao (Height) | Padding ngang | Font size | Border Radius | Áp dụng cho |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Small (`sm`)** | `h-8` (32px) | `px-3` (12px) | `text-xs` (12px) | `rounded-md` (8px) | Button sm, Input sm, Filter Chips |
| **Medium (`md`)** | **`h-10` (40px)** | `px-4` (16px) | `text-sm` (14px) | `rounded-md` (8px) | Button md, Input, Select (Mặc định) |
| **Large (`lg`)** | `h-12` (48px) | `px-6` (24px) | `text-base` (16px) | `rounded-lg` (12px) | Hero CTA Button, Search Input lớn |

### 3.3. Từ điển Thay thế Class (Refactoring Cheat Sheet)

```diff
- bg-slate-100 dark:bg-[#0b0f17]
+ bg-background

- bg-white dark:bg-[#111827]
+ bg-card

- border-slate-200 dark:border-[#253044]
+ border-border

- text-slate-950 dark:text-slate-100
+ text-foreground

- text-slate-600 dark:text-slate-400
+ text-muted-foreground

- text-teal-700 dark:text-teal-400
+ text-primary

- focus:ring-ring
+ focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
```

---

## 4. Kế Hoạch Triển Khai Chi Tiết (Execution Roadmap)

### Giai đoạn 1: Chuẩn hóa Tokens & Cấu hình CSS Cơ sở
- [ ] Cập nhật [globals.css](file:///d:/tools/finance-community/apps/web/app/globals.css):
  - Đồng bộ bảng màu HSL của `--primary` và `--accent` giữa `:root`, `.dark`, và `.admin-light-mode`.
  - Khai báo token `--color-ring: hsl(var(--ring));` trong khối `@theme`.
  - Chuẩn hóa các biến `--radius-*` và loại bỏ các fallback viết sai tỷ lệ trong code.
  - Xóa bỏ `stroke-width: 2.25px !important` toàn cục, chuyển sang truyền `strokeWidth={2}` mặc định nếu cần.
  - Chuyển toàn bộ các rule CSS `select[aria-label=...]` vào file module hoặc component cụ thể của trang Admin.

### Giai đoạn 2: Chuẩn hóa bộ Component Nguyên tử (UI Primitives)
- [ ] [Button.tsx](file:///d:/tools/finance-community/apps/web/components/ui/Button.tsx):
  - Cập nhật size `md` thành `h-10 px-4 text-sm`.
  - Thay `rounded-[var(--radius-md,...)]` bằng `rounded-md`.
  - Xóa bỏ các class màu cứng `ring-slate-600`, `ring-slate-400`, `ring-red-600`, thay bằng `ring-primary`, `ring-border`, `ring-danger`.
- [ ] [Input.tsx](file:///d:/tools/finance-community/apps/web/components/ui/Input.tsx):
  - Chuyển `space-y-1.5` thành `space-y-1` (4px).
  - Chuyển `px-3.5` thành `px-4` (16px) hoặc `px-3` (12px).
  - Chuyển `rounded-xl` thành `rounded-md` để đồng bộ hoàn toàn với Button và Select.
  - Chuyển nhãn label cứng `text-slate-800 dark:text-slate-200` sang `text-foreground`.
- [ ] [Select.tsx](file:///d:/tools/finance-community/apps/web/components/ui/Select.tsx):
  - Cập nhật trigger height từ `h-9` lên `h-10` (40px) khớp với `Input`.
  - Thay fallback radius bằng `rounded-md`.
- [ ] [Badge.tsx](file:///d:/tools/finance-community/apps/web/components/ui/Badge.tsx):
  - Thay `rounded-[var(--radius-sm,...)]` bằng `rounded-sm`.
  - Đổi các biến thể `success`, `warning`, `danger` từ mã màu cứng Tailwind (`bg-emerald-700`) sang class semantic: `bg-success text-white`, `bg-warning text-white`, `bg-danger text-white`.

### Giai đoạn 3: Refactor Các Layout & Navigation Components
- [ ] [AppShell.tsx](file:///d:/tools/finance-community/apps/web/components/layout/AppShell.tsx):
  - Thay `bg-slate-100 dark:bg-[#0b0f17]` bằng `bg-background`.
- [ ] [Header.tsx](file:///d:/tools/finance-community/apps/web/components/navigation/Header.tsx):
  - Sửa các icon `h-4.5 w-4.5` thành `h-4 w-4` hoặc `h-5 w-5`.
  - Sửa định vị phân số `-bottom-2.5` thành `-bottom-2` hoặc `-bottom-3`.
  - Thay các màu `text-teal-*`, `text-slate-*` bằng `text-primary`, `text-foreground`, `text-muted-foreground`.
- [ ] [Footer.tsx](file:///d:/tools/finance-community/apps/web/components/navigation/Footer.tsx):
  - Đồng bộ màu nền, viền và text theo semantic tokens.

### Giai đoạn 4: Refactor Các Component Nội Dung Cốt Lõi
- [ ] [PostCard.tsx](file:///d:/tools/finance-community/apps/web/components/content/PostCard.tsx):
  - Chuyển toàn bộ các mã viền và nền hex sang `border-border`, `bg-surface`, `text-foreground`, `text-primary`.
- [ ] [EditorialHeroGrid.tsx](file:///d:/tools/finance-community/apps/web/components/content/EditorialHeroGrid.tsx):
  - Dọn dẹp các class phân số `gap-1.5`, gộp padding và chiều cao tối thiểu theo thang 4px chuẩn (`min-h-[440px]`, `min-h-[480px]`).
- [ ] [CategoryFilterBar.tsx](file:///d:/tools/finance-community/apps/web/components/content/CategoryFilterBar.tsx) & [TagFilterBar.tsx](file:///d:/tools/finance-community/apps/web/components/content/TagFilterBar.tsx):
  - Thống nhất độ bo góc và màu hover theo tokens.

---

## 5. Tiêu Chuẩn Kiểm Thử & Nghiệm Thu (Acceptance Criteria)

1. **Kiểm tra trực quan (Visual & Theme Testing):**
   - Chuyển đổi qua lại giữa Light Mode và Dark Mode trên tất cả các trang: màu chủ đạo không bị nhảy sang màu khác, tương phản chữ đạt chuẩn WCAG AA.
   - Khi đặt `Button` và `Input` hoặc `Select` cạnh nhau trong form tìm kiếm, cạnh trên và dưới phải thẳng hàng 100% (cùng cao 40px).
2. **Kiểm tra mã nguồn (Static Code Analysis):**
   - Không còn class màu hex `dark:bg-[#...]` tự do trong thư mục `components/`.
   - Giảm thiểu tối đa các spacing phân số (`-1.5`, `-2.5`, `-3.5`) trong các component chính.
   - Chạy `npm run typecheck` thành công code 0.
   - Chạy `npm run test` (Vitest) toàn bộ component tests pass 100%.
