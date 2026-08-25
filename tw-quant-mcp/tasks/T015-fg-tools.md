---
github_issue: N/A
title: F/G 組期貨選擇權與基礎設施工具
type: feature
priority: medium
status: done
assignee: pi with opencode/x-preview-f-free
created: 2026-07-31
updated: 2026-08-01
depends_on: []
---

# T015 - F/G 組工具（期貨・選擇權・基礎設施）

## 目標
註冊 §10.F（期貨與選擇權，7 工具）與 §10.G（基礎設施，2 工具），對接 T013 TAIFEX 模組與 T005 Registry/行事曆。

## 驗收標準
- [x] F 組：`get_futures_daily_ohlc`（API 最新日 + 盤中可查）、`get_futures_history`（DL 回溯）、`get_put_call_ratio`（date/range，支援歷史）、`get_large_trader_positions`、`get_institutional_futures_positions`、`get_institutional_options_positions`、`get_institutional_futures_history`
- [x] 歷史工具路徑驗證：date 為最新交易日→API；其餘→DL（L2 快取命中不重複下載）
- [x] G 組：`get_symbol_list`（market 選填）、`get_trading_calendar`（year/month）
- [x] schema 與 §10.F/G 一致；輸出含 `_lineage`（HISTORICAL / POST_MARKET_TODAY）與 `_chart_meta`（candlestick/line，§11.3）
- [x] 契約測試 + 整合測試（契約代號錯誤、範圍跨年、無資料日期）

## 備註
- `get_put_call_ratio` 之圖表需含多空分界線 1.0 之 annotation（§11.3）
- 期貨契約代號（如 TX、MTX）需於輸入驗證白名單，避免注入

## 實作紀錄（2026-08-01）
- 9 工具全部登錄並接線（`pkg/mcp/tools_fg.go` + `registry_fg.go`；App 新增 `WithAppTAIFEX`，預設以真實 API/DL 來源建立 T013 查詢層）；整合測試 15 項全綠（`go build` / `go vet` / `go test ./...`；commit `2bc3cfc`）
- 路徑驗證（真實 TAIFEXQuery + httptest + 官方錄製 fixtures）：date==最新交易日（PutCallRatio 判定）→ API，DL 零下載；歷史範圍 → DL 下載一次；跨 App 實例（新 L1）L2 命中 `is_cached=true` 且不重複下載
- 修正：`TAIFEXQueryResult` 新增 `is_cached` 欄位並隨 L2 持久化——重啟後範圍查詢之 lineage 仍正確標記快取命中（原僅單日 Fetch 有 fromCache 旗標）
- 期貨契約白名單（TX/MTX/GTX/G2F/G1F/G9F/E4F/XIF/GXF/T5F，含注入嘗試字元拒絕之邊界測試）；範圍跨度上限 366 日；start>end 拒絕
- `get_large_trader_positions` 合併期貨+選擇權兩資料集（單日 date 或範圍 start/end）；缺口（官方無該日資料）回明確錯誤，範圍內個別缺口以補檔（derived_from）或跳過處理
- `get_put_call_ratio` chart 為 line + hline annotation 1.0（多空分界線，§11.3）；期貨 K 線 chart 為 candlestick（價格單位「點」）
- G 組：`get_symbol_list` 直接讀 Symbol Registry（market 過濾、依代碼排序）；`get_trading_calendar` 依官方開休市表計算交易日 + 休市清單（含版本標記），修正全年模式迭代終點 bug
- 工具計數 27→36（app_test.go / main_test.go 已同步）；`TestWaitSequentialTiming` 為既有 rate limiter 時序敏感測試（jitter ±20%），單獨重跑 5 次全綠
- 待辦：F 組剩餘 `get_options_daily_ohlc` 工具不在 §10.F 工具清單內（選擇權每日行情僅 T013 provider 層提供）

## 執行紀錄（2026-08-25 稽核）
- 驗收標準逐條對照程式碼與測試後勾選。
- 證據：registry 註冊＋TestAllToolsEnvelopeConsistent 全工具 probe、snapshots/raw/get_institutional_options_positions.json、TestAllToolsCacheConsistency 全工具覆蓋、go vet/go test 全綠。
- README 更新以 commit ac57a5c 之自動產生附錄形式補齊。
