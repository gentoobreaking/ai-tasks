---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/756
title: LangChain Core Agent 整合
type: Feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-13
updated: 2026-05-13
depends: T012, T019
---

# T024 - LangChain Core Agent 整合

## 目標
將 langchain-core 整合進 JARVIS，支援本地模型的 Agent loop（ReAct）+ 時間注入 + 工具呼叫。

## 實作內容
- `brain/langchain_adapter.py` — MNN-LLM 包裝為 BaseChatModel + 自訂 ReAct agent loop
- 工具動態載入（auto_scan_and_load_skills + JSON config fallback）
- 時間注入（SystemMessage 帶入目前日期時間）
- 支援 tool_calls 與文字 Action Input 兩種格式
- Debug mode 開關（`~/.jarvis_config.json.debug`）

## 驗收標準
- [x] Qwen2.5-7B 可正確呼叫工具（web_search, query_stock_price 等）
- [x] Agent loop 正確攔截 Action + 執行工具 + 回寫 Observation
- [x] debug mode 輸出思考歷程到 log
- [x] 時間注入讓模型知道當前日期
