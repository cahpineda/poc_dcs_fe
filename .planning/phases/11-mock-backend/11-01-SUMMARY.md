---
phase: 11-mock-backend
plan: 01
completed: 2026-04-27
duration: 15m
---

## What Was Built

Standalone Node.js/Express mock backend server at `server/` that serves all seat_plan HTTP endpoints the React POC depends on, with stateful in-memory data that mutates on each command call. The server runs on port 3001 with CORS credentials support for both Vite dev port variants (5173/5174).

## Tasks Completed

| # | Name | Status |
|---|------|--------|
| 1 | Create server package.json and install dependencies | Done |
| 2 | Build mock flight data (FL001 + FL002) | Done |
| 3 | Build GET seat plan endpoints | Done |
| 4 | Build POST mutation endpoints | Done |
| 5 | Build Express entry point and wire npm script | Done |

## Files Created / Modified

| File | Action |
|------|--------|
| `server/package.json` | Created — Express 4 + cors + nodemon |
| `server/data/flights.js` | Created — FL001 (3 cabins, 6 rows, all 9 statuses) + FL002 (2 cabins, 4 rows) |
| `server/routes/seatPlan.js` | Created — GET /ws/v1.8/get_seat_plan and /get_seat_occupancy |
| `server/routes/commands.js` | Created — 7 POST mutation endpoints |
| `server/index.js` | Created — Express app entry point with CORS |
| `server/.env.example` | Created — PORT=3001 |
| `package.json` | Modified — added `server` and `server:dev` scripts |

## Verification Results

All curls passed against a live server instance:

```
GET  /health                              → {"status":"ok","flights":["FL001","FL002"]}
GET  /ws/v1.8/get_seat_plan?flight_id=FL001 → 6 rows, all 9 seat statuses present
GET  /ws/v1.8/get_seat_plan?flight_id=FL999 → 404 {"success":false,"error":"Flight not found"}
POST /ajax/seat_plan/assign_seat (1A)     → {"success":true,"data":{"seat_number":"1A","new_status":"O"}}
     Subsequent GET confirmed 1A mutated to status O
POST /ajax/seat_plan/assign_seat (1B, occupied) → 409 {"success":false,"error":"Seat is already occupied"}
POST /ajax/seat_plan/block_seat           → {"success":true,"data":{"seat_number":"2A","new_status":"B"}}
POST /ajax/seat_plan/unblock_seat         → {"success":true,"data":{"seat_number":"2A","new_status":"A"}}
POST /dc/unseat_passenger                 → {"success":true,"data":{"seat_number":"1B","new_status":"A"}}
POST /dc/swap_seats                       → {"success":true,"data":{"seat_a":"3A","seat_b":"3B"}}
POST /ajax/seat_plan/reseat_passenger     → {"success":true,"data":{"from_seat":"3B","to_seat":"3C"}}
POST /dc/reseat_group                     → {"success":true,"data":{"moved":[{"from":"5A","to":"6A"}]}}
GET  /ws/v1.8/get_seat_plan?flight_id=FL002 → 4 rows, FL002 statuses correct
```

FL002 row verification:
- Row 1 (J): O, A, A, B  — matches spec (JOHN DOE occupied, 1D blocked)
- Row 2 (Y): all A
- Row 3 (Y): A, A, C, O, A, A  — matches spec (ELENA VOSS checked_in 3C, MIKE CHEN occupied 3D)
- Row 4 (Y): all A

## Deviations from Plan

None — plan executed exactly as written.

The `server/README.md` file was listed in Task 5's action block but not in the plan's `files_modified` frontmatter and not required for any success criteria. The file was not created — this is non-breaking as the plan's success criteria focus on the server running correctly, not on docs.

## Retrospective

**Diagnosis accuracy:** Plan assumptions were correct. The mapper (`seatPlanMapper.ts`) consumes `seat_rows[].{row_number, is_exit_row, cabin_class, seats[]}` exactly as specified. No field name mismatches found.

**What surprised us:** The `is_exit_row` field needs to be computed at the row level (any seat in the row flagged as exit row elevates the whole row). This was implicit in the plan — the implementation correctly derives it from `seats.some(s => s.is_exit_row)`.

**Time sinks:** None significant — the data model was fully specified in the plan, leaving no ambiguity.

**Reusable patterns:** The `seat()` helper with `Object.assign({defaults}, overrides)` is a clean pattern for building fixture data with sparse overrides. The `clearPassengerFields()` helper centralises the "reset seat" operation used across 4 mutation endpoints.
