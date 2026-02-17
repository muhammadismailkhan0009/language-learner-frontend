# Dependency Boundaries
(Import Direction & Isolation Rules for Frontend Web Systems)

## Purpose

This document defines allowed dependency direction for frontend web system modules.
It prevents cyclic architecture and keeps shell, feature, orchestration,
state, and platform concerns isolated.

---

## Canonical Dependency Direction

`entrypoints -> bootstrap -> app/features/ui/flows/state/platform -> shared`

Additional allowed paths:
- `app -> features -> flows -> state -> shared`
- `app -> ui -> shared`
- `app -> features -> flows -> platform -> shared`
- `features -> ui -> shared`
- `features -> flows -> state -> shared`
- `flows -> platform -> shared`
- `state -> shared`

Disallowed examples:
- `shared -> app`
- `shared -> features`
- `shared -> ui`
- `flows -> bootstrap`
- `platform -> app`
- `platform -> features`
- `ui -> features`
- `ui -> flows`
- `ui -> platform`
- `state` importing framework-shell files from `app`

---

## Layer Roles

- `entrypoints`: startup only
- `bootstrap`: composition/wiring only
- `app`: framework shell surfaces
- `features`: feature-level modules and composition
- `ui`: cross-feature reusable UI primitives/composition helpers
- `flows`: use-case orchestration and policy decisions
- `state`: state contracts and transitions/selectors
- `platform`: runtime/external adapters
- `shared`: reusable primitives and contracts

---

## Mandatory Ports and Adapters Rule

Ports/Adapters are mandatory.

Required:
- Port interfaces define integration boundaries used by flows.
- Adapters implement ports in `platform/*`.
- Flows depend on ports, never concrete adapters.

Required placement:
- Port interfaces: `flows/<feature>/ports/*` or `shared/ports/*`
- Adapter implementations: `platform/*`

Example shape:
- `flows/catalog/ports/ProductDataPort.ts`
- `platform/data/HttpProductDataAdapter.ts`

---

## Runtime API Access Rule

Only `platform/*` and necessary framework shell entry surfaces may directly call:
- browser/web runtime APIs
- network clients
- environment-specific SDKs

Flow code must consume these capabilities via ports/contracts.

---

## Contract Placement

- Shared DTOs/value objects: `shared/types`
- Feature-specific request/response models: `flows/<feature>/contracts`
- State contract shapes: `state/contracts`

---

## Anti-Coupling Rules

- No cross-imports between sibling features unless via shared contracts.
- No deep imports that bypass boundary folders.
- No import-time side effects in `shared`.
- `ui/*` modules must not depend on `features/*`, `flows/*`, or `platform/*`.

---

## Practical Enforcement

- Review each new feature for dependency direction compliance.
- Reject flow modules importing concrete platform adapters.
- Reject shell/app files accumulating orchestration policy.
- Reject `ui/*` modules that embed feature orchestration or runtime adapter calls.
