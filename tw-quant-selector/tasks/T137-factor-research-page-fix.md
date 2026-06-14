---
github_issue: 
title: "因子研究頁面修復 — 初始載入、快取、空狀態與中文化"
type: pending
priority: high
status: done
assignee: "Hermes with DeepSeek V4 Pro"
created: 2026-06-14T21:52:00Z
updated: 2026-06-14T21:52:00Z
---

# T137 - 因子研究頁面修復 — 初始載入、快取、空狀態與中文化

## 目標
修復 `/factor-research` 頁面的多個 UX 問題，並將策略名稱中文化。

## 驗收標準
- [x] 頁面載入時自動顯示 IC 分析圖表（加入 `useEffect` 初始載入）
- [x] 已載入的 tab 切換不再重複 fetch（`loadedTabs` ref 快取）
- [x] IC 分析無資料時顯示「目前尚無資料」
- [x] 分層報酬無資料時顯示空狀態而非整塊消失
- [x] 相關性矩陣無資料時顯示空狀態而非整塊消失
- [x] 法人驗證首次切換不自動打 API，點「計算」才打
- [x] 法人驗證無結果時顯示「點擊計算按鈕」提示
- [x] 相關性矩陣中文化：composite→綜合、momentum→動能、value→價值、quality→品質、growth→成長、guru→大師
- [x] IC 分析圖表標題中文化
- [x] 相關性矩陣放大 ~2x（字型、padding、min-width）
- [x] 相關性矩陣下方加入 Pearson r 說明文字
- [x] 相關性矩陣左側行標題加粗 + 背景色

## 更動檔案
- `frontend/src/pages/FactorResearch.tsx`
- `frontend/src/pages/FactorResearch.module.css`

## 備註
無