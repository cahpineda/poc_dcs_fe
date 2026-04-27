---
requested_issue_key: ACA-2950
ticket_status: To Do
hierarchy_mode: all
generated: 2026-04-27
---

> **TASK SCOPE — IMPLEMENT ONLY:** `ACA-2950` (REQUESTED). All other issues in this file (parent hierarchy, related issues) are **reference context only** — they explain the WHY and HOW, but must NOT be planned or implemented.

# ACA-2950: Scaffold React project structure for seat_plan migration (REQUESTED)

**Type:** Dev (Sub-task)
**Status:** To Do
**Priority:** Normal
**Assignee:** Carlos Hurtado
**Reporter:** Carlos Hurtado
**Created:** 2026-04-27
**Updated:** 2026-04-27

---

## Description

Set up the initial React project scaffold for the seat_plan frontend migration from cloud2.

**Scope:**
- Bootstrap React project (Vite or CRA per team standard)
- Define folder structure: components, pages, services, hooks
- Install and configure base dependencies
- Verify project runs locally without errors

**Acceptance Criteria:**
- React project is bootstrapped and runs locally
- Folder structure follows team conventions
- Base dependencies are installed and configured
- No build or runtime errors on initial run

---

## Hierarchy

The complete hierarchy from Feature to this sub-task: Feature → Dev Sub-task

### Feature: ACA-2948

**Summary:** Migrate seat_plan frontend feature from cloud2 to React
**Status:** In Progress
**Type:** Feature
**Priority:** Normal
**Assignee:** Carlos Hurtado

**Description:** Create a new React project to migrate the frontend implementation of the seat_plan feature from cloud2. This includes setting up the React project structure, replicating existing functionality, and ensuring feature parity with the cloud2 implementation.

### ACA-2950 (REQUESTED)

**Summary:** Scaffold React project structure for seat_plan migration
**Status:** To Do
**Type:** Dev (Sub-task)
**Priority:** Normal

**Labels:** `ink-monitor`
**Components:** Departure Control System (Desktop) - DCS

---

## Related Issues

### Subtasks

No subtasks.

### Links

No linked issues.

### Other Issues from Same Epic

No Epic association found for ACA-2948 — same-epic issues not available.

---

## Important History

### 2026-04-27 — Status Change

**From:** Technical Review → **To:** To Do
**By:** Carlos Hurtado

---

### 2026-04-27 — Label Added

**Label added:** `ink-monitor`
**By:** Carlos Hurtado

---

### 2026-04-27 — Time Estimate Set

**Original estimate:** 8h
**By:** Carlos Hurtado

---

### 2026-04-27 — Parent Assigned

**Parent set:** ACA-2948 (Migrate seat_plan frontend feature from cloud2 to React)
**By:** Carlos Hurtado

---

## Raw Fields

| Field | Value |
|-------|-------|
| key | ACA-2950 |
| id | 141974 |
| issuetype | Dev (subtask, hierarchyLevel: -1) |
| status | To Do |
| priority | Normal |
| assignee | Carlos Hurtado |
| reporter | Carlos Hurtado |
| creator | Carlos Hurtado |
| parent | ACA-2948 |
| labels | ink-monitor |
| components | — |
| customfield_10086 | Departure Control System (Desktop) - DCS |
| customfield_10473 | Low |
| timeoriginalestimate | 28800 (8h) |
| timeestimate | 28800 (8h) |
| timespent | null |
| project | ACA — AI Coding Agency |
| fixVersions | — |
| resolutiondate | null |
| duedate | null |
| created | 2026-04-27T19:13:53+0200 |
| updated | 2026-04-27T19:15:09+0200 |

---

## Development Context

### What needs to be done?

Bootstrap a React project to serve as the foundation for migrating the `seat_plan` feature's frontend from cloud2. Set up the project scaffold with proper folder structure, tooling, and base dependencies so the team can begin implementing seat_plan UI components.

### Why is it important?

This is the first and foundational sub-task of ACA-2948 (seat_plan frontend migration). Without the project scaffold, no further development work on the migration can proceed. ACA-2948 is currently In Progress, making this a blocking deliverable.

### What to consider?

- Align the React project setup with the team's existing frontend tooling (check whether Vite or Create React App is the team standard)
- Folder structure should mirror conventions used in other React projects in the codebase: `components/`, `pages/`, `services/`, `hooks/`
- Identify and document which APIs the cloud2 seat_plan feature calls — these will need to be wired up in subsequent sub-tasks
- Confirm whether TypeScript is required (likely, given team standard)

### What is NOT included?

- Implementing seat_plan UI components (separate sub-tasks)
- Migrating API integrations or business logic from cloud2
- Any backend changes

---

## Technical Information

**Relevant labels:** `ink-monitor`
**Affected components:** Departure Control System (Desktop) - DCS
**Original estimate:** 8h

**Useful links:**
- [Jira Issue](https://inkinnovation.atlassian.net/browse/ACA-2950)
- [Parent Feature](https://inkinnovation.atlassian.net/browse/ACA-2948)

---

*Generated on: 2026-04-27 | Issue Key: ACA-2950 | Last updated: 2026-04-27*
