---
github_issue: N/A
title: F/G 組期貨選擇權與基礎設施工具
type: feature
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31
---

# T015 - F/G 組工具（期貨・選擇權・基礎設施）

## 目標
註冊 §10.F（期貨與選擇權，7 工具）與 §10.G（基礎設施，2 工具），對接 T013 TAIFEX 模組與 T005 Registry/行事曆。

## 驗收標準
- [ ] F 組：`get_futures_daily_ohlc`（API 最新日 + 盤中可查）、`get_futures_history`（DL 回溯）、`get_put_call_ratio`（date/range，支援歷史）、`get_large_trader_positions`、`get_institutional_futures_positions`、`get_institutional_options_positions`、`get_institutional_futures_history`
- [ ] 歷史工具路徑驗證：date 為最新交易日→API；其餘→DL（L2 快取命中不重複下載）
- [ ] G 組：`get_symbol_list`（market 選填）、`get_trading_calendar`（year/month）
- [ ] schema 與 §10.F/G 一致；輸出含 `_lineage`（HISTORICAL / POST_MARKET_TODAY）與 `_chart_meta`（candlestick/line，§11.3）
- [ ] 契約測試 + 整合測試（契約代號錯誤、範圍跨年、無資料日期）

## 備註
- `get_put_call_ratio` 之圖表需含多空分界線 1.0 之 annotation（§11.3）
- 期貨契約代號（如 TX、MTX）需於輸入驗證白名單，避免注入
