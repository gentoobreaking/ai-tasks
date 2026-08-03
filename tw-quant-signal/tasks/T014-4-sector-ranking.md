---
github_issue: ""
title: "[014-4] 類股排名 — EPS/ROE/ROA 百分位"
type: feature
priority: low
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-30
updated: 2026-08-03
---

# T014-4 - 類股排名

## 目標
找出該個股所屬產業/類股，計算 EPS、ROE、ROA 在該類股中的百分位排名，前端顯示類股標籤與排名位置。

**資料源**: TWSE 產業分類（初始可用硬編碼對照表）

## 實作方式
非獨立資料表，邏輯寫在 API 層，用預先定義的類股對照表查詢，再從 `quarterly_financials` 聚合百分位排名。

## 驗收標準
- [x] 類股對照表（硬編碼 dict，包含 watch_stocks 的類股歸屬）
- [x] `GET /api/stocks/{id}/sector-ranking` 端點回傳該股所屬類股及百分位排名
- [x] 前端顯示：類股標籤 + EPS/ROE/ROA 在該類股中的位置（前 N%）
- [x] 前端建置無錯誤

## 備註
- 初始版本用硬編碼類股對照，後續可優化為 TWSE API 動態查詢
- 百分位計算：排序後排名 / 總數 * 100，越小越靠前

---
## 驗收紀錄 (2026-08-03)
- 驗收通過：全部端點 200、前端 build 成功、pipeline 執行正常
- 修復事項：見 git commit 4344513「fix: T014 驗收修復 — ROE/股利/類股排名/月營收/健診」
