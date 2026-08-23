---
github_issue: 
title: react-query 導入
type: refactor
priority: medium
status: done
depends_on: [T041]
assignee: pi with opencode/x-preview-f-free
created: 2026-08-23
updated: 2026-08-23
---

# T42 - react-query 導入

## 目標
QueryClientProvider 已存在但閒置；將 Ranking / Valuation / Alerts / Stocks / Reports / PipelineStatus / Dashboard 七個頁面的手寫 useState+useEffect 資料獲取改為 useQuery，獲得快取、重試、背景更新，並刪除大量 boilerplate。

## 驗收標準
- [x] 各頁 queryKey 含篩選參數（date / limit / minScore / typeFilter…）
- [x] 404 類查詢（valuation/report）retry: false 以正常呈現空狀態
- [x] Dashboard 合併為單一 useQuery（Promise.all 聚合）

## 備註
無
