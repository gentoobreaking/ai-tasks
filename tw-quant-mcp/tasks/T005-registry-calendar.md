---
github_issue: N/A
title: Symbol Registry 與交易日曆
type: feature
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31
---

# T005 - Symbol Registry 與交易日曆

## 目標
實作 `pkg/model.Symbol` 之 Registry（§5.2）與 `pkg/calendar` 交易日曆：從 TWSE/TPEx 官方清單載入並預熱至 L2，提供 market 判定與交易日判定（附錄 A）。

## 驗收標準
- [ ] Registry 資料源：TWSE 上市清單 + TPEx 上櫃清單官方 OpenAPI，每日預熱入 L2（24h TTL）
- [ ] `Lookup(code) (Symbol, ok)`：上市/上櫃判定正確（含 `ex_ch` 前綴 `tse_`/`otc_`）
- [ ] 未知代碼回傳明確錯誤，供各 Tool handler 回覆
- [ ] 交易日曆：支援當年休市日（官方行事曆來源），`IsTradingDay(date)` 正確處理週末與假日
- [ ] 盤中引擎與預熱排程（T018）皆依賴此模組判定是否執行
- [ ] 單元測試：節日（如元旦、春節）、週末、補班日案例；Registry 載入/更新

## 備註
- MIS `ex_ch` 組裝**一律**經 Registry，禁止猜測市場別（v1.2 已知缺失）
- 行事曆資料若官方未提供遠端來源，允許內嵌靜態表並標註版本
