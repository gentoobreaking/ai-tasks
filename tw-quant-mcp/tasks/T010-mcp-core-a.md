---
github_issue: N/A
title: MCP 基礎層與 A 組盤中工具
type: feature
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31
---

# T010 - MCP 基礎層與 A 組盤中工具

## 目標
實作 `pkg/mcp`：go-sdk Server 初始化、Tool 註冊框架、Envelope 注入層（所有 Handler 輸出統一包裹 `data` / `_lineage` / `_chart_meta`），並註冊 §10.A 之 6 個盤中工具。

## 驗收標準
- [ ] Server 初始化（Stdio 預設，支援 Streamable HTTP）與 Tool 註冊框架（註冊表 + schema 驗證）
- [ ] Envelope 注入：統一由 middleware 產生 `_lineage`（含 latency_ms），Handler 不得自行偽造；`chart=true`（預設）時注入 `_chart_meta`
- [ ] `set_active_watchlist`：symbols 長度 1~15 驗證、非法代號錯誤、接入 T006 Watchlist
- [ ] `get_intraday_kline`：純記憶體讀取（T006），timeframe `1m`/`5m`，輸出 Candle[] + chart_meta(candlestick)
- [ ] `get_intraday_quote`：即時報價 + 五檔（T006 資料）
- [ ] `get_intraday_vwap` / `detect_volume_surge`：對接 T007 計算引擎
- [ ] `scan_daytrade_eligibility`：處置/注意/當沖限制/停資停券比對（來源：T008/T009 資料 + TWSE-WEB 名單）
- [ ] 整合測試：6 工具 schema 與回傳符合 §10.A；錯誤路徑（>15 檔、未知 symbol、非交易時段）

## 備註
- 所有工具輸出必須含 `_lineage`，freshness 依資料實際狀態（REALTIME_INTRADAY）
- 非交易時段呼叫盤中工具應回傳明確錯誤（依 T005 行事曆判定），此為 daybrain 專案 v1.1 之 Freshness Gate 依賴
