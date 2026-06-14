---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/631
type: Bug
priority: P0
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-21
updated: 2026-05-21
howto: 
---

  1. 修復 engine/graph.py:223
     - _route_after_dag 改為 _dag_router（已存在的正確函數）
     - 或刪除閉包中的重複路由邏輯，直接使用 _dag_router
  2. 修復 DAG 循環偵測 bug（engine/skills/task_executor.py:36-54）
     - has_cycle 閉包應使用 task.depends_on 而非外層 task
     - path 變數不應跨 task 共用
  3. 補 redisvl 到 requirements-worker.txt
     - 添加 redisvl 版本鎖定
     - 確認 graph.py 中 Redis 路徑正確 import

# T116 - 修復 _route_after_dag NameError + 補 redisvl 依賴

## 目標
修復執行時期 NameError（`_route_after_dag` 不存在）與 DAG 循環偵測邏輯錯誤，補上缺失的 redisvl 依賴。

## 驗收標準
- [ ] graph.py:223 改為呼叫 `_dag_router`（正確的函數名稱）
- [ ] DAG 循環偵測 `has_cycle` 正確使用當前 task 的 depends_on
- [ ] `path` 變數在每個 task 檢查時獨立重置
- [ ] redisvl 已加入 requirements-worker.txt
- [ ] use_dynamic_tasks=True 時不會噴 NameError

## 備註
- 這兩個 bug 在 use_dynamic_tasks=True 時會直接 crash
- DAG 循環 bug 是 scope closure 經典錯誤
