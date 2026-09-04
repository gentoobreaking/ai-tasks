---
github_issue: ""
title: MCP Server Implementation
type: task
priority: high
status: done
depends_on:
  - T009
  - T010
  - T011
  - T012
  - T013
  - T015
  - T016
  - T026
  - T027
  - T028
  - T029
assignee: "pi with opencode"
created: 2026-09-03
updated: 2026-09-04
---

# T017 - MCP Server Implementation

## 目標
使用官方 Go MCP SDK（`github.com/modelcontextprotocol/go-sdk/mcp`）實作 MCP Server 骨架與全部 Tool/Resource 註冊，強制結構化參數 + 統一錯誤模型 + Provenance 注入，達成 AI Isolation 邊界。

## 驗收標準
### Server 骨架
- [ ] 以 `mcp.NewServer()` 建立 Server，支援 `stdio` 與 `Streamable HTTP` 雙 transport；HTTP 模式以 `Chi` / `net/http` 暴露 `/mcp`，含 `request_id` 中間件
- [ ] 整合 `T016 ProvenanceMiddleware`：所有 tool 回應自動注入 `metadata{algorithm_version, snapshot_id, generated_at, query_hash}` 與 `data_provenance`
- [ ] 整合 Observability：`mcp_requests_total`, `mcp_request_duration_seconds` Prometheus 指標；OpenTelemetry trace 含 `tool_name, snapshot_id, query_hash`；log 含 `request_id, tool_name, snapshot_id, algorithm_version, query_hash`

### Transaction Tools（依賴 T009 + T026）
- [ ] `search_transactions`：input `{county, district, section?, land_number?, date_from?, date_to?, limit?, offset?}`（禁止 `sql`, `where`, `postgis` 欄位）→ output `{transactions[], statistics{count,min,P10,P25,median,mean,P75,P90,max}, data_provenance, metadata}`；空結果回 `[]` 非錯誤
- [ ] `get_transaction`：input `{transaction_id}` → 回單筆 + provenance；找不到 → `TRANSACTION_NOT_FOUND`
- [ ] `get_transaction_statistics`：依相同 filters 計算 `price_per_ping` 統計（1 坪=3.305785㎡）

### Parcel Tools（依賴 T010）
- [ ] `get_parcel`：input `{county, district, section, land_number}` 完整四鍵 → 單筆 parcel + geometry 摘要
- [ ] `search_parcels`：input `{county, district, section?, area_min_sqm?, area_max_sqm?, urban_zoning?}` → 分頁列表

### GIS Tools（依賴 T011 + T027 + T012）
- [ ] `get_parcel_geometry`：回 `geometry(MultiPolygon,3826)`, `centroid`, `bbox`, `area_sqm`，座標可選 `EPSG:4326` 輸出（內部仍 3826 計算）
- [ ] `get_parcel_location` / `find_nearby_roads` / `get_parcel_map_context`：回 centroid 經緯度、附近道路列表、前端疊圖所需 `map_context{latitude, longitude, zoom}`
- [ ] `check_road_access`：input `{parcel_id, search_radius_m?}` → `{status: ROAD_ADJACENT|ROAD_NEARBY|NO_ROAD_DETECTED|UNKNOWN, distance_m, road_width_m, width_source: OFFICIAL|GIS_DERIVED|UNKNOWN}`，四種 status 皆可觸發

### Comparable Tools（依賴 T013 + T029）
- [ ] `find_comparable_transactions`：input `{target{county,district,section,land_number}, filters{years, area_similarity_pct, same_zoning, same_land_use, road_access_required}, limit}` → hard filters + scoring + `{comparables[], algorithm_version}`
- [ ] `score_comparable_transactions`：回每筆 `distance_m, area_similarity, zoning_match, land_use_match, road_access_match, time_score, total_score` 明細

### Valuation Tools（依賴 T015 + T028 + T029）
- [ ] `estimate_land_value`：input `{parcel_id, snapshot_id?}` → `{bear_value, base_value(weighted median), bull_value, confidence, comparable_ids, statistics, provenance}`；`comparable_count < minimum_required` → `{status: INSUFFICIENT_DATA, reason[]}` 不硬算
- [ ] `estimate_property_value` / `explain_valuation`：含 `valuation_id, weights, outlier_method, configuration_version` 可追溯解釋

### Provenance Tools（依賴 T016）
- [ ] `get_data_snapshot`：input `{snapshot_id}` → snapshot 全欄位 + manifest
- [ ] `get_data_provenance`：input `{transaction_id? , valuation_id?}` → 完整溯源鏈

### 錯誤模型與 Resources
- [ ] 統一錯誤 envelope `{error{code,message,retryable}}`；9 碼齊全：`INVALID_ARGUMENT, PARCEL_NOT_FOUND, TRANSACTION_NOT_FOUND, DATA_NOT_AVAILABLE, GIS_NOT_AVAILABLE, SNAPSHOT_NOT_FOUND, VALUATION_NOT_AVAILABLE, SOURCE_UNAVAILABLE, INTERNAL_ERROR`；參數缺漏 → `INVALID_ARGUMENT`（retryable=false）
- [ ] MCP Resources 實作並可 `Read`：`realestate://snapshot/{id}`, `realestate://transaction/{id}`, `realestate://parcel/{id}`, `realestate://valuation/{id}`, `realestate://algorithm/{version}`（回 JSON + provenance）
- [ ] AI Isolation 負向測試：`{sql:"SELECT..."}`, `{where:"..."}`, `{postgis:"ST_DWithin..."}`, `{valuation_formula:"..."}`, `{weights:{...}}` 透過 tool 傳入 → 全數 `INVALID_ARGUMENT` 拒絕，無 SQL 直通
- [ ] 所有 Tool `inputSchema` / `outputSchema` 以 JSON Schema 定義並由 `T018` 快照比對防漂移

## 備註
- 官方 SDK 用法：`mcp.NewServer()` + `mcp.AddTool(server, &mcp.Tool{Name, Description, InputSchema}, handler)`；handler 內僅呼叫 Service，禁止直連 `pgx` / `PostGIS`
- 本任務為單 session 上限，需與下游 `T018 Contract Tests` 緊密對接；`T026/T027` 匯入資料為所有 tool 的前置資料來源
