---
title: 建立專案 .venv（Python 3.14 + 全部依賴）
type: chore
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-05
updated: 2026-08-05
---

# T026 - 建立專案 .venv（Python 3.14 + 全部依賴）

## 目標
T017 驗證時發現執行環境分裂：QClaw python3（3.11.10）缺 dotenv、homebrew python3（3.14.6）缺 loguru 等，且 pyright 用自己的機制找不到已安裝套件。本任務在專案根目錄建立統一 `.venv`（Python 3.14），安裝 pyproject 全部依賴（runtime + dev），讓 pytest / ruff / pyright / 各模組 import 都在同一環境執行。

## 驗收標準
- [x] `/opt/homebrew/bin/python3 -m venv .venv` 建立於專案根目錄（Python 3.14.6 + pip 26.1.2）
- [x] 依賴安裝：`pip install -e ".[dev]"` 失敗（hatchling 無 src/ 套件結構）→ 按備註退路逐項安裝 dependencies + dev 全清單 + pydantic-settings + pyyaml（httpx 0.28.1/pydantic 2.13.4/python-dotenv 1.2.2/loguru 0.7.3/structlog 26.1.0/pytest 9.1.1/pytest-asyncio 1.4.0/ruff 0.16.1/pyright 1.1.411/pydantic-settings 2.14.2/PyYAML 6.0.3）
- [x] `.venv/bin/python -c "import structlog, dotenv, pydantic, pydantic_settings, httpx, loguru, yaml"` 全部成功
- [x] `.venv/bin/python -m pytest tests/ -q` → 5 passed（統一環境）
- [x] `.venv/bin/ruff check .`（ruff 0.16.1）、`.venv/bin/pyright --version`（1.1.411）可執行
- [x] `.venv/` 已加入 .gitignore（L61，原僅 venv/ 無點前綴）；`git status` 確認 .venv 未被追蹤
- [x] pip freeze 快照存 `logs/venv-pip-freeze-2026-08-05.txt`（25 套件）

## 額外驗證
- 全專案 13 個模組（config/auto_develop/multi_ai_discuss/consensus_eval/spec_auto_merge/index_knowledge/task_advisor/auto_guardrail/gen_mermaid/extract_feedback/apply_feedback/install_hooks/setup_daemon）`.venv/bin/python` import 全部成功（含之前 pyright 誤報的 config/validate.py、install_hooks.py）
- .venv 建立後 pyright 誤報的 5 個套件（structlog/dotenv/pydantic_settings/yaml/httpx）在 .venv 中全部可用，為 T027（pyright 指向 .venv）鋪路

## 備註
- **本任務是 T027（pyright venv 設定）的前置任務**
- 不影響既有執行方式：QClaw python3 與 homebrew python3 仍可使用，.venv 是新增的統一環境
- pyproject 的 `[tool.pyright] pythonVersion = "3.10"` 是語法目標版本，不代表執行版本，不需改
- 若 pip 安裝網路受限，可改用 `--index-url` 鏡像（如 tsinghua/aliyun）
