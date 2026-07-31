---
github_issue: N/A
title: B/C 組盤後行情、籌碼與風險工具
type: feature
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31
---

# T011 - B/C 組工具（盤後行情・籌碼・風險）

## 目標
註冊 §10.B（盤後行情與籌碼）與 §10.C（重大訊息與風險）共 13 個工具，對接 T008/T009 Adapter 與快取層。

## 驗收標準
- [ ] B 組：`get_stock_daily_quote`（含 MA20/60、RSI、MACD helper 指標）、`get_stock_daily_kline`（period/adjust）、`get_market_summary`、`get_institutional_investors`、`get_foreign_industry_holdings`、`get_foreign_shareholding_history`、`get_margin_trading`、`get_abnormal_trading`、`get_warrant_activity`
- [ ] C 組：`get_major_announcements`（MOPS 重大訊息，T012 提供資料）、`get_attention_disposition_stocks`
- [ ] 各工具 Input/Output schema 與 §10 表格一致；輸出含 `_lineage`（POST_MARKET_TODAY）與 `_chart_meta`（bar/line 等，依 §11.3）
- [ ] 盤後資料快取 TTL 依 §4.2（60s 盤中 / 至隔日 08:00）；再次查詢 `is_cached=true`
- [ ] 上市/上櫃路由：依 T005 Registry 正確分流 T008/T009
- [ ] 契約測試 + 整合測試（含非交易日、無資料日期之錯誤處理）

## 備註
- `get_stock_daily_quote` 之指標為 helper 資料，`_lineage.derived_from` 需標明父資料集（§3.2）
- 15:00 後法人資料才穩定，早於此時段查詢需容忍快照不全並於 lineage 註記
