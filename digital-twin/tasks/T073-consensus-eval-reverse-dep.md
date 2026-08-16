---
github_issue: null
title: consensus_eval 反向依賴修正（直通 discussion_orchestrator）
type: refactor
priority: medium
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-12'
updated: '2026-08-17'
spec_version: v3
---
# T073 - consensus_eval 反向依賴修正

## 目標
`consensus_eval.py:16` 從 CLI shim `multi_ai_discuss` 匯入 `MODELS, AIClient`，形成工具依賴 CLI 的輕微反向邊（orchestrator 才是真正的消費者）。改為直連 `discussion_orchestrator`（含 adapters / resilience）。

## 驗收標準
- [x] `consensus_eval.py` 不再 import `multi_ai_discuss`，改由 `discussion_orchestrator` 取得 `MODELS` / `AIClient`
- [x] `multi_ai_discuss` 的 legacy AIClient compat shim 若已無消費者可移除（同時檢查討論引擎是否仍被引用）
- [x] `test_gen_mermaid_consensus` / `test_discussion_orchestrator` 等測試全過
- [x] pytest 全量通過、ruff / pyright 通過

## 實作摘要

### 設計
`AIClient` 本質上是 `create_adapter` 的薄包装（將 `messages` list → `system`/`prompt` 字串）。
將其移至 `discussion_orchestrator.adapters`（與 `ModelAdapter` / `create_adapter` 同模組），
並由 `discussion_orchestrator/__init__.py` re-export `AIClient` 與 `MODELS`，
使 `consensus_eval.py` 能直通 `discussion_orchestrator` 取得所需符號。

`worker.py` 僅以 `multi_ai_discuss.py` 做為 **subprocess CLI 入口**（不 import AIClient），
因此移除 shim 類別不影響 worker 路徑。

### 變更
- **新增** `discussion_orchestrator.adapters.AIClient`：原 `multi_ai_discuss.AIClient` 完整複製（`__init__`/`classify_fatal_error`/`call`），內部使用 `create_adapter`
- `discussion_orchestrator/__init__.py`：re-export `AIClient` 與 `MODELS`（來自 `config`）
- `consensus_eval.py`：`from multi_ai_discuss import MODELS, AIClient` → `from discussion_orchestrator import AIClient, MODELS`
- `multi_ai_discuss.py`：刪除本地 `AIClient` 類別；改為 `from discussion_orchestrator.adapters import AIClient, create_adapter`（backward-compat re-export）；移除不再使用的 `ModelConfig` 匯入
- `tests/test_index_discuss_observability.py`：`TestMultiAIDiscuss` → `TestAIClient`；匯入 `AIClient` 自 `discussion_orchestrator`；monkeypatch 目標改為 `discussion_orchestrator.adapters.create_adapter`

### 驗證
- pytest 全量：262 passed + 1 skipped
- ruff：本次檔案 All checks passed
- pyright：本次檔案 0 errors

## 備註
- 此 shim 僅提供 `__call__`/`classify_fatal_error` 的舊介面；`DiscussionOrchestrator` 本體已直從 `create_adapter` 建立 ModelAdapter，無仰賴 AIClient
- 屬架構修正，不改變 consensus 計算結果 — `_tokenize` / `calculate_consensus_index` 未動