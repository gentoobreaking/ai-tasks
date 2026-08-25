---
github_issue: N/A
title: 通用 ChartMeta 五型別升級（v2.1 §11）
type: feature
priority: low
status: done
assignee: pi with opencode/x-preview-f-free
created: 2026-08-01
updated: 2026-08-01
depends_on: []
---

# T028 - 通用 ChartMeta 五型別升級（v2.1 §11）

## 目標
將既有 `pkg/chart`（v1.3 §11，7 種型別：candlestick/line/bar/heatmap/pie/scatter/radar）對齊 v2.1 §11 通用設計：確認/補齊五種型別（candlestick / line / bar / heatmap / table）之 `_chart_meta` 輸出，新增 `table` 型別對應（除權息行事曆、風險旗標），並確保 `series` 陣列本身即為正規化 X/Y 資料（呼叫端忽略 recommended_type 也可直接繪圖）。

## 驗收標準
- [x] ChartMeta 結構支援 v2.1 五型別；既有 7 型別保留並與 v2.1 五型別對應（pie/scatter/radar 視為延伸，不刪除）
- [x] 新增 `table` 型別：除權息行事曆（get_exdividend_calendar）、風險旗標（get_risk_flags）輸出 table 型 _chart_meta
  - 註：get_risk_flags 工具本身不存在（T029 以 scan_daytrade_eligibility 對應 v2.1 §9.9），table 對應落在 scan_daytrade_eligibility
- [x] 所有時間序列工具之 series 資料已是正規化 X/Y（timestamp + values），不依賴 recommended_type 即可繪圖（抽查 ≥5 工具：TestSeriesNormalizedXY 覆蓋 7 工具）
- [x] 財報體檢五面向可輸出 heatmap（或 radar，前端自決；_chart_meta 僅提供結構建議）— 既有 radar 保留滿足
- [x] 單元測試：五型別 ChartMeta 產生、table 型別、既有工具 regression（chart=true/false 行為不變）

## 實作摘要（commit）
- `pkg/chart/chart.go`：Meta 新增 `Columns []Column`（table 型別欄位描述，omitempty 向下相容）；新增 `Column{Key,Label}` 與 `Table(columns, opts)` builder（無座標軸語意，series 標記 type=table）；Series.Type 註解補 table。
- `pkg/chart/mapping.go`（ForTool 為 §11.3 唯一真值）：get_exdividend_calendar → table（date/code/name/market/kind/cash_dividend/stock_dividend 七欄）；scan_daytrade_eligibility → table（symbol/name/date/daytrade_allowed/is_attention/is_disposition/margin_suspended/short_suspended/summary 九欄，對應 v2.1 get_risk_flags）。財報體檢維持 radar（v2.1 允許 heatmap 或 radar，前端自決）。
- 測試：`pkg/chart/chart_test.go` 新增 TestTableMeta（序列化/省略座標軸）、TestForTool 補 table 兩 case、TestForToolTableColumns（欄位與資料結構一致）、TestSeriesNormalizedXY（7 工具 JSON 欄位存在性 + x_axis.key 一致）；`pkg/mcp/app_de_test.go` TestDEGetExdividendCalendar 補 chart=table 斷言；`pkg/mcp/app_test.go` TestCallScanDaytradeEligibility 補 chart=table + columns 斷言。
- `make check`（vet + gofmt + go test ./...）全綠。
- 前置：無（chart.go 既有；v2.1 §11 與 v1.3 §11 差異小，主要為 table 型別與通用 series 保證）
- v2.1 §11 ChartMeta 欄位名（XAxisKey/YAxisKeys/Series）與 v1.3 實作（x_axis/y_axis/series）不同：維持既有 JSON 結構（向下相容），僅補型別與對應

## 執行紀錄（2026-08-25 稽核）
- 驗收條目全數已有勾選；本次稽核以全域門檻複核：`go vet ./...` 通過、`go test ./...` 16 套件全綠（含契約測試/Envelope 一致性/快取一致性/壓力腳本存在性）。
- 本任務產出之模組為現行 155 註冊工具之作用中路徑（非死代碼），接線由 `cmd/mcp-server` 入口經 `App` 組裝達成；真實程序煙霧測試見 snapshots/raw/。
