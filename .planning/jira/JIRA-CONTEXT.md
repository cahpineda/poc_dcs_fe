---
requested_issue_key: ACA-2953
ticket_status: In Progress
hierarchy_mode: all
generated: 2026-04-28
---

> **TASK SCOPE — IMPLEMENT ONLY:** `ACA-2953` (REQUESTED). All other issues in this file (parent hierarchy, related issues, same-epic issues) are **reference context only** — they explain the WHY and HOW, but must NOT be planned or implemented.

# ACA-2953: Validate and fix visual/functional parity of seat_plan React migration against cloud2 monolith (REQUESTED)

**Type:** Sub-task
**Status:** In Progress
**Priority:** Normal
**Assignee:** Carlos Hurtado
**Reporter:** Carlos Hurtado
**Created:** 2026-04-28
**Updated:** 2026-04-28

---

## Description

With the React scaffold and initial migration already in place, this task focuses on **recontra-validating** that the migrated `seat_plan` feature is visually and functionally identical to the original implementation in the cloud2 PHP monolith.

The validation must be done component by component, screen by screen, comparing the React implementation against the source of truth in `cloud2`. The mock server already exposes all required endpoints with mock data, so the React app must be fully exercised against it during validation.

Any discrepancy found — whether visual (layout, spacing, colors, typography, icons) or functional (interactions, state transitions, API calls, edge cases) — must be documented and corrected within this same task before it can be closed.

---

### Scope

**1. Source audit from cloud2**
- Review the original `seat_plan` views/templates in cloud2 (Blade/PHP templates, JS, CSS)
- Extract the full list of UI states: initial load, seat selection, seat locked, occupied, available, error states, loading states
- Document all user interactions: clicks, hover, drag (if any), keyboard navigation
- Document all API calls made by cloud2's seat_plan: endpoints, payloads, response handling

**2. Side-by-side visual comparison**
- Run both the cloud2 monolith and the React app (against mock server) simultaneously
- Compare each screen/component pixel-level:
  - Seat grid/map layout
  - Seat state indicators (colors, icons, labels)
  - Typography, spacing, alignment
  - Responsive behavior (if applicable)
  - Modal/dialog/tooltip appearances
  - Loading spinners/skeletons
  - Error and empty states

**3. Functional validation against mock server**
- Verify all API integrations in the React app match the cloud2 call patterns
- Validate state management: seat selection flow, conflict/lock handling, confirmation
- Reproduce all user flows end-to-end using the mock server
- Confirm edge cases are handled (e.g. seat already taken, session timeout, max seats)

**4. Fix all identified discrepancies**
- For each gap found, document and fix inline
- Re-validate after each fix
- No known visual or functional gap should remain unresolved at close

---

### Acceptance Criteria

- [ ] All cloud2 `seat_plan` views and interactions have been catalogued and mapped to React equivalents
- [ ] Side-by-side visual comparison completed with zero unresolved discrepancies
- [ ] All user flows work end-to-end against the mock server with no errors
- [ ] API integration in React matches cloud2 endpoints and payloads
- [ ] All edge cases handled identically to cloud2 behavior
- [ ] No console errors or warnings during normal usage
- [ ] PR reviewed and merged with validation evidence (screenshots or screen recording attached)

### Definition of Done

The React `seat_plan` feature is indistinguishable from the cloud2 implementation from the end user's perspective, validated against the mock server, with all discrepancies corrected and evidenced.

---

## Hierarchy

The complete hierarchy from Feature to this issue: Feature → Sub-task

### Feature: ACA-2948

**Summary:** Migrate seat_plan frontend feature from cloud2 to React
**Status:** In Progress
**Type:** Feature

**Description:** Create a new React project to migrate the frontend implementation of the seat_plan feature from cloud2. Includes scaffolding the React project structure, replicating existing functionality, and ensuring feature parity with the cloud2 implementation.

**Scope:**
- Scaffold and configure a new React project for the seat_plan feature
- Implement seat_plan UI components in React
- Ensure feature parity with the cloud2 seat_plan frontend
- Integrate with existing APIs and data sources used by cloud2

### ACA-2953 (REQUESTED)

**Summary:** Validate and fix visual/functional parity of seat_plan React migration against cloud2 monolith
**Status:** In Progress
**Type:** Sub-task
**Priority:** Normal

**Labels:** `ink-monitor`
**Components:** —
**Fix Versions:** —

---

## Related Issues

### Subtasks

No subtasks on ACA-2953.

### Links

No issue links on ACA-2953.

### Other Issues from Same Epic

No epic — ACA-2948 is a top-level Feature. Sibling sub-tasks under ACA-2948:

