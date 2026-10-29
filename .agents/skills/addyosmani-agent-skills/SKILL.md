---
name: addyosmani-agent-skills
description: >-
  Production-grade software engineering workflows covering Define, Plan, Build,
  Verify, Review, and Ship phases with strict quality gates (from addyosmani/agent-skills).
  Use this skill when planning features, implementing vertical slices, verifying tests,
  reviewing code quality, or preparing changes for production release.
---

# Production-Grade Engineering Skills (Addy Osmani)

Source: [`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills)

Follow senior-engineer workflows and quality gates across the full software development lifecycle to prevent shortcuts and ensure maintainable, production-ready code.

## Software Development Lifecycle Workflow

### 1. Define (`/spec` & `/constraints`)
- **Clarify Before Coding**: Identify ambiguities, edge cases, data shapes, and non-functional constraints before writing implementation code.
- **Acceptance Criteria**: Define clear, testable success criteria and explicit non-goals so scope remains bounded.

### 2. Plan (`/plan`)
- **Atomic Tasks**: Decompose complex changes into small, independently verifiable vertical slices.
- **Codebase Alignment**: Trace existing architectural patterns, state management conventions, and types before proposing new files.

### 3. Build (`/build` & `/code-simplify`)
- **Incremental Vertical Slices**: Implement one small, working slice at a time (data model -> service/API -> UI -> verification) rather than large unverified batches.
- **Clarity Over Cleverness**: Write self-documenting code with explicit types, clear naming, and minimal cognitive load.
- **Complete States**: Handle loading, empty, error, and edge-case states alongside the happy path.

### 4. Verify (`/test`)
- **Tests as Proof**: Verify behavior with automated unit/integration tests and build checks (`npm run build`, `npm test`, typechecking) rather than assuming code works by inspection.
- **Root-Cause Debugging**: When a bug or test failure occurs, reproduce and trace the root cause before applying a fix—never mask symptoms with superficial workarounds.

### 5. Review (`/review`)
- **Multi-Axis Quality Gate**: Audit changes across:
  - **Correctness**: Does it satisfy all requirements and edge cases?
  - **Security**: Are inputs validated, secrets protected, and XSS/injection vectors prevented?
  - **Performance**: Are there unnecessary re-renders, N+1 queries, memory leaks, or oversized bundles?
  - **Maintainability**: Can another engineer understand and modify this code in 6 months?

### 6. Ship (`/ship` & `/webperf`)
- **Pre-Flight Checklist**: Ensure zero build/type errors, clean git diffs with no stray debug logs or dead code, and strong Core Web Vitals (LCP, INP, CLS) for frontend changes.

