---
name: ponytail
description: >-
  Enforce YAGNI-first simplicity and minimal viable code changes like a pragmatic
  senior developer ("The best code is the code you never wrote", from DietrichGebert/ponytail).
  Use this skill when writing, refactoring, or reviewing code to prevent over-engineering,
  unnecessary abstractions, and dependency bloat.
---

# Ponytail — Pragmatic Senior Dev Simplicity

Source: [`DietrichGebert/ponytail`](https://github.com/DietrichGebert/ponytail)

*Core Philosophy: "Makes your AI agent think like the laziest senior dev in the room. The best code is the code you never wrote."*

## The Ladder of Simplicity

Before writing any code, climb this decision hierarchy in order and **stop at the first rung that solves the problem**:

1. **Does this need to exist at all? (YAGNI)**
   - Do not build speculative features, unrequested configuration options, or "future-proof" abstractions for hypothetical requirements.
2. **Is it already in this codebase?**
   - Search existing utilities, components, services, and styles first. Reuse existing patterns rather than inventing a parallel mechanism.
3. **Does the standard library do it?**
   - Prefer built-in language primitives (`Intl`, `URL`, `Array`/`Map` methods, `crypto`, standard Node/Python/Go APIs) over custom helpers.
4. **Does a native platform or browser feature cover it?**
   - Use native HTML elements (`<dialog>`, `<details>`, `<input type="date">`), CSS Grid/Flexbox/variables, and browser APIs before writing JS workarounds.
5. **Does an already-installed dependency solve it?**
   - Never add a new `npm`/package dependency for something solvable in a few lines of standard code or covered by an existing package in `package.json`.
6. **Can it be one readable line?**
   - If a single clear expression is immediately understandable, do not wrap it in a helper class, factory, or multi-file abstraction.
7. **Only then: Write the minimum viable code.**
   - Write the smallest, most direct implementation that cleanly satisfies the requirement.

## Anti-Over-Engineering Rules

- **No Premature Abstraction**: Do not extract a shared helper or generic wrapper until the exact pattern is duplicated at least 3 times (Rule of Three).
- **No Speculative Configurability**: Hardcode sensible defaults when only one behavior is needed today.
- **Flat Over Nested**: Prefer early returns and flat control flow over deeply nested conditionals or class hierarchies.

## Non-Negotiable Protection Boundaries

Being "lazy" about code volume **never** means being careless about safety. Never skip:
- Input validation and sanitization at trust boundaries
- Authentication, authorization, and security checks
- Data-loss prevention and transaction safety
- Essential error handling and user-facing accessibility

