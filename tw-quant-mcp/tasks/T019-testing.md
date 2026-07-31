---
github_issue: N/A
title: 測試策略與測試基建（fixtures / 契約測試 / live smoke）
type: testing
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31
---

# T019 - 測試策略與測試基建

## 目標
建立 §13 測試策略：錄製回放（golden fixtures）、契約測試（§5 歸一化規則）、Live smoke（限時段）、壓力測試工具。

## 驗收標準
- [ ] Fixtures 目錄與錄製工具：`testdata/{twse,tpex,mops,taifex,mis}/` 存放官方 raw response；含 MIS 盤中多 tick 序列與 TAIFEX CSV 樣本；每 fixture 附抓取日期
- [ ] 契約測試框架：對所有 Adapter 之 Normalize 輸出驗證 §5 規則（欄位型別、單位、日期格式、命名）——不連網
- [ ] Envelope 一致性測試：所有已註冊 Tool 之回傳皆含 `_lineage` 且欄位齊全（freshness/单位正確）
- [ ] Live smoke：僅於 CI 指定時段（開盤時間）執行之標記測試（`-tags=live`），對 MIS/TWSE 少量真實請求驗證路徑
- [ ] 壓力測試工具（`test` 或 `cmd/loadtest`）：模擬 20 併發 Client 對同一熱門股查詢，輸出快取命中率與延遲分位數
- [ ] `make test` 全綠；`go test -race ./...` 通過（RingBuffer/aggregator 並發重點）

## 備註
- Fixtures 一律於 CI 離線跑，避免 CI 觸發 Rate Limit
- 官方改版偵測：契約測試失敗時人工比對 fixture 與最新 raw，更新 fixtures 並註記（T012 備註同）
