---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/536
title: T032 - Supervisor 路由與圖拓撲驗證測試
type: Feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash Free
created: 2026-05-16
updated: 2026-05-16
howto: implement
---

# T032 - Supervisor 路由與圖拓撲驗證測試

## 目標
T029 已修復 `engine/graph.py` 的 `qa_node_func`、`Supervisor` import、條件邊路由等 Bug。需建立對應測試確保：

1. 所有節點（PM/Coder/Doc/Researcher/QA/DevOps）皆可被 Supervisor 路由到達
2. Supervisor 路由決策符合 `config/agents.yaml` 的 `transitions` 規則
3. 非法路由（不允許的轉換）被正確攔截並強制重定向

## 驗收標準
- [x] 建立 `tests/test_supervisor_routing.py`
- [x] 測試每個 Agent 節點的可達性與正確 sender 標記
- [x] 測試 Supervisor 路由限制：例如 DevOps → Coder 應被拒絕
- [x] 測試 T029 修復後所有節點不會拋出 NameError 或 ImportError
- [x] 測試 `iteration_count` 在每次節點調用後正確遞增

## 備註
- 使用 Mock LLM 避免實際調用推理
- 測試 Supervisor 邏輯而不啟動完整 LangGraph 圖
