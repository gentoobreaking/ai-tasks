---
title: auto_develop 失敗路徑還原工作目錄
type: fix
priority: high
status: done
spec_version: v3
commit: a1c28f0
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-05
updated: 2026-08-06
commit: aac5064
---

# T013 - auto_develop 失敗路徑還原工作目錄

## 目標
`process_task()` 目前流程：套用 diff → 測試失敗 → `_record_failure` 標 pending。但**失敗的程式碼殘留在工作目錄**，下次重試時 `git apply` 可能因檔案已被污染而失敗（T006/T008 blocked 的潛在成因之一）。測試/檢查失敗時應先還原工作目錄再記錄失敗。

## 驗收標準
- [x] 測試/檢查失敗時，執行 `git checkout -- .`（或 `git stash`）還原所有未 commit 變更（實作：`_git_revert_changes()` 用 `git checkout -- .` + `git clean -fd`）
- [x] 還原後 `git status --porcelain` 為乾淨狀態（除任務檔本身的 status 更新外；允許 tasks/、config.py、logs/ 殘留）
- [x] 同一任務重試時 `git apply` 不再因殘留變更失敗（重試前工作目錄已還原）
- [x] 還原前先印出失敗原因與將被還原的檔案清單（方便除錯）
- [x] 不影響成功路徑（測試通過時不還原、正常 commit）
- [x] `--keep-changes` 逃生門參數（除錯用，預設關閉）已實作

## 備註
- 注意：`update_task_status` 對任務檔的寫入不能也被還原（任務檔在 `~/tasks/` 或專案 `tasks/`，不在 code_dir，天然不受影響；若放 code_dir 內需排除）
- 建議加 `--keep-changes` 逃生門參數（除錯用，預設關閉）
