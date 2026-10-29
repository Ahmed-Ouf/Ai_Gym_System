---
name: taste-skill
description: >-
  UI/UX art direction, anti-slop frontend standards, and visual harmony rules (from Leonxlnx/taste-skill).
  Use this skill when designing or auditing frontend interfaces, color palettes, button hierarchies,
  typography contrast, and layouts to ensure distinctive, human-crafted design quality.
---

# Taste Skill (UI/UX Art Direction & Visual Craft)

Source: [`Leonxlnx/taste-skill`](https://github.com/Leonxlnx/taste-skill)

Avoid generic, template-like AI frontend designs by adhering to strict art direction, intentional color hierarchies, typography contrast, and visual restraint.

## 1. Color Wheel Discipline & Hue Separation

- **Never Place Adjacent Sibling Hues in the Same Group**: Placing two shades of blue (e.g., standard blue `#2563eb` next to indigo `#4f46e5`) creates visual ambiguity and cognitive load. The eye cannot quickly distinguish their semantic purpose.
- **Distinct Semantic Roles**: If multiple actions coexist in one toolbar, each action must occupy a clearly separated sector of the color wheel (e.g., Green 150°, Blue 215°, Purple/Magenta 280°, Graphite Slate 210° neutral).
- **Surface Dominance over Rainbow Saturation**: Avoid filling 4 adjacent buttons with full saturated gradients. Instead, use clean neutral surfaces (`#ffffff` or `#f8fafc`) with crisp **1.5px borders** and dedicated colored icon pods (`icon-pod`).

## 2. Visual Hierarchy & Action Group Architecture

- **Primary vs. Utility**: Not every button is an emergency. One action should be the anchor (e.g., primary action), while companion actions use elegant bordered utility styling.
- **Border Craft**:
  - Border width: `1.5px` provides crisp tactile definition without feeling heavy.
  - Neutral resting state: `border: 1.5px solid #e2e8f0`.
  - Focused / Hover state: subtle border tint matching the action's semantic icon (`#10b981`, `#3b82f6`, `#a855f7`, etc.) with a gentle `-2px` transform and soft shadow.

## 3. High-Legibility Typography

- **Text Contrast**: Primary labels on light surfaces must always use deep slate or charcoal (`#0f172a` or `#1e293b`), achieving WCAG AAA contrast (> 7:1).
- **Tabular Numerals**: Financial figures, duration timers, and counters must use `font-variant-numeric: tabular-nums` to maintain clean vertical alignments.

