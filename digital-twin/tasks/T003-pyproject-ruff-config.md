---
status: done
spec_version: v3
commit: a1c28f0
depends_on: []
priority: high
assignee: OpenCode
created: 2026-08-03
updated: '2026-08-03'
summary: '實作 T003: 新增 pyproject.toml 完整依賴管理與 ruff 配置'
commit: 87f7fc0
---
# T003: 新增 pyproject.toml 完整依賴管理與 ruff 配置

## 背景
專案無 `pyproject.toml` / `requirements.txt`，依賴管理完全缺失。依 DeepSeek 建議，採用單一 `pyproject.toml` + `uv` 管理。

## 需求
1. 新增 `pyproject.toml`，包含：
   - `[build-system]` 使用 `hatchling`
   - `[project]`：name, version, description, requires-python, dependencies
   - `[project.optional-dependencies]`：dev/prod/rag/telegram 分組
   - `[tool.ruff]`：line-length=100, target-version=py310
   - `[tool.pyright]`：typeCheckingMode=strict
   - `[tool.pytest.ini_options]`：asyncio_mode=auto, testpaths=["tests"]
2. 移除不存在的 `requirements.txt` 參考
3. 確保 `uv sync --all-extras` 可完整安裝

## 驗收標準
- `uv sync --all-extras` 成功安裝所有依賴
- `ruff check .` 無錯誤
- `pyright` 型別檢查通過

## 參考
- v3 討論 DEC-04 / SPEC-06 / DeepSeek 第 2 輪建議 2.4, 4.1