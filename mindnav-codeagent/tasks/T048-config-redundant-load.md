---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/552
title: T048 - Config 重複讀取優化
type: Refactor
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash Free
created: 2026-05-16
updated: 2026-05-16
howto: refactor
---

# T048 - Config 重複讀取優化

## 目標
目前 `build_project_graph()` 內部及每個節點函數內部都各自呼叫 `ConfigLoader.get_agent_config()`，同一次工作流可能執行數十次 YAML 解析。ConfigLoader 雖然有 cache，但每次函數調用仍然走 dict lookup。

## 驗收標準
- [x] `build_project_graph()` 在圖建構時一次讀取所有 config（`full_config = ConfigLoader.load_config()`），並透過 closure 傳遞給節點函數
- [x] 所有節點函數不再內部呼叫 `ConfigLoader.get_agent_config()`（pm_node 的 git_audit_policy 也由外部傳入）
- [x] Supervisor 接受外部傳入的 `workflow_config` 與 `route_opt`，避免內部重讀
- [x] `agent_node()` helper 接收 `cfg` 參數，而非每次重新讀取
- [x] 單次工作流中 `ConfigLoader.load_config()` 呼叫次數降至 1 次

## 備註
- researcher_node_func、devops_node_func、qa_node_func 是主要違規者
- LLMFactory.get_llm() 也應快取其 config 查詢結果
