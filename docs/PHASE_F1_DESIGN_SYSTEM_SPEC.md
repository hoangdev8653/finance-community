# PHASE F1 — DESIGN SYSTEM SPECIFICATION

**Target**: Design Tokens, Typography, Colors, & Layout System  
**Mode**: STRICT SPECIFICATION  
**Date**: 2026-08-15  
**Status**: APPROVED & LOCKED FOR FRONTEND IMPLEMENTATION  

---

## 1. Color System Rationale & Semantic Tokens

The color system is calculated to convey **financial authority, seriousness, and editorial legibility**. It avoids saturated neon accents or generic SaaS blue tones.

- **Primary Brand Color**: Deep Emerald (`#059669` / HSL `160 84% 39%`) — Symbolizes financial growth, stability, and trust.
- **Secondary Accent**: Financial Slate (`#0f172a` / HSL `222 47% 11%`) — Solid structural grounding.
- **Surface Contrast**: High contrast neutral tones (Slate/Zinc family) preventing eye fatigue during extended reading.

### HSL Design Tokens (CSS Variables)

```css
:root {
  /* Light Theme Tones */
  --background: 0 0% 100%;             /* #ffffff */
  --foreground: 222.2 84% 4.9%;        /* #020817 */
  
  --surface: 210 40% 98%;              /* #f8fafc */
  --surface-elevated: 0 0% 100%;       /* #ffffff */
  
  --muted: 210 40% 96.1%;              /* #f1f5f9 */
  --muted-foreground: 215.4 16.3% 46.9%;/* #64748b */
  
  --border: 214.3 31.8% 91.4%;         /* #e2e8f0 */
  --input: 214.3 31.8% 91.4%;
  
  --primary: 160 84% 39%;              /* Emerald #059669 */
  --primary-foreground: 0 0% 100%;
  
  --secondary: 222.2 47.4% 11.2%;      /* Navy #0f172a */
  --secondary-foreground: 210 40% 98%;
  
  --success: 142 76% 36%;              /* #16a34a */
  --success-foreground: 0 0% 100%;
  
  --warning: 38 92% 50%;               /* #f59e0b */
  --warning-foreground: 0 0% 100%;
  
  --danger: 0 84.2% 60.2%;             /* #ef4444 */
  --danger-foreground: 0 0% 100%;
  
  --info: 199 89% 48%;                 /* #0ea5e9 */
  --info-foreground: 0 0% 100%;
  
  --radius: 0.375rem;                  /* 6px max default */
}

.dark {
  /* Rich Dark Tones (Zinc/Slate #09090b baseline) */
  --background: 240 10% 3.9%;          /* #09090b */
  --foreground: 0 0% 98%;              /* #fafafa */
  
  --surface: 240 5.9% 10%;             /* #18181b */
  --surface-elevated: 240 3.7% 15.9%;  /* #27272a */
  
  --muted: 240 3.7% 15.9%;             /* #27272a */
  --muted-foreground: 240 5% 64.9%;    /* #a1a1aa */
  
  --border: 240 3.7% 15.9%;            /* #27272a */
  --input: 240 3.7% 15.9%;
  
  --primary: 160 84% 39%;              /* Emerald #059669 */
  --primary-foreground: 0 0% 100%;
  
  --secondary: 240 4.8% 95.9%;         /* #f4f4f5 */
  --secondary-foreground: 240 5.9% 10%;
  
  --success: 142 70% 45%;
  --warning: 38 92% 50%;
  --danger: 0 72% 51%;
  --info: 199 89% 48%;
}
```

---

## 2. Typography System

The typography architecture uses a **Dual-Font Pairing**:
- **Editorial Headings**: `Newsreader` (or `Merriweather` / `Playfair Display`) — Imparts prestige, editorial weight, and financial journalism feel.
- **UI & Controls**: `Inter` (or `Plus Jakarta Sans`) — Clean, highly legible sans-serif for UI controls, navigation, and data tables.
- **Financial Tickers & Numbers**: `JetBrains Mono` — Tabular figures for stock codes, prices, percentages, and timestamps.

