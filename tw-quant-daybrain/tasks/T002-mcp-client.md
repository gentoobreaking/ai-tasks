---
github_issue: N/A
title: MCP Client 連線層
type: feature
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-08-01
---

# T002 - MCP Client 連線層

## 目標
實作對 `tw-quant-mcp`（v1.3）之 MCP Client（§2.2 工具契約）：Stdio 連線、統一 Tool 呼叫封裝（Envelope 解析）、重試與斷線重連。

## 驗收標準
- [ ] Stdio transport 連線（`MCP_SERVER_BIN` / `MCP_TRANSPORT=stdio`），啟動時 `tools/list` handshake 驗證
- [ ] 統一呼叫封裝 `call(tool, args) → { data, _lineage, _chart_meta }`：解析 Envelope（§2.2），失敗時丟出具結構之錯誤
- [ ] 內建 §2.2 工具契約之型別定義，與 mcp v1.3 規格對齊：`set_active_watchlist` / `get_intraday_vwap` / `detect_volume_surge` / `get_intraday_quote` / `get_intraday_kline` / `get_market_summary` / `get_futures_daily_ohlc` / `get_put_call_ratio` / `get_institutional_investors` / `get_major_announcements` / `get_abnormal_trading` / `get_stock_daily_kline` / `scan_daytrade_eligibility` / `get_trading_calendar` / `get_symbol_list` / `get_pre_market_quote` / `get_taifex_night` / `get_us_market`
- [ ] 重試策略：單一 Tool 失敗重試 2 次（指數退避 1s→2s）；重連（斷線指數退避 1s→30s）
- [ ] 呼叫層級 circuit breaker：連續 5 次失敗 → 60s 暫停並通知上層降級
- [ ] 整合測試：以 mock MCP server（錄製 mcp v1.3 之 Envelope fixtures）驗證解析與錯誤路徑

## 備註
- 本專案**不直接存取任何官方 HTTP API**（附錄 A），所有資料路徑皆經 mcp
- `_lineage` 為 T003 Freshness Gate 之輸入，解析層不得丟棄
- v2.0 新增工具（`get_pre_market_quote` / `get_taifex_night` / `get_us_market`）為 §5 Bias 決策樹之輸入，需含型別定義與 fixtures
- mcp v1.3 之 `get_symbol_list` / `get_trading_calendar` 為本層先行驗證之工具
