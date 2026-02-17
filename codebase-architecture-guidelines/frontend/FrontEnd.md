# Frontend Web System Architecture Guidelines
(Framework-Adaptive Structural Rules)

## Purpose

This document defines a **framework-adaptive structure** for frontend web systems.
These guidelines are **normative rules** for this codebase and reflect the author's coding style.

Target scope includes web UI systems only:
- SPA systems
- SSR/SSG systems
- hybrid web systems

Its goal is to make it immediately obvious:
- where feature boundaries live
- where UI composition belongs
- where platform/runtime integrations belong
- while maximizing locality of behavior
- while reducing cognitive load and long-term maintenance cost

It **does not**:
- by itself mandate framework conventions
- force one routing mechanism
- prescribe state-management libraries
- define testing or refactoring workflow

Scope boundary:
- this file defines **directory structure and placement intent only**
- it does not define dependency rules, behavior rules, or control-flow rules

---

## Core Principle

> **Feature boundaries are primary; framework boundaries are respected, not duplicated.**
> **Locality of behavior is mandatory.**

If a framework mandates specific folders/files (for routing, layout, entrypoints, lifecycle),
use those directly and map feature logic around them.

---

## Canonical Structure (Framework-Agnostic)

src/
├── app/
├── features/
├── flows/
├── ui/
├── state/
├── platform/
├── shared/
└── bootstrap/


---

## Directory Intent

### `app/`
- Framework-owned surfaces and app shell.
- Examples: framework entrypoints, layout shells, route declarations, screen registration.
- Keep this thin; delegate behavior/orchestration to feature and flow modules.

### `features/`
- Primary feature slices.
- Contains feature-local UI, contracts, and composition modules.
- Anything specific to one feature stays here.
- Behavior should live closest to where it is used.

### `flows/`
- Use-case orchestration and behavior decisions.
- Coordinates reads, decisions, updates, and side-effect requests.
- Avoid direct dependency on framework/runtime APIs when possible.

### `ui/`
- Cross-feature reusable UI composition and primitives.
- Not framework boilerplate storage.
- No feature-specific behavior assumptions.

### `state/`
- Cross-feature state contracts, selectors, reducers/transitions.
- State model ownership lives here, not scattered across feature views.

### `platform/`
- Runtime/platform adapters and external integration points.
- Examples: network, storage, browser/runtime bridges, analytics adapters.

### `shared/`
- Reusable context-agnostic modules.
- Pure helpers, value objects, shared contracts, cross-feature primitives.

### `bootstrap/`
- Wiring, startup composition, dependency construction.
- No feature policy logic.

---

## Framework Adaptation Rule

Do not force a synthetic directory model that fights the framework.

Required adaptation behavior:
- If framework mandates routing/layout folders (e.g., file-based routing), keep them in `app/`.
- If framework uses config-declared navigation, keep navigation declaration in `app/`.
- Keep feature behavior in `features/` and `flows/`, not in framework shell files.
- Keep platform integrations in `platform/` regardless of framework.

Anti-pattern:
- Creating duplicate route trees or duplicated "routes" folders only to satisfy a guideline.

---

## Component and Module Placement Rules

- Feature-specific modules stay inside `features/<feature>/...`.
- Promote modules to `ui/` or `shared/` only when reused across independent features.
- Flow logic does not belong in framework shell files.
- Platform/runtime API usage belongs in `platform/` adapters.
- Prefer co-location by default; extract only when reuse or boundary clarity is proven.

---

## Modularity & Domain Concepts

- Frontend web system modules are **feature-aligned first**.
- Domain concepts may exist where behavior is non-trivial.
- Structure favors locality of behavior, maintainability, and reduced cognitive load
  over framework style preferences.

---

## Non-Goals

This document intentionally avoids:
- selecting specific frameworks/libraries
- prescribing framework-specific file names
- defining testing/refactoring policy

Its purpose is **structural clarity only**.

---

## Companion Documents

For full governance, the following companion guides are mandatory.

Path note:
- In this source repo, use `frontend/...`.
- In copied package output, use `codebase-architecture-guidelines/frontend/...`.

Companion files:
- `frontend/Module-Boundaries.md` or `codebase-architecture-guidelines/frontend/Module-Boundaries.md`
- `frontend/Dependency-Boundaries.md` or `codebase-architecture-guidelines/frontend/Dependency-Boundaries.md`
- `frontend/Architecture-Patterns.md` or `codebase-architecture-guidelines/frontend/Architecture-Patterns.md`
- `frontend/Test.md` or `codebase-architecture-guidelines/frontend/Test.md`
- `frontend/Refactoring.md` or `codebase-architecture-guidelines/frontend/Refactoring.md`

---

## Precedence

When rules overlap, apply documents in this order:
1. `frontend/Architecture-Patterns.md` (or copied path equivalent)
2. `frontend/Dependency-Boundaries.md` (or copied path equivalent)
3. `frontend/Module-Boundaries.md` (or copied path equivalent)
4. `frontend/Test.md` (or copied path equivalent)
5. `frontend/Refactoring.md` (or copied path equivalent)
6. `frontend/FrontEnd.md` (or copied path equivalent)

Interpretation rule:
- `FrontEnd.md` governs structure and placement.
- Companion documents govern architecture constraints, dependency direction,
  testing policy, and safe refactoring behavior.
