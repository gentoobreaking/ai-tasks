---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/533
title: T029 - Graph.py 與 Import 路徑缺陷修復
type: Feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash Free
created: 2026-05-16
updated: 2026-05-16
howto: fix
---

# T029 - Graph.py 與 Import 路徑缺陷修復

## 目標
Review 發現 `engine/graph.py` 與 `interface/git_review_api.py` 存在多處程式碼缺陷，導致系統無法正常運行。

## 驗收標準
- [x] `engine/graph.py` 新增 `qa_node_func`：QA 節點未定義，導致 RuntimeError（原先 Missing function）
- [x] `engine/graph.py` 新增 `Supervisor` import：缺少 `from engine.core.supervisor import Supervisor`
- [x] `engine/graph.py` 修正 import 路徑：`from engine.core.llm_factory` → `from engine.llm_factory`，`from engine.core.config_loader` → `from engine.config_loader`
- [x] `engine/graph.py` 補全 Supervisor 條件邊：原先只 map `PM/Coder/Doc`，缺少 `Researcher/QA/DevOps/END` 導致路由錯誤
- [x] `interface/git_review_api.py` 修正 import：`from src.core.llm_factory` → `from engine.llm_factory`

## 備註
- QA 節點功能設計：從 `ConfigLoader.get_agent_config("qa")` 讀取設定，調用 `LLMFactory.get_llm(role="qa")`
- 緩解 Git Review API 對 `langchain_ollama` 的殘留依賴
