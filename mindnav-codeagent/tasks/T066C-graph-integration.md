---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/591
title: T066C - 向後相容整合：Graph 整合與 Hybrid 模式
type: Feature
priority: high
status: done
assignee: OpenCode MiniMax-M2.7
created: 2026-05-18
updated: 2026-05-18
howto: implement
parent: T066
---

# T066C - 向後相容整合：Graph 整合與 Hybrid 模式

## 目標

將 T066A (Planner) 和 T066B (TaskExecutor) 整合進 `graph.py`，並保持向後相容（簡單任務仍走原有 linear pipeline）。

## 承接 T066A + T066B

T066A 產出：
- `planner_node.py` - 結構化任務拆解
- `route: "linear" | "dynamic"`

T066B 產出：
- `task_executor.py` - 通用 Worker 執行器
- ProjectState 擴展欄位
- Supervisor DAG 執行邏輯

## 驗收標準

- [x] 修改 `engine/graph.py`：
  - 新增 `planner` 節點作為 entry point
  - 整合 `Send` 機制的 conditional edges
  - Planner 完成後根據 `route` 判斷：
    - `linear`: 走原有 PO → PM → ... 流程
    - `dynamic`: 進入 DAG 執行模式

- [x] Hybrid 模式實現：
  - 簡單任務（`route: "linear"`）直接進入現有 pipeline
  - 複雜任務（`route: "dynamic"`）進入 planner → task_executor 流程
  - 任務複雜度由 Planner 自行判斷

- [x] 整合測試：
  - 驗證 linear 模式與現有流程相同 ✅
  - 驗證 dynamic 模式正確執行 DAG ✅
  - 驗證 hybrid 路由正確 ✅

- [x] 文件更新：
  - config/agents.yaml 不需修改（planner 使用 pm model）✅

## 實作細節 (2026-05-18)

### 修改的檔案

| 檔案 | 說明 |
|------|------|
| `engine/graph.py` | 重構，新增 planner node、DAG routing、新增 route/task_plan 欄位 |
| `tests/test_graph_integration.py` | 整合測試（15 tests, 14 passed, 1 skipped）|

### 新增流程

```
User Input
    ↓
[planner]  (entry point when use_dynamic_tasks=True)
    ↓
┌─────────────────────────────────────┐
│  route = "linear"  │  route = "dynamic" │
↓                    ↓                    ↓
Supervisor       execute_dag → [Send fan-out]
    ↓                    ↓
原有流程...          task_executor (xN)
                          ↓
                      execute_dag (loop)
```

### 新增程式碼

#### _route_after_planner
```python
def _route_after_planner(state: ProjectState) -> Literal["Supervisor", "execute_dag"]:
    if state.get("route") == "linear":
        return "Supervisor"
    return "execute_dag"
```

#### _dag_router
```python
def _dag_router(state: ProjectState) -> Literal[str, list, "END"]:
    task_plan = state.get("task_plan")
    if not task_plan:
        return END

    # Validate DAG (circular dependency check)
    if not validate_dag(task_plan)[0]:
        return END

    # Get runnable tasks (dependencies satisfied)
    pending = get_runnable_tasks(task_plan, state.get("completed_task_ids", []))

    if not pending:
        return END

    if len(pending) > 1:
        return [Send("task_executor", {"task": t}) for t in pending]
    return "task_executor"
```

### Hybrid 模式切換

```python
def build_project_graph(use_redis=False, for_worker=False, use_dynamic_tasks=True):
    if use_dynamic_tasks:
        builder.set_entry_point("planner")
        # ... add planner and task_executor nodes
    else:
        builder.set_entry_point("Supervisor")
        # original flow
```

### 回歸相容

- 預設 `use_dynamic_tasks=True`，複雜任務進入 DAG 執行
- 設定 `use_dynamic_tasks=False` 可回歸原有 Supervisor 流程
- 向後相容：planner 偵測到簡單任務會直接回傳 `route: "linear"`，交由原有流程處理

## 備註

- ✅ 2026-05-18 完成實作
- 15 個整合測試通過（1 因 Redis 不可用跳過）
- T066A + T066B + T066C 完整整合，動態任務拆解與平行執行機制完成

## Reference

- [LangGraph Conditional Edges](https://langchain-ai.github.io/langgraph/concepts/conditional_edges/)
- [LangGraph Send API](https://langchain-ai.github.io/langgraph/concepts/send/)
