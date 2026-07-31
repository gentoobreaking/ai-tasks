---
github_issue: N/A
title: MCP Client 連線層
type: feature
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31
---

# T002 - MCP Client 連線層

## 目標
實作對 `tw-quant-mcp`（v1.3）之 MCP Client（§2.2）：Stdio 連線、統一 Tool 呼叫封裝（Envelope 解析）、重試與斷線重連。

## 驗收標準
- [ ] Stdio transport 連線（`MCP_SERVER_BIN` / `MCP_TRANSPORT=stdio`），啟動時 `tools/list` handshake 驗證
- [ ] 統一呼叫封裝 `call(tool, args) → { data, _lineage, _chart_meta }`：解析 Envelope（§2.2），失敗時丟出具結構之錯誤
- [ ] 內建 §2.2 工具契約之型別定義（Watchlist/surge/VWAP/institutional/calendar 等輸入輸出），與 mcp v1.3 規格對齊
- [ ] 重試策略：單一 Tool 失敗重試 2 次（指數退避 1s→2s）；重連（斷線指數退避 1s→30s）
- [ ] 呼叫層級 circuit breaker：連續 5 次失敗 → 60s 暫停並通知上層降級
- [ ] 整合測試：以 mock MCP server（錄製 mcp v1.3 之 Envelope fixtures）驗證解析與錯誤路徑

## 備註
- 本專案**不直接存取任何官方 HTTP API**（附錄 A），所有資料路徑皆經 mcp
- `_lineage` 為 T003 Freshness Gate 之輸入，解析層不得丟棄
- mcp v1.3 之 `get_symbol_list` / `get_trading_calendar` 為本層先行驗證之工具
