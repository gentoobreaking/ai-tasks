---
github_issue: ""
title: Frontend — Search/Filter UI + Provider Toggle
type: task
priority: high
status: done
depends_on:
  - T017
assignee: "pi"
created: 2026-09-06
updated: 2026-09-07
---

# T022 - Frontend Implementation

## Goal
Implement frontend matching [frontend_spec.md](frontend_spec.md) §2 Completion Definition:  
**All 15 criteria must pass** — application loads, search works, filters work, map interactions work, parcel inspection, transaction detail, comparable analysis, GIS info, valuation, satellite layer, Street View, loading/empty/error states, provenance visible, no mock data, acceptance tests pass.

> Currently only Leaflet map renders (no search UI, no Google Maps layers).

## Acceptance Criteria (from spec §2)
- [ ] Application loads successfully  
- [ ] Search works (FE-SEARCH-001): parcel lookup → displayed + map moves  
- [ ] Search results work  
- [ ] Filter works  
- [ ] Map interaction works  
- [ ] Parcel selection works  
- [ ] Parcel detail works  
- [ ] Transaction detail works  
- [ ] Comparable analysis works  
- [ ] Road/GIS information works  
- [ ] Valuation works  
- [ ] Satellite layer works  
- [ ] Street View works (google provider only)  
- [ ] Loading states exist  
- [ ] Empty states exist  
- [ ] Error states exist  
- [ ] Provenance is visible  
- [ ] No fake/mock production data  

## Notes
- **Provider toggle required**: `MAP_PROVIDER=leaflet` (default, OSM) | `google` (needs API key)
- **Runtime config**: `runtime-config.js` injects MCP_SERVER_URL + GOOGLE_MAPS_API_KEY via nginx entrypoint
- **GIS layers**: NLSC tiles proxied via `/proxy/nlsc/` (CORS bypass)
- **Backend dependency**: Go MCP server (`t17`) provides all data via `/mcp` endpoint