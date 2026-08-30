---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/256
title: 更新 README task 表格的 GitHub 連結
type: docs
priority: low
status: done
depends_on:
  - T001
  - T002
  - T003
  - T004
  - T005
  - T006
  - T007
  - T008
assignee: "pi with opencode"
created: 2026-05-01
updated: 2026-08-30
---

## 目標

README.md task 表格中的連結仍指向 `gold-monitor-pro-v4/tasks/T001.md` 等舊路徑，但目錄已更名為 `gold-monitor-pro/tasks/` 並重新命名檔案為 `T00X-<description>.md`。

將所有 8 個連結路徑同步更新。

## 驗收標準

- [x] README.md 中所有 task 連結指向 `gold-monitor-pro/tasks/T00X-<description>.md`
- [x] 顯示標籤仍為 `[T00X]`（非 `[T00X-<description>]`）
- [x] 點擊連結解析成功（檔案存在於對應路徑）

## 執行紀錄
- README.md 表格連結已更新