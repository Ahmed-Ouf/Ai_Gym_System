---
name: anthropics-frontend-design
description: >-
  Create distinctive, production-grade frontend interfaces with high design quality
  and intentional aesthetics (from anthropics/skills). Use this skill when the user
  asks to build, style, or redesign web components, pages, dashboards, or applications.
---

# Frontend Design & UI Craft (Anthropic Skills)

Source: [`anthropics/skills`](https://github.com/anthropics/skills)

Guide the creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics and deliver cohesive, memorable user experiences.

## 1. Design Thinking (Before Writing Code)

Before implementing UI code, commit to a clear aesthetic direction:
- **Purpose & Context**: What problem does this interface solve? Who uses it, and in what environment (e.g., data-dense operations dashboard vs. consumer marketing page)?
- **Tone & Direction**: Choose an intentional aesthetic stance—such as refined minimalism, warm editorial, dark high-contrast operational utility, kinetic typography, or crisp Swiss grid layout.
- **Differentiation**: Identify the signature visual detail that makes the screen feel purposefully crafted rather than generated from a default template.

## 2. Core Aesthetic Pillars

- **Typography**:
  - Pair an expressive, characterful display/heading font with a highly legible body/UI font (plus a crisp monospace font for numerical/tabular data, IDs, and timestamps).
  - Establish a clear typographic hierarchy using distinct size jumps, weight contrast, letter-spacing (`tracking`), and line-height.
  - Use `font-variant-numeric: tabular-nums` on financial figures, counters, tables, and timers so columns align cleanly.
- **Color & Surface Hierarchy**:
  - Commit to a cohesive palette using CSS custom properties (`--bg-surface`, `--text-primary`, `--accent-primary`, etc.).
  - Use dominant neutral surfaces with sharp, intentional accent colors for primary actions and semantic status indicators.
  - Avoid cliched purple-to-blue gradients on white backgrounds.
- **Spatial Composition & Layout**:
  - Use consistent spacing tokens, clear visual grouping, and generous whitespace (or deliberate, well-aligned density for data tables and control panels).
  - Ensure responsive behavior across mobile, tablet, and desktop breakpoints without horizontal overflow or cramped touch targets.
- **Motion & Micro-interactions**:
  - Focus on high-impact moments: smooth page/section entrance reveals, subtle hover/focus elevation, and clear loading/skeleton states.
  - Respect `prefers-reduced-motion` media queries.

## 3. Production Implementation Standards

- **Complete Interactive States**: Every interactive element (buttons, inputs, rows, tabs, modals) must have designed `default`, `hover`, `focus-visible`, `active`, `disabled`, and `loading`/`empty` states.
- **Accessibility**: Maintain WCAG contrast ratios, semantic HTML landmarks, keyboard navigation support, and proper ARIA attributes.
- **Visual Self-Check**: Verify that text never overlaps, badges/chips do not wrap awkwardly, and empty/error states look as intentional as populated states.

