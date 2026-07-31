---
github_issue: N/A
title: TPEx Adapter（上櫃盤後）
type: feature
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31 23:30
---

# T009 - TPEx Adapter

## 目標
實作 `pkg/provider/tpex.go`：TPEx OpenAPI（`www.tpex.org.tw/openapi`）上櫃資料 Adapter，涵蓋 §2 登錄表 TPEx-API 全部內容。

## 驗收標準
- [x] 上櫃日收盤行情、本益比/估值、指數
- [x] 上櫃三大法人（個股+彙總）、融資融券
- [x] 注意/處置股、除權息行事曆、零股交易
- [x] 每資料集 Validate + Normalize + 單位換算（與 §5.1 一致）
- [x] 契約測試（fixtures 回放）：欄位型別/單位/日期格式
- [x] 上市/上櫃邊界案例：同 code 於兩市場不存在時之錯誤處理

## 實作記錄（2026-07-31）
- **端點架構**：`TPExSource`（`https://www.tpex.org.tw/openapi/v1`，ID=`TPEX_API`），10 資料集全數對應 §2 登錄表 TPEx-API：
  `tpex_mainboard_quotes`(daily_close)、`tpex_mainboard_peratio_analysis`(pe_valuation)、`tpex_index`(indices)、`tpex_3insti_daily_trading`(institutional)、`tpex_3insti_summary`(institutional_summary)、`tpex_mainboard_margin_balance`(margin)、`tpex_trading_warning_information`(attention)、`tpex_disposal_information`(disposition)、`tpex_exright_prepost`(ex_rights)、`tpex_odd_stock`(odd_lot)。
- **端點特性（實測）**：TPEx OpenAPI 不接受任何 query 參數（`?date=&stockId=` 實測無效），恆回最新交易日全市場；資料列皆含 Date 欄（民國 7 碼，`tpex_index` 為西元 8 碼，`tpexDate` 雙格式解析）。
- **單位換算（§5.1）**：融資融券餘額官方以「張」計，×1000 → 股（以 6147 頎邦融資利用率 15.59% = 29,023/186,148 張交叉驗證）；其餘成交量值已為股/元（零股 1,455 股 × 130 = 189,150 元驗算）不換算。對外欄位統一 元/股/%。
- **三大法人欄位容錯**：官方英文欄位名含不一致空格（如 `" Foreign …-Total Sell"`、`"Dealers -TotalSell"`），以 `pick()`（排序 key + 子字串比對）取值。
- **上市/上櫃邊界（§2.1）**：`stockNo` 為 Normalize 過濾參數（URL 直通）；過濾後查無資料（如 2330 查上櫃）回傳空陣列非錯誤，供工具層 cross-market fallback；未過濾而官方空資料則報格式異常。
- **Validate**：所有資料集皆頂層 JSON 陣列（`isJSONArray` + 逐列物件檢查）；空陣列為合法（無資料交易日）。
- **測試**：`pkg/provider/tpex_test.go`（URL/每資料集契約/httptest Fetch 全流程/錯誤路徑/邊界/空資料）+ `testdata/tpex/` 11 個錄製 fixture（`tpex_index.json` 為全月 22 列）。
- **驗收**：`go build ./...`、`go vet ./...`、`go test ./... -count=1 -race`、`make lint`、`gofmt -l` 全部通過。

## 備註
- 上市資料一律走 T008，上櫃一律走本 Adapter；cross-market 查詢由上層工具負責 fallback（§2.1）
- Rate Limit 1/1s（§4.4）
