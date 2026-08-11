---
github_issue: null
title: circuit breaker 兩套 wrapper 收斂（worker AIBreaker / resilience BreakerGuard）
type: refactor
priority: medium
status: pending
depends_on: [57]
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-12'
updated: '2026-08-12'
---
# T071 - circuit breaker wrapper 收斂

## 目標
專案有兩套功能重疊的 pybreaker wrapper，語意已分歧：
- `worker.py:66-106` `AIBreaker`：用 `current_state == STATE_OPEN` + `_state_storage.opened_at` 時間窗
- `discussion_orchestrator/resilience.py:53-67+` `make_breaker`/`BreakerGuard`：手動 success/failure 計數

調整其中一方不影響另一方，且對 pybreaker 內部狀態有不同依賴（見 T077）。收斂為單一共用實作。

## 驗收標準
- [ ] 兩處共用同一 breaker 封裝（如移到 common/ 或 resilience.py 並由 worker 引用），語意一致
- [ ] 共用實作不依賴 pybreaker 私有 API（`_state_storage`），以官方 `current_state`/`call()` 語意為準
- [ ] worker 斷路行為（timewindow 重開、半開失敗重開路）與 T057 測試語意不變
- [ ] discussion_orchestrator 既有 resilience 測試全過
- [ ] pytest 全量通過、ruff / pyright 通過

## 備註
- 需確認 pybreaker 2.x 是否相容；若不相容則一併執行 T077 的版本上限收緊
- 保留兩個使用點各自的參數（fail_max / reset_timeout）可設定能力