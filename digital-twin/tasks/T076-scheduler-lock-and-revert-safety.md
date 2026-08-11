---
github_issue: null
title: scheduler 併跑鎖定與 git_revert_all 資料破壞防護
type: fix
priority: medium
status: pending
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-12'
updated: '2026-08-12'
---
# T076 - scheduler 併跑鎖定 + revert 防誤刪

## 目標
兩個問題：
1. **併跑 race**：`AutoDevelopScheduler.run`（scheduler.py:932-989）、frontmatter read-modify-write、`sync_readme`（:252-326）、`git add -A`+commit 之間無鎖。手動 `/auto-dev` 與排程同時跑會重複執行任務、frontmatter 競爭寫入。
2. **revert 破壞性**：`_record_failure`（scheduler.py:681-689）→ `git_revert_all` 執行 `git checkout -- .`（common/git.py:131-137）與 `git clean -fd`（git.py:139-145）。`git clean -fd` 會靜默刪除目標 repo 內任何未追蹤、未 gitignore 的使用者檔案。

## 驗收標準
- [ ] scheduler 加入 inter-run 鎖（如 file lock 於 code_dir 或 temp），同專案同時只允許一個 run；第二個 run 拒絕或等待
- [ ] 手動 `/auto-dev` 與排程共用同一鎖
- [ ] `git_revert_all` 不再 `git clean -fd` 刪除未追蹤檔案，或以安全方式（如僅清 diff 產物並先列出檔案、或加入 dry-run 警示）取代；`.env` 等檔案絕不被刪
- [ ] 新增測試：並發 run 鎖行為、revert 後未追蹤檔案保留
- [ ] pytest 全量通過、ruff / pyright 通過

## 備註
- 鎖需要有過期/清理機制（lock file 殘留不得永久卡住排程）
- revert 的語義是「還原任務變更」；若未追蹤檔案屬任務產物可由任務層記錄清單精確刪除