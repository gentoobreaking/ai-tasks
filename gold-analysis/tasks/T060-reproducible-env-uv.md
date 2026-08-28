---
id: T060
github_issue: ""
title: 環境可重現化 (uv + uv.lock；修正 venv 直譯器不一致)
project: gold-analysis
type: infra
priority: medium
status: pending
depends_on: []
assignee: "pi"
created: 2026-08-28
updated: 2026-08-28
---

# T060 - 環境可重現化 (uv + uv.lock；修正 venv 直譯器不一致)

## 目標
本地 venv 中 `pip3 list` 顯示已安裝 fastapi/pandas 等，但 `python3 -c "import fastapi"` 卻報 `ModuleNotFoundError`，顯示 `pip3` 與 `python3` 在非互動 subshell 中指向不同直譯器，破壞可重現性。依 ai-howto 慣例應改用 `uv` 並產生 `uv.lock`。

## 驗收標準
- [ ] 改用 `uv` 管理虛擬環境與依賴（`uv venv`、`uv sync`）
- [ ] 產生並提交 `uv.lock` 鎖定版本
- [ ] `uv run python3 -c "import app.main"` 成功（依賴完整解析）
- [ ] README/AGENTS 更新為 `uv` 指令（取代 `pip3`/手動 venv）
- [ ] 修復 venv 中 `pip3`/`python3` 指向不一致的根因（重建乾淨 venv 或統一用 `uv run`）

## 備註
- AGENTS 全域規範：本機用 `python3`/`uv`，`uv run python3` 執行腳本。
- 參考：`backend/requirements*.txt`（若存在）與 `backend/venv`。
