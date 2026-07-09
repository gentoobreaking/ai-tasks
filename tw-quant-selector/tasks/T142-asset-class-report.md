---
github_issue:
title: "表格輸出與圖表繪製 + 主入口腳本"
type: feature
priority: high
status: done
assignee: "OpenCode with DeepSeek V4 Flash"
created: 2026-07-09
updated: 2026-07-09
---

# T142 - 表格輸出與圖表繪製 + 主入口腳本

## 目標
建立 `scripts/asset_class_report.py`，讀取 T141 的指標結果，產出四份 Markdown 表格與一張 matplotlib 淨值走勢圖。此腳本同時作為主入口，可自動依序觸發 T140→T141→T142。

## 表格產出
1. `comparison_table_台股.md` — 前 50 權值股排序表
2. `comparison_table_市场型ETF.md` — 市場型 ETF 排序表
3. `comparison_table_配息型ETF.md` — 配息型 ETF 排序表
4. `summary_comparison.md` — 三類彙總對照表

每張表欄位：`代碼 | 名稱 | 總報酬率 | CAGR | 年化波動度 | Sharpe | 最大回撤 | 每週均漲跌 | 每月均漲跌 | 每季均漲跌 | 每週波動度 | 每月波動度 | 每季波動度`

## 圖表
- `nav_growth_chart_5y.png`
- X 軸: 日期(2021~2026)；Y 軸: 淨值($10,000 起算)
- 三類中位數曲線 + 熱門股(2330,2317,2454,2412,2308,2881,2882,2002)灰色虛線
- 中文字型：Noto Sans CJK / STHeiti，含標題、圖例、網格

## 主入口功能
1. 檢查 T140 中間檔案，若無則自動執行 T140
2. 執行 T141 指標計算
3. 執行 T142 表格+圖表輸出
4. 印出結果摘要

## 驗收標準
- [x] 表格格式正確（4 份 Markdown 已產出）
- [x] 圖表中文字型使用 Heiti TC 正常顯示
- [x] 熱門股標記明顯可辨識
- [x] 三類 ETF 線條顏色區分明確（藍/綠/橙）
- [x] 執行時間 < 5 分鐘（已下載過後）

## 更動檔案
- `scripts/asset_class_report.py`（新檔案）
