---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/843
title: Support Custom Universe in Backtesting
type: feature
priority: medium
status: done
assignee: gemini-3-flash-preview
created: 2026-06-07
updated: 2026-06-07
---

# T130 - Support Custom Universe in Backtesting

## 目標
支援在回測時傳入 `custom_universe`（自訂標的清單），讓使用者可以針對特定的股票名單進行策略驗證，而非強制跑全市場回測。

## 驗收標準
- [x] 修改 `src/tw_quant_selector/api/app.py` 的 `BacktestRequest` 模型，增加 `custom_universe: Optional[list[str]]` 欄位。
- [x] 修改 `src/tw_quant_selector/backtest/engine.py` 的 `run_backtest` 函式，使其接受 `custom_universe` 參數。
- [x] 在回測循環中，若有提供 `custom_universe`，則略過 `_historical_universe` 或 `get_universe` 的全市場篩選邏輯，僅針對清單內的標的進行評分與調倉。
- [x] 更新前端 `Backtest.tsx` 頁面，提供一個輸入框讓使用者輸入逗點分隔的股票代碼（如 2330, 2317, 2454）。
- [x] 驗證自訂名單回測的結果正確顯示於歷史紀錄與圖表中。

## 備註
- 已完成功能開發與後端邏輯驗證。
- 若需進行長週期回測，請先執行 `scripts/run_demo.py` 以匯入足夠歷史數據。