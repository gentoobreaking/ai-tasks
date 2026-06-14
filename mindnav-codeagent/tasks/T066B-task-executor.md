---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/590
title: T066B - 任務圖執行器：DAG 執行與 Send Fan-out
type: Feature
priority: high
status: done
assignee: OpenCode MiniMax-M2.7
created: 2026-05-18
updated: 2026-05-18
howto: implement
parent: T066
---

# T066B - 任務圖執行器：DAG 執行與 Send Fan-out

## 目標

建立 Task Executor 與 Supervisor DAG 執行邏輯，實現基於 `depends_on` 的平行派發。

## 承接 T066A

T066A 產出的 `TaskPlan` 包含：
- `tasks: List[SubTask]` - 拆解後的子任務列表
- `thought_process` - 拆解思考邏輯

T066B 提供：
- ProjectState 欄位擴展
- TaskExecutor 元件
- DAG 驗證與執行輔助函數

## ProjectState 擴展

```python
class ProjectState(TypedDict):
    # ... 原有欄位 ...

    # T066B 新增欄位
    task_results: Dict[str, Any]      # task_id → 執行結果
    completed_task_ids: List[str]     # 已完成的 task_id 列表
    pending_dependencies: Dict[str, List[str]]  # task_id → 依賴它的 tasks
```

## 驗收標準

- [x] 修改 `engine/graph.py` ProjectState：
  - 新增 `task_results: dict`
  - 新增 `completed_task_ids: list`
  - 新增 `pending_dependencies: dict`

- [x] 修改 `interface/tg_bot.py` initial_state：
  - 新增上述三欄位的初始值

- [x] 新增 `engine/skills/task_executor.py`：
  - `validate_dag()` - DAG 無循環依賴驗證
  - `build_pending_dependencies()` - 建構依賴圖
  - `get_runnable_tasks()` - 取得可執行的任務
  - `should_parallel_execute()` - Send fan-out 路由
  - `task_executor_node()` - 任務執行節點
  - 根據 `worker_type` 分派給對應 Agent (coder, researcher, qa, devops, doc, security)

- [ ] 修改 `engine/nodes/supervisor_node.py`：
  - **已移至 T066C**（需與 graph.py 整合後實作）

- [x] DAG 驗證：
  - 確保無循環依賴 ✅
  - `pending_dependencies` 正確維護 ✅
  - `completed_task_ids` 正確更新 ✅

- [x] 單元測試：
  - DAG 無循環依賴檢查 ✅ (6 tests)
  - Send fan-out 邏輯驗證 ✅ (4 tests)
  - task_executor 分派邏輯驗證 ✅ (8 tests)

## 實作細節 (2026-05-18)

### 新增/修改檔案

| 檔案 | 說明 |
|------|------|
| `engine/graph.py` | ProjectState 擴展，新增 task_results 等三欄位 |
| `interface/tg_bot.py` | initial_state 新增三欄位初始值 |
| `engine/skills/task_executor.py` | TaskExecutor + DAG 輔助函數 |
| `tests/test_task_executor.py` | 單元測試（18 tests, 全部通過）|

### task_executor.py 提供的函數

| 函數 | 說明 |
|------|------|
| `validate_dag(task_plan)` | 驗證無循環依賴，回傳 (bool, str) |
| `build_pending_dependencies(task_plan)` | 建構 task_id → [依賴它的tasks] map |
| `get_runnable_tasks(task_plan, completed_ids)` | 取得可執行的任務（無依賴或依賴已完成）|
| `should_parallel_execute(task_plan)` | 返回 Send fan-out router 函數 |
| `task_executor_node(state, task)` | 執行單一 SubTask，回傳結果 |

### validate_dag 邏輯

- 檢查重複 task_id
- 檢查未知依賴
- DFS 檢測循環依賴

### DAG 驗證結果

| 測試案例 | 結果 |
|---------|------|
| 線性 DAG (task_01 → task_02) | ✅ |
| 並行 DAG (task_01, task_02 → task_03) | ✅ |
| 循環依賴 (A→B→A) | ✅ 正確拒絕 |
| 未知依賴 | ✅ 正確拒絕 |
| 複雜 DAG (root→a,b→c) | ✅ |

### 備註

- ✅ 2026-05-18 完成實作
- Supervisor_node 的 Send fan-out 整合將在 T066C 中實作
- 18 個單元測試全部通過
- T066B 產出可被 T066C 直接使用
