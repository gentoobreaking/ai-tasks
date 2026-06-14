---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/810
title: 程式碼品質提升（問題 11-15）
type: enhancement
priority: low
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-30
updated: 2026-06-01
howto: /Users/claw/Projects/tw-quant-selector/CODE_REVIEW_REPORT.md
---

# T097 - 程式碼品質提升（問題 11-15）

## 目標
提升程式碼品質和可維護性，包含 5 個子問題：

**問題 11：硬編碼的預設參數**
- `value.py` 的 `max_pb=30, max_pe=100`
- `momentum.py` 的 `lookback_long=252, lookback_short=22`
- `quality.py` 的 `roe_weight=0.5, leverage_weight=0.3`
- `growth.py` 的 `rev_weight=0.6, eps_weight=0.4`
→ 應該開放使用者調整

**問題 12：前端缺少錯誤邊界處理**
- `apiFetch()` 只有丟出例外，沒有統一錯誤處理
- 應該加入 `try-catch` + Toast 通知

**問題 13：缺少單元測試**
- 後端：`tests/` 目錄不存在
- 前端：`__tests__/` 目錄不存在
- 應該新增 pytest + vitest 測試

**問題 14：日誌（Logging）不一致**
- 有些地方用 `print()`，有些用 `structlog`
- 應該統一使用 `structlog`

**問題 15：前端套件版本過舊**
- `react`: ^18.2.0（最新 18.3.1）
- `typescript`: ^5.0.0（最新 5.5.4）
- `@tanstack/react-table`: ^8.9.3（最新 8.20.0）
→ 應該更新到最新穩定版

## 驗收標準

### 問題 11：開放策略參數調整
- [x] 後端已支援：`get_strategy(name, params)` 將 `params` 作為 `**kwargs` 傳入建構子
- [x] `get_strategy_schemas()` 自動從 `__init__` 簽名推斷參數資訊
- [x] `combiner.py:90` 已傳遞 `strategy_params` 至 `get_strategy()`

### 問題 12：統一錯誤處理
- [x] Toast 系統已存在（`Toast.tsx` + `ToastProvider` + `useToast()`）
- [x] ErrorBoundary 已存在（支援 component/page/fullscreen 層級）
- [x] 新增 `src/utils/handleApiError.ts` 統一錯誤處理函數
- [x] Dashboard/Portfolio/Settings/Signals 已使用 Toast
- [x] Backtest.tsx 由 `alert()` 改為 Toast（`handleApiError` + `useToast`）
- [x] `npm run build` 通過

### 問題 13：新增單元測試
- [x] 後端 `tests/` 目錄已存在（50+ 測試案例）
- [x] 已有 `test_strategies.py`、`test_db.py`、`test_api.py`、`test_backtest.py`（engine）等

### 問題 14：統一日誌
- [x] 整個專案統一使用 `structlog`（13 個模組已使用）
- [x] `app.py` 中 3 處 `print()` 已改為 `log.warning` / `log.info`
- [x] `scheduler.py` 保留 display-oriented `print()`（CLI 使用者輸出，非日誌用途）

### 問題 15：更新前端套件
- [x] `npm outdated` 檢查後更新：react-dom/vite/eslint/react-router-dom/zustand/@types/node
- [x] `npm run build` 通過（tsc + vite, 0 errors）
- [x] 建立 `docs/UPGRADE_LOG.md` 記錄更新歷史

## 備註
- **為什麼問題 11-15 優先級較低？** 不影響核心功能，不影響資料正確性，屬於「長期維護性」和「開發體驗」改善
- **建議執行順序**：
  1. 先處理問題 12（錯誤處理），因為可以立即提升使用者體驗
  2. 再處理問題 14（日誌），因為可以幫助除錯
  3. 然後處理問題 13（測試），因為可以增加重構信心
  4. 最後處理問題 11（參數調整）和問題 15（套件更新）
- **參考**：CODE_REVIEW_REPORT.md 問題 11-15（🟢 輕微）
