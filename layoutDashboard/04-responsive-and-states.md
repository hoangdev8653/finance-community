# 04 — Responsive, Interaction & Component States

## 1. Breakpoints

Repo dùng Tailwind CSS 4. Có thể map:

```text
< 640      mobile
640–859    tablet-small
860–1023   tablet / compact desktop
1024–1279  desktop
1280+      large desktop
```

Nếu project đang có breakpoint custom `860px`, ưu tiên giữ breakpoint đó để tránh tạo inconsistency.

## 2. Desktop 1280+

- Sidebar: visible, 232 px.
- Header: 68 px.
- KPI: 4 columns.
- Analytics: 3 columns.
- Table + right column: 2-column layout.

## 3. Width 1024–1279

- Sidebar có thể thu gọn thành 72–80 px.
- KPI vẫn 4 columns nếu đủ room; nếu card quá hẹp thì chuyển 2×2.
- Analytics: 2 columns; recent activity full-width hoặc right rail.
- Search có thể giảm xuống 200 px.

## 4. Width 860–1023

- Sidebar collapsed.
- KPI: 2×2.
- Analytics: 1–2 columns tùy width.
- Right rail xuống dưới.
- Table chuyển thành horizontal scroll.

## 5. Mobile < 860

- Sidebar hidden; mở bằng drawer.
- Header chỉ giữ menu, notifications, avatar.
- Search chuyển thành icon button hoặc full-width row.
- Page heading stack dọc.
- Date picker full width.
- KPI 1 column ở mobile nhỏ; 2 columns nếu còn đủ 340px/card.
- Charts full width.
- Distribution legend nằm dưới donut.
- Activity full width.
- Table có horizontal scrolling hoặc chuyển sang card list.

## 6. Hover

Navigation:

```text
background #F8FAFC
color      #0F172A
```

Buttons:

- subtle darkening of current background.
- transition `150ms ease`.

Cards:

- hover shadow chỉ với cards interactive.

## 7. Focus

Keyboard focus phải nhìn thấy rõ:

```css
outline: 2px solid rgba(5, 150, 105, .28);
outline-offset: 2px;
```

Không dùng `outline: none` mà không có replacement.

## 8. Active / pressed

Buttons có thể giảm nhẹ brightness/scale:

```text
scale: 0.99
```

Không dùng animation lớn.

## 9. Tooltips

Cho icon-only button:

- Delay ~300ms.
- Font 12px.
- Radius 6px.
- Background `#0F172A`.
- Text white.

## 10. Dropdowns

- White surface.
- Border `#E2E8F0`.
- Radius 8px.
- Shadow subtle.
- Item height 36–40px.
- Hover background `#F8FAFC`.

## 11. Accessibility

- Contrast text/body phải đủ rõ.
- Tất cả icon button có `aria-label`.
- Bảng có semantic `<table>`.
- Nav dùng `<nav>`.
- Page main dùng `<main>`.
- Card title dùng heading phù hợp hierarchy.
- Status badge không chỉ dựa vào màu; luôn có text.
