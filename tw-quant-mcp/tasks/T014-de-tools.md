---
github_issue: N/A
title: D/E 組基本面、篩選與股利工具
type: feature
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-08-01
---

# T014 - D/E 組工具（基本面・篩選・股利）

## 目標
註冊 §10.D（基本面與篩選）與 §10.E（股利）共 10 個工具，對接 T012 MOPS 與 T008 TWSE 資料；`get_financial_health_check` 之五面向評分邏輯由 T017 composite engine 提供。

## 驗收標準
- [x] D 組：`get_financial_statements`、`get_monthly_revenue`、`get_valuation_ratios`（PE/PB/ROE/殖利率）、`get_esg_report`（TWSE OpenAPI）、`get_company_profile`、`screen_stocks`（value/growth 條件，T017 引擎）
- [x] E 組：`get_dividend_history`（配息歷史 + 穩定性）、`get_exdividend_calendar`、`screen_high_yield`（T017 引擎）
- [x] 各工具 schema 與 §10.D/E 一致；輸出含 `_lineage` 與 `_chart_meta`（財報 radar、篩選 scatter，§11.3）
- [x] TTL 依 §4.2：營收/財報 12h、除權息行事曆 L2 持久
- [x] 契約測試 + 整合測試（股利為 0、財報缺期、篩選無結果之邊界）

## 備註
- 五面向（獲利/成長/結構/配息/治理）評分輸入來自本組工具之 raw 資料，勿在 T014 內重寫評分邏輯
- 篩選類工具必須整批透過快取 + 記憶體計算，避免逐股打上游（§12.4）

## 實作紀錄（2026-08-01）
- 10 工具全部登錄並接線（`pkg/mcp/tools_de.go` + `registry_de.go`），契約測試 3 項 + 整合測試 17 項全綠（`go build` / `go vet` / `go test ./...`；commit `801814e`）
- 新增 provider 數據集：`TWSEAPIValuation`（BWIBBU_ALL）、`TWSEAPIExDiv`（TWT48U_ALL）、`TWSEAPIDividend`（t187ap45_L，含現金股利「盈餘+法定盈餘公積+資本公積」加總）；fixtures 3 份實測存檔
- `get_valuation_ratios`：TSE 走 BWIBBU_ALL、OTC 走 TPEx peratio；ROE 年化估計 = 稅後淨利×(4/季)÷股東權益（MOPS 無 ROE 欄位）；虧損公司 `pe=0` 且 `pe_available=false`，以 `roe_method` 標示
- `screen_stocks`/`screen_high_yield` 整批快取共用鍵（§12.4）：估值/股利/營收/ESG 各 1 次 fetch，記憶體聚合；篩選剔除 00 前綴 ETF；`require_esg` 以揭露清單過濾
- `get_dividend_history`：TSE 全年度（t187ap45）+ 連續配息/平均股利/最新殖利率；OTC 僅最新一年並以 `note` 說明深度限制；不分派公司回傳 1 年度股利 0
- 除權息行事曆合併上市（TWT48U）+ 上櫃（TPEx exrights），日期範圍過濾、依日期排序、無事件回空清單（非錯誤）
- TTL 偏離說明：除權息行事曆採 24h + L2 tier 而非永久 TTL（預告表公司可變更/取消，永久快取有陳舊風險）；§4.2 文字列 L2 資格，此為權衡後之實作
- `get_financial_health_check` 已登錄但回明確錯誤「由 T017 composite engine 提供」（未接線）；radar chart meta 已建置（`radarChart` helper），待 T017 供應
- chart meta：營收/股利歷史 → bar、篩選 → scatter（PE/殖利率/市值）、財報健檢 → radar；測試工具計數 17→27 已同步更新
