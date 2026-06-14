---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/510
title: T003 - 路由代理開發 (Router Agent)
type: Feature
priority: high
status: done
assignee: gemini-cli
created: 2026-05-15
updated: 2026-05-15
---

# T003 - 路由代理開發 (Router Agent)

## Description
開發具備結構化輸出（Structured Outputs）的 Router Agent，根據用戶問題自動判定檢索標籤與是否需要聯網。

## Acceptance Criteria
- [x] 定義 RouteDecision 結構（target_source: code, spec, live_log）。
- [x] 使用本地 LLM 實作路由邏輯，確保輸出絕對確定性（Temperature=0）。
- [x] 測試 Router 能正確引導問題至對應的知識庫標籤。

## Notes
- 路由代理使用 `ChatOllama` 的 `with_structured_output` 實作。
- 已優化 System Prompt 以確保 `live_log` 路由的準確性。
- 測試覆蓋了 code, spec, live_log, web_search, general 五種情境。
