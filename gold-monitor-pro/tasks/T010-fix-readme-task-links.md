---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/256
title: 更新 README task 表格的 GitHub 連結
status: pending
assignee: 寶寶
created: 2026-08-28
updated: 2026-08-28
---

## 目標

README.md task 表格中的連結仍指向 `gold-monitor-pro-v4/tasks/T001.md` 等舊路徑，但目錄已更名為 `gold-monitor-pro/tasks/` 並重新命名檔案為 `T00X-<description>.md`。

將所有 8 個連結路徑同步更新。

## 驗證標準

- [ ] README.md 中所有 task 連結指向 `gold-monitor-pro/tasks/T00X-<description>.md`
- [ ] 顯示標籤仍為 `[T00X]`（非 `[T00X-<description>]`）
- [ ] 點擊連結解析成功（檔案存在於對應路徑）
