# UI & Design System Rules: Strict 4-Point Grid Standard

When creating or modifying any Page, Component, Layout, or CSS rule in this project, you MUST strictly adhere to the **4-Point Grid System** and the established Design System rules below.

---

## 1. Core Principles of the 4-Point Grid

Every measurement in CSS and Tailwind classes **MUST be an integer multiple of 4 pixels**.
Never use odd numbers, arbitrary decimals, or non-divisible fractional steps (e.g. `11px`, `13px`, `15px`, `25px`, `34px`, `h-4.5`, `w-4.5`, `p-3.5`, `gap-2.5`, `px-4.5`).

### Allowed Spacing & Sizing Scale:
| Tailwind Class | Pixels | Divisible by 4? | Allowed Usage |
| :--- | :--- | :--- | :--- |
| `0` | 0px | ✅ Yes | Margin, padding, gap, radius |
| `1` | 4px | ✅ Yes | Fine-grain gaps, icon margins |
| `2` | 8px | ✅ Yes | Tight padding, small gaps |
| `3` | 12px | ✅ Yes | Badge padding, medium gaps |
| `4` | 16px | ✅ Yes | Standard card padding, gutters |
| `5` | 20px | ✅ Yes | Card padding, icon dimensions (`h-5 w-5`) |
| `6` | 24px | ✅ Yes | Layout spacing, section headers |
| `8` | 32px | ✅ Yes | Large section padding, big icons |
| `10` | 40px | ✅ Yes | Button heights, input heights (`h-10`) |
| `12` | 48px | ✅ Yes | Large container gaps |
| `16` | 64px | ✅ Yes | Header height (`h-16`) |
| `20` | 80px | ✅ Yes | Hero padding, banner heights |
| `24` | 96px | ✅ Yes | Page section padding |

### ❌ Strictly Prohibited:
- No fractional Tailwind values for layout: `p-0.5` (2px), `p-1.5` (6px), `p-2.5` (10px), `p-3.5` (14px), `p-4.5` (18px), `gap-1.5` (6px), `gap-2.5` (10px).
- No arbitrary non-4 pixel values: `text-[11px]`, `text-[13px]`, `text-[15px]`, `text-[25px]`, `h-[38px]`, `w-[35px]`.

---

## 2. Typography Standard

Always use the standard Tailwind typography scale (which aligns to 4pt/line-height multiples):

| Tailwind Class | Font Size | Line Height |
| :--- | :--- | :--- |
| `text-xs` | 12px (Bội số của 4) | 16px (h-4) |
| `text-sm` | 14px | 20px (h-5) |
| `text-base` | 16px (Bội số của 4) | 24px (h-6) |
| `text-lg` | 18px | 28px (h-7) |
| `text-xl` | 20px (Bội số của 4) | 28px (h-7) |
| `text-2xl` | 24px (Bội số của 4) | 32px (h-8) |
| `text-3xl` | 28px or 30px | 36px (h-9) |
| `text-4xl` | 36px (Bội số của 4) | 40px (h-10) |

- **Font Weight Rule:**
  - Default text must never be faint or `font-light` (300).
  - Use `font-normal` (400) or `font-medium` (500) for body text.
  - Use `font-semibold` (600) or `font-bold` (700) for interactive elements, badges, navigation, and titles.

---

## 3. Positioning & Centering Rules

- **Absolute Vertical Centering:**
  Never use hardcoded pixel offsets like `top-2.5` or `top-3.5`.
  Always use:
  ```html
  <div className="absolute left-3 top-1/2 -translate-y-1/2" />
  ```
- **Horizontal Centering:**
  Always use:
  ```html
  <div className="absolute left-1/2 -translate-x-1/2" />
  ```

---

## 4. Theme & Color Rules

- Every component MUST support both **Light Mode** and **Dark Mode** seamlessly.
- Dark mode variant MUST be driven by `@custom-variant dark (&:where(.dark, .dark *));`.
- High contrast is mandatory:
  - Light mode: `text-slate-900`, `text-slate-800`, `text-slate-700`, `bg-white`, `border-slate-200`.
  - Dark mode: `dark:text-slate-100`, `dark:text-slate-200`, `dark:text-slate-300`, `dark:bg-slate-900`, `dark:border-slate-800`.
