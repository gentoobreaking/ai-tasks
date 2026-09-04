---
github_issue: ""
title: Algorithm / Valuation Config 版本化與鎖定
type: task
priority: high
status: done
depends_on:
  - T002
assignee: "pi with opencode"
created: 2026-09-03
updated: 2026-09-03
---

# T028 - Algorithm / Valuation Config 版本化與鎖定

## 目標
將 `VALUATION_SPEC.md §5.4-5.10` 中所有「不得由 LLM 決定」之參數與公式版本化、配置化、可追溯、不可竄改，並供 `T013 Comparable` / `T015 Valuation` 唯讀取用。

## 驗收標準
- [x] 定義 `algorithm_version` 表寫入邏輯：`version`（如 `comparable-v2.0`, `valuation-v2.0`）為 PK，含 `description, weights(JSONB), created_at`，由 migration 預植 `v2.0`，後續版本僅能 `INSERT` 不可 `UPDATE/DELETE`（DB trigger 強制）
- [x] 定義 `configuration_snapshot` 表寫入邏輯：`version` 遞增，`config` JSONB 含 `area_similarity_pct(預設30), lambda(time衰減), distance_scale, W_area, W_distance, W_time, W_zoning, W_land_use, W_road, IQR_k(1.5), minimum_required_comparables`，同樣僅 `INSERT`
- [x] 實作 `ConfigService`：`GetActiveConfig()`, `GetConfig(version)`, `CreateConfig(newWeights)`（產生新 `configuration_version` 並寫 `configuration_snapshot`），`GetAlgorithmVersion(name)`；所有讀取皆帶 `provenance{source, source_version}`
- [x] 鎖定機制：為 `algorithm_version` 與 `configuration_snapshot` 建立 `BEFORE UPDATE OR DELETE` trigger → `RAISE EXCEPTION 'artifact locked'`；由 `T020` 驗證 `UPDATE→FAIL`
- [x] Comparable / Valuation 僅唯讀：`T013` 的 `W_*` 與 `lambda/distance_scale`、`T014` 的 `IQR_k`、`T015` 的 `minimum_required` 皆從 `ConfigService` 取，不得 hard-code；單元測試以 `sqlmock` 驗證未直讀常數
- [x] `valuation_config` 變更可追溯：每次估值寫入 `valuation_result.configuration_version`（FK 至 `configuration_snapshot.version`），`T016 query_hash` 納入 `configuration_version`
- [x] 提供 `configs/valuation-v2.0.yaml` 範例檔與 `go:embed` 載入，內容與 DB 預設一致，CI 校驗 `yaml == DB config JSON`
- [x] 測試：建立 `v2.0` → 嘗試 `UPDATE weights` → 失敗；建立 `v2.1` 新配置 → 舊估值仍指向 `v2.0`；切換 active config 後新估值 `configuration_version` 正確變更

## 備註
- 對應 P5 Artifact Locking + VALUATION_SPEC.md §5.9-5.10，本任務是 `T013/T014/T015` 的前置依賴（依賴圖已重接）
- `algorithm_version` 用於 `metadata.algorithm_version` 與 `query_hash`，`configuration_version` 用於重現性（T019）
- 禁止 LLM 透過 MCP 修改權重（T021 負向測試覆蓋：`{weights:{...}}` → `INVALID_ARGUMENT`）