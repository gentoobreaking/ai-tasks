---
github_issue: N/A
title: TWSE Adapter（OpenAPI + Web API 盤後）
type: feature
priority: high
status: done
assignee: pi with opencode/x-preview-f-free
created: 2026-07-31
updated: 2026-07-31
depends_on: []
---

# T008 - TWSE Adapter

## 目標
實作 `pkg/provider/twse.go`：TWSE OpenAPI（`openapi.twse.com.tw`）與 Web API（`www.twse.com.tw/exchangeReport/*`）之盤後資料 Adapter，涵蓋 §2 登錄表 TWSE-API / TWSE-WEB 全部內容。

## 驗收標準
- [x] 個股日 K（日/週/月）、月均價、還原價格（`adjust` 參數）
- [x] 融資融券、三大法人買賣超（上市，金額+股數）、外資持股歷史、全市場收盤行情、加權指數歷史
- [x] 鉅額交易、權證交易統計、異常成交量、ESG/公司治理（OpenAPI）
- [x] 每資料集實作 Validate + Normalize；TWSE 原生單位（仟元/張）於 Adapter 內依 §5.1 換算（有測試）
- [x] 契約測試：以錄製 raw response fixtures 驗證 Normalize 後欄位型別、單位、日期格式
- [x] 回傳原始 raw 僅入 internal 暫存，不直接外洩（§3.1）

## 實作記錄（2026-07-31）
- **端點架構**：`TWSEWebSource`（`https://www.twse.com.tw`，新版 API 皆掛 `/rwd/` 前綴；`indicesReport/MI_5MINS_HIST` 例外無前綴）與 `TWSEAPISource`（`https://openapi.twse.com.tw/v1`）。ESG 以 `t187ap46_L_{1..21}` 路徑參數選 topic（預設 1 = 溫室氣體排放）；topic 不會進 query。
- **資料集**（14 個 Normalize）：daily_k（日/週/月 K 聚合）、monthly_avg、margin、institutional、market_close、index_history、block_trades、abnormal_volume、daily_close、foreign_holdings、warrants、indices、esg、company_governance。
- **單位換算**（§5.1，均有契約測試）：margin「張→股」（`model.LotsToShares`）；權證 t187ap42_L「仟元→元」（含小數欄位 `400.00`）與「張→股」；STOCK_DAY/T86/鉅額/全市場行情官方已為股/元，不換算。
- **`adjust` 參數**：2025-07 與 2026-07 實測（0056 除息月）OpenAPI 與 Web 新版 API 皆已忽略該參數（帶/不帶輸出完全相同、註記欄全空）；仍保留 URL 傳遞通路，Normalize 不特別處理，註記於檔頭。
- **STOCK_DAY_AVG**：官方僅回「日期/收盤價」（末列為「月平均收盤價」彙總列），無每日平均欄；MonthAvg 優先取官方彙總列，缺失時以收盤均值計算。
- **日期/型別容錯**：parseROCDate 支援 `115/07/01`、`115.07.31`、`1150730`；`rawRows` 統一 JSON number cell（如 notice「編號」為 int）為字串；`isJSONArray` 處理 OpenAPI 直接回傳陣列之資料集（daily_close/foreign_holdings/warrants/indices/esg/governance）。
- **tables 結構**：margin/market_close/block_trades 走 `tablesOf`（title 過濾），`validateTables` 對全部表格做列寬檢查 + 目標表必備欄位檢查；鉅額原始回應含第二張無 title 表（schema 不同），fixture 已剔除。
- **日期一致性 Validate**：每日資料集要求資料日期 == 請求日期（OpenAPI STOCK_DAY_ALL 官方恆回 T-1，以資料列為準）；整月資料集（index_history/block_trades）要求同月份。
- **empty 回應**：官方「沒有符合條件」以 `{"stat":…}` 內文判斷，回傳 nil（margin 空檔日測試覆蓋）。
- **測試**：`pkg/provider/twse_test.go`（URL/契約/聚合/HTTP fetch 全流程/錯誤路徑）+ `testdata/twse/` 15 個錄製 fixture（margin_empty.json 為官方查無資料回應）。
- **驗收**：`go build ./...`、`go vet ./...`、`go test ./... -count=1 -race`、`make lint`、`gofmt -l` 全部通過。

## 備註
- 各資料集 Rate Limit 依 T003 §4.4 表（TWSE-WEB 1/2s、TWSE-API 1/1s）
- 全市場行情為大型 payload，建議支援欄位修剪（§12.7）以節省記憶體
- 此 Adapter 供應 §10.B 之大部分工具（T011）

## 執行紀錄（2026-08-25 稽核）
- 驗收條目全數已有勾選；本次稽核以全域門檻複核：`go vet ./...` 通過、`go test ./...` 16 套件全綠（含契約測試/Envelope 一致性/快取一致性/壓力腳本存在性）。
- 本任務產出之模組為現行 155 註冊工具之作用中路徑（非死代碼），接線由 `cmd/mcp-server` 入口經 `App` 組裝達成；真實程序煙霧測試見 snapshots/raw/。
