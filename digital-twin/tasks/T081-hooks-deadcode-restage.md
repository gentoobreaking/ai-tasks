---
github_issue: null
title: install_hooks 死碼清理與 pre-commit ruff --fix 後 restage
type: fix
priority: low
status: pending
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-12'
updated: '2026-08-12'
---
# T081 - install_hooks 死碼與 restage 修正

## 目標
`install_hooks.py` 兩個問題：
1. **死碼**（:99-105）：以不存在的 `config/schema.json` 作為 `.env.example` 同步的守門條件，此檔案不存在於 repo（glob 驗證），該區塊永遠不會執行
2. **restage bug**（:85）：pre-commit 跑 `ruff check --select E,F --fix` 修改檔案後從未 `git add` 回 index，導致實際 commit 的內容與被檢查/修正的內容不一致

## 驗收標準
- [ ] 移除 `config/schema.json` 守門死碼（或改為真實存在的檔案判斷）
- [ ] pre-commit 在 ruff --fix 後對被修改的檔案重新 `git add`
- [ ] 本機重新安裝 hook（install_hooks.py）後，以人工製造 ruff 可修問題驗證：commit 內容含修正、index 一致
- [ ] tests/test_advisor_guardrail_hooks.py 的 hook 內容測試相應更新
- [ ] pytest 全量通過、ruff / pyright 通過

## 備註
- 同系列问题：test_advisor_guardrail_hooks 驗證 hook 內容時需同步（注意 gitleaks/trufflehog 名稱與未安裝時跳過行為）