| Key | Summary | Status | Type |
|-----|---------|--------|------|
| ACA-2950 | Scaffold React project structure for seat_plan migration | Finished | Dev |
| ACA-2953 | Validate and fix visual/functional parity of seat_plan React migration against cloud2 monolith | In Progress | Sub-task |

---

## Important History

### 2026-04-28 - Label Added

**Field:** labels → `ink-monitor`
**By:** Carlos Hurtado

### 2026-04-28 - Status Change

**From:** To Do → **To:** In Progress
**By:** Carlos Hurtado

### 2026-04-28 - Description Added

Full task scope and acceptance criteria added.
**By:** Carlos Hurtado

### 2026-04-28 - Estimate Set

**Original estimate:** 8h
**By:** Carlos Hurtado

### 2026-04-28 - Status Change

**From:** Technical Review → **To:** To Do
**By:** Carlos Hurtado

### 2026-04-28 - Assignment

**Assigned to:** Carlos Hurtado
**By:** Carlos Hurtado

### 2026-04-28 - Created

Issue created as sub-task of ACA-2948.
**By:** Carlos Hurtado

---

## Raw Fields

| Field | Value |
|-------|-------|
| key | ACA-2953 |
| id | 142205 |
| issuetype | Sub-task |
| status | In Progress |
| priority | Normal |
| assignee | Carlos Hurtado |
| reporter | Carlos Hurtado |
| creator | Carlos Hurtado |
| created | 2026-04-28T13:54:21+0200 |
| updated | 2026-04-28T13:56:29+0200 |
| parent | ACA-2948 |
| project | ACA — AI Coding Agency |
| labels | ink-monitor |
| components | (none) |
| fixVersions | (none) |
| timeoriginalestimate | 8h (28800s) |
| timeestimate | 8h (28800s) |
| timespent | null |
| resolution | null |
| resolutiondate | null |
| duedate | null |
| subtasks | (none) |
| issuelinks | (none) |
| customfield_10086 | Departure Control System (Desktop) - DCS |
| customfield_10473 | Low (Risk) |

---

## Development Context

### What needs to be done?

Perform a thorough parity audit of the completed React `seat_plan` POC against the cloud2 PHP monolith. The React migration (Phases 1-15, 244 tests) is functionally complete but has not been formally validated pixel-by-pixel and interaction-by-interaction against cloud2. This task requires:

1. **Audit** cloud2 source (views, JS, CSS) for UI states, interactions, and API contracts
2. **Compare** React app (running against mock server at `localhost:3001`) against cloud2 screen by screen
3. **Document** every discrepancy found (visual or functional)
4. **Fix** all discrepancies within this task — no open gaps allowed at close
5. **Evidence** the validation with screenshots or screen recording for PR

### Why is it important?

This is the final acceptance gate before the React migration can be considered production-ready. ACA-2948 (parent Feature) requires feature parity — ACA-2950 delivered the scaffold/implementation, ACA-2953 delivers the proof that it is correct.

### What to consider?

- The React POC already has 244 passing tests and 15 completed phases — the implementation is believed to be complete
- The mock server (`npm run server:dev`, port 3001) has FL001/FL002 with all 9 seat statuses and all passenger field scenarios
- The React app runs at `localhost:5174` with `npm run dev`
- Key areas likely to have gaps: loading/error states, edge cases (seat taken during assignment), keyboard navigation, responsive layout, legend completeness
- cloud2 uses PHP/Blade templates with JS (`dc_seat_plan_tab.js`) — compare React components against these files
- Previous parity audit (Phase 7) scored: Grid 18/30, States 28/40, Tokens 5/15 — post phases 8-15 scores should be much higher but need re-verification
- All fixes must be re-tested (regression test suite: `npm test`)

### What is NOT included?

- Backend/API changes — the mock server and cloud2 adapter layer are out of scope unless a parity gap requires a fix
- New features beyond what cloud2 has — this is a parity task, not an enhancement task
- Performance optimization
- Accessibility improvements beyond what cloud2 has

---

## Technical Information

**Relevant labels:** `ink-monitor`
**Affected components:** Departure Control System (Desktop) - DCS
**Versions:** —

**Useful links:**
- [Jira Issue](https://inkinnovation.atlassian.net/browse/ACA-2953)
- [Parent Feature](https://inkinnovation.atlassian.net/browse/ACA-2948)
- [Sibling Dev Task](https://inkinnovation.atlassian.net/browse/ACA-2950)

---

*Generated on: 2026-04-28 | Issue Key: ACA-2953 | Last updated: 2026-04-28*
