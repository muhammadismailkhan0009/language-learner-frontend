# Frontend Web System Test Instructions (LLM-Guided)
(Behavioral Testing & Safe Automation Rules)

## Purpose

This document defines **how tests are created, evolved, and maintained**
in this frontend web system codebase when using AI-assisted development.

These rules are **normative** and reflect the author's testing philosophy.

This file exists to:
- preserve behavioral intent
- keep tests stable under refactoring
- prevent silent semantic drift
- make LLM-assisted coding predictable and safe

---

## Scope Boundary

This document:
- defines **testing intent, semantics, and automation rules**
- applies only to **frontend web system tests**
- governs **how LLMs may interact with tests**

This document does **not**:
- define architecture or directory structure
- mandate testing frameworks or tools
- require TDD
- define coverage targets
- prescribe mocking libraries or styles

---

## Frontend-Web Test Taxonomy

Use these categories as behavioral lenses:
- **Feature tests**: user-observable feature guarantees at feature boundaries.
- **UI interaction tests**: click/type/select/keyboard/focus behavior.
- **State and flow tests**: transition logic, orchestration, async branch handling.
- **Adapter contract tests**: `platform/*` mapping, transport errors, retries/timeouts.
- **Navigation tests**: route/view transitions, parameter/query behavior, guard behavior.
- **Accessibility tests**: semantic role/name behavior and keyboard accessibility guarantees.
- **Responsive tests**: behavior guarantees across declared viewport classes/breakpoints.
- **End-to-end/system tests**: critical journey guarantees through real app composition.
- **Non-functional tests**: performance, security behavior, and browser compatibility guarantees.

Tests are selected by risk and declared behavior, not by framework conventions.

---

## Core Principles

### 1. Tests Encode Intent, Not Structure

- Tests represent **human-declared behavioral guarantees**
- Tests are **commitments**, not experiments
- Tests must not be inferred from code structure alone

LLMs must never invent, assume, or widen behavior.

---

### 2. Definition of a Unit Test

A **unit test** is defined by **behavioral scope**, not by framework/runtime surface.

A unit test:
- asserts **one externally meaningful behavioral guarantee**
- may execute with:
  - real rendering/runtime facades
  - real state transitions
  - real serialization/mapping logic
- is still a unit test if it verifies **one behavior**

Unit tests are **behavioral**, not structural.

---

### 3. Definition of an Integration Test

An **integration test** verifies **composition of multiple behaviors**
across frontend web system boundaries.

Integration tests:
- assert interaction between independent guarantees
- commonly span boundaries such as:
  - `app/features` <-> `flows`
  - `flows` <-> `state`
  - `flows/features` <-> `platform`
- are **explicit and intentional**
- must never be inferred automatically

Use of real framework runtime alone does not imply integration testing.

---

### 4. Definition of an End-to-End/System Test

An **end-to-end/system test** verifies a declared user journey
through full application composition.

End-to-end/system tests:
- cover cross-boundary behavior from shell/app through feature/flow/platform integrations
- verify business-critical outcomes visible to users
- are intentionally small in number and focused on critical flows
- must be deterministic and environment-stable

End-to-end tests do not replace unit/integration tests.

---

## Behavior Declaration Rules

- Behavior is **human-owned**
- LLMs must not infer behavior from:
  - component names
  - view/screen names
  - action names
  - data shape names

New behavior:
- requires explicit human declaration
- results in **new tests**
- does not modify existing test intent

---

## Test Evolution Rules

### Additive Evolution Only

- Existing tests must retain their original intent
- New behavior -> new test
- Old tests are never implicitly re-scoped or reclassified

### Reclassification Policy

- Tests must **never** be reclassified automatically
- Reclassification is allowed **only** via explicit human instruction
- LLMs may suggest candidates for reclassification, but must not apply it

---

## LLM Automation Rules (Critical)

### What LLMs MAY Do Automatically

- Fix production code to satisfy failing tests
- Repair **mechanical aspects** of tests:
  - setup
  - wiring
  - fixtures
  - builders
  - selectors
  - imports and renames

### What LLMs MUST NOT Do Automatically

- Change assertions
- Change expected values
- Remove assertions
- Add new assertions
- Broaden or weaken guarantees
- Change the semantic meaning of a test

### Invariant

> **Assertions are sacred. Setup is negotiable.**

If a test cannot be repaired without changing assertions,
human intervention is required.

---

## Handling Failing Tests

Default rule:
1. A test fails
2. Assume test intent is correct
3. Fix production code

Only with explicit human instruction may the LLM:
- change test intent
- update assertions
- remove or replace tests

---

## Frontend-Web Specific Testing Areas

### Feature and Interaction Guarantees

- Test user-observable outcomes at feature boundaries.
- Assert outcomes, not incidental implementation details.
- Include keyboard and focus behavior when interaction depends on them.
- Include validation/error feedback behavior for interactive flows.

### State Transition Guarantees

