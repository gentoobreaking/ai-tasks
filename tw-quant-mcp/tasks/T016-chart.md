---
github_issue: N/A
title: Chart 套件（ChartMeta 產生器）
type: feature
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31
---

# T016 - Chart 套件

## 目標
實作 `pkg/chart`（§11）：`_chart_meta` 標準產生器、§11.3 全圖表類型對應、`chart=true/false` 輸出開關。

## 驗收標準
- [ ] `_chart_meta` 結構（§11.2）：recommended_type / x_axis / y_axis / series / annotations / note
- [ ] 類型對應全數實作：candlestick（K 線類）、line（指數/趨勢）、bar（法人/融資融券/營收，正負分色）、heatmap/pie（產業配置）、scatter（篩選）、radar（財報五面向）、line+annotation（PCR 分界線）
- [ ] 支援 volume 於 y 軸 right_axis 之輔助軸
- [ ] `chart=false` 時 `_chart_meta` 完全省略（omitempty，§12.7）；預設 true
- [ ] 所有時間序列工具輸出之 `data` 可直接繪圖（時間欄位格式一致，§11.1）
- [ ] 單元測試：每類型 meta 結構正確；omitempty 行為

## 備註
- `_chart_meta` 為渲染描述，**不重複編碼**資料（§11.1）——避免 payload 翻倍
- 新增資料型別時須於本套件同步補類型對應，§11.3 表為唯一真值
