---
github_issue: null
title: 移除未使用依賴（loguru/pydantic/langchain 等）並統一安裝來源
type: refactor
priority: low
status: done
spec_version: v3
commit: a1c28f0
depends_on: [67]
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-12'
updated: '2026-08-14'
---
# T080 - 依賴清理與安裝來源統一

## 目標
`pyproject.toml` 聲明但不被任何程式碼 import 的依賴：
- `loguru`、`pydantic`（pyproject.toml:12,14）
- `langchain`、`langchain-openai`、`chromadb`、`tiktoken`（pyproject.toml:49-52）

這些同時被 `Dockerfile:17` 安裝，白白增加 uv.lock 與映像體積。清理時一併以 T067 的 `[prod]` extras 作為唯一安裝來源。

## 驗收標準
- [x] 逐一以 `git grep` 驗證無 import 後，移除 pyproject.toml 中未使用依賴
- [x] uv.lock 同步更新（uv lock / uv sync）
- [x] Dockerfile 依賴僅來自 `[prod]` extras（T067 完成後）
- [x] `.venv` 移除對應套件後 pytest 全量仍通過（含所有 ImportError 降級路徑測試）
- [x] ruff / pyright 通過

## 實作摘要

### 驗證未使用的依賴
透過 AST 解析專案所有 `.py` 檔案，確認實際 import 的第三方套件：
- **實際被 import**：`httpx`、`python-dotenv`、`structlog`、`pyyaml`、`opentelemetry-*`、`prometheus-client`、`aiogram`、`fastapi`、`uvicorn`、`redis`、`pybreaker`、`tenacity`、`lancedb`、`sentence-transformers`、`pyarrow`
- **未被 import**：`loguru`、`pydantic`（程式碼改用 `dataclass`）、`langchain`、`langchain-openai`、`chromadb`、`tiktoken`

### 變更
- `pyproject.toml`：
  - 移除 `loguru`、`pydantic` 從主依賴與 `[prod]` extras
  - 移除整個 `[rag]` extras（內含 `langchain` 等未使用套件）
  - 新增 `lancedb>=0.36`、`sentence-transformers>=3.0` 到主依賴與 `[prod]`（實際被 import）
  - 保留 `[telegram]` extras（`aiogram`、`fastapi`、`uvicorn`、`redis`、`pybreaker` 子集）
  - 清理 `[dev]` extras：移除 `loguru`、`pydantic`
  - 新增 `[tool.hatch.build]` 配置，使專案可 `pip install -e .`
- `Dockerfile`：
  - Builder 階段改為 `COPY` 原始碼後 `pip install ".[prod]"`（T080: 統一安裝來源）
  - 不再手動列出每個依賴版本

### 驗證
- pytest：265 passed + 1 skipped
- ruff：All checks passed
- pyright：0 new errors（31 errors 為既有 test_tasks_store.py 問題）
- 專案可 `pip install -e .` 且所有模組正常 import

## 備註
- 移除前已檢查 `common/observability.py` 等 optional-import 降級路徑，確認不依賴 `loguru`/`pydantic`
- `langchain` 等若未來需求可另開 issue 再加回