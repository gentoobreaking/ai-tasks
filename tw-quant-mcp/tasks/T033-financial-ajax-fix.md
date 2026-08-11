---
github_issue: N/A
title: P0 財報 AJAX 接線（季報三表修復 + PE/ROE + 健康評分連帶修復）
type: feature
priority: high
status: pending
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-12
updated: 2026-08-12
---

# T033 - P0 財報 AJAX 接線

## 目標
修復 `get_financial_statements` 對 2330/1101/2317 等公司回「代碼 X 無損益表摘要資料」的問題，並連帶修復 PE/ROE（`get_valuation_ratios`）與五面向財務健康評分（`get_financial_health_check`）中因缺損益表而失效的面向。

**背景**：`t187ap14_L.csv`（MOPS Open Data 損益表摘要）目前僅 435 家，**不含 2330/1101/2317**（2308 對照組正常）。`handlerGetFinancialStatements` 的 income 分支只走 `mopsRows[IncomeStatementRow](MOPSIncomeSummary)`（t187ap14 CSV），CSV 無該代碼即報錯；但 balance/cashflow 分支已用 `mopsStatement[T]`（ajax_t164sb03/05）正常運作，且 `pkg/provider/mops_html.go` 已存在 `parseIncomeStatementHTML`（ajax_t164sb04）parser——**code 已備，僅差 income 分支接線**。

## 驗收標準
- [ ] `get_financial_statements`：2330/1101/2317 可回傳損益表摘要（income），且 balance/cashflow 維持現行 AJAX 路徑正常
- [ ] income 解析以 AJAX 單股逐季（ajax_t164sb04）為 fallback：t187ap14 CSV 有該代碼時仍走 CSV（優先，省呼叫數），無該代碼時走 AJAX
- [ ] 民國年→西元年轉換正確（沿用現有 `parseMOPSDate`/`mopsYearQuarter` 邏輯，不得出現 2026→3937 型錯誤，T022 教訓）
- [ ] `get_valuation_ratios`：2330/1101/2317 的 PE/ROE 不再因「無損益表摘要」而失效（pe_available/roe_method 正常標示）
- [ ] `get_financial_health_check`：獲利/成長面向輸入完整（損益表資料到位）
- [ ] 契約測試 + 整合測試覆蓋：CSV 有資料（2308）、CSV 無資料走 AJAX（2330）、AJAX 亦無資料（邊界）三路徑
- [ ] fixtures 存檔 AJAX income HTML 實測樣本（2330 115Q2）
- [ ] `go build` / `go vet` / `go test ./...` 全綠
- [ ] 更新 `docs/data-provider-fallback.md`（tw-quant-signal）：季報之 yfinance fallback 於 mcp 側修復後仍保留為最終兜底（mcp 服務未啟動/逾時時），但「資料缺口」原因改列為已修復

## 改動檔案清單
- `pkg/mcp/tools_de.go`：`handlerGetFinancialStatements` income 分支增加 AJAX fallback（`mopsStatement[IncomeStatementRow](a, ctx, provider.MOPSIncomeStatement, sym.Code, year, quarter)`）；`incomeOf` 空結果時不直接報錯，改為走 AJAX
- `pkg/mcp/tools_de.go`：`handlerGetValuationRatios` / `handlerGetFinancialHealthCheck` 之 ROE 計算路徑確認吃得到 AJAX income（若共用 incomeOf 邏輯需同步）
- `pkg/provider/mops_html.go`：確認 `parseIncomeStatementHTML` 對 115Q2 樣本解析正確（label 匹配：營業收入合計/營業利益（損失）/本期淨利（淨損））
- fixtures：`pkg/provider/testdata/mops/` 新增 income_statement_2330_115Q2.html
- 契約測試：`pkg/mcp/` 或 `pkg/provider/` 對應測試檔

## 備註
- MOPS AJAX 限流 1/2s（§4.4）；WATCH_STOCKS 3 檔 × 6 季 ≈ 18 次呼叫，單股/小批可接受；**批量 screen 場景不適用逐股逐季 AJAX**（維持 t187ap14 CSV 優先路徑即為此設計）
- `get_financial_health_check` 輸入來自 T014 已快取 raw 資料（§12.4），接線後需確認 index_build（`pkg/mcp/index_build.go`）預熱路徑同步受益
- 季報「資料未釋出或期間不存在」邊界（filterPeriod 空）維持現行錯誤訊息
- 參考實測證據：`/tmp/t164sb04_2330.html`（34KB，hasBorder table + 營業收入合計/本期淨利（淨損）/民國115年第1季 全數匹配 parser）；`/tmp/t187ap14.csv`（436 行，2330/1101/2317 出現 0 次）
- 完整評估：workspace `tw-quant-mcp-data-gap-eval_2026-08-12.md`
