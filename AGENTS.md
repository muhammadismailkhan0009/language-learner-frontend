# Agent Guardrails

## Frontend Implementation Gate (Mandatory)

1. Before any frontend implementation, read `code_generation_guidelines/uiflow_llm_guidelines.md`.
2. For stateful UI, use `@myriadcodelabs/uiflow` by default.
3. If not using `@myriadcodelabs/uiflow`, stop and ask for explicit user approval before coding.
4. In the first progress update for frontend work, explicitly confirm:
   - `Loaded uiflow guidelines: yes`
5. Treat any violation of these rules as a blocker, not a preference.

## Frontend Architecture Gate (Mandatory)

1. Before frontend implementation or refactor, read all files in `codebase-architecture-guidelines/frontend/`:
   - `Architecture-Patterns.md`
   - `Dependency-Boundaries.md`
   - `Module-Boundaries.md`
   - `Test.md`
   - `Refactoring.md`
   - `FrontEnd.md`
2. In the first progress update for frontend work, explicitly confirm:
   - `Loaded architecture guidelines: yes`
3. Treat architecture-guideline violations as blockers, not preferences.
