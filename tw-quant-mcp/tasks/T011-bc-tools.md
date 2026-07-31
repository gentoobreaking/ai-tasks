---
github_issue: N/A
title: B/C 組盤後行情、籌碼與風險工具
type: feature
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31
---

# T011 - B/C 組工具（盤後行情・籌碼・風險）

## 目標
註冊 §10.B（盤後行情與籌碼）與 §10.C（重大訊息與風險）共 13 個工具，對接 T008/T009 Adapter 與快取層。

> 註：任務書標題寫「共 13 個工具」，但 §10.B/C 驗收清單實際列出 11 個
> （B 組 9 + C 組 2）；以驗收清單為準，本任務完成 11 個工具。

## 驗收標準
- [x] B 組：`get_stock_daily_quote`（含 MA20/60、RSI、MACD helper 指標）、`get_stock_daily_kline`（period/adjust）、`get_market_summary`、`get_institutional_investors`、`get_foreign_industry_holdings`、`get_foreign_shareholding_history`、`get_margin_trading`、`get_abnormal_trading`、`get_warrant_activity`
- [x] C 組：`get_major_announcements`（MOPS 重大訊息，T012 提供資料）、`get_attention_disposition_stocks`
- [x] 各工具 Input/Output schema 與 §10 表格一致；輸出含 `_lineage`（POST_MARKET_TODAY）與 `_chart_meta`（bar/line 等，依 §11.3）
- [x] 盤後資料快取 TTL 依 §4.2（60s 盤中 / 至隔日 08:00）；再次查詢 `is_cached=true`
- [x] 上市/上櫃路由：依 T005 Registry 正確分流 T008/T009
- [x] 契約測試 + 整合測試（含非交易日、無資料日期之錯誤處理）

## 備註
- `get_stock_daily_quote` 之指標為 helper 資料，`_lineage.derived_from` 需標明父資料集（§3.2）
- 15:00 後法人資料才穩定，早於此時段查詢需容忍快照不全並於 lineage 註記

## 實作記錄（2026-07-31）
### 資料源實測（本任務新增）
- 外資持股歷史 = TWSE-WEB `rwd/fund/MI_QFIIS`（dayDate 參數，**T-1 翌日釋出**；
  20260731 請求仍回 07/30 資料；openapi `t187ap05_L` 實為月營收，不可用）
- 上市處置股 = TWSE-API openapi `v1/announcement/punish`（JSON array；
  TWSE-WEB `/announcement/disposal*` 全 404 死路）
- TPEx `tpex_3insti_daily_trading`（上櫃法人明細）2026-07-31 實測可用

### 新增/修改
- `pkg/provider/twse.go`：新增 `qfiis`（MI_QFIIS）、`punish`（announcement/punish）
  資料集與 normalizer（`ForeignHoldingPointRow`/`PunishRow`）、required fields、
  `TWSEWebSource/TWSEAPISource.Client()` accessor；fixture
  `testdata/twse/{qfiis,punish}.json` 與契約測試
- `pkg/engine/indicators.go`：SMA/RSI(14)/MACD(12,26,9) 純函數 + 測試
- `pkg/engine/tick.go`：漲跌停價 tick 進位演算法（market_summary 漲跌停家數）+ 測試
- `pkg/cache/policy.go`：新增 `foreign_holding`、`warrants` 資料類別
  （60s 盤中 / 至隔日 08:00，AllowL2；§4.2 政策表擴充）
- `pkg/model/bc.go`：`DailyQuote/DailyIndicators/MACDPoint/MarketSummary/
  MarketStats/InstitutionalSummary/ForeignHoldingPoint/
  ForeignShareholdingHistory/AbnormalTrade/AttentionStock/DispositionStock/
  AttentionDispositionList/WarrantSummary`
- `pkg/mcp`：
  - `core.go`：Handler 回傳契約改 `HandlerResult{Data, Lineage}`；lineage 合併
    `ToolDef.Response` 預設與 handler 覆寫（機制欄位 FetchedAt/LatencyMS 僅 Core 填）
  - `registry.go`：`ToolDef.Response *model.Lineage`（盤後工具預設 lineage）
  - `app.go`：`WebFetcher/APIFetcher/TPExFetcher` 介面 + `cache` 欄位 +
    `WithAppSources/WithAppCache`、`Close()`；預設建立真實 TWSE/TPEx sources 與 L1-only 快取
  - `fetch.go`：`fetchNormalize[T]`（GetOrFetch 讀穿 + §4.2 TTL）、`fetchRaw`、
    `prevTradingDay/resolveDate`（最近交易日、15:00 盤後語義）、provider 資料集
    → 政策類別對映（`cacheDataset`）
  - `tools_bc.go`：11 個 handler（含 15:00 前法人資料 lineage 註記、
    上櫃指標缺失 note、無資料日期明確錯誤）
  - `registry_bc.go`：11 工具 schema/描述（§10.B/C）
  - `envelope.go`：chart updater 擴充（candlestick 盤後/bar/line/pie，§11.3）
- `cmd/mcp-server/main_test.go`：tools/list 期望 17 個工具
- 整合測試 `pkg/mcp/app_bc_test.go`：fake fetcher 注入（免 HTTP）、
  快取二次命中 `is_cached=true`、非交易日/無資料錯誤、上市/上櫃路由、
  `get_attention_disposition_stocks` 餵入 DaytradeScanner（T010 scan 名單供應器）

### 驗收
- `go build ./... && go vet ./... && go test ./... -count=1 -race && make lint && gofmt -l` 全綠
- commit: T011: B/C 組盤後行情、籌碼與風險工具（11 工具，驗收完成）
