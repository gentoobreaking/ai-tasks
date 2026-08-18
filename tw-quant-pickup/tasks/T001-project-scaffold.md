---
github_issue: N/A
title: 專案 Scaffold（Python monorepo 骨架）
type: task
priority: P0
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: '2026-08-18'
fail_count: 0
summary: 2026-08-18 完成：scaffold 補強（.env.example / Makefile dev+run / README spec 指標）並驗收後 commit 2333d00
blocked_review: tasks/blocked-review/T001-review.md
---
# T001 - 專案 Scaffold（Python monorepo 骨架）

## 目標

依 spec §4（Repository Structure）建立 `src/twquant/` 目錄骨架、`pyproject.toml`、config YAML、Makefile、Dockerfile、docker-compose.yml、`.env.example` 與測試目錄。不實作任何業務邏輯，只建立可跑 pytest 的空專案。

## 驗收標準

- [x] `pyproject.toml` 建立（Python >= 3.11，依賴：pydantic、httpx、pytest、uv/pip 皆可）
- [x] `src/twquant/` 含 spec §4 全部子目錄：cli / providers / collectors / normalization / factors / valuation / etf / ranking / backtest / ai / api / reports / alerts / models / db（實作採根層 flat layout，依專案 AGENTS.md 慣例；套件集合與 spec §4 相同）
- [x] `tests/` 含 unit / integration / regression / backtest 四個子目錄（§4 底部）
- [x] `config/` 五個 YAML：scoring.yaml / valuation.yaml / universe.yaml / schedule.yaml / risk.yaml
- [x] `.env.example` 含 `MCP_TRANSPORT`（stdio|streamable-http，預設 streamable-http）與 `MCP_HTTP_ADDR=127.0.0.1:8787`（§6）
- [x] `Makefile` 提供 `make dev` / `make test` / `make lint` / `make run` 基本指令
- [x] 空專案 `pytest` 可通過（至少一個 smoke test）——實際 8 passed，ruff/pyright 亦過

## 備註

- 不建立 DB 連線與實際對外呼叫；`collectors` 等目錄先放空 `__init__.py`
- README.md 需指向 spec 路徑（`~/tasks/tw-quant-pickup/tw-quant-pickup-spec-v0.3.md`）
- 專案根目錄建議在 `~/Projects/tw-quant-pickup/`（現有工作目錄）