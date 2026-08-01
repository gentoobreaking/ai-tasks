---
github_issue: N/A
title: 通用 ChartMeta 五型別升級（v2.1 §11）
type: feature
priority: low
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-01
updated: 2026-08-01
---

# T028 - 通用 ChartMeta 五型別升級（v2.1 §11）

## 目標
將既有 `pkg/chart`（v1.3 §11，7 種型別：candlestick/line/bar/heatmap/pie/scatter/radar）對齊 v2.1 §11 通用設計：確認/補齊五種型別（candlestick / line / bar / heatmap / table）之 `_chart_meta` 輸出，新增 `table` 型別對應（除權息行事曆、風險旗標），並確保 `series` 陣列本身即為正規化 X/Y 資料（呼叫端忽略 recommended_type 也可直接繪圖）。

## 驗收標準
- [ ] ChartMeta 結構支援 v2.1 五型別；既有 7 型別保留並與 v2.1 五型別對應（pie/scatter/radar 視為延伸，不刪除）
- [ ] 新增 `table` 型別：除權息行事曆（get_exdividend_calendar）、風險旗標（get_risk_flags）輸出 table 型 _chart_meta
- [ ] 所有時間序列工具之 series 資料已是正規化 X/Y（timestamp + values），不依賴 recommended_type 即可繪圖（抽查 ≥5 工具）
- [ ] 財報體檢五面向可輸出 heatmap（或 radar，前端自決；_chart_meta 僅提供結構建議）
- [ ] 單元測試：五型別 ChartMeta 產生、table 型別、既有工具 regression（chart=true/false 行為不變）

## 備註
- 前置：無（chart.go 既有；v2.1 §11 與 v1.3 §11 差異小，主要為 table 型別與通用 series 保證）
- v2.1 §11 ChartMeta 欄位名（XAxisKey/YAxisKeys/Series）與 v1.3 實作（x_axis/y_axis/series）不同：維持既有 JSON 結構（向下相容），僅補型別與對應
