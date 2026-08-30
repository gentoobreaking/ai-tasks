---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/255
title: 將實現程式碼移入專案目錄
type: chore
priority: high
status: done
depends_on: []
assignee: "pi with opencode"
created: 2026-05-01
updated: 2026-08-30
---

## 目標

SPEC.md 指定將 `gold_local_monitor.py` / `gold_intl_monitor.py` 放入 `~/scripts/`，但專案目錄 `/Projects/ai-tasks/gold-monitor-pro/` 僅含 SPEC.md、README.md 及 tasks/，**沒有任何 Python 原始碼**。

將實現程式碼移入專案內 `src/` 目錄，確保版本控制與程式規格的追蹤一致。

## 驗收標準

- [x] `src/gold_local_monitor.py` 存在且可獨立 `--check` 執行
- [x] `src/gold_intl_monitor.py` 存在且可獨立 `--check` 執行
- [x] SPEC.md 的檔案路徑參考更新為 `src/` 而非 `~/scripts/`
- [x] 兩支程式 `import` 路徑僅依賴 `src/` 內部模組，無外部依賴

## 執行紀錄
- 已將程式碼移入 src/ 目錄
- Makefile 提供 test、serve、install-scheduler 等指令