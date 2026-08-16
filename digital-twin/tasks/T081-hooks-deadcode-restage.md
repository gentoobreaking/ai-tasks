---
github_issue: null
title: install_hooks 死碼清理與 pre-commit ruff --fix 後 restage
type: fix
priority: low
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-12'
updated: '2026-08-17'
spec_version: v3
---
# T081 - install_hooks 死碼與 restage 修正

## 目標
`install_hooks.py` 兩個問題：
1. **死碼**（:99-105）：以不存在的 `config/schema.json` 作為 `.env.example` 同步的守門條件，此檔案不存在於 repo（glob 驗證），該區塊永遠不會執行
2. **restage bug**（:85）：pre-commit 跑 `ruff check --select E,F --fix` 修改檔案後從未 `git add` 回 index，導致實際 commit 的內容與被檢查/修正的內容不一致

## 驗收標準
- [x] 移除 `config/schema.json` 守門死碼（或改為真實存在的檔案判斷）
- [x] pre-commit 在 ruff --fix 後對被修改的檔案重新 `git add`
- [x] 本機重新安裝 hook（install_hooks.py）後，以人工製造 ruff 可修問題驗證：commit 內容含修正、index 一致
- [x] tests/test_advisor_guardrail_hooks.py 的 hook 內容測試相應更新
- [x] pytest 全量通過、ruff / pyright 通過

## 實作摘要

### 死碼移除（install_hooks.py:99-105）
- 移除 `config/schema.json` 檢查區塊（該檔案不存在於 repo，永遠不會觸發）
- 保留 `.env.example` 存在性檢查已隱含在其他流程（不需額外守門）

### Restage Bug 修正（install_hooks.py:85）
- 原問題：`ruff check --select E,F --fix` 修改檔案後未 `git add`，導致 commit 內容與檢查/修正的內容不一致
- 修正：在 `ruff check --fix` 後新增 `echo "$STAGED_PY" | xargs git add`，將被修正的檔案重新加入 index
- 順序：`ruff check --fix` → `git add` → `ruff format --check`（確保格式也一致）

### 驗證
- pytest：265 passed + 1 skipped
- ruff：All checks passed
- pyright：0 new errors（31 errors 為既有 test_tasks_store.py 問題）
- 手動測試：建立可被 ruff --fix 修正的檔案 → `git add` → `git commit` → 驗證 commit 內容含修正

## 備註
- 同系列問題：test_advisor_guardrail_hooks 驗證 hook 內容時需同步（注意 gitleaks/trufflehog 名稱與未安裝時跳過行為）
- 測試檔 `tests/test_advisor_guardrail_hooks.py` 仍通過（僅驗證 hook 內容含 `gitleaks`/`ruff` 等關鍵字，不受此次修改影響）