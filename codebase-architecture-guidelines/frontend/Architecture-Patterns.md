# Architecture Patterns for Frontend Web Systems
(Feature Slices, Ports/Adapters, Optional CQRS)

## Purpose

This document defines mandatory and optional architecture patterns for frontend web system code.
It is normative for this codebase and intended to keep frontend web systems extensible,
testable, and maintainable across web frameworks.

---

## Normative Baseline

> Feature-slice boundaries and Ports/Adapters are mandatory.

Rules:
- Feature behavior must be organized by capability slices, not by framework primitives alone.
- Use-case orchestration must be separated from framework shell and runtime adapters.
- Ports/Adapters (interface-based boundaries) are required for external/platform integrations.
- CQRS is optional and should be used only when read/write concerns materially diverge.
- Locality of behavior is mandatory: keep behavior close to feature ownership unless reuse is proven.

---

## Feature Slice Requirement

Required usage:
- Use feature-aligned names for modules, flows, and contracts.
- Keep shell composition (`app`) separate from feature behavior (`features`/`flows`).
- Keep domain logic separate from platform/runtime adapter logic.

Recommended placement:
- `features/<feature>/*`
- `flows/<feature>/*`
- shared cross-feature domain/contracts in `shared/*`.

---

## Ports and Adapters Requirement

Required usage:
- Define ports for integration points used by flow logic.
- Implement adapters in `platform/*`.
- Wire concrete adapters in `bootstrap/*` or app startup composition.

Required structure:
- Port interfaces: `flows/<feature>/ports/*` (or `shared/ports/*` if cross-feature)
- Adapter implementations: `platform/*`
- Flows depend on ports, not concrete adapters.

Examples of integration points that must use ports:
- network/data providers
- storage and cache boundaries
- runtime/device APIs
- telemetry and analytics sinks

---

## Shell vs Feature Rule

Required:
- Framework shell files (entry, route config, layout, screen registration) stay thin.
- Feature behavior and orchestration live in `features/*` and `flows/*`.
- Shell files must compose and delegate; they must not become behavior hubs.

---

## CQRS Policy (Optional)

CQRS is optional by default.

Adopt CQRS when:
- read and write concerns have materially different complexity
- command side effects need distinct handling from query paths
- separation reduces coupling and improves maintainability

Suggested structure when used:
- `flows/<feature>/commands/*`
- `flows/<feature>/queries/*`
- `flows/<feature>/contracts/*`

Do not adopt CQRS only for style consistency.

---

## Enforcement

Code review requirements:
- Every feature must preserve shell/feature/adapter separation.
- External/runtime integrations must pass through declared ports/adapters.
- Any direct concrete integration inside flow code is an architecture violation.
- CQRS is required only when divergence criteria are met.

Merge/CI gates (objective):
- Import-boundary checks must pass for `app`, `features`, `ui`, `flows`, `state`, `platform`, and `shared`.
- Any direct runtime API usage in `flows/*` fails review unless explicitly approved.
- Any direct concrete adapter import in `flows/*` fails review unless explicitly approved.
- New feature modules must declare their boundary placement (`features`, `flows`, `platform`, `state`) in PR notes.

---

## Non-Goals

This guide does not mandate:
- specific frameworks
- specific state libraries
- enterprise tactical pattern overhead

Primary goal: stable boundaries with pragmatic complexity control.
