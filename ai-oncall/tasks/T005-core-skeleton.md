---
github_issue: N/A
title: oncall-core 骨架、gRPC servicer 與 SQLite store
type: feat
priority: high
status: done
depends_on:
- T001
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T005 - oncall-core 骨架、gRPC servicer 與 SQLite store

## 目標
Python 專案基礎：pyproject + uv、src/oncall_core 結構、structlog、grpc_servicer 實作
proto 四個 RPC 的骨架、SQLite store（WAL、migration 機制、incidents/timeline/predictions 表）。

## 驗收標準
- [ ] gRPC 四個 RPC 可被 Go gate 呼叫（跨語言整合煙霧測試）
- [ ] store 併發寫入安全（WAL），migration 測試
- [ ] ruff/pyright 歸零