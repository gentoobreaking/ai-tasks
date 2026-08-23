---
github_issue: 
title: 後端模組化重構（api routers + pipeline 套件）
type: refactor
priority: medium
status: done
depends_on: [T039]
assignee: pi with opencode/x-preview-f-free
created: 2026-08-23
updated: 2026-08-23
---

# T40 - 後端模組化重構（api routers + pipeline 套件）

## 目標
api/main.py（859 行）拆分為 helpers + routers/{system,market,content}；pipeline_runner.py（1315 行）拆分為 pipeline/ 套件（core/runner/setup/stages），原檔保留相容 shim，SQL 與行為完全不變。

## 驗收標準
- [x] create_app 僅保留工廠、middleware、exception handlers
- [x] pipeline/core.py：型別 / STAGE_ORDER / RunContext
- [x] pipeline/runner.py：PipelineRunner 編排與 load_pipeline_config
- [x] pipeline/setup.py + stages.py：前置作業與 §49 各階段
- [x] 全數測試通過（697 passed）、ruff 通過

## 備註
pipeline_runner.time.sleep 相容性：測試 monkeypatch 需 shim 保留 `import time`。
