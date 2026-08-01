---
github_issue: N/A
title: 測試策略與測試基建（fixtures / 契約測試 / live smoke）
type: testing
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-08-01
---

# T019 - 測試策略與測試基建

## 目標
建立 §13 測試策略：錄製回放（golden fixtures）、契約測試（§5 歸一化規則）、Live smoke（限時段）、壓力測試工具。

## 驗收標準
- [x] Fixtures 目錄與錄製工具：`testdata/{twse,tpex,mops,taifex,mis}/` 存放官方 raw response；含 MIS 盤中多 tick 序列與 TAIFEX CSV 樣本；每 fixture 附抓取日期（FIXTURES.md）
- [x] 契約測試框架：`pkg/provider/contract_test.go` 對所有 Adapter 之 Normalize 輸出驗證 §5 規則（欄位型別、單位、日期格式、命名）——不連網；價差契約負價格以 per-case allowNegPrice 放行（§5.1 一般契約仍攔截）
- [x] Envelope 一致性測試：`pkg/mcp/app_envelope_test.go` 覆蓋全部 36 個已註冊 Tool，驗證 `_lineage` 欄位齊全（source/source_role/freshness/data_date/fetched_at 等）；盤中 A 組另驗證 http_calls=0
- [x] Live smoke：`pkg/mcp/live_smoke_test.go`（`-tags=live`，`make test-live`），僅開盤時段 09:00–13:30 執行，非開盤自動 Skip；MIS/TWSE 少量真實請求
- [x] 壓力測試工具：`cmd/loadtest`（`make loadtest`），20 併發 × 10 次對同一熱門股（2330）查詢，輸出快取命中率（實測 100%，目標 ≥80%）與延遲分位數（P99 <1ms）
- [x] `make test` 全綠；`go test -race ./...` 通過（RingBuffer/aggregator 並發重點）

## 備註
- Fixtures 一律於 CI 離線跑，避免 CI 觸發 Rate Limit
- 官方改版偵測：契約測試失敗時人工比對 fixture 與最新 raw，更新 fixtures 並註記（T012 備註同）