- Treat state transitions/selectors as behavior.
- Validate stable outcomes for valid/invalid input paths.
- Validate async transitions explicitly (idle -> loading -> success/failure).
- Validate race/cancellation behavior where concurrent requests can occur.

### Platform Adapter Guarantees

- Test adapter behavior at `platform/*` boundaries.
- Validate mapping/error behavior for runtime/external integrations.
- Verify normalization of remote payloads into internal contracts.
- Verify failure modes: timeout, malformed payload, and unavailable network.

### View-State Guarantees

- Test declared user-visible states (loading, success, empty, failure).
- Avoid over-constraining non-essential markup structure.
- Prefer assertions on meaning (text/role/state), not brittle DOM shape.

### Navigation Guarantees

- Treat navigation outcomes as behavior when declared by the feature.
- Validate route/view transitions, query/parameter handling, and back/forward behavior.
- Validate guard/redirect outcomes where applicable.

### Accessibility Guarantees

- Treat declared accessibility requirements as behavioral guarantees.
- Validate keyboard-only operation for interactive controls.
- Validate visible labels, accessible names, and focus movement outcomes.

### Responsive Guarantees

- Validate behavior at declared viewport classes/breakpoints.
- Assert behavior changes that are intentional (layout mode, menu behavior, interaction path).
- Do not snapshot entire pages for responsiveness unless explicitly justified.

### SSR/Hydration Guarantees (When Applicable)

- Validate no behavior drift between server-rendered and hydrated states.
- Validate critical interactions immediately after hydration.
- Validate fallback/error behavior when server data is absent or stale.

### Performance Guarantees

- Treat declared latency/performance budgets as behavioral guarantees.
- Validate critical interaction latency and page-level rendering budgets.
- Validate expensive rendering paths and re-render hotspots for regression risk.
- Performance failures must be treated as test failures when budget thresholds are declared.

### Security Behavior Guarantees

- Treat security-relevant behavior as testable contracts.
- Validate authentication/authorization UI boundaries and forbidden-state behavior.
- Validate safe handling of untrusted input and output encoding behavior.
- Validate CSRF/session boundary behavior where applicable.

### Browser Compatibility Guarantees

- Validate critical journeys on the declared browser support matrix.
- Validate behavior differences only where explicitly accepted.
- Any unsupported-browser policy must be explicit and documented.

---

## Mocking & Real Behavior Policy

### Primary Decision Axis

> **What uncertainty is this test meant to eliminate?**

Mocking vs real behavior is decided **after** this question.

---

### Rule Correctness Tests

- Prefer **real behavior**
- Avoid mocks
- Use real implementations
- Infrastructure is part of behavior if behavior depends on it

Mocking flow/domain policy is forbidden.

---

### Composition Tests

- Mock **trusted boundaries only**
- Each mock represents an already-tested behavior
- Assert outcomes, not implementation details
- Avoid mocking UI interaction primitives when interaction behavior is under test.

---

### Runtime/Adapter Tests

- Prefer realistic runtime facades or targeted integration harnesses
- Keep scope narrow and deterministic
- Do not replace adapter behavior with empty stubs when adapter behavior is the point

---

## Mocking Prohibitions

LLMs must not:
- mock the unit under test
- mock flow/domain policy to force passing tests
- mock state transition behavior when state semantics are the behavior
- mock platform adapter mapping when mapping correctness is the behavior
- mock navigation behavior when navigation outcome is the declared behavior
- mock accessibility behavior when accessibility is the declared behavior

---

## Frontend-Web Regression Guards

When behavior is declared critical, lock it with focused tests for:
- authentication/session boundary behaviors (signed-in, signed-out, expired state)
- form submission and validation semantics
- destructive-action confirmation and failure handling
- browser refresh/deep-link restoration semantics
- feature-level loading/error recovery paths

Prefer small, behavior-focused tests over broad snapshot-style assertions.

---

## Release Quality Gates

Minimum gate for release candidates:
- Critical user journeys must pass end-to-end/system tests.
- Declared accessibility guarantees must pass.
- Declared performance budgets must pass.
- Declared browser-compatibility matrix checks must pass.
- No known failing high-severity tests may be waived without explicit human approval.

Gate ownership:
- Humans define what is critical and what budgets/matrix apply.
- LLMs execute and preserve those gates; they do not weaken them.

---

## Decision Rule for Mocking

Before mocking a dependency, ask:

> **If this dependency were wrong, would this test catch it?**

- If yes -> do NOT mock
- If no -> mocking is acceptable

---

## MVP Testing Guidance

- MVP tests focus on **minimal guarantees**
- One behavioral unit test per core capability is usually sufficient
- Tests should assert only what is explicitly promised

Behavior growth is additive.

---

## Final Invariant

> **LLMs translate declared intent into code.**
> **They do not invent intent.**
> **They do not weaken intent.**
> **They do not silently change intent.**

All automation must preserve this invariant.
