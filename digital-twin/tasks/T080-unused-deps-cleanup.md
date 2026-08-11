---
github_issue: null
title: 移除未使用依賴（loguru/pydantic/langchain 等）並統一安裝來源
type: refactor
priority: low
status: pending
depends_on: [67]
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-12'
updated: '2026-08-12'
---
# T080 - 依賴清理與安裝來源統一

## 目標
`pyproject.toml` 聲明但不被任何程式碼 import 的依賴：
- `loguru`、`pydantic`（pyproject.toml:12,14）
- `langchain`、`langchain-openai`、`chromadb`、`tiktoken`（pyproject.toml:49-52）

這些同時被 `Dockerfile:17` 安裝，白白增加 uv.lock 與映像體積。清理時一併以 T067 的 `[prod]` extras 作為唯一安裝來源。

## 驗收標準
- [ ] 逐一以 `git grep` 驗證無 import 後，移除 pyproject.toml 中未使用依賴
- [ ] uv.lock 同步更新（uv lock / uv sync）
- [ ] Dockerfile 依賴僅來自 `[prod]` extras（T067 完成後）
- [ ] `.venv` 移除對應套件後 pytest 全量仍通過（含所有 ImportError 降級路徑測試）
- [ ] ruff / pyright 通過

## 備註
- 移除前務必檢查 `common/observability.py` 等 optional-import 降級路徑是否誤刪需要的相依（如 opentelemetry）
- 若某模組刻意保留未用依賴供未來使用，需在 pyproject 註記理由，不可默默留著