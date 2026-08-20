---
trigger: always_on
---

# UI & Design System Rules: 4-Point Grid Foundation

When creating or modifying any Page, Component, Layout, or CSS rule in this project, you MUST follow the established Design System and use the **4px Grid as the primary spacing and layout rhythm**.

The 4px Grid is a **design-system foundation**, not an absolute mathematical restriction for every CSS property.

---

## 1. Core 4px Grid Principle

### Primary Rule

All spacing and layout values SHOULD use the 4px grid whenever reasonably possible.

Preferred values:

```text
0
4
8
12
16
20
24
28
32
36
40
48
56
64
72
80
96

This applies primarily to:

padding
margin
gap
space-x
space-y
section spacing
component spacing
layout gutters
grid spacing
positioning offsets
component dimensions
container spacing
Design Principle

Prefer:

4px
8px
12px
16px
20px
24px
32px
40px
48px
64px

over arbitrary values such as:

7px
11px
13px
17px
19px
23px
25px
31px
37px

The goal is visual consistency and predictable rhythm, not mathematical rigidity.

2. 4px Grid Priority

Use the following priority when choosing values.

MUST

Use the 4px grid whenever practical for:

padding
margin
gap
section spacing
layout spacing
repeated component spacing
SHOULD

Prefer the 4px grid for:

width
height
positioning
component dimensions
card dimensions
input heights
button heights
icon containers
avatar containers
border radius
MAY

Use non-4px values when required by:

typography
accessibility
optical alignment
browser behavior
native UI constraints
third-party components
responsive behavior
precise visual design requirements

When using a non-4px value, it should be intentional rather than arbitrary.

3. Preferred Tailwind Spacing Scale

Use the standard Tailwind spacing scale where it aligns with the 4px grid.

Tailwind	Pixels	Preferred Usage
0	0px	No spacing
1	4px	Fine spacing
2	8px	Tight spacing
3	12px	Small spacing
4	16px	Standard spacing
5	20px	Medium component spacing
6	24px	Section/component spacing
7	28px	Larger component spacing
8	32px	Large spacing
9	36px	Large component spacing
10	40px	Button/input/component sizing
12	48px	Large layout spacing
14	56px	Major layout spacing
16	64px	Header/section sizing
20	80px	Hero/major section spacing
24	96px	Large section spacing

Prefer existing Tailwind utilities over arbitrary values.

Example:

<div className="p-4 gap-6">

is preferred over:

<div className="p-[16px] gap-[24px]">
4. Avoid Arbitrary Values

Avoid arbitrary values when an existing design-system value can achieve the same result.

Prefer:

p-4
px-6
gap-4
mt-8
h-10
w-10

instead of:

p-[16px]
px-[24px]
gap-[16px]
mt-[32px]
h-[40px]
w-[40px]

Arbitrary values are allowed when there is a genuine design or technical requirement.

Do NOT introduce arbitrary values merely to fix inconsistent spacing without understanding the component layout.

5. Fractional Tailwind Values

Fractional spacing utilities such as:

p-0.5
p-1.5
p-2.5
p-3.5
gap-1.5
gap-2.5

SHOULD NOT be used for normal layout spacing.

Prefer the nearest appropriate 4px-grid value.

However, fractional values MAY be used when:

required for optical alignment
required by an existing component specification
required by a third-party component
required for precise UI alignment
a documented design decision requires it

Do not use fractional values simply because they are available.

6. Typography Is Independent From the 4px Grid

Typography MUST NOT be forced to use only font sizes divisible by 4.

Typography follows its own readability and hierarchy system.

Use the standard Tailwind typography scale whenever appropriate.

Recommended baseline:

Tailwind	Font Size	Line Height
text-xs	12px	16px
text-sm	14px	20px
text-base	16px	24px
text-lg	18px	28px
text-xl	20px	28px
text-2xl	24px	32px
text-3xl	30px	36px
text-4xl	36px	40px

The fact that a font size is not divisible by 4 does NOT make it invalid.

For example:

14px
18px
30px

are valid typography values.

Typography Rules
Prefer the established type scale.
Do not introduce arbitrary font sizes without a design reason.
Maintain a clear hierarchy between headings, body text, metadata, labels, and captions.
Optimize line-height for readability rather than forcing mathematical consistency.
Do not sacrifice readability merely to satisfy the 4px grid.
7. Line Height

Line-height follows the typography system rather than the strict 4px rule.

Prefer established values such as:

16px
20px
24px
28px
32px
36px
40px

Relative line-height values are allowed when they improve typography consistency.

Avoid arbitrary line-height values unless there is a clear reason.

8. Component Sizing

Component dimensions SHOULD generally follow the 4px grid.

Preferred examples:

32px
36px
40px
44px
48px
56px
64px

Common examples:

h-10
h-11
h-12
min-h-12

A component MAY use a non-4px dimension when:

required for accessibility
required for native control compatibility
required by typography
required for visual balance
required by responsive layout

Do not distort a component solely to make every measurement divisible by 4.

9. Borders and Dividers

Borders are a technical exception to the 4px grid.

The following are explicitly allowed:

border-width: 1px;

Use 1px borders for:

cards
inputs
separators
dividers
focus rings
subtle UI boundaries

Do NOT use 4px borders simply to satisfy the grid rule.

The 4px grid applies to spacing around borders, not necessarily to border thickness.

10. Border Radius

Border radius SHOULD use the established design-system scale.

Preferred values:

4px
8px
12px
16px
20px
24px

Prefer semantic Tailwind classes or project design tokens over arbitrary radius values.

Do not introduce arbitrary radius values without a clear visual reason.

11. Icons and Optical Alignment

Icon dimensions SHOULD generally follow the 4px grid:

16px
20px
24px
32px
40px
48px

However, icon sizing MAY deviate from the grid when necessary for:

optical balance
icon-specific proportions
stroke weight
alignment with text
third-party icon libraries

Optical correctness takes priority over mathematical perfection.

Example:

<Icon className="h-5 w-5" />

is preferred when appropriate.

12. Positioning and Centering

Prefer CSS layout primitives over hardcoded positioning.

Vertical Centering

Prefer:

<div className="absolute left-3 top-1/2 -translate-y-1/2" />

instead of manually calculating vertical offsets.

Horizontal Centering

Prefer:

<div className="absolute left-1/2 -translate-x-1/2" />
General Rule

Prefer:

flex
grid
items-center
justify-center
place-items-center
absolute + inset/transform

over arbitrary pixel positioning.

Hardcoded offsets are allowed when required by the actual component design.

13. Responsive Design

The 4px grid does NOT override responsive design requirements.

Use responsive Tailwind utilities to adapt layouts across viewport sizes.

Example:

<div className="p-4 md:p-6 lg:p-8">

is preferred over attempting to use one fixed spacing value for every viewport.

Responsive breakpoints MUST follow the project's established breakpoint system.

Do not introduce new breakpoints without a clear architectural reason.

14. Layout Principles

Prefer:

Flexbox
CSS Grid
Container queries
Responsive utilities
Design tokens
Semantic spacing

Avoid:

Magic numbers
Arbitrary offsets
Negative margins without justification
Absolute positioning for primary layout
Hardcoded dimensions that prevent responsive behavior

A magic number is any arbitrary value introduced without a clear relationship to the design system or component layout.

15. Semantic Design Tokens

Prefer semantic design tokens over hardcoded colors and repeated raw values.

Prefer:

bg-background
text-foreground
bg-card
text-muted-foreground
border-border

over repeatedly hardcoding:

bg-white
text-slate-900
border-slate-200

when an equivalent project token exists.

The design system should centralize visual decisions whenever possible.

16. Light and Dark Mode

Every applicable component MUST support both Light Mode and Dark Mode.

Dark mode MUST use the project's established dark-mode implementation.

Current project convention:

@custom-variant dark (&:where(.dark, .dark *));

Do not create component-specific dark-mode mechanisms that conflict with the global theme system.

Prefer semantic color tokens so that light/dark theme changes remain centralized.

17. Contrast and Accessibility

Accessibility takes priority over strict visual-grid adherence.

Text and interactive elements MUST maintain sufficient contrast.

Do not reduce:

font size
line height
target size
spacing
focus visibility

merely to satisfy the 4px grid.

Interactive targets should provide adequate touch/click area.

Focus states MUST remain clearly visible in both Light Mode and Dark Mode.

18. Explicit Exceptions

The following are explicitly exempt from strict 4px-grid enforcement:

Typography font sizes
Typography line heights
1px borders
1px dividers
Hairline separators
Icon optical sizing
Browser/native control requirements
Accessibility requirements
Third-party component constraints
Responsive layout requirements
CSS values required for correct rendering
Existing design specifications
Precise optical alignment

Exceptions should be intentional and minimal.

Do not use an exception simply to avoid using the established design system.

19. Decision Rule for AI Agents

When choosing between two valid implementations, prefer the one that:

Uses the existing design token.
Uses the existing Tailwind utility.
Follows the 4px spacing rhythm.
Uses semantic colors.
Preserves responsive behavior.
Preserves accessibility.
Preserves visual hierarchy.
Avoids arbitrary values.
Avoids unnecessary one-off CSS.
Keeps the implementation consistent with existing components.
Priority Order

When rules conflict, use this priority:

Accessibility
    ↓
Correct functionality
    ↓
Responsive behavior
    ↓
Established Design System
    ↓
4px spacing rhythm
    ↓
Individual visual preference

The 4px grid MUST NOT override accessibility, functionality, or responsive requirements.

20. Final Principle

The goal of the 4px Grid is:

Consistency
Predictability
Visual rhythm
Maintainability
Scalability

It is NOT:

Every CSS number must be divisible by 4.

Use the 4px grid as the default foundation for spacing and layout, while allowing intentional exceptions where typography, accessibility, optical alignment, browser behavior, or technical constraints require them.

Core Principle

4px-first, not 4px-only.
```
