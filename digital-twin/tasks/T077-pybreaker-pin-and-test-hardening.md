---
github_issue: null
title: pybreaker 版本上限收緊 + 測試移除私有 API 操作
type: fix
priority: medium
status: done
depends_on: [71]
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-12'
updated: '2026-08-14'
---
# T077 - pybreaker 版本上限與測試硬化

## 目標
- `pyproject.toml` 宣告 `pybreaker>=1.0` 過寬：程式碼實際依賴 1.4.x API（`STATE_OPEN`、`current_state`、`_state_storage.opened_at`，worker.py:88-94），測試直接改 `br._state_storage.opened_at`（tests/test_telegram_bot.py:190,209）。升到 2.x 即壞。
- 測試碰 pybreaker 私有屬性（`_state_storage`），任何版本更動即 britt math。

## 驗收標準
- [x] pyproject.toml 改為 `pybreaker>=1.4,<2`（或鎖定相容範圍，隨 T071 共用封裝而定）
- [x] 測試不再引用 `_state_storage` 等私有屬性；改以公開 API 模擬時間推進（或 T071 封裝提供測試用之 clock 注入）
- [x] 若 T071 收斂後共用封裝提供 clock/時間注入，測試經該介面操作
- [x] test_telegram_bot 的 breaker 測試全過；pytest 全量通過
- [x] ruff / pyright 通過

## 實作摘要

### 設計
T071（breaker wrapper 收斂）已完成，將 `BreakerGuard`、`make_breaker`、`CircuitBreakerError` 收斂至 `common/breaker.py`。該封裝：
- 僅使用 pybreaker 公共 API：`CircuitBreaker`、`current_state`、`fail_max`、`reset_timeout`、`call()`
- 不依賴 `_state_storage`、`opened_at` 等私有屬性
- 以 `fcntl.flock` 風格的 probe 機制判定時間窗（見 `BreakerGuard.is_open`）
- 降級：pybreaker 未安裝時回傳 `_FakeBreaker`（永遠 closed）

測試層已在 T071 改為使用 `common.breaker.BreakerGuard` + `make_breaker`，完全不碰 pybreaker 私有 API。

### 變更
- `pyproject.toml`：四處 `pybreaker>=1.0` → `pybreaker>=1.4,<2`
  - `[project].dependencies`
  - `[project.optional-dependencies].prod`
  - `[project.optional-dependencies].telegram`
  - `[project.optional-dependencies].dev`

### 驗證
- pytest：265 passed + 1 skipped
- ruff：All checks passed
- pyright：0 new errors

## 備註
- 依賴 T071（breaker wrapper 收斂）先完成，本任務僅能改版本範圍
- 目標是「升級 pybreaker 不炸測試」的長期穩定性