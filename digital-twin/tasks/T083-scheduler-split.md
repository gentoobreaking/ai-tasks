---
github_issue: 
title: 拆分 scheduler.py 為 quality_gate.py 與 blocked_flow.py
type: pending
priority: medium
status: pending
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-15
updated: 2026-08-15
---

# T083 - 拆分 scheduler.py 為 quality_gate.py 與 blocked_flow.py

## 目標
將 `scheduler.py`（目前 1059 行）進一步模組化，把品質閘門邏輯與 blocked 流程拆分為獨立模組，降低單檔複雜度並提升可維護性。

## 背景
T051 已將 `auto_develop.py` 從 1965 行拆分為 `scheduler.py` + `providers.py` + `diff.py`。但 `scheduler.py` 仍包含：
- 品質閘門（pytest 執行、ruff 檢查、diff 確認）
- 修復迴圈（auto-repair）
- blocked 流程（review / retry / supersede）
- README 同步
- 排程器主迴圈

過多職責集中於同一檔案，不利於後續維護與測試。

## 驗收標準
- [ ] 新增 `quality_gate.py`：封裝 pytest 執行、ruff 檢查、diff 確認閘門邏輯
- [ ] 新增 `blocked_flow.py`：封裝 blocked review / retry / supersede 流程
- [ ] `scheduler.py` 縮減至 600 行以下，僅保留排程器主迴圈與任務挑選邏輯
- [ ] import 方向維持單向：`scheduler → quality_gate → common.git`、`scheduler → blocked_flow → common.tasks`
- [ ] 現有測試全通過（265 passed）
- [ ] ruff check 零錯誤
- [ ] README 同步更新模組結構

## 備註
- 拆分時注意 `process_task` 中的例外防護（T068）邏輯需保留在 scheduler 主迴圈
- inter-run lock（T076 fcntl flock）也需保留在 scheduler
- 參考 T051 的拆分模式：薄 CLI 入口 + 核心邏輯模組
