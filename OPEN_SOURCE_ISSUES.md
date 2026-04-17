# Open Source Issue Backlog

This file contains active issue ideas you can copy into GitHub Issues.

## Recently Completed (Removed From Active Backlog)

- Added CONTRIBUTING.md and CODE_OF_CONDUCT.md.
- Added PR template and issue templates.
- Added frontend CI and lint checks in CI.
- Added README CI badge and open source docs baseline.

## Active Backlog

## 1) Add Docker Core Concepts Cheatsheet

- Type: feature
- Why: Developers need a practical Docker quick reference for everyday container tasks.
- Suggested labels: `content`, `frontend`, `enhancement`
- Acceptance criteria:
  - Add Docker cheatsheet JSON in `frontend/public/cheatsheets/`.
  - Include sections for images, containers, networks, volumes, compose basics, and troubleshooting.
  - Add routing and home-page card for Docker cheatsheet.
  - Support English and Hinglish versions.

## 2) Add Kubernetes Core Concepts Cheatsheet

- Type: feature
- Why: Kubernetes fundamentals are a common interview and production requirement.
- Suggested labels: `content`, `frontend`, `enhancement`
- Acceptance criteria:
  - Add Kubernetes cheatsheet JSON in `frontend/public/cheatsheets/`.
  - Include sections for pods, deployments, services, ingress, configmaps, secrets, probes, and autoscaling.
  - Add routing and home-page card for Kubernetes cheatsheet.
  - Support English and Hinglish versions.

## 3) Add System Design Fundamentals Cheatsheet

- Type: feature
- Why: System design is a major learning need for backend and interview prep.
- Suggested labels: `content`, `system-design`, `enhancement`
- Acceptance criteria:
  - Add System Design cheatsheet JSON in `frontend/public/cheatsheets/`.
  - Include sections for scalability, caching, databases, queues, consistency, sharding, and observability.
  - Add routing and home-page card for System Design cheatsheet.
  - Support English and Hinglish versions.

## 4) Add New Cheatsheet Expansion Pipeline

- Type: chore
- Why: New topic onboarding should be repeatable and low-friction for contributors.
- Suggested labels: `tooling`, `documentation`, `good first issue`
- Acceptance criteria:
  - Define JSON schema and checklist for new cheatsheet topics.
  - Add a contributor guide section for adding a new topic end-to-end.
  - Add script or validation command to catch malformed cheatsheet JSON.

## 5) Full Frontend Redesign (V2)

- Type: feature
- Why: A fresh visual system can improve readability, engagement, and community appeal.
- Suggested labels: `frontend`, `design`, `enhancement`
- Acceptance criteria:
  - Create a redesign proposal doc with design goals, wireframes, and component plan.
  - Implement updated layout and component styling for home and section pages.
  - Preserve mobile responsiveness and accessibility requirements.
  - Keep existing content model and routing intact.

## 6) Website UX Audit and Improvement Sprint

- Type: audit
- Why: Structured UX audit helps identify friction in navigation and reading flow.
- Suggested labels: `ux`, `audit`, `frontend`
- Acceptance criteria:
  - Audit home, search, navigation rail, and section reading flow.
  - Produce prioritized issue list with severity and suggested fixes.
  - Implement top 5 high-impact UX improvements.

## 7) Accessibility Audit and Remediation

- Type: audit
- Why: Open source project should be keyboard and screen-reader friendly.
- Suggested labels: `a11y`, `audit`, `frontend`
- Acceptance criteria:
  - Run accessibility audit on key flows (home, section navigation, search dialog).
  - Fix heading hierarchy, focus order, labels, and keyboard interactions.
  - Document accessibility checklist in PR workflow.

## 8) Performance Audit and Budget Enforcement

- Type: audit
- Why: Fast loading is critical for a reference-style product.
- Suggested labels: `performance`, `frontend`, `ci`
- Acceptance criteria:
  - Capture baseline metrics (LCP, CLS, TTI, bundle size).
  - Identify heavy modules and optimize code-splitting.
  - Add performance budget checks to CI or release checklist.

## 9) Service Worker Caching Hardening

- Type: bug
- Why: Aggressive caching can serve stale UI and stale cheatsheet content.
- Suggested labels: `frontend`, `pwa`, `bug`
- Acceptance criteria:
  - Review and simplify cache strategy.
  - Add cache versioning and clear invalidation policy.
  - Verify fresh assets and content are served after deploy.

## 10) Add Lightweight E2E Smoke Tests

- Type: testing
- Why: Basic user journeys should stay reliable across changes.
- Suggested labels: `testing`, `frontend`, `ci`
- Acceptance criteria:
  - Add at least 3 smoke tests: home load, section navigation, search dialog open.
  - Run tests in CI on pull requests.
  - Add short contributor doc for running tests locally.

## 11) Content Quality and Consistency Review

- Type: documentation
- Why: Cheatsheet quality is the product's core value.
- Suggested labels: `content`, `documentation`
- Acceptance criteria:
  - Define content consistency checklist (title style, key points, code formatting, language quality).
  - Audit all existing cheatsheet JSON files against checklist.
  - Open follow-up issues for gaps and inconsistencies.

## 12) Security and Dependency Audit

- Type: maintenance
- Why: Community projects need routine dependency and security hygiene.
- Suggested labels: `security`, `dependencies`, `chore`
- Acceptance criteria:
  - Run dependency audit and document findings.
  - Upgrade vulnerable dependencies with minimal regressions.
  - Ensure lint and build pass after upgrades.
