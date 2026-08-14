# 2026-08-12 T071 完成：circuit breaker wrapper 收斂

## 目標達成
兩套 pybreaker wrapper（worker `AIBreaker` / resilience `BreakerGuard`）收斂為單一 `common/breaker.py`，語意一致，零私有 API 依賴。

## 關鍵設計洞察（歷經 5 版迭代後定稿）
**問題**：pybreaker 無公開 API 查詢「OPEN 且時間窗已過」；`_state_storage.opened_at` 是私有 API（T077 要移除）。之前嘗試：
1. wrapper 自維護假時鐘 + advance_time → 與 pybreaker 內部時鐘不同步，失敗
2. 探針 lambda 判斷 → is_open 有副作用，失敗
3. 短 reset_timeout 真實時間 → 仍需解決 is_open 副作用

**最終方案**：`is_open` 用「探針是否被執行」區分時間窗：
- 非 OPEN → False（純查詢）
- OPEN 且時間窗未過 → `breaker.call(probe)` 被 `before_call` 擋下（probe 未執行）→ True
- OPEN 且時間窗已過 → probe 執行；成功 → 自動恢復熔斷（回 False）；失敗 → 重開（回 True）

**副作用 = 期望行為**：時間窗過後第一個 is_open 檢查自動試探恢復，呼叫端放行（T057 語意）。這是 T071 的核心突破——不再需要模擬時間，完全委託 pybreaker 官方狀態機。

## 變更清單
- `common/breaker.py`（新增）：`make_breaker` / `BreakerGuard` / `CircuitBreakerError` / `_FakeBreaker` 降級
- `worker.py`：刪 AIBreaker 類別 → `from common.breaker import ...`；E402 import 移到頂部；移除 datetime/UTC/pybreaker imports
- `discussion_orchestrator/resilience.py`：刪本地 breaker 實作 → re-export common.breaker（adapters.py 的 `from .resilience import BreakerGuard, make_breaker` 不變）
- `tests/test_telegram_bot.py`：breaker 測試改用短 reset_timeout(0.2s) + time.sleep 真實等待，不再碰 `_state_storage`

## 驗證
- pytest 全量：262 passed + 1 skipped
- ruff：All checks passed（含 pre-commit）
- pyright：本次檔案 0 errors；全量存量 32 errors（較改動前 40 減少 8；與 T071 無關，另案）
- commit: `425266c`

## 後續
- T077（pybreaker 版本上限收緊）可解除依賴，待執行
- 存量 pyright 32 errors（test_tasks_store 19、test_blocked_review 7 等）另案處理
