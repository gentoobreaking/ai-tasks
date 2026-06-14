---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/805
title: 修改 Backtest 再平衡邏輯（改為每日檢查）
type: bugfix
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-30
updated: 2026-06-01
howto: /Users/claw/Projects/tw-quant-selector/CODE_REVIEW_REPORT.md
---

# T092 - 修改 Backtest 再平衡邏輯（改為每日檢查）

## 目標
`src/tw_quant_selector/backtest/engine.py` 中的 `_rebalance_dates()` 函數只在前星期一執行再平衡，但台股每週有 5 個交易日（週一到週五），這會導致：
1. 錯過 4 個交易日的訊號變化
2. 回測結果與實際狀況有較大偏差
3. 無法及時反應市場變化（如停損停利）

此任務要修改為：**每週（週一）執行再平衡，但每天檢查訊號和停損停利**。

## 驗收標準
- [x] 修改 `_rebalance_dates()` 改為每日檢查（週一到週五）
- [x] 修改 `run_backtest()` 邏輯：每週（週一）執行再平衡
- [x] 新增 `_check_stop_loss_take_profit()` 函數（停損 -10%、停利 +20%）
- [x] 新增 `_sell_position()` 函數（執行賣出邏輯）
- [x] 測試案例通過（停損觸發、停利觸發、每週再平衡）

## 備註
- **為什麼不完全每日再平衡？** 過度交易會導致交易成本過高，每週再平衡已經足夠應對市場變化
- **未來優化方向**：加入「動態再平衡」機制（當訊號變化 > 20% 時，立即再平衡）
- **參考**：CODE_REVIEW_REPORT.md 問題 5（🟡 中等）
