---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/806
title: 重構 Decimal 與 np.isnan 混用問題
type: bugfix
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-30
updated: 2026-06-01
howto: /Users/claw/Projects/tw-quant-selector/CODE_REVIEW_REPORT.md
---

# T093 - 重構 Decimal 與 np.isnan 混用問題

## 目標
`src/tw_quant_selector/strategies/combiner.py` 第 156-165 行的 `_save_signals()` 函數中，存在 `Decimal` 與 `np.isnan()` 混用的問題：
1. `np.isnan()` 只能處理 `float` 類型，不能處理 `Decimal`
2. 現有邏輯混亂，`isinstance(raw, (float, np.floating))` 對 `Decimal` 會返回 `False`，導致判斷邏輯失效
3. 容易在運行時出現類型錯誤

此任務要統一處理 `None`、`NaN`、`Decimal`、`float` 等多種類型，移除不安全的 `np.isnan()` 調用。

## 驗收標準
- [x] 新增 `_safe_decimal()` 輔助函數（處理多種類型的轉換）
- [x] 重構 `_save_signals()` 中的類型判斷邏輯
- [x] 所有 `np.isnan()` 調用都被安全替換
- [x] 測試案例全部通過（None、NaN、Decimal、float、無效字符串）

## 備註
- **為什麼不用 `np.isnan()` 處理 `Decimal`？** `np.isnan()` 只接受 `float` 或 `np.floating` 類型，傳入 `Decimal` 會拋出 `TypeError`
- **未來擴展**：可以將 `_safe_decimal()` 放到 `base.py` 中作為公共輔助函數，其他策略檔案也可以複用
- **參考**：CODE_REVIEW_REPORT.md 問題 6（🟡 中等）
