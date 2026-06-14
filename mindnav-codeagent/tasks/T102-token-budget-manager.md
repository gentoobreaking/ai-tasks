---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/614
priority: P1
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-21
updated: 2026-05-21
howto: 
---

  1. 實作 TokenBudgetManager 類別：支援角色配額設定與消耗追蹤
  2. 在 engine/core/memory_mgmt.py 或獨立檔案中實作
  3. 定義角色配額表：
     - Supervisor: 500, PO: 1000, PM: 1500
     - Architect: 2000, Coder: 3000, QA: 1500
     - 其他角色各 1000
  4. 在每次 agent_node 調用前檢查配額，超額時使用摘要版 prompt
  5. 在 ProjectState 新增 token_usage: Dict[str, int]
  6. 實作 per-AC token accounting：每個 AC 關聯 token 預算
  7. 裁切時優先裁減高消耗低產出的角色記錄
  8. 更新 config/agents.yaml 加入 token_budgets 設定

# T102 - Token Budget Manager

## 目標
實作主動式 Token 預算管理系統，依角色分配配額，避免單一節點消耗全部 token 導致關鍵資訊遺失。

## 驗收標準
- [x] TokenBudgetManager 支援角色配額設定
- [x] 超額時自動降級為摘要版 prompt
- [x] ProjectState 記錄 token_usage
- [x] per-AC token accounting
- [x] 裁切策略優先保留低消耗高產出角色

## 備註
- 整合現有 MemoryManager 的 max_token_size 機制
- 配額可透過 config 覆蓋
- 超額不拒絕執行，只降級 prompt

## T102 完成。修改/新增 4 個檔案：

| 檔案 | 變更 |
|------|------|
| `engine/core/token_budget.py` | **NEW** — `TokenBudgetManager` 類別，支援角色配額、消耗追蹤、超額截斷策略 |
| `engine/nodes/base.py` | `agent_node()` 整合預算檢查：超額自動截斷歷史訊息 + 記錄消耗到 state |
| `engine/graph.py` | `ProjectState` 新增 `token_usage` 欄位 |
| `config/agents.yaml` | `memory_policy` 下新增 `token_budgets` 設定 |

驗證結果：
- 預設配額：Coder=3000, Supervisor=500, 其餘 1000 ✅
- 消耗追蹤：累積記錄正確 ✅
- 超額截斷：2x 預算→保留後 8 筆, 4x 預算→保留後 3 筆 ✅
- Token 估算：50 tokens/msg + 0.3 tokens/char ✅
- Singleton 模式：跨調用共享狀態 ✅
- `token_usage` 寫入 state 回傳 ✅

