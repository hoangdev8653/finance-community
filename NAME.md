# ☕ BREWSEVEN — Bộ Nhận Diện Thương Hiệu Chính Thức

> **Quyết định thương hiệu:** Thay thế tên cũ (_MorningView / Finance Pulse_) bằng **BrewSeven**.

---

## 📌 1. Thông Tin Nhận Diện Cốt Lõi

- **Tên thương hiệu (Brand Name):** **BrewSeven** _(hoặc viết hoa: **BREWSEVEN**)_
- **Icon / Biểu tượng viết tắt:** **Br7** _(hoặc B7 — sử dụng cho Favicon, App Icon, Monogram)_
- **Tên hiển thị Website (Website Title):**
  - `BrewSeven — Chưng cất Tri thức, Nâng tầm Cuộc sống`
  - _(Phiên bản chi tiết: `BrewSeven — Nền tảng Học tập & Phong cách sống: Tài chính, Thể thao & Kỹ năng`)_
- **Quy tắc tiêu đề trang con (Title Template):** `%s | BrewSeven`
- **Tên miền mục tiêu (Domains):**
  - `brewseven.vn` _(Ưu tiên số 1 cho thị trường Việt Nam)_
  - `brewseven.com` / `brewseven.io`

---

## 🌟 2. Triết Lý & Câu Chuyện Thương Hiệu

- **BREW:**
  - Biểu tượng của sự **chưng cất, tinh lọc những giá trị tinh hoa nhất** (như cách pha một ly cà phê hảo hạng buổi sớm mai hay ủ một bình trà thượng phẩm).
  - Kế thừa trọn vẹn cảm giác thư thái, thói quen đời thường của một "tách cà phê tri thức" mỗi ngày.
- **SEVEN (Số 7):**
  - Gắn liền với con số may mắn của Founder.
  - **7 ngày trong tuần:** Thói quen học tập, rèn luyện đều đặn không gián đoạn (Thứ 2 đến Chủ nhật).
  - **7 nấc thang hoàn thiện bản thân:**
    1. _Tài chính vững vàng (Wealth & Investment)_
    2. _Thể lực bền bỉ (Fitness, Sports & Health)_
    3. _Trí tuệ sáng suốt (Mindset & Knowledge)_
    4. _Kỷ luật thép (Discipline & Habits)_
    5. _Kỹ năng thực chiến (Practical Life Skills)_
    6. _Tâm trí an yên (Peace of Mind)_
    7. _Tự do đích thực (Ultimate Freedom)_

---

## 📣 3. Khẩu Hiệu Chính Thức (Slogans / Taglines)

- **Slogan chính:**  
  👉 _BrewSeven — Chưng cất tri thức, nâng tầm cuộc sống._
- **Slogan định vị:**  
  👉 _BrewSeven — 7 nấc thang làm chủ cuộc đời: Tài chính, Thể thao & Phong cách sống._
- **Slogan hành động:**  
  👉 _Mỗi ngày một tách tri thức cùng BrewSeven._

---

## ⚙️ 4. Cấu Trúc Mã Nguồn — Single Source of Truth (SSOT)

Toàn bộ tên thương hiệu, logo alt, biểu tượng, slogans, email liên hệ và tên các ban chuyên môn được tập trung tại một file hằng số duy nhất:
👉 **`apps/web/lib/constants/brand.ts`**

```typescript
export const BRAND = {
  name: 'BrewSeven',
  shortName: 'BrewSeven',
  code: 'Br7',
  domain: 'brewseven.vn',
  fallbackUrl: 'https://brewseven.vn',

  slogan: 'Mỗi ngày một tách tri thức cùng BrewSeven.',
  sloganShort: 'Mỗi ngày một tách tri thức',
  sloganCore: 'BrewSeven — Chưng cất tri thức, nâng tầm cuộc sống.',
  sloganPositioning: 'BrewSeven — Nền tảng học tập & phong cách sống: Tài chính, Thể thao & Kỹ năng sống.',

  editorialDesk: 'Ban Biên Tập BrewSeven',
  expertDesk: 'Chuyên Gia BrewSeven',
  intelligenceBadge: 'BrewSeven Intelligence • Verified Research',
  studioName: 'BrewSeven Studio',
  adminName: 'BrewSeven Admin',

  emails: {
    editorial: 'editorial@brewseven.vn',
    support: 'support@brewseven.vn',
    partners: 'partners@brewseven.vn',
  },
} as const;
```

> **Ghi chú bảo trì:** Sau này khi muốn đổi tên thương hiệu hoặc slogan, bạn **chỉ cần chỉnh sửa duy nhất file `apps/web/lib/constants/brand.ts`**. Toàn bộ Header, Footer, Sidebar, Admin, Auth, Layout, Metadata SEO, từ điển i18n, thông tin liên hệ và chính sách pháp lý sẽ tự động cập nhật đồng bộ!

