---
status: done
commit: 41237c1e
depends_on: []
priority: high
assignee: OpenCode
created: 2026-08-03
updated: '2026-08-17'
summary: '實作 T002: gitignore-and-hooks'
spec_version: v3
---
# T002: 新增 .gitignore 並強制 secrets scanning (pre-commit/pre-push)

## 背景
專案缺少 .gitignore，導致 `.env`、`*.db`、`__pycache__/` 等敏感檔案可能被提交。且無 pre-commit hooks 防止 secrets 洩漏。

## 需求
1. 新增 `.gitignore`，最小內容包含：
   - `.env`、`*.db`、`*.sqlite*`
   - `__pycache__/`、`*.pyc`、`.pytest_cache/`、`.coverage`
2. 在 `install_hooks.py` 內建 pre-commit hooks：
   - `gitleaks` (pre-commit) 掃描 secrets
   - `trufflehog` (pre-push) 掃描歷史
   - `ruff` (pre-commit) 格式化與 lint
   - `pytest` (pre-push) 執行測試
3. Hook 失敗即 `exit 1` 阻擋提交

## 驗收標準
- `git commit` 觸發 `gitleaks` + `ruff`，失敗即阻擋
- `git push` 觸發 `trufflehog` + `pytest`，失敗即阻擋
- `.env.example` 內容與 schema 同步

## 參考
- v3 討論 DEC-07 / SPEC-01, SPEC-02 / DeepSeek 第 1 輪建議 1, 5