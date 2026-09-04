# 02 — Design Tokens

## 1. Typography

Repo hiện tại đã dùng **Lexend** cho heading và **Source Sans 3** cho body. Dashboard nên giữ đúng hướng này.

### Font families

```css
--font-heading: 'Lexend', sans-serif;
--font-sans: 'Source Sans 3', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Type scale

| Token | Size | Line-height | Weight | Usage |
|---|---:|---:|---:|---|
| display-sm | 28px | 36px | 700 | Page title |
| heading-sm | 18px | 24px | 700 | Card section title |
| body-lg | 16px | 24px | 400/500 | Main value or prominent text |
| body-md | 14px | 20px | 400/500 | Navigation, metadata |
| body-sm | 13px | 18px | 400/500 | Secondary metadata |
| caption | 12px | 16px | 400/500 | Chart labels, status |
| overline | 11px | 16px | 700 | Sidebar group labels |
| kpi-value | 24–26px | 32px | 700 | KPI numbers |

### Heading behavior

- Heading dùng Lexend.
- Body dùng Source Sans 3.
- Không dùng font-weight `800` cho mọi title; chỉ dùng khi cần nhấn mạnh.
- Số liệu KPI phải có `font-variant-numeric: tabular-nums`.

## 2. Color palette

### Base

```text
background      #FFFFFF
surface         #FFFFFF
surface-subtle  #F8FAFC
text-primary    #0F172A
text-secondary  #64748B
text-tertiary   #94A3B8
border           #E5E7EB
border-subtle   #EEF2F4
```

### Brand green

```text
primary-700     #047857
primary-600     #059669
primary-500     #10B981
primary-100     #D1FAE5
primary-50      #ECFDF5
```

Use green cho:

- active navigation
- positive trend
- primary CTA
- Learning identity

### Secondary chart accents

```text
blue            #3B82F6
blue-soft       #EFF6FF
purple          #8B5CF6
purple-soft     #F5F3FF
orange          #F59E0B
orange-soft     #FFF7ED
red             #EF4444
red-soft        #FEF2F2
```

Không dùng các màu này làm background lớn; chỉ dùng làm accents.

## 3. KPI icon container

- Size: `48×48 px`.
- Circle: `9999 px`.
- Learning icon background: `#E8F8F1`.
- Series icon background: `#EAF2FF`.
- Users icon background: `#F2ECFF`.
- Community icon background: `#FFF1E2`.

Icon:

- `22–24 px`.
- Stroke `2–2.25`.

## 4. Card

```css
background: #FFFFFF;
border: 1px solid #E8EDF0;
border-radius: 12px;
box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
```

Hover card chỉ dùng khi card clickable:

```css
box-shadow: 0 4px 14px rgba(15,23,42,.06);
transform: translateY(-1px);
```

Không dùng shadow đậm.

## 5. Inputs / buttons

### Small control

- Height `36 px`.
- Font `13–14 px`.
- Radius `8 px`.
- Border `#E2E8F0`.

### Primary button

- Background `#059669`.
- Hover `#047857`.
- Text white.
- Height `36–40 px`.
- Radius `8 px`.
- Weight `600`.

### Outline button

- Background white.
- Border `#D9E1E7`.
- Text `#334155`.

## 6. Status badge

### Published

- Background `#ECFDF5`.
- Text `#047857`.
- Border `#BBF7D0`.

### Draft

- Background `#FFF7ED`.
- Text `#C2410C`.
- Border `#FED7AA`.

### Pending review

- Background `#EFF6FF`.
- Text `#2563EB`.
- Border `#BFDBFE`.

### Hidden / rejected

- Background `#FEF2F2`.
- Text `#B91C1C`.
- Border `#FECACA`.

Badge:

- Height `24 px`.
- Padding `4px 8px`.
- Radius `6 px`.
- Font `12 px`.
- Weight `600`.

## 7. Iconography

Library: **Lucide React** — repo hiện đã dùng `lucide-react`.

Guidelines:

- Default size `18 px`.
- Header icons `20 px`.
- KPI icons `22–24 px`.
- Stroke width `2`.
- Không trộn nhiều icon style khác nhau.

Suggested mappings:

```text
Dashboard       LayoutDashboard
Lessons         BookOpen
Series          Layers3
Categories      FolderTree
Topics          Tags
Community       MessageSquare
Users           Users
Comments        MessageCircle
Feedback        MessageSquareText
Notifications   Bell
Reports         ChartNoAxesColumnIncreasing
AI Editorial    Sparkles
Media           Images
Settings        Settings2
Search          Search
Menu            Menu
Calendar        CalendarDays
Chevron         ChevronDown / ChevronRight
More            MoreHorizontal
```
