---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/512
title: T005 - 聯網檢索工具整合 (Tavily)
type: Feature
priority: medium
status: done
assignee: gemini-cli
created: 2026-05-15
updated: 2026-05-15
---

# T005 - 聯網檢索工具整合 (Tavily)

## Description
整合 Tavily Search API，讓 Agent 具備搜尋外部開源範本與 API 文件的能力。

## Acceptance Criteria
- [x] 封裝 search_web_templates 工具。
- [x] 讓 Coder 節點能根據 Router 建議調用聯網工具。
- [x] 驗證搜尋結果能正確注入 Agent 上下文。

## Notes
- 實作於 `src/tools/web_search.py`。
- 整合進 `src/core/graph.py` 中的 Coder 節點。
- 支援 API Key 缺失時的 Mock 模式。
