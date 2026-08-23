---
github_issue: 
title: 前端 UX 改善（日期、設定生效、類型區分、可點擊代號）
type: feat
priority: medium
status: done
depends_on: [T035]
assignee: pi with opencode/x-preview-f-free
created: 2026-08-23
updated: 2026-08-24
---

# T36 - 前端 UX 改善（日期、設定生效、類型區分、可點擊代號）

## 目標
多項 UX 打磨：Backtest 結束日期預設今天；Settings 設定真正持久化且 API 位址即時生效；股票類型區分台股/ETF/ETN；/stocks 與 /ranking 代號可點擊導向估值分析；新增共用 DateSelector 元件；估值頁補回可用估值模型標籤；Stocks 頁新增關鍵字篩選。

## 驗收標準
- [x] Backtest `--end` 預設 todayLocal()
- [x] Settings 存 localStorage 且 apiBaseUrl 動態切換 client baseURL
- [x] `securityTypeLabel()`：security_type 標記優先、00/02 開頭規則兜底
- [x] 共用 DateSelector 元件套用於六個查詢頁
- [x] 估值頁顯示 estimate_method 對應模型標籤
- [x] Stocks 搜尋框（代碼/名稱）

## 備註
無
