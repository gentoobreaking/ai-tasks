---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/517
title: T010 - Git Hook 代碼自動審查整合 (FastAPI & pre-commit)
type: Feature
priority: medium
status: done
assignee: gemini-cli
created: 2026-05-15
updated: 2026-05-15
---

# T010 - Git Hook 代碼自動審查整合 (FastAPI & pre-commit)

## Description
建立 FastAPI 接口與 Git pre-commit Hook，實現代碼提交前的自動化 Agent 審查。

## Acceptance Criteria
- [x] 暴露 FastAPI /git/review 接口接收 Diff 資料。
- [x] 撰寫 pre-commit 腳本，串接本地 API。
- [x] 實現「拒絕提交」邏輯，若 Agent 發現嚴重 Bug 則中止 Commit。

## Notes
- 審查 API 實作於 `src/interface/git_review_api.py`。
- Pre-commit 腳本位於 `src/scripts/pre-commit-review.sh`。
- 運作流程：`git commit` -> `pre-commit hook` -> `FastAPI` -> `Local LLM` -> `Decision`。
- 若 API 服務未啟動，腳本會提示警告並跳過審查以避免阻塞工作流。
