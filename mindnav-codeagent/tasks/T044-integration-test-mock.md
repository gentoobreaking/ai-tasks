---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/548
title: T044 - Integration Test Mock 補全
type: Feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash Free
created: 2026-05-16
updated: 2026-05-16
howto: implement
---

# T044 - Integration Test Mock 補全

## 目標
`engine/tests/integration_test.py` 的 `test_full_flow()` 直接呼叫真實 `build_project_graph().stream()`，依賴真實 Redis 與 LLM，CI 環境無法執行。需建立 mock 版本的測試圖。

## 驗收標準
- [x] 建立 `engine/tests/mock_graph.py`，回傳固定的 mock LLM 回應
- [x] 建立 `build_test_graph()` 僅註冊必要節點（PM + Coder），跳過 RedisSaver（改用 MemorySaver）
- [x] `test_full_flow()` 使用 mock graph 而非 production graph
- [x] `test_node_routing()` 僅 1-route 節點走真實 Supervisor，multi-route 節點 mock structured_llm
- [x] `test_context_pruning()` 使用 mock LLM 避免真實模型連線
- [x] CI 環境可執行所有整合測試且不需 Redis 與 LLM

## 備註
- mock LLM 可用 `MagicMock(spec=BaseLLM)` + `return_value=AIMessage(content="mock response")`
- RedisSaver 可用 `MemorySaver` 替代以移除 Redis 依賴
