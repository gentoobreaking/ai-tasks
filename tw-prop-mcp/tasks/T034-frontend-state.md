---
github_issue: ""
title: Frontend — State Management + Error Handling
type: task
priority: medium
status: done
depends_on:
  - T022
assignee: "pi"
created: 2026-09-06
updated: 2026-09-07
---

# T034 - Frontend — State Management + Error Handling

## Goal
Implement robust frontend state management and error handling per frontend_spec.md §16–§18.

## Acceptance Criteria
- [ ] Global loading state during initial data fetch
- [ ] Per-component loading spinners (parcel, transactions, valuation)
- [ ] Empty state patterns: dedicated components for no data scenarios
- [ ] Error boundary: catches JS errors, shows fallback UI
- [ ] MCP connection errors handled gracefully: "API Connected" / "Connection lost, retrying…"
- [ ] No fake/mock production data — all data flows through real MCP tools
- [ ] Retry logic for transient connection failures

## Notes
- Current `useMCP.ts` uses hardcoded `001-002-003` sample parcel — needs UI to drive parcel selection
- `MapView.tsx` has provider toggle but Google Maps components were missing (now restored)
- Error messages should reference SPEC.md error codes (INVALID_ARGUMENT, PARCEL_NOT_FOUND, etc.)