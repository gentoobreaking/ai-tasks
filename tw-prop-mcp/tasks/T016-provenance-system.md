---
github_issue: ""
title: Provenance System
type: task
status: done
updated: 2026-09-04
depends_on: ["T003", "T009", "T010", "T015"]
assignee: pi
created: 2026-09-03
updated: 2026-09-03
---

# T016 - Provenance System

## 目標
實作完整的資料溯源系統（含 Query Hash）並確保每個 MCP tool 回應皆注入 `metadata` + `data_provenance`，達成 Transaction → Snapshot → Official Source 與 Valuation → Comparables → Transactions → Snapshot 全鏈可重現。

## 驗收標準
- [ ] Domain 層：所有核心實體 `Transaction, Parcel, ParcelGeometry, RoadSegment, ParcelRoadAccess, ComparableResult, ValuationResult` 皆含 `source, source_version, snapshot_id, source_record_hash, import_batch_id` 欄位
- [ ] 實作 `ProvenanceService`：`GetSnapshot(id)`, `GetProvenanceByTransaction(id)`, `GetProvenanceByValuation(id)`，回傳完整鏈（DB JOIN + snapshot manifest 讀取）
- [ ] 實作 `get_data_snapshot` 工具邏輯：輸入 `snapshot_id` → 回傳 `dataset_snapshot` 全欄位 + `file_sha256` + `source_metadata` + `record_count` + `status`
- [ ] 實作 `get_data_provenance` 工具邏輯：輸入 `transaction_id` 或 `valuation_id` → 回傳 `{source, dataset_snapshot, source_file, record_hash, import_batch_id, algorithm_version, configuration_version}`，缺一不可（P6）
- [ ] Query Hash 規格：`canonicalize({input_params 排序後 JSON, algorithm_version, configuration_version, snapshot_id}) → SHA256 hex → query_hash`；提供 `HashQuery(input, algoVer, configVer, snapshotID) string` 純函數，無隨機/時間依賴
- [ ] 實作 `ResponseEnvelope`：每個 Service 回傳前由 `ProvenanceMiddleware` 注入 `metadata{algorithm_version, snapshot_id, generated_at(RFC3339), query_hash}` 與 `data_provenance{source, dataset_snapshot, source_file, record_hash, import_batch_id, algorithm_version}`
- [ ] Valuation Provenance 完整記錄：`valuation_id, target_parcel(county/district/section/land_number), snapshot_id, comparable_ids[], algorithm_version(comparable-v2.0), configuration_version, outlier_method(IQR), weights{W_area,W_distance,W_time,W_zoning,W_land_use,W_road}, statistics{count,min,P10,P25,median,mean,P75,P90,max}, created_at`
- [ ] Transaction 溯源鏈測試：`transaction → snapshot → manifest → checksum` 可反向追回原始檔名
- [ ] Valuation 溯源鏈測試：`valuation → comparable_ids → transactions → snapshot → official source` 全鏈可遍歷，任一環缺失 → 回傳 `DATA_NOT_AVAILABLE`
- [ ] Query Hash 決定性測試：相同 `input+algo+config+snapshot` → 百次 `query_hash` 相同；任一參數異動 1 bit → hash 改變；`generated_at` 不參與 hash
- [ ] MCP 回應注入測試：`search_transactions, get_parcel, find_comparable_transactions, estimate_land_value` 四類回應皆含 `metadata.query_hash` 與 `data_provenance.snapshot_id`，缺失則 contract test 失敗
- [ ] 單元測試 + 整合測試（testcontainers）：含成功/找不到/版本不匹配三態

## 備註
- P6 Provenance Required + P3 Deterministic First 直接驗證：`query_hash` 用於 reproducibility / audit / cache / regression test
- 本任務不直接註冊 MCP Tool（由 T017 註冊），但提供 `ProvenanceService` 與 `HashQuery` 供 T017 / T019 / T025 呼叫
- Valuation provenance 欄位對齊 VALUATION_SPEC.md §5.16，缺漏會導致 T019 重現性測試無法通過