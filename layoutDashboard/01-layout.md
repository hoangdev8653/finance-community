# 01 — Layout Specification

## 1. Canvas

### Reference

- Reference image: 1536×1024 px.
- Thiết kế tối ưu cho viewport desktop từ 1280 px trở lên.
- Background toàn trang: `#FFFFFF` hoặc `#FCFDFD` rất nhẹ.
- Không dùng full-bleed màu nền mạnh.

## 2. Global shell

```text
┌──────────────────────────────────────────────────────────────────────┐
│                         TOP HEADER                                    │
├───────────────┬──────────────────────────────────────────────────────┤
│               │                                                      │
│   SIDEBAR     │                  MAIN CONTENT                         │
│   fixed       │                                                      │
│               │                                                      │
│               │                                                      │
│               │                                                      │
└───────────────┴──────────────────────────────────────────────────────┘
```

### Sidebar

- Width desktop: **232 px**.
- Position: fixed left `0`.
- Top: `0`.
- Height: `100vh`.
- Right border: `1 px solid #E8EDF0`.
- Background: `#FFFFFF`.
- Internal horizontal padding: `16 px`.
- Main nav starts khoảng `92 px` from top.
- Bottom account card sits gần đáy sidebar với `16–20 px` bottom margin.

### Main content

- Main content starts after sidebar.
- Desktop left inset after sidebar: khoảng `28–32 px`.
- Right inset: khoảng `24 px`.
- Max content width: flexible; dashboard nên tận dụng không gian còn lại.
- Main page padding top: khoảng `24–28 px` dưới header.

### Header

- Height: **68 px**.
- Fixed/sticky top.
- Background: white.
- Bottom border `1 px` `#E8EDF0`.
- Hamburger/menu icon ở vùng trái content.
- Search box ở phía phải.
- Notification bell kế bên.
- Avatar admin ở ngoài cùng phải.

## 3. Sidebar anatomy

### Brand block

- Position top-left.
- Logo mark: khoảng `32×32 px`.
- Brand title: `Finance Community`.
- Subtitle: `Admin Dashboard`.
- Brand title baseline gần logo center.
- Gap logo → text: `10–12 px`.

### Navigation

Mỗi item:

- Height: `40–44 px`.
- Border radius: `8 px`.
- Horizontal padding: `10–12 px`.
- Gap icon/text: `12 px`.
- Icon: `18–20 px`.
- Label: `14 px`.
- Weight: `500`.
- Text color default: `#334155`.

Active item:

- Background: `#ECFDF5` / gần `rgba(16,185,129,.08)`.
- Text + icon: `#059669` / `#16A34A`.
- Weight: `600`.
- Có thể có left indicator 2 px màu xanh lá.

### Nav groups

Theo reference nên chia nhóm:

- Không gian làm việc
- Nội dung
- Cộng đồng
- Phân loại nội dung
- Quản trị

Tên group:

- `11 px`
- uppercase
- `700`
- letter-spacing `0.12–0.16em`
- color `#94A3B8`

## 4. Page header

Khu vực page header gồm:

- Title: `Tổng quan`
- Subtitle: `Cái nhìn tổng quan về nền tảng`
- Date range picker bên phải.

### Title

- Font size: `26–28 px`.
- Line-height: `32–36 px`.
- Weight: `700`.
- Color: `#0F172A`.

### Subtitle

- Font size: `14 px`.
- Line-height: `20 px`.
- Weight: `400`.
- Color: `#64748B`.

### Date picker

- Width khoảng `210–220 px`.
- Height `36–40 px`.
- Border `#E2E8F0`.
- Radius `8 px`.
- Font `13–14 px`, weight `500`.

## 5. KPI row

Desktop: **4 columns**.

```text
[ KPI 1 ] [ KPI 2 ] [ KPI 3 ] [ KPI 4 ]
```

- Gap: `16–20 px`.
- Card height: khoảng `128–132 px`.
- Border radius: `10–12 px`.
- Border: `1 px solid #E8EDF0`.
- Background: `#FFFFFF`.
- Shadow: rất nhẹ.

Grid calculation:

```text
availableWidth = viewport - sidebar - pagePaddingLeft - pagePaddingRight
cardWidth = (availableWidth - 3 * gap) / 4
```

## 6. Analytics row

Desktop layout:

```text
┌────────────────────────────┬──────────────────────┬──────────────────┐
│ Lượt xem / Line chart      │ Phân bố nội dung     │ Hoạt động gần đây│
│                            │ Donut chart           │                  │
└────────────────────────────┴──────────────────────┴──────────────────┘
```

Tỷ lệ gợi ý:

- Left: `~46%`
- Center: `~25%`
- Right: `~29%`

Better CSS:

```css
grid-template-columns: minmax(0, 1.8fr) minmax(280px, 1fr) minmax(280px, 1.15fr);
```

- Gap: `16–20 px`.
- Card border/radius giống KPI.

## 7. Bottom row

```text
┌──────────────────────────────────────┬────────────────────┐
│ Bài học mới nhất                     │ Thao tác nhanh     │
│ table                                │                    │
└──────────────────────────────────────┴────────────────────┘
```

Trong reference, cột phải đồng thời chứa `Hoạt động gần đây` phía trên và `Thao tác nhanh` phía dưới.

Suggested desktop:

- Main table column: `~70%`
- Right utility column: `~30%`.

## 8. Container spacing

Áp dụng 4px grid:

- Page outer padding: `24 px` hoặc `28 px`.
- Section gap: `20–24 px`.
- Card internal padding: `16–20 px`.
- Major vertical rhythm: `24 px`.
- Minor vertical rhythm: `8 / 12 / 16 px`.

## 9. Z-index

- Header: `z-40`.
- Sidebar: `z-30`.
- Dropdown/popover: `z-50`.
- Modal: `z-60`.
