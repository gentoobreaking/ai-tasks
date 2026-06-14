---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/613
priority: P1
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-21
updated: 2026-05-21
howto: 
---

  1. 在 SubTask 模型新增 complexity（low/medium/high）與 priority（P0/P1/P2/P3）欄位
  2. 修改 Planner node 要求 LLM 在拆解時評估每項的 complexity 與 priority
  3. 修改 task_executor.py 的 get_runnable_tasks() 加入排序邏輯：
     - 先按 complexity 排序（簡單→中等→困難）
     - 同層級內按 priority 排序（P0→P1→P2→P3）
  4. 更新 config/planner/SOUL.md 提示 LLM 評估難度
  5. 更新測試驗證排序結果

# T101 - Easy-First Task Sort

## 目標
將任務執行動態排序為易至難（easy-first），先完成簡單任務建立信心，再處理複雜邏輯。

## 驗收標準
- [x] SubTask 新增 complexity 與 priority 欄位
- [x] Planner 產出時 LLM 自動評估難度與優先級
- [x] get_runnable_tasks() 依 complexity + priority 排序
- [x] 不影響 DAG 依賴正確性（仍保持 depends_on 先決條件）

## 備註
- complexity 值：low, medium, high
- priority 值：P0, P1, P2, P3
- 同 dependency 層級的任務才互相比較排序

## T101 完成。修改 3 個檔案：

| 檔案 | 變更 |
|------|------|
| `engine/nodes/task_models.py` | `SubTask` 新增 `complexity`(low/medium/high) 與 `priority`(P0-P3) 欄位 |
| `config/planner/SOUL.md` | 提示 LLM 在拆解時評估每項任務的複雜度與優先級 |
| `engine/skills/task_executor.py` | `get_runnable_tasks()` 依 complexity→priority 排序（易至難） |

排序驗證結果：
- low→P0 → low→P1 → low→P2 → medium→P0 → medium→P3 → high→P0 ✅
- 已完成任務正確排除 ✅
- DAG 依賴先決條件仍然優先於排序 ✅
- 舊任務無 complexity/priority 時預設 medium/P2 ✅

