---
status: blocked
priority: high
assignee: OpenCode
created: 2026-08-03
updated: '2026-08-04'
fail_count: 2
summary: 連續失敗 3 次（應用 diff 失敗），標記為 blocked 待人工處理
---
# T008: 新增 agent_registry.yaml + agent_registry.py 動態路由

## 背景
現有 4 Sub-Agent 扁平化星型結構，**缺乏橫向協作與動態路由機制**（v3 討論 2.1, DEC-08, SPEC-14）。

## 需求
1. 新增 `.opencode/agent_registry.yaml`：
   - Agent 定義：id, role, capabilities[], model, version
   - Routing rules：條件 → delegate_to agent
2. 新增 `agent_registry.py`：
   - 載入 YAML，提供 `route(task_tags) -> agent_id`
   - CLI `twin route --task-id TASK-123 --auto` 自動委派並回寫 `tasks/TASK-123/routing.json`
3. 整合到 `my-clone.md` SOP 4.1：收到任務時自動查 Registry 決定委派對象

## 驗收標準
- `twin route --task-id T002 --auto` 自動委派正確 agent
- `my-clone.md` 內 SOP 引用 Registry 進行委派
- 未來新增 Agent 僅需修改 YAML，無需改 code

## 參考
- v3 討論 DEC-08 / SPEC-14 / DeepSeek 第 2 輪建議 2.9