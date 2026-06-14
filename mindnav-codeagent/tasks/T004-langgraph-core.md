---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/511
title: T004 - LangGraph 多代理核心拓撲 (PM & Coder & Doc)
type: Feature
priority: high
status: done
assignee: gemini-cli
created: 2026-05-15
updated: 2026-05-15
---

# T004 - LangGraph 多代理核心拓撲 (PM & Coder & Doc)

## Description
建立 LangGraph StateGraph，定義 ProjectState 與多模型節點（Cloud PM, Local Coder/Doc），實現協作循環。

## Acceptance Criteria
- [x] 定義 ProjectState 共享狀態（messages, current_code, docs, etc.）。
- [x] 實作 PM 節點（GPT-4o/Local Fallback）負責任務拆解與進度審核。
- [x] 實作 Coder 節點（Local LLM）負責代碼生成。
- [x] 設定條件路由（Conditional Edges），定義循環退出條件。

## Notes
- 使用 `MemorySaver` 實現執行緒記憶隔離。
- 實現了 `OPENAI_API_KEY` 缺失時自動回退至本地模型的機制。
- 循環退出條件：PM 回覆中包含 `FINISHED` 或超過 10 次迭代。
- 代碼位於 `src/core/graph.py`。
