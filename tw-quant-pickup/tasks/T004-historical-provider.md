---
github_issue: N/A
title: HistoricalPriceProvider（上櫃歷史價格回補）
type: task
priority: P1
status: pending
depends_on: [T001, T003]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T004 - HistoricalPriceProvider（上櫃歷史價格回補）

## 目標

實作 §6 `HistoricalPriceProvider`：上櫃（TPEx）日 K 歷史回補，回補 ≥5Y，供回測與技術指標使用，不進個股 Fair Value。實作候選：FinMind `TaiwanStockPrice`（首選，selector 已驗證）或 Yahoo Finance（備選）。資料標 `source_role = FALLBACK`（§7 備援來源清單）。

## 驗收標準

- [ ] `get_historical_prices(symbol, start_date, end_date) -> list[DailyPrice]` 按 Protocol 實作（§6）
- [ ] 上櫃標的可回補 ≥5Y（§37.1 Backtest Data Availability Matrix 真實反映）
- [ ] 回補資料寫入 daily_prices，lineage 標 `source=FINMIND`（或 YAHOO_FINANCE）、`source_role=FALLBACK`（§7.1 備援清單）
- [ ] 回補後不可再改變：資料不可被後續回補覆蓋，確保回測重現性（§37.1 限制欄、§45）
- [ ] 回補資料只用於回測 / 技術指標，明確禁止進入 Fair Value / Score / Ranking / Buy Zone（§7 FALLBACK 原則）
- [ ] 上市標的仍以 McpProvider 為主來源，歷史跨度以官方 ≥10Y（§37.1）
- [ ] unit test：空區間、跨年度、除權息前後資料正確性

## 備註

- FinMind 需要 token；Yahoo 不需 key（免費端點）——作為備選實作，config 切換
- 與 T021（backtest）有依賴：矩陣 §37.1 需在此任務產出初版