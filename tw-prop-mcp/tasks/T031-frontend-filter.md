---
github_issue: ""
title: Frontend — Transaction / Filter UI
type: task
priority: medium
status: done
depends_on:
  - T022
assignee: "pi"
created: 2026-09-06
updated: 2026-09-07
---

# T031 - Transaction / Filter UI

## Goal
Implement transaction filtering per frontend_spec.md §8 (Filter) and §13–§14 (Transaction Panel / Comparable Panel).

## Acceptance Criteria
- [ ] Filter supports: county, section, date range, land area, zoning, land use, price range, unit price
- [ ] Transaction detail panel shows full record (price, area, date, building specs, provenance)
- [ ] Comparable analysis panel shows scored comparables with distance/area/time/zoning/road scores
- [ ] Filters trigger MCP calls (`search_transactions`, `find_comparable_transactions`)
- [ ] Deterministic filtering — same params → same results

## Notes
- Backend tools: `search_transactions`, `get_transaction`, `find_comparable_transactions`, `score_comparable_transactions`
- Filter panel should be desktop-first layout (spec §4: 1280×720 minimum)