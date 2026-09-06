---
github_issue: ""
title: Frontend — Map Interaction + Layers
type: task
priority: high
status: pending
depends_on:
  - T022
assignee: "pi"
created: 2026-09-06
updated: 2026-09-06
---

# T032 - Map Interaction + Layers

## Goal
Implement full map workspace per frontend_spec.md §9–§12 (Map, Parcel Inspector, GIS/Road Panel, Street View).

## Acceptance Criteria
- [ ] Map interaction: pan, zoom, click parcel polygon
- [ ] Parcel selection: click polygon → Parcel Inspector panel opens
- [ ] Parcel detail: shows land number, area, zoning, geometry info
- [ ] Road/GIS panel: shows road access classification, nearby roads, geometry
- [ ] Satellite layer: toggle between OSM + satellite (ESRI WorldImagery in Leaflet)
- [ ] NLSC cadastral overlay: toggle on/off (proxied via `/proxy/nlsc/`)
- [ ] Street View: available when `MAP_PROVIDER=google`, hidden in Leaflet mode
- [ ] Loading/empty/error states for map layers

## Notes
- Leaflet ParcelLayer: parses WKT MULTIPOLYGON from MCP geometry
- Google Maps ParcelLayer: requires `GOOGLE_MAPS_API_KEY` via runtime-config.js
- Map context: MCP `get_parcel_map_context` provides combined data
- Provider toggle via `MAP_PROVIDER` env (no rebuild needed)