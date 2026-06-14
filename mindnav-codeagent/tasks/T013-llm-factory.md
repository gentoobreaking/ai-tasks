---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/519
title: T013 - 統一推理接口與 LLM 資源池化
type: Feature
priority: medium
status: done
assignee: gemini-cli
created: 2026-05-15
updated: 2026-05-15
---

# T013 - 統一推理接口與 LLM 資源池化

## Description
將所有 Agent 的 LLM 呼叫統一重構至 `src/core/llm_factory.py`，封裝 OpenAI 相容接口，實現推理後端與 Agent 邏輯的完全解耦。

## Acceptance Criteria
- [x] 建立 `src/core/llm_factory.py` 提供統一的 `get_llm()` 工廠方法。
- [x] 將 `graph.py`、`router.py`、`git_review_api.py` 的 LLM 實例化邏輯遷移至此。
- [x] 支援動態配置推理後端（Ollama/vLLM/llama-cpp-python）而不需改動業務代碼。

## Notes
- 實作了 `LLMFactory`。
- 所有組件已重構為透過 `LLMFactory` 獲取 LLM 實例。
- 統一透過環境變數 `LOCAL_LLM_URL` 管理推理端點。
- 移除了所有對 `ChatOllama` 的直接依賴，改用 `ChatOpenAI` 進行通用連接。