| Typography Token | Font Family | Size | Weight | Line Height | Letter Spacing | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | Editorial Serif | `2.5rem` (40px) | `700 Bold` | `1.15` | `-0.02em` | Main Landing / Featured Title |
| **Heading 1 (H1)** | Editorial Serif | `2.0rem` (32px) | `700 Bold` | `1.20` | `-0.01em` | Post Title / Page Title |
| **Heading 2 (H2)** | Editorial Serif / UI Sans | `1.5rem` (24px) | `600 SemiBold`| `1.25` | `-0.01em` | Article Section Headings |
| **Heading 3 (H3)** | UI Sans | `1.25rem` (20px)| `600 SemiBold`| `1.30` | `0` | Sub-sections / Card Titles |
| **Body Large** | UI Sans / Serif | `1.125rem`(18px)| `400 Regular` | `1.65` | `0` | Editorial Reading Lead Paragraph |
| **Body Base** | UI Sans | `1.0rem` (16px) | `400 Regular` | `1.60` | `0` | Standard Body Content / Comments |
| **Body Small** | UI Sans | `0.875rem`(14px)| `400 Regular` | `1.50` | `0` | Card Description / Secondary text|
| **Caption** | UI Sans | `0.75rem` (12px)| `400 Regular` | `1.40` | `0.01em` | Image Captions / Timestamps |
| **Label** | UI Sans | `0.875rem`(14px)| `500 Medium`  | `1.20` | `0` | Form Input Labels / Buttons |
| **Metadata / Mono** | Tabular Mono | `0.75rem` (12px)| `500 Medium`  | `1.20` | `0.02em` | Ticker Tags / Audit Codes |

---

## 3. Spacing Scale (4px / 8px Grid Baseline)

```
space-1  :  4px  (0.25rem)   - Tight icon/text gap
space-2  :  8px  (0.5rem)    - Compact padding / badge gap
space-3  : 12px  (0.75rem)   - Input internal padding
space-4  : 16px  (1.0rem)    - Card internal padding / Standard gap
space-6  : 24px  (1.5rem)    - Section gap / Grid gap
space-8  : 32px  (2.0rem)    - Card container gap
space-12 : 48px  (3.0rem)    - Page block margin
space-16 : 64px  (4.0rem)    - Main layout vertical section spacing
```

---

## 4. Border Radius System

To prevent generic "toy-like" roundness, radii are strictly constrained:

```css
--radius-sm : 0.125rem; /* 2px  - Badges, Table Rows */
--radius-md : 0.25rem;  /* 4px  - Buttons, Inputs, Cards */
--radius-lg : 0.375rem; /* 6px  - Modals, Popovers */
--radius-xl : 0.5rem;   /* 8px  - Maximum container radius */
--radius-full: 9999px;  /* Avatars only! Never for content cards */
```

---

## 5. Shadow System

Shadows are restricted to floating layers to prevent muddy card layouts:

- `none`: Default for all content cards, article containers, and inline blocks. Borders (`border-slate-200`) define hierarchy.
- `shadow-sm`: Used strictly for dropdown menus, select options, hover states on interactive buttons.
- `shadow-md`: Used strictly for floating modals, dialog overlays, and slide-over panels.
- `shadow-lg`: Used strictly for global toast notifications.

---

## 6. Responsive Breakpoints & Layout Grid Architecture

```
Breakpoint    Min-Width    Target Device                 Grid Layout Policy
sm            640px        Mobile Landscape / Phablet   Single Column Stack
md            768px        Tablet Portrait               2-Column Responsive Flow
lg            1024px       Tablet Landscape / Laptop     3-Column (Sidebar + Main + Widgets)
xl            1280px       Desktop                       12-Column Grid (Max Content Width: 1280px)
2xl           1536px       Large Monitors                Centered 12-Column Container
```

### Main Page Grid Allocation (Desktop `xl` 1280px)
- **Navigation Header**: Fixed full-width top bar (`h-16`).
- **Left Column (3 cols / 280px)**: Primary Navigation Sidebar / Category Selector.
- **Center Column (6 cols / 680px)**: Primary Feed / Editorial Article Reader.
- **Right Column (3 cols / 320px)**: Market Trends, Recommended Series, Top Authors, Community Rules.
