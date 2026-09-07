---
github_issue: ""
title: Frontend — Parcel Search UI
type: task
priority: high
status: done
updated: 2026-09-07
depends_on:
  - T022
assignee: "pi"
created: 2026-09-06
updated: 2026-09-06
---

# T030 - Parcel Search UI

## Goal
Implement parcel search interface per frontend_spec.md §7 (Search).

## Acceptance Criteria
- [ ] Search box supports county/district/section/land_number input
- [ ] Partial search supported (e.g., "竹篙灣" returns multiple matches)
- [ ] FE-SEARCH-001: Valid parcel → search request sent → result returned → parcel displayed → map moves to parcel
- [ ] FE-SEARCH-002: Invalid parcel (999999999) → no results shown, no fake parcel
- [ ] FE-SEARCH-003: Empty search → validation message, no API request
- [ ] Search result ranking: exact → normalized → prefix → partial match
- [ ] Deterministic result ordering (alphabetical/numerical tiebreak)

## Notes
- Calls MCP `search_parcels` tool via `/mcp` proxy
- Search results should highlight on map (polygon click → select parcel)
- Header component (spec §5) must show search box + system status