---
github_issue: null
title: twin auto --list 首行顯示專案標題
type: feature
priority: low
status: done
commit: a1b2c3d
updated: '2026-08-17'
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-11'
spec_version: v3
---
# T063 - twin auto --list 首行顯示專案標題

## 目標
`twin auto --list` 目前直接列出任務清單，首行缺少標頭說明。
需要在任務表列之前，顯示標頭：`目前專案{project}中的任務表列如下：`

## 驗收標準
- [x] `./twin auto --project digital-twin --list` 首行顯示 `目前專案digital-twin中的任務表列如下：`
- [x] `./twin auto --list`（PWD 自動判斷專案）首行正確顯示對應專案名稱
- [x] all-done 專案仍顯示標頭，然後顯示完成訊息
- [x] 無任務檔案的專案顯示標頭，然後顯示「沒有任務檔案」提示
- [x] pytest 12 passed；ruff auto_develop.py 通過
- [x] 專案不存在時不顯示標頭，僅顯示錯誤

## 備註
- 需修改 `auto_develop.py` 中 `--list` 處理區塊
- 確認 `load_tasks()` 可能拋出 `ValueError` 的情況下，標頭仍正確顯示
- 標頭應在所有輸出情況下一致顯示（含：無任務、全完成、正常列舉）
- 專案不存在（tasks_dir 不存在）時，於 `sys.exit(1)` 前不顯示標頭