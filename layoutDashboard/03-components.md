# 03 — Component-by-Component UI Specification

## A. Brand / Sidebar

### A1. Logo block

**Visual**

- Green geometric book/layers mark.
- Khoảng `32×32 px`.
- Text title `Finance Community`, Lexend, `14 px`, weight `600`.
- Subtitle `Admin Dashboard`, Source Sans 3, `12 px`, weight `400`.
- Brand text màu `#0F172A`; subtitle `#64748B`.

### A2. Hamburger

- `Menu` 18–20 px.
- Color `#334155`.
- Button hit area `36×36 px`.
- Không có nền ở trạng thái thường; hover có `#F8FAFC`.

### A3. Navigation

Reference item order:

```text
Tổng quan
Bài học
Series
Danh mục
Chủ đề
Bài viết cộng đồng
Người dùng
Bình luận
Phản hồi
Thông báo
Báo cáo
AI Editorial
Media
Cấu hình
```

Mỗi item:

- icon 18 px
- label 14 px
- weight 500
- vertical center
- 40–44 px height
- radius 8 px

### A4. Current admin account

Bottom card:

- Width gần full sidebar.
- Height `64–72 px`.
- Border `1 px` `#E5E7EB`.
- Radius `10 px`.
- Avatar khoảng `32×32 px`.
- Name `13 px`, weight `600`.
- Role `12 px`, color `#64748B`.
- Chevron/down icon ở far right.

---

## B. Header

### B1. Search

- Width khoảng `248 px`.
- Height `36 px`.
- Radius `8 px`.
- Search icon 17 px.
- Placeholder `Tìm kiếm...` 13 px.
- Shortcut chip bên phải `⌘ K` hoặc `Ctrl K`.
- Shortcut chip font `11 px` monospace.

### B2. Notification

- Bell 20 px.
- Small red notification badge `16–18 px`.
- Badge position: top-right.
- Number font `10–11 px`, weight `700`.

### B3. Admin avatar

- `32×32 px`.
- Round `9999 px`.
- Green circle.
- Initials `HH`.
- Text white, weight `600`, size `12 px`.

---

## C. Page heading

```text
Tổng quan
Cái nhìn tổng quan về nền tảng
```

Title: `28px / 700 / Lexend`.
Subtitle: `14px / 400 / Source Sans 3`.
Gap title-subtitle: `4px`.

Date picker:

- right aligned
- calendar icon
- date range
- chevron-down

---

## D. KPI cards

### KPI 1 — Tổng bài học

- Label: `Tổng bài học`
- Value: `1,248`
- Green book icon.
- Change: `↗ 12.5%`
- Helper: `so với tuần trước`
- Mini sparkline green.

### KPI 2 — Tổng series

- Label `Tổng series`
- Value `156`
- Blue layers icon.
- Change `↗ 8.2%`
- Blue sparkline.

### KPI 3 — Người dùng

- Label `Người dùng`
- Value `12,589`
- Purple users icon.
- Change `↗ 15.3%`
- Purple sparkline.

### KPI 4 — Bài viết cộng đồng

- Label `Bài viết cộng đồng`
- Value `432`
- Orange chat icon.
- Change `↗ 9.1%`
- Orange sparkline.

### KPI internal layout

```text
┌──────────────────────────────────────┐
│ [ICON]    Label                      │
│           1,248                      │
│           ↗ 12.5% so với tuần trước │
│                             /\/\_/   │
└──────────────────────────────────────┘
```

KPI value phải nổi bật hơn label tối thiểu 2 cấp.

---

## E. Views analytics card

Title: `Lượt xem`.

Top line:

- `89,235` — 24 px / 700.
- Positive delta `↗ 18.6%`.
- Dropdown `7 ngày` ở góc phải.

Chart:

- Line chart smooth.
- Primary line green.
- Stroke 2 px.
- Point radius 3–4 px.
- Area fill gradient rất nhẹ green → transparent.
- Grid line dotted.
- Y-axis: `0`, `10K`, `20K`, `30K`, `40K`.
- X-axis: `20/05` → `26/05`.
- Labels 11–12 px.
- Chart top padding `12–16 px`.

Không làm chart quá đậm; mục tiêu là dashboard readability.

---

## F. Distribution donut card

Title: `Phân bố nội dung`.

Donut:

- Center aligned.
- Size khoảng `150–170 px`.
- Stroke thickness khoảng `25–30 px`.
- Center text `Tổng` 13 px.
- Center number `1,404` 20 px / 700.

Legend:

```text
● Bài học             1,248 (88.9%)
● Series                156 (11.1%)
● Bài viết cộng đồng   432 (30.7%)
● Khác                  68 (4.8%)
```

Lưu ý dữ liệu reference có tổng/percentage mang tính minh họa. Khi implement phải bind dữ liệu thật, không hard-code.

Legend item:

- dot 8 px
- title 13 px / 600
- value 12 px / 400
- vertical gap 12–14 px

---

## G. Recent activity

Card title: `Hoạt động gần đây`.

Mỗi row:

- Icon bubble `38–40 px`.
- Text stack.
- Primary: 13 px / 600.
- Secondary: 12–13 px / 400.
- Timestamp: 11–12 px.
- Row vertical padding `10–12 px`.

Ví dụ types:

1. Bài học mới được xuất bản
2. Series mới được tạo
3. Bài viết cộng đồng mới
4. Người dùng mới đăng ký
5. Cập nhật hệ thống

Icon bubble có màu theo loại activity.

Bottom CTA:

- `Xem tất cả hoạt động →`
- Full width outline button.
- Height `34–36 px`.

---

## H. Latest lessons table

Card title: `Bài học mới nhất`.

CTA right: `Xem tất cả`.

### Header row

Columns:

```text
TIÊU ĐỀ
SERIES
TÁC GIẢ
TRẠNG THÁI
NGÀY TẠO
...
```

Header:

- 11 px.
- Weight 700.
- Uppercase.
- Letter-spacing `0.06–0.08em`.
- Color `#94A3B8`.

### Body row

- Height khoảng `56–64 px`.
- Bottom border `#EEF2F4`.
- Thumbnail `48×36 px` hoặc `48×40 px`.
- Border radius `6 px`.
- Title 13–14 px / 600.
- Secondary fields 13 px / 400.
- Ellipsis menu 18 px.

### Row examples

```text
[thumbnail] 7 nguyên tắc quản lý tài chính cá nhân
           Quản lý tài chính cá nhân
           Hoàng Huy
           [Đã xuất bản]
           26/05/2025
                                            ⋯
```

Rows must support keyboard focus.

---

## I. Quick actions

Card title: `Thao tác nhanh`.

6 buttons in 2×3 grid.

```text
[Tạo bài học] [Tạo series] [Tạo danh mục]
[Tạo bài viết] [AI trợ lý]   [Upload media]
```

Button tile:

- height `64–70 px`.
- border 1 px `#E5E7EB`.
- radius `8 px`.
- icon 20–22 px.
- label 12 px / 500.
- icon centered above text.

Trong kiến trúc sản phẩm mới, chỉ Admin/Editorial được phép có `Tạo bài học` và `Tạo series`.

---

## J. Empty / loading / error

### Loading

- Use skeleton rectangles.
- Không dùng spinner cho toàn dashboard nếu có thể stream partial UI.
- Skeleton nền `#F1F5F9`.

### Empty

- Icon 32–40 px.
- Heading 14–16 px / 600.
- Description 12–13 px.
- CTA optional.

### Error

- Bố cục giống empty nhưng accent red.
- Có nút `Thử lại`.
- Không làm toàn trang đỏ.
