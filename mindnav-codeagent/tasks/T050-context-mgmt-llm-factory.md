---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/554
title: T050 - ContextManager 改用 LLMFactory
type: Refactor
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash Free
created: 2026-05-16
updated: 2026-05-16
howto: refactor
---

# T050 - ContextManager 改用 LLMFactory

## 目標
`engine/context_mgmt.py` 直接使用 `ChatOllama` 建立 LLM 連線，違反了 LLMFactory 統一管理推理後端的設計原則，導致 ContextManager 只能使用 Ollama 而非全域配置的後端。

## 驗收標準
- [x] `ContextManager.__init__()` 改為透過 `LLMFactory.get_llm()` 取得 LLM 實例
- [x] 移除對 `langchain_ollama` 的直接依賴（不再 import ChatOllama）
- [x] 保留 `model` 與 `base_url` 參數作為向下相容（若傳入則優先使用 override，透過 model_override/url_override 傳入 LLMFactory）
- [x] ContextManager 的摘要功能使用與 PM 角色相同的模型

## 備註
- summarize_messages 中的 `self.llm.ainvoke(prompt)` 不需改動，只需改 constructor
- 需確認 graph.py 中建立 ContextManager 的位置也要跟著調整
