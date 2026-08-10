---
github_issue: N/A
title: Walk-Forward Optimization（WFO 滾動驗證）
type: feature
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-01
updated: 2026-08-11
---

# T024 - Walk-Forward Optimization（WFO）

## 目標
實作 §13.3 Walk-Forward 滾動驗證：IS 3 個月 Grid Search 找最佳參數、凍結後於 OOS 1 個月無偏檢驗、拼接 OOS 績效曲線、WFE 指標判讀（§13.4）。實作於 `src/backtest/wfo_optimizer.ts`。

## 驗收標準
- [x] 滾動視窗（§13.3）：IS 3 個月 + OOS 1 個月，窗口向前推進 OOS 月數
- [x] IS 最佳化（§13.3-A）：於 IS 資料執行 Grid Search（T023 邏輯），選 Profit Factor 最高且交易次數 ≥3 之參數（`findBestParamsOnGrid`）
- [x] OOS 無偏檢驗（§13.3-B）：凍結 IS 最佳參數，於完全未看過之 OOS 月份回測，記錄真實績效
- [x] 窗口輸出（§13.3 `WfoWindowResult`）：windowId / IS 範圍 / OOS 範圍 / bestInSampleParams / oosPnlNtd / oosWinRatePct / oosTradesCount
- [x] 拼接 OOS 績效：累計所有 OOS 月份損益為權益曲線（`totalOosPnlNtd`），為策略實戰最真實預期
- [x] WFE 計算（§13.3 `calculateWfoEfficiency` + §13.4）：OOS 獲利窗口比率；>60% 過關、<30% 極度過度擬合不可上線
- [x] 參數漂移穩定度（§13.4）：輸出每窗口 `bestInSampleParams` 變化序列，標註健康（穩定）vs 危險（劇烈跳動）狀態
- [x] CLI 獨立執行：`npm run wfo`（非交易日執行，§18.1）
- [x] 測試：以多個月 fixtures 執行完整滾動、WFE 邊界（30%/60%）、參數漂移判定

## 備註
- 對齊 §13.3 提供之 `WalkForwardOptimizer` TypeScript 完整實作範例，可直接採用
- WFO 為參數上線前之最終驗證關卡：WFE < 30% 絕不能上線（§13.4）
- 結果供 T015 發布決策與 scoring v2.1 參數建議
