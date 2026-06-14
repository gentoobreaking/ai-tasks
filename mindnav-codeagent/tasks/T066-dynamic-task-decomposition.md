---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/588
title: T066 - 動態任務拆解與平行執行機制
type: Feature
priority: high
status: done
assignee: OpenCode MiniMax-M2.7
created: 2026-05-18
updated: 2026-05-18
howto: implement
---

# T066 - 動態任務拆解與平行執行機制

## 目標

導入基於 Pydantic 結構化輸出的任務拆解引擎，讓 Supervisor 能將複雜任務動態拆解成 DAG 任務圖，並透過 LangGraph Send 機制實現真正的平行執行。

## 背景

目前 mindnav-codeagent 的 workflow 是**靜態線性 pipeline**：
```
PO → PM → Architect → Coder → Security → QA → DevOps → Doc
```

每個節點嚴格依序執行，無法：
- 識別可平行執行的子任務
- 動態調整任務顆粒度
- 高效利用閒置的 Agent 資源

需要升級為**動態 DAG 執行**。

## 三大拆解原則

1. **單一職責與上下文隔離** - 每個 SubTask 目標必須極其單一，input_data 只給必要資訊
2. **正交平行化** - `depends_on: []` 的任務同時執行，利用 LangGraph Send fan-out
3. **依賴關係顯式化** - DAG 有向無環圖，明確宣告 `depends_on`

## 子任務拆分

| 任務 | 內容 | 依賴 |
|------|------|------|
| **T066A** | Planner Node + Pydantic Models + 系統提示詞 + 單元測試 | 無 |
| **T066B** | ProjectState 擴展 + task_executor.py + Supervisor Send fan-out + DAG 驗證 | T066A |
| **T066C** | graph.py 整合 + Hybrid 模式 + 向後相容 + 整合測試 | T066A + T066B |

## 驗收標準（宏觀）

- [x] T066A: Planner Node 可正確輸出 TaskPlan 結構
- [x] T066B: TaskExecutor 可根據 worker_type 分派並執行
- [x] T066C: Hybrid 模式正常運作，linear/dynamic 路由正確
- [x] 向後相容：原有 linear pipeline 不受影響
- [x] 整合測試通過

## 參考文獻

- [LangGraph Send API](https://langchain-ai.github.io/langgraph/concepts/send/)
- [LangGraph .with_structured_output()](https://python.langchain.com/docs/how_to/structured_output/)
- [Orchestrator-Worker Workflows](https://medium.com/@email2argha/ delegate-parallelize-synthesize-building-orchestrator-worker-workflows-with-langgraph)
