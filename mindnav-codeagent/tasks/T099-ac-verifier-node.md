---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/616
priority: P0
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-21
updated: 2026-05-21
howto: 
---

  1. 在 engine/nodes/task_models.py 新增 ACItem 模型、ac_ids 欄位至 SubTask、ac_items 欄位至 TaskPlan
  2. 新增 engine/nodes/verifier_node.py：LLM-based AC 驗證節點，使用 VerificationReport 結構化輸出
  3. 在 engine/graph.py 擴充 ProjectState（ac_items, verified_acs）、註冊 Verifier node、加 Verifier→Supervisor edge
  4. 在 engine/core/supervisor.py 加入 AC 驗證閘門：攔截 END/FINISHED 路由至 Verifier，避免無限循環
  5. 更新 engine/nodes/planner_node.py 在分解任務時提取 AC items
  6. 更新 engine/nodes/__init__.py 匯出 create_verifier_node
  7. 更新 config/agents.yaml 加入 Verifier 轉場規則
  8. 更新 config/planner/SOUL.md 提示 LLM 提取 AC

# T099 - AC Verifier Node

## 目標
實作結構化 AC (Acceptance Criteria) 驗證流程，防止 PM 在需求未全部覆蓋時提前結案。

## 驗收標準
- [x] ACItem 模型支援 id, description, source, priority 欄位
- [x] SubTask 可關聯多個 AC（透過 ac_ids 欄位）
- [x] Verifier node 使用 LLM 比對 task_results 判定 covered/missing/partial
- [x] Supervisor 攔截 FINISHED 訊號，AC 未驗證時強制路由 Verifier
- [x] Verifier 發現 missing 時路由 PM 安排補救
- [x] 避免 Verifier → Supervisor → Verifier 無限循環
- [x] Planner 分解任務時自動提取 AC items
- [x] Supervisor 全路徑（FINISHED, 迭代上限, LLM 決策）都受 AC gate 保護

## 備註
- Verifier 使用 pm role 的 LLM 進行驗證
- verified_acs 為 Dict[str, str]，key 為 ac_id
- 無 AC 項目時不阻擋正常流程
