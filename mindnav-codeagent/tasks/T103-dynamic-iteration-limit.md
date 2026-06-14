---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/615
priority: P2
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-21
updated: 2026-05-21
howto: 
---

  1. 在工作流程 config 加入 max_iterations_per_task 設定
  2. 在 supervisor.py 計算動態迭代上限：
     - 根據 task_plan 的任務數量與複雜度估算
     - 公式：max(8, num_tasks * 2, sum(complexity_weight))
     - complexity_weight: low=1, medium=2, high=3
  3. PM 可申請延長迭代上限（需 Supervisor 核准）
  4. 上限寫入 ProjectState.max_iterations 欄位
  5. 取代硬編碼的 8 次限制
  6. 更新測試驗證動態計算結果

# T103 - Dynamic Iteration Limit

## 目標
根據任務複雜度動態計算迭代上限，取代現有硬編碼的 8 次限制，避免大型任務被提前截斷。

## 驗收標準
- [ ] 迭代上限根據任務數量與複雜度動態計算
- [ ] 不再使用硬編碼 8 次上限
- [ ] PM 可申請延長上限（需 Supervisor 核准）
- [ ] ProjectState 記錄 max_iterations
- [ ] 回歸測試確保現有行為不受影響

## 備註
- 預設公式：max(8, num_tasks * 2, total_complexity_weight)
- 延長申請透過 PM 節點在 message 中加入 EXTEND_ITERATION 標記
- Supervisor 核准後更新 max_iterations

## T103 完成。修改 4 個檔案：

| 檔案 | 變更 |
|------|------|
| `engine/graph.py` | `ProjectState` 新增 `max_iterations` |
| `engine/nodes/planner_node.py` | 新增 `compute_max_iterations()` 公式 `max(8, num*2, sum(complexity_weight))`，分解時回傳至 state |
| `engine/core/supervisor.py` | 改用動態 `max_iterations`，新增 `EXTEND_ITERATION` 支援（PM 可申請延長 50%） |
| `engine/nodes/pm_node.py` | 改用 `max_iterations` 取代硬編碼 8 |

動態計算驗證：
- 空任務 → 8 ✅
- 5 個 high 任務 → 15 ✅  
- 混合 3 low + 2 medium → 10 ✅
- EXTEND_ITERATION: 10 → 15 ✅

