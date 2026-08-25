---
github_issue: N/A
title: MCP 基礎層與 A 組盤中工具
type: feature
priority: high
status: done
assignee: pi with opencode/x-preview-f-free
created: 2026-07-31
updated: 2026-07-31
depends_on: []
---

# T010 - MCP 基礎層與 A 組盤中工具

## 目標
實作 `pkg/mcp`：go-sdk Server 初始化、Tool 註冊框架、Envelope 注入層（所有 Handler 輸出統一包裹 `data` / `_lineage` / `_chart_meta`），並註冊 §10.A 之 6 個盤中工具。

## 驗收標準
- [x] Server 初始化（Stdio 預設，支援 Streamable HTTP）與 Tool 註冊框架（註冊表 + schema 驗證）
- [x] Envelope 注入：統一由 middleware 產生 `_lineage`（含 latency_ms），Handler 不得自行偽造；`chart=true`（預設）時注入 `_chart_meta`
- [x] `set_active_watchlist`：symbols 長度 1~15 驗證、非法代號錯誤、接入 T006 Watchlist
- [x] `get_intraday_kline`：純記憶體讀取（T006），timeframe `1m`/`5m`，輸出 Candle[] + chart_meta(candlestick)
- [x] `get_intraday_quote`：即時報價 + 五檔（T006 資料）
- [x] `get_intraday_vwap` / `detect_volume_surge`：對接 T007 計算引擎
- [x] `scan_daytrade_eligibility`：處置/注意/當沖限制/停資停券比對（來源：T008/T009 資料 + TWSE-WEB 名單）
- [x] 整合測試：6 工具 schema 與回傳符合 §10.A；錯誤路徑（>15 檔、未知 symbol、非交易時段）

## 備註
- 所有工具輸出必須含 `_lineage`，freshness 依資料實際狀態（REALTIME_INTRADAY）
- 非交易時段呼叫盤中工具應回傳明確錯誤（依 T005 行事曆判定），此為 daybrain 專案 v1.1 之 Freshness Gate 依賴

## 實作記錄（2026-07-31）
- `pkg/mcp/` 新增：`registry.go`（ToolDef/Registry/schema 編譯/jsonschema-go 驗證/tools.toml）、`envelope.go`（ChartOption §11 注入）、`core.go`（統一 Call：schema 驗證 → handler → Envelope 注入，lineage 含 latency_ms、freshness=REALTIME_INTRADAY、source=TWSE_MIS）、`app.go`（組裝根：Symbol Registry/行事曆/盤中引擎/風險掃描器/Wire）、`tools.go`（6 個 §10.A handler）、`risk.go`（DaytradeScanner 記憶體名單比對）、`wire.go`（SDK 介面層：IsError Content / StructuredContent）
- `cmd/mcp-server/main.go`：接線 `mcpapp.NewApp(cfg) + app.Wire(srv)`；main_test.go 改斷言 6 工具 + schema
- 非交易時段 gate：交易日曆（T005）+ 09:00–13:30 時段，6 工具統一攔截回明確錯誤
- `set_active_watchlist`：schema minItems/maxItems(1..15) + Symbol Registry 代號驗證 → engine.Watchlist.Set
- `get_intraday_kline`：engine.Aggregator.Klines 記憶體重採樣；chart=true（預設）注入 §11.2 candlestick `_chart_meta`；chart=false 移除
- `get_intraday_quote`：RingStore 最新快照 → IntradayQuote（含五檔 Book）
- `get_intraday_vwap` / `detect_volume_surge`：engine IntradayStore / Aggregator.Surge（T007）
- `scan_daytrade_eligibility`：DaytradeScanner 以 T008（AbnormalVolumeRow）/T009（TPExAttention/DispositionRow）同名單格式注入；停資停券 → DaytradeAllowed=false；名單未載入回「名單資料尚未載入」+ summary（名單供應器為後續任務）
- 順帶修正：MIS 五檔實測為 `_` 分隔字串（b/g=買價/買量、a/f=賣價/賣量），原 `[]string` 假設錯誤 → 改 parseBook 字串解析（真實 fixture 驗證 + 新測試）
- 整合測試 `pkg/mcp/app_test.go`：in-memory SDK session 端到端（tools/list、6 工具呼叫）、`_lineage` 欄位、chart 注入/移除、錯誤路徑（>15 檔、空清單、未知代號、未加 watchlist、非法 timeframe、週末/盤後時段）
- 驗收：`go build ./... && go vet ./... && go test ./... -count=1 -race && make lint && gofmt -l` 全綠

## 執行紀錄（2026-08-25 稽核）
- 驗收條目全數已有勾選；本次稽核以全域門檻複核：`go vet ./...` 通過、`go test ./...` 16 套件全綠（含契約測試/Envelope 一致性/快取一致性/壓力腳本存在性）。
- 本任務產出之模組為現行 155 註冊工具之作用中路徑（非死代碼），接線由 `cmd/mcp-server` 入口經 `App` 組裝達成；真實程序煙霧測試見 snapshots/raw/。
