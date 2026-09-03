---
github_issue: ""
title: Comparable / Valuation 結果持久化
type: task
priority: high
status: pending
depends_on: ["T002", "T015", "T028"]
assignee: pi
created: 2026-09-03
updated: 2026-09-03
---

# T029 - Comparable / Valuation 結果持久化

## 目標
將 `DATA_MODEL.md §2.11` 的 `comparable_result` 與 `valuation_result` 從「計算即丟」改為可持久化、可追溯、可重放，供 `T017 MCP` 與 `T019 重現性` 直接讀取歷史結果。

## 驗收標準
- [ ] 定義 `sql/comparable_result.sql` 與 `sql/valuation_result.sql`，`sqlc generate` 產生 `ComparableResultRepository` / `ValuationResultRepository`（pgx + sqlc，無 ORM）
- [ ] `ComparableResultRepository`：`BatchInsert(results)`, `ListByTarget(target_parcel_id, snapshot_id)`, `GetByID(id)`；欄位對齊 `T002` DDL（含 `distance_m, area_similarity, zoning_match, land_use_match, road_access_match, time_score, total_score, algorithm_version`）
- [ ] `ValuationResultRepository`：`Insert(result)`, `GetByID(valuation_id)`, `ListByParcel(parcel_id, snapshot_id)`；欄位含 `comparable_ids(JSONB), algorithm_version, configuration_version, outlier_method, weights(JSONB), statistics(JSONB), bear_value, base_value, bull_value, confidence, status`
- [ ] 寫入時強制 provenance：`snapshot_id, algorithm_version, configuration_version` 必填，缺失 → `INVALID_ARGUMENT`；自動寫入 `created_at`
- [ ] 估值寫入原子性：`T015` 計算 `valuation_result` 時在同一 transaction 內寫入 `valuation_result` + 對應多筆 `comparable_result`，失敗全回滾
- [ ] 查詢 deterministic：`ListByTarget` 以 `total_score DESC, distance_m ASC, transaction_id ASC` 固定排序，相同輸入多次查詢順序一致
- [ ] 整合 `T016`：`ValuationResult` 的 `GetProvenance` 可 JOIN `transaction` → `snapshot` → `manifest` 全鏈
- [ ] 測試：`testcontainers` 整合測試，含 `INSERT → GET` 回讀、`ListByTarget` 排序、`UNIQUE` 衝突、JSONB 權重與統計序列化正確性；regression seed 固定

## 備註
- 本任務依賴 `T002` DDL 與 `T028` 版本號，`T017` 已新增 `depends_on: T029` 確保 MCP 讀歷史結果
- `valuation_result` 的 `statistics` 與 `weights` 以 JSONB 存，查詢時由 `sqlc` 解為 Go struct（`json.RawMessage` → `ValuationWeights`）
- 不在此任務做估值計算（由 T015），僅負責持久化與讀取
