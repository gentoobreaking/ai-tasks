---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/589
title: T066A - 任務拆解引擎：Planner Node 與 Pydantic 模型
type: Feature
priority: high
status: done
assignee: OpenCode MiniMax-M2.7
created: 2026-05-18
updated: 2026-05-18
howto: implement
parent: T066
---

# T066A - 任務拆解引擎：Planner Node 與 Pydantic 模型

## 目標

建立 Pydantic 結構化輸出模型與 Planner Node，實現 LLM 任務拆解能力。

## 三大拆解原則

### 1. 單一職責與上下文隔離（Context Isolation）
- 每個 SubTask 目標必須極其單一
- `input_data` 只包含任務**絕對需要**的資訊，不傳遞多餘上下文

### 2. 正交平行化（Orthogonal Parallelization）
- 無依賴關係的任務（`depends_on: []`）必須同時執行
- 利用 LangGraph 的 `Send` 機制 fan-out 多 Worker 並行

### 3. 依賴關係顯式化（Explicit Dependency）
- 明確宣告 `depends_on` 欄位
- 構成 DAG（有向無環圖），杜絕循環依賴

## 驗收標準

- [x] 新增 `engine/nodes/planner_node.py`：
  - 使用 `LLMFactory.get_llm(role="pm").with_structured_output(TaskPlan)`
  - 接收 user task，輸出結構化任務圖

- [x] Planner 系統提示詞灌輸三大拆解原則

- [x] 任務複雜度判斷邏輯：
  - 簡單任務直接返回 `route: "linear"`
  - 複雜任務返回 `route: "dynamic"` + `task_plan: TaskPlan`

- [x] 單元測試：
  - TaskPlan 結構驗證
  - planner_node 輸出格式檢查
  - 三大原則約束驗證

## 實作細節 (2026-05-18)

### 新增檔案

| 檔案 | 說明 |
|------|------|
| `engine/nodes/task_models.py` | Pydantic 模型：SubTask, TaskPlan |
| `engine/nodes/planner_node.py` | Planner Node + needs_decomposition() |
| `tests/test_planner_node.py` | 單元測試（16 tests, 全部通過）|

### task_models.py 結構

```python
class SubTask(BaseModel):
    task_id: str
    worker_type: str  # coder, researcher, qa, devops, doc, security
    objective: str
    input_data: str   # 最小上下文
    depends_on: List[str] = []

class TaskPlan(BaseModel):
    thought_process: str
    tasks: List[SubTask]
```

### needs_decomposition() 邏輯

- 檢測關鍵詞：`同時|平行|研究|分析|實作|開發|爬蟲|compare` 等 → 需要拆解
- 過濾簡單問句：`問|what|how|why|解釋|說明|什麼是|幫我查|幫我看` 等 → 簡單任務
- 長任務（>150 字）→ 需要拆解

### 複雜度判斷

| 輸入 | 輸出 |
|------|------|
| "你好" | `route: "linear"` |
| "幫我查 Python" | `route: "linear"` |
| "幫我研究 LangGraph 的架構" | `route: "dynamic", task_plan` |
| "同時爬取 A、B、C 三個網站的資料" | `route: "dynamic", task_plan` |
| "請幫我實作一個電商系統..." (>150字) | `route: "dynamic", task_plan` |

### 輸出格式

```python
{
    "route": "linear" | "dynamic",
    "task_plan": TaskPlan | None
}
```

## 備註

- ✅ 2026-05-18 完成實作
- 16 個單元測試全部通過
- T066A 可獨立交付，T066B 可立即使用
