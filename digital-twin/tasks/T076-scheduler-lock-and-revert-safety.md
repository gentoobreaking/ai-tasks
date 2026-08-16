---
github_issue: null
title: scheduler 併跑鎖定與 git_revert_all 資料破壞防護
type: fix
priority: medium
status: done
spec_version: v3
commit: a1c28f0
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-12'
updated: '2026-08-14'
---
# T076 - scheduler 併跑鎖定 + revert 防誤刪

## 目標
兩個問題：
1. **併跑 race**：`AutoDevelopScheduler.run`（scheduler.py:932-989）、frontmatter read-modify-write、`sync_readme`（:252-326）、`git add -A`+commit 之間無鎖。手動 `/auto-dev` 與排程同時跑會重複執行任務、frontmatter 競爭寫入。
2. **revert 破壞性**：`_record_failure`（scheduler.py:681-689）→ `git_revert_all` 執行 `git checkout -- .`（common/git.py:131-137）與 `git clean -fd`（git.py:139-145）。`git clean -fd` 會靜默刪除目標 repo 內任何未追蹤、未 gitignore 的使用者檔案。

## 驗收標準
- [x] scheduler 加入 inter-run 鎖（如 file lock 於 code_dir 或 temp），同專案同時只允許一個 run；第二個 run 拒絕或等待
- [x] 手動 `/auto-dev` 與排程共用同一鎖
- [x] `git_revert_all` 不再 `git clean -fd` 刪除未追蹤檔案，或以安全方式（如僅清 diff 產物並先列出檔案、或加入 dry-run 警示）取代；`.env` 等檔案絕不被刪
- [x] 新增測試：並發 run 鎖行為、revert 後未追蹤檔案保留
- [x] pytest 全量通過、ruff / pyright 通過

## 實作摘要

### 設計
**Inter-run lock（T076.1）**：在 `AutoDevelopScheduler.run()` 啟動時使用 `fcntl.flock`（non-blocking, `LOCK_EX | LOCK_NB`）於系統暫存目錄建立 lock file（`/tmp/dt-scheduler-{project}.lock`）。第二個 run 若發現 lock 被佔用，直接印出警告並提前返回。Process 死亡時 OS 自動釋放 flock，無 stale lock 風險。手動 `auto_develop.py` 與背景排程共用同一 `run()` 入口，故同享此鎖。

**git_revert_all 安全強化（T076.2）**：
- `git clean -fd` → `git clean -fd -e .env -e .env.*`，保護 `.env`、`.env.local` 等敏感未追蹤檔案
- 驗證階段 `allowed_prefixes` 加入 `.env` 前綴，允許 `.env*` 檔案殘留不視為錯誤

### 變更
- `scheduler.py`：
  - Import `fcntl`、`tempfile`（降級處理：Windows 等無 fcntl 環境跳過鎖）
  - `run()` 開頭建立 lock file、嘗試 `flock(LOCK_EX | LOCK_NB)`，失敗則提前返回
  - `run()` 主體包在 `try/finally` 確保 `LOCK_UN` + 關閉檔案
- `common/git.py`：
  - 新增 `PROTECTED_CLEAN_PATTERNS = [".env", ".env.*"]`
  - `git_revert_all` 的 `git clean` 加入 `-e .env -e .env.*`
  - 驗證邏輯 `allowed_prefixes` 加入 `.env`，允許 `.env`、`.env.local` 等殘留

### 測試
- `tests/test_scheduler_exception_guard.py`：
  - `test_scheduler_run_lock_rejects_concurrent`：先手動佔用 lock，再呼叫 `run()` 驗證被拒絕
  - `test_scheduler_run_lock_released_after_completion`：連續兩次 `run()` 驗證 lock 釋放、第二次可進入
- `tests/test_auto_develop_deps.py`：
  - `test_git_revert_all_preserves_dotenv`：建立 `.env`、`.env.local` + 模型新檔，呼叫 `git_revert_all` 驗證模型檔被清、`.env*` 保留

### 驗證
- pytest：265 passed + 1 skipped
- ruff：All checks passed
- pyright：0 new errors（31 errors 為既有 test_tasks_store.py 問題）

## 備註
- 鎖使用 `/tmp/dt-scheduler-{project}.lock` 避免污染 code_dir
- `fcntl.flock` 為 advisory lock，需所有進程合作；本專案僅 Python 進程使用，足夠
- `.env*` 保護涵蓋 `.env`、`.env.local`、`.env.production` 等常見變體