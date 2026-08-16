---
github_issue: null
title: git 操作收斂 common/git.py——auto_develop 五處 subprocess 改用單一模組
type: refactor
priority: high
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-11'
updated: '2026-08-17'
spec_version: v3
---
# T050 - git 操作收斂 common/git.py

## 目標
2026-08-11 審查發現 auto_develop.py 內 git 操作散落且片段重複：
git_commit(:724)、build_pr_summary 的 add+diff(:791)、count_diff_lines 的 add+diff(:847)
（後兩者幾乎相同）、_get_changed_files(:1427)、_git_revert_changes(:1460)。
本任務建立 common/git.py 單一收斂點（diff 統計、commit、revert、changed_files），
auto_develop 全面改用，後續拆分（T051）可立即受益。

## 驗收標準
- [x] common/git.py 提供：`git_diff_numstat(code_dir)`（等價 :791/:847 行為，含 staging）、
  `git_commit(code_dir, msg) -> hash|None`、`git_changed_files(code_dir) -> list[str]`、
  `git_revert_all(code_dir) -> bool`
- [x] auto_develop 五處全改走 common/git.py；`rg "subprocess.run\(\[\"git\"" auto_develop.py` 無殘留
- [x] PR 摘要閘門輸出與先前一致（test_auto_develop_deps 的 count_diff_lines/build_pr_summary 測試維持通過）
- [x] pytest 全量維持 151 passed + 1 skipped；ruff 全過；不引入新依賴

## 備註
- build_pr_summary 與 count_diff_lines 的差異在 staging 時機與輸出格式，收斂時保留各自既有輸出語意
- revert 含 git clean -fd 的破壞性動作，函式需有明確 docstring 與 dry-run 參數（沿用現況 println 告警）
- 實作補充：git_revert_all 提供 `dry_run=True`（只告警不執行）；tasks/config.py/logs 殘留容許
  語意一併收進 common/git.py；_git_revert_changes 保留對外簽名薄委派；
  pytest 全量 164 passed + 1 skipped（新增 3 項 common/git 測試）