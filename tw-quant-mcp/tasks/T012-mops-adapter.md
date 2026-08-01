---
github_issue: N/A
title: MOPS Adapter（財報 / 月營收 / 重大訊息）
type: feature
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-08-01
---

# T012 - MOPS Adapter

## 目標
實作 `pkg/provider/mops.go`：公開資訊觀測站之月營收、財報三表、重大訊息、公司基本資料 Adapter（§2 MOPS 登錄）。

## 驗收標準
- [x] 月營收（含 YoY/MoM 成長率 helper 計算）、財報摘要（損益表簡版 + 獲利能力指標，支援年度與季度期間參數）
- [x] 財報三表：完整資產負債表（t164sb03）、綜合損益表（t164sb04）、現金流量表（t164sb05），支援年度與季度期間參數（T012-followup，AJAX HTML table 解析）
- [x] 重大訊息（可依日期/symbol/關鍵字過濾）、公司基本資料
- [x] Validate + Normalize + 單位換算；營收/金額欄位與 §5.1 一致（千元→元 ×1000）
- [x] TTL 政策：營收/財報 12h（§4.2）；重大訊息 5min
- [x] 契約測試（fixtures 回放）：17 個 TestMOPS* 全綠（財報期間解析、欄位完整性、缺值為 null）
- [x] 供應 §10.C `get_major_announcements`（已從 stub 接線）與 §10.D 基本面工具（model 層已就緒，T014 handler 待實作）

## 實作記錄
- **資料源**：Open Data CSV（mopsfin.twse.com.tw，t187ap03/04/05/14/17_L）＋ 舊站 AJAX HTML（mopsov.twse.com.tw，ajax_t164sb03/04/05；免 CSRF，直 POST form-encoded）
- **財報三表 followup**：`pkg/provider/mops_html.go` 新增 `parseBalanceSheetHTML` / `parseCashFlowHTML` / `parseIncomeStatementHTML`（`<table class='hasBorder'>` 逐列解析，`<h2>` 標題辨識報表型別、`<h4>` 驗證公司名）；`mopsYearQuarter` 由標題「民國115年第1季」解析年（+1911）與季（需去「第」前綴）
- **model**：`pkg/model/mops.go` 新增 `BalanceSheet` / `CashFlowStatement`（金額為仟元×1000 後之元；json tag 與既有 model 一致）
- **mcp 層**：`MOPSFetcher` interface + `WithAppMOPS` option + `fetch.go` cacheDataset 登錄（balance_sheet / cash_flow / income_statement → DatasetFinancials 12h）；`handlerGetMajorAnnouncements` 自 stub 接線（date/symbol/keyword 過濾，mopsSourceWrapper）
- **測試**：3 個 HTML fixtures（2330 2026Q1 資產負債/現金流量/綜合損益表，2026-07-31 實測快照）；HTML 契約測試驗證期間解析、欄位完整性、缺值為 null
- **優化（2026-08-01 review）**：① `get_major_announcements` 快取鍵去 symbol（一次全量下載供各過濾組合共用，重大訊息 5min TTL）；② 損益表本季欄定位（th header 展開 colspan 找「第N季」欄，Q2-Q4 不再誤取累計期間）；③ fallback 改以欄位存在性判斷（非 `值==0`）；④ CSV 逐列取值改 header 預解析 index（消除逐列模糊比對）；⑤ `mopsYearQuarter` 優先取 tblHead 標題；⑥ model 單位註解修正（仟元→元）＋移除 dead code

## 備註
- MOPS 頁面結構較多變，fixtures 需保留歷史版本以偵測官方改版
- Rate Limit 1/2s（§4.4）；財報為大型 payload，留意記憶體與 gzip
- 新站 SPA（mops.twse.com.tw/mops/）需 bridge API `redirectToOld` 取舊站 URL；目前直連 mopsov 免 CSRF，bridge 僅供備援（見 discovery 文件）

## 驗收
- `go build ./... && go vet ./...` 全綠
- `gofmt -l pkg/ cmd/` 無輸出
- `make lint` 全綠
- `go test ./... -count=1 -race` 9 套件全綠（pkg/mcp、pkg/provider 含 17 個 TestMOPS*）
