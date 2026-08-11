---
github_issue: null
title: pybreaker 版本上限收緊 + 測試移除私有 API 操作
type: fix
priority: medium
status: pending
depends_on: [71]
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-12'
updated: '2026-08-12'
---
# T077 - pybreaker 版本上限與測試硬化

## 目標
- `pyproject.toml` 宣告 `pybreaker>=1.0` 過寬：程式碼實際依賴 1.4.x API（`STATE_OPEN`、`current_state`、`_state_storage.opened_at`，worker.py:88-94），測試直接改 `br._state_storage.opened_at`（tests/test_telegram_bot.py:190,209）。升到 2.x 即壞。
- 測試碰 pybreaker 私有屬性（`_state_storage`），任何版本更動即 britt math。

## 驗收標準
- [ ] pyproject.toml 改為 `pybreaker>=1.4,<2`（或鎖定相容範圍，隨 T071 共用封裝而定）
- [ ] 測試不再引用 `_state_storage` 等私有屬性；改以公開 API 模擬時間推進（或 T071 封裝提供測試用之 clock 注入）
- [ ] 若 T071 收斂後共用封裝提供 clock/時間注入，測試經該介面操作
- [ ] test_telegram_bot 的 breaker 測試全過；pytest 全量通過
- [ ] ruff / pyright 通過

## 備註
- 依賴 T071（breaker wrapper 收斂）先完成，否則此任務僅能改版本範圍
- 目標是「升級 pybreaker 不炸測試」的長期穩定性