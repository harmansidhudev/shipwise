---
name: quality-assurance
description: "Testing strategy, test pyramid, unit/integration/E2E testing, load testing, cross-browser testing, and code quality tooling."
triggers:
  - "testing"
  - "unit test"
  - "integration test"
  - "E2E test"
  - "Playwright"
  - "Vitest"
  - "load testing"
  - "k6"
  - "code quality"
  - "test coverage"
---

# Quality Assurance

> Phase 2: BUILD | Sprint 2 (planned)

## Coverage

- Testing pyramid (unit 70%, integration 20%, E2E 10%)
- Unit testing (Vitest recommended, 80% coverage on business logic)
- Integration testing (real DB with fixtures, auth flow testing)
- E2E testing (Playwright recommended, 4 critical paths, POM pattern, <2% flake)
- Load testing (k6 recommended, normal/spike/soak, P50/P95/P99)
- Cross-browser (Chrome, Firefox, Safari, Edge + mobile)
- Code quality (ESLint + Prettier + Husky + TypeScript strict + lint-staged)

## Checklist Items

### Unit Tests
<!-- beginner -->
**Write unit tests for your business logic** — Tests are code that automatically checks if your code works correctly. Focus on the important stuff: payment calculations, permission checks, data transformations. Don't test UI components (those are fragile). Aim for 80% coverage on business logic files.

<!-- intermediate -->
**Unit tests (Vitest, 80% business logic coverage)** — Focus on pure functions, calculations, permissions, and data transforms. Skip UI component tests.

<!-- senior -->
**Unit tests** — 80% business logic coverage, Vitest.

## Companion tools
- `anthropics/claude-code` → `webapp-testing`
- `obra/superpowers` → `test-driven-development`
