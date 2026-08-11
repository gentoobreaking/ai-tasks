---
github_issue: N/A
title: P1 股利 ex_date（TWT48U 併入 dividend history + 評估歷史查詢）
type: feature
priority: medium
status: pending
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-12
updated: 2026-08-12
---

# T034 - P1 股利 ex_date

## 目標
補齊 `get_dividend_history` 目前缺乏的 **ex_date / 除息資訊**（現由 tw-quant-signal 側 yfinance fallback 補，mcp 端無此欄位），並評估歷史除權息查詢的接線可行性。

**背景（實測 2026-08-12）**：
- `get_dividend_history`（t187ap45_L）：2330 僅 2 年（115/114）、1101/2317 僅 1 年（114），**無 ex_date/close_before_ex/cash_yield**；官方 Open API 僅現行+前一年度
- `get_exdividend_calendar`（TWT48U_ALL 預告行事曆）：實測正常，**含 ex_date + 現金/股票股利 + ETF**（含 00940/00878 等），但僅未來事件
- tw-quant-signal `fetch_dividends` 現行對 mcp 無 ex_date 之情況降級 yfinance（補 ex_date/cash_yield），見 data-provider-fallback.md §2.2

## 驗收標準
- [ ] `get_dividend_history` 輸出增加 `ex_date`（除息日）欄位：來源為 TWT48U 行事曆（未來事件 + 近 6 個月內已過事件），無行事曆事件之年度的 ex_date 為空（不報錯）
- [ ] TWT48U 資料與 t187ap45 股利年度正確對應（民國年度 vs 除息日年度需小心：除息日落在股利年度次年，對應規則寫入 code comment）
- [ ] 上櫃（OTC）分支：TPEx 歷史除息資料源**先調查**（文件指出未接線），若無官方免費端點則維持現況並在 `note` 說明
- [ ] 評估報告產出：TWSE 歷史除權息查詢頁（ex_new/t108 系）是否有官方免費 JSON 端點可用於回溯多年 ex_date；可行則列入 T034 範圍，不可行則記錄替代方案（含 yfinance 續用）
- [ ] 契約測試 + 整合測試：有行事曆事件（近期除息股）、無行事曆事件（股利年份與行事曆對不上）、OTC（維持 note）三路徑
- [ ] `go build` / `go vet` / `go test ./...` 全綠
- [ ] 更新 `docs/data-provider-fallback.md`（tw-quant-signal）：股利之 yfinance fallback 保留為兜底，但 mcp 端已補 ex_date 之說明更新

## 改動檔案清單
- `pkg/mcp/tools_de.go`：`handlerGetDividendHistory` 增加 TWT48U 行事曆查詢（`apiRows`/既有 exdiv 路徑）併入 ex_date
- `pkg/model/mops.go`（或 domain/dividend）：`DividendYear` 增加 `ExDate` 欄位
- 歷史除權息查詢調查：`docs/` 新增調查記錄（或併入 task 實作紀錄）
- fixtures：TWT48U 樣本存檔（若新增解析）

## 備註
- 除息日與股利年度對應：例如 115 年股利（t187ap45 年度 115）之除息日多在 115 年 6~9 月；114 年股利之除息日多在 114 年 6~9 月——對應規則需以「除息日年份 = 股利年度」驗證，避免跨年錯配
- 優先做「TWT48U 併入」段（成本低、立即消除部分 yfinance fallback）；歷史回溯僅在官方免費端點可行時才納入，避免過度工程
- 完整評估：workspace `tw-quant-mcp-data-gap-eval_2026-08-12.md` §三
