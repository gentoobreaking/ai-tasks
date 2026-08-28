---
id: T063
github_issue: ""
title: 回測與模擬下單框架 + 策略比較視圖
project: gold-analysis
type: feature
priority: medium
status: done
depends_on: []
assignee: "pi"
created: 2026-08-28
updated: 2026-08-28
---

# T063 - 回測與模擬下單框架 + 策略比較視圖

## 目標
系統已有風險指標（VaR/CVaR/Sharpe/MaxDD）但**沒有回測能力**來歷史驗證策略。需建立向量化回測引擎（vectorbt / backtrader / numba）與模擬下單（paper replay），並提供策略比較視圖。

## 驗收標準
- [ ] 提供回測入口：給定策略參數與歷史資料，輸出績效（Sharpe/Sortino/MaxDD/WinRate）+ 權益曲線
- [ ] 支援 walk-forward / 樣本外驗證（參考 repo T055-backtesting-engine 規格）
- [ ] 模擬下單（paper replay）可重放歷史訊號並對比實際走勢
- [ ] 前端新增策略比較視圖（多策略績效並排）
- [ ] 補測試：回測結果數值合理（無未定義/無未處理例外）

## 備註
- 與 repo 任務 T055-backtesting-engine、T057-risk-management 重疊，本任務聚焦「框架+比較視圖」落地。
- 注意 T054 先確保歷史資料取數為真實來源，回測才有意義。
