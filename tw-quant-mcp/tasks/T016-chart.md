---
github_issue: N/A
title: Chart 套件（ChartMeta 產生器）
type: feature
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-08-01
---

# T016 - Chart 套件

## 目標
實作 `pkg/chart`（§11）：`_chart_meta` 標準產生器、§11.3 全圖表類型對應、`chart=true/false` 輸出開關。

## 驗收標準
- [x] `_chart_meta` 結構（§11.2）：recommended_type / x_axis / y_axis / series / annotations / note
- [x] 類型對應全數實作：candlestick（K 線類）、line（指數/趨勢）、bar（法人/融資融券/營收，正負分色）、heatmap/pie（產業配置）、scatter（篩選）、radar（財報五面向）、line+annotation（PCR 分界線）
- [x] 支援 volume 於 y 軸 right_axis 之輔助軸
- [x] `chart=false` 時 `_chart_meta` 完全省略（omitempty，§12.7）；預設 true
- [x] 所有時間序列工具輸出之 `data` 可直接繪圖（時間欄位格式一致，§11.1）
- [x] 單元測試：每類型 meta 結構正確；omitempty 行為

## 備註
- `_chart_meta` 為渲染描述，**不重複編碼**資料（§11.1）——避免 payload 翻倍
- 新增資料型別時須於本套件同步補類型對應，§11.3 表為唯一真值

## 實作紀錄（2026-08-01）
- 新增 `pkg/chart`（型別化 §11.2 結構）：`Meta`/`Axis`/`YAxis`/`Series`/`Annotation`，全部 omitempty 化；builder：`Candlestick`（volume 於 right_axis 輔助軸 + series volume bar）、`Line`、`Bar`（series.style=diverging 正負分色）、`Heatmap`、`Pie`、`Scatter`（bubble size）、`Radar`（axes）；`HLine` 註記 + functional options（WithNote/WithAnnotations/WithXKey/WithXFormat/WithYTitle）
- §11.3 對應表收斂至 `chart.ForTool(tool, limit)`（唯一真值，21 工具全對應；未知工具回傳 nil 不注入）；`pkg/mcp/envelope.go` 之 defaultChartUpdater 改為薄委派，刪除 231 行 ad-hoc map builder
- `model.Envelope.ChartMeta` 型別化為 `*chart.Meta`（JSON 鍵 `_chart_meta,omitempty`；chart=false 時 nil 完全省略，§12.7）
- 修正 §11.1 不一致：期貨 K 線 x_axis.key 由 `timestamp` 改為資料實際欄位 `date`（格式 YYYY-MM-DD）；其餘時間序列工具之 x_axis.key 與 model 欄位一致（timestamp/date/data_year_month/dividend_year）
- 單元測試 8 項：每類型結構、ForTool 21 工具映射、PCR hline 1.0、時間序列 x key 契約、marshal omitempty（空 annotations 省略、零值欄位省略）
- 既有整合測試同步（chartType helper 改讀 *chart.Meta；model_test 改用 chart.Candlestick()）；`go build` / `go vet` / `go test ./...` 全綠
- commit：`f4a73d6`（`feat(T016): Chart 套件 — _chart_meta 標準產生器（§11 全類型對應，驗收完成）`）
