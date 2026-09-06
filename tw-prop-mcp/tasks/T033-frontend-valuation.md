---
github_issue: ""
title: Frontend — Valuation + Provenance UI
type: task
priority: high
status: pending
depends_on:
  - T022
assignee: "pi"
created: 2026-09-06
updated: 2026-09-06
---

# T033 - Valuation + Provenance UI

## Goal
Implement valuations and data provenance display per frontend_spec.md §15 (Valuation Panel) and §11 (Provenance).

## Acceptance Criteria
- [ ] Valuation panel shows: land value (bear/base/bull), confidence level, comparable count
- [ ] Valuation explanation: methodology, outlier handling, weighting rationale
- [ ] Provenance panel: shows data source chain (Transaction → Snapshot → Official Source)
- [ ] API errors handled: shows user-friendly message, no crash
- [ ] Loading states: spinner/progress during MCP calls
- [ ] Empty states: "No valuation data available" when not computed

## Notes
- MCP tools: `estimate_land_value`, `estimate_property_value`, `explain_valuation`, `get_data_provenance`
- Query hash shown for reproducibility (spec §P1)
- Valuation only computed if sufficient comparables exist