---
github_issue: null
title: consensus_eval 反向依賴修正（直連 discussion_orchestrator）
type: refactor
priority: medium
status: pending
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-12'
updated: '2026-08-12'
---
# T073 - consensus_eval 反向依賴修正

## 目標
`consensus_eval.py:16` 從 CLI shim `multi_ai_discuss` 匯入 `MODELS, AIClient`，形成工具依賴 CLI 的輕微反向邊（orchestrator 才是真正的消費者）。改為直連 `discussion_orchestrator`（含 adapters / resilience）。

## 驗收標準
- [ ] `consensus_eval.py` 不再 import `multi_ai_discuss`，改由 `discussion_orchestrator` 取得 `MODELS` / `AIClient`
- [ ] `multi_ai_discuss` 的 legacy AIClient compat shim 若已無消費者可移除（同時檢查討論引擎是否仍被引用）
- [ ] test_gen_mermaid_consensus / test_discussion_orchestrator 等測試全過
- [ ] pytest 全量通過、ruff / pyright 通過

## 備註
- 若移除 shim 影響外部呼叫（如 worker subprocess 直接跑 `multi_ai_discuss.py`），保留 CLI 入口但內部轉發 orchestrator
- 屬架構修正，不應改變 consensus 計算結果