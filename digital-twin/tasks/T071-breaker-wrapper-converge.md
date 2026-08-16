---
github_issue: null
title: circuit breaker 兩套 wrapper 收斂（worker AIBreaker / resilience BreakerGuard）
type: refactor
priority: medium
status: done
depends_on:
- 57
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-12'
updated: '2026-08-17'
spec_version: v3
---
# T071 - circuit breaker wrapper 收斂

## 目標
專案有兩套功能重疊的 pybreaker wrapper，語意已分歧：
- `worker.py:66-106` `AIBreaker`：用 `current_state == STATE_OPEN` + `_state_storage.opened_at` 時間窗
- `discussion_orchestrator/resilience.py:53-67+` `make_breaker`/`BreakerGuard`：手動 success/failure 計數

調整其中一方不影響另一方，且對 pybreaker 內部狀態有不同依賴（見 T077）。收斂為單一共用實作。

## 驗收標準
- [x] 兩處共用同一 breaker 封裝（`common/breaker.py`，worker 與 resilience 皆引用），語意一致
- [x] 共用實作不依賴 pybreaker 私有 API（`_state_storage` / `_handle_success` 已全數移除），以官方 `current_state`/`call()` 語意為準
- [x] worker 斷路行為（timewindow 重開、半開失敗重開路）與 T057 測試語意不變
- [x] discussion_orchestrator 既有 resilience 測試全過
- [x] pytest 全量通過（262 passed + 1 skipped）、ruff 通過；pyright 本次涉及檔案 0 錯誤（存量 32 錯誤與本次無關，另案處理）

## 實作摘要

### 設計（關鍵洞察）
`is_open` 時間窗判定**不模擬時鐘、不讀私有 API**，改以「探針是否被執行」區分：
- 非 OPEN → False（純查詢）
- OPEN 且時間窗未過 → `breaker.call(probe)` 被 `before_call` 擋下（probe 未執行）→ True
- OPEN 且時間窗已過 → probe 執行；成功 → 自動恢復熔斷（回 False）；失敗 → 重開（回 True）

此「副作用」為期望行為：時間窗過後第一個 `is_open` 檢查自動試探恢復，呼叫端正常放行（與 T057 語意一致）。

### 變更
- 新增 `common/breaker.py`：`make_breaker` / `BreakerGuard` / `CircuitBreakerError` 導出；`_FakeBreaker` 降級（無 pybreaker 時永遠 closed）
- `worker.py`：刪除本地 `AIBreaker` 類別與 pybreaker 私有 API 依賴，改 `from common.breaker import BreakerGuard, CircuitBreakerError, make_breaker`（E402 修正）
- `discussion_orchestrator/resilience.py`：刪除本地 `_FakeBreaker`/`make_breaker`/`BreakerGuard`，改 re-export `common.breaker`（adapters.py 沿用 `from .resilience import ...` 不變）
- `tests/test_telegram_bot.py`：breaker 測試改以獨立短 reset_timeout（0.2s）+ 真實等待，不再模擬 `_state_storage.opened_at`（T077 語意）

### 驗證
- pytest 全量：262 passed + 1 skipped（含 T082 新增測試）
- ruff：本次檔案 All checks passed
- pyright：本次檔案 0 errors（全量 32 存量 errors，較改動前 40 個減少 8 個）

## 備註
- 需確認 pybreaker 2.x 是否相容；若不相容則一併執行 T077 的版本上限收緊（T077 待辦，pybreaker 1.4.1）
- 保留兩個使用點各自的參數（fail_max / reset_timeout）可設定能力：`make_breaker(name, fail_max, reset_timeout)`
- 存量 pyright 32 errors（test_tasks_store 19、test_blocked_review 7、incremental_index 1 等）與 T071 無關