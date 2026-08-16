---
status: done
spec_version: v3
commit: a1c28f0
depends_on:
- T003
priority: high
assignee: OpenCode
created: 2026-08-03
updated: '2026-08-07'
commit: e832edf
fail_count: 2
summary: 連續失敗 3 次（應用 diff 失敗），標記為 blocked 待人工處理
blocked_review: tasks/blocked-review/T008-review.md
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
- [x] `twin route --task-id T002 --auto` 自動委派正確 agent（測試通過 + 真實 T002/ T004/ T009 端到端）
- [x] `my-clone.md` 內 SOP 4.1 引用 Registry 進行委派（步驟 3 新增）
- [x] 未來新增 Agent 僅需修改 YAML，無需改 code（Registry.route() 純資料驅動，agents/rules 皆在 YAML）

## 參考
- v3 討論 DEC-08 / SPEC-14 / DeepSeek 第 2 輪建議 2.9
- 摘要：`2026-08-06-T008-summary.md`

## 執行記錄
- 新增 `.opencode/agent_registry.yaml`（4 agents + 4 routing rules）
- 新增 `agent_registry.py`（Registry 類、extract_tags、find_task_file、CLI route/list）
- 修改 `twin` CLI：新增 `route` 子命令（呼叫 agent_registry.py route）
- 修改 `.opencode/agents/my-clone.md`：SOP 4.1 步驟 3 整合 Registry
- `pytest tests/test_agent_registry.py -q` 10 passed；全測試 43 passed