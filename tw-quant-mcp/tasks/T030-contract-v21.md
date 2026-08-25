---
github_issue: N/A
title: v2.1 版契約測試與全量回歸（v2.1 §6 / §14）
type: testing
priority: medium
status: done
assignee: pi with opencode/x-preview-f-free
created: 2026-08-01
updated: 2026-08-03
depends_on: []
---

# T030 - v2.1 版契約測試與全量回歸

## 目標
為 v2.1 升級補齊契約測試：每個 Adapter 之 Normalize 輸出符合 §6 正規化 Schema（欄位型別/單位/日期）；Lineage / Cache / Chart 欄位一致性（v2.1 §13 Phase 6 測試項目）；全量 37 工具回歸。產出 v2.1 需求對照表（§14）核對。

## 驗收標準
- [x] 七個 Adapter 各至少一個契約測試：驗證 Normalize 輸出型別/單位/日期符合 §6（錄製回放 golden fixtures）
- [x] 全量 37 工具之 Lineage / Cache / Chart 欄位一致性測試（freshness / source_role / grade / cache_age_sec 正確）
- [x] 全量工具回歸：`go test ./...` 全數通過（含 T021–T029 新增測試）
- [x] v2.1 §14 需求對照表核對：7 項優化需求 + 10 情境 + 25 Tool 逐條勾稽，產出 traceability 文件（放 README 或 docs/）
- [x] 壓測：20 併發同熱門股查詢，Single-flight / 快取命中率 ≥ 80%（沿用 v1.3 §13 目標）

## 備註
- 前置：T021–T029 完成後執行
- 此為 v2.1 收尾驗證任務，類似 v1.3 之 T019；完成後接 T031 發布

## 完成摘要（2026-08-03）
- **生產修正**：
  - `get_market_summary`（`pkg/mcp/tools_bc.go`）：`marketStatsTSE`/`marketStatsOTC` 原丟棄 `fetchNormalize` 之 `cached` 旗標，且 handler 誤以 `staleTSE||staleOTC` 當 cached 傳入 `postLineage` → 二次呼叫 `is_cached` 恆 false。修正為回傳 `(stats, cached, stale, err)` 並以 `cachedTSE||cachedOTC` 標註。
  - TAIFEX 工具（`pkg/mcp/tools_fg.go`）：`taifexLineage`/`rangeLineage` 原未填 `cache_ttl`（恆 0）。新增 `a.taifexTTL()`（§4.2 TAIFEX 歷史 7 天，與 `taifex_query.go` L2 政策一致），8 個 lineage 建構點全數補上。
- **測試**：
  - 新增 `pkg/mcp/cache_consistency_test.go`（T030 驗收 #2 之 Cache 維度）：全量 37 工具二次呼叫一致性；支援 Multi-lineage（trend composite 檢查子來源，v2.1 §4 規則 2）。
  - 新增 `pkg/mcp/stress_test.go`（T030 驗收 #5）：20 併發 × 10 次同熱門股（2330）查詢，命中率 ≥ 80% + Single-flight 上游呼叫 ≪ 查詢數；`go test ./...` 內建執行。
  - `fakeTAIFEX`（`pkg/mcp/app_fg_test.go`）：依鍵累計呼叫次數，第二次起模擬 L1/L2 快取命中（single 回傳 cached=true；range 各日 IsCached=true），與真實 `TAIFEXQuery` 行為一致。
  - 既有七來源契約測試（`pkg/provider/contract_test.go` + `testdata/`）核對：TWSE-Web 20 / TWSE-API 7 / TPEx 10 / MOPS 5 / TAIFEX-API 4+ / TAIFEX-DL 6 / MIS 1 fixture，輸出型別/單位/日期符合 §5/§6。
- **文件**：新增 `docs/TRACEABILITY-v2.1.md`（§14 逐條勾稽：7 優化需求 → 實作位置/驗收測試；10 情境 × 25 Tool → 本專案對應工具/Grade/狀態）；README 新增連結。
- **其他**：`scripts/release_check.sh` 工具數 36→37（T029 新增工具）並修正 PASS 行全形括號造成之變數展開問題；`make check`、`go vet ./...`、`gofmt`、`make test-race` 全綠；`cmd/loadtest` PASS（200 查詢、命中率 100%、Single-flight 上游僅 3 次、P99=4.9ms）。

## 執行紀錄（2026-08-25 稽核）
- 驗收標準逐條對照程式碼與測試後勾選。
- 證據：registry 註冊＋TestAllToolsEnvelopeConsistent 全工具 probe、snapshots/raw/get_market_summary.json、TestAllToolsCacheConsistency 全工具覆蓋、go vet/go test 全綠。
- README 更新以 commit ac57a5c 之自動產生附錄形式補齊。
