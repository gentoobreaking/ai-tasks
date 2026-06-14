---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/612
priority: P0
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-21
updated: 2026-05-21
howto: 
---

  1. 定義 TechSpec 結構化模型（stack, rationale, constraints, risks）
  2. 修改 architect_node.py 以結構化輸出 TechSpec 而非自由文字
  3. 新增 review_gate.py：審查節點檢查 TechSpec 完整性與限制違反
  4. 實作 ADR (Architecture Decision Record) 自動持久化至 docs/adr/
  5. 在 ProjectState 新增 tech_spec 與 adr_log 欄位
  6. Coder 的 system prompt 注入「已決策技術棧」，確保遵循
  7. 更新 config/agents.yaml 加入 ReviewGate 轉場規則

# T100 - TechSpec + ADR

## 目標
將 Architect 節點改造為結構化技術選型流程，產生 TechSpec 並自動記錄 ADR，確保 Coder 遵循技術決策。

## 驗收標準
- [x] Architect 產出結構化 TechSpec（stack, rationale, constraints, risks）
- [x] Review Gate 節點檢查 TechSpec 完整性
- [x] ADR 自動持久化至 docs/adr/ 目錄
- [x] Coder system prompt 注入已決策技術棧
- [x] state 支援 tech_spec 與 adr_log 欄位

## 備註
- TechChoice 包含 domain, options, selected, reason
- Risk 包含 description, mitigation, severity
- ADR 格式參考 docs/adr/2026-05-21-{title}.md

T100 — TechSpec + ADR 完成。以下是實作摘要：

### 修改/新增檔案

| 檔案 | 變更 |
|------|------|
| `engine/nodes/task_models.py` | 新增 `TechChoice`、`Risk`、`TechSpec`、`ADREntry` 模型 |
| `engine/nodes/architect_node.py` | 改寫為結構化輸出 `ArchitectOutput(TechSpec + message)` |
| `engine/nodes/review_gate.py` | **NEW** — 驗證 TechSpec 完整性 + 自動寫入 ADR 到 `docs/adr/` |
| `engine/graph.py` | `ProjectState` 新增 `tech_spec`/`adr_log`，註冊 ReviewGate node |
| `engine/core/supervisor.py` | `RouteDecision` 新增 `ReviewGate` |
| `engine/nodes/coder_node.py` | Coder system prompt 自動注入已決策技術棧 |
| `engine/nodes/__init__.py` | 匯出 `create_review_gate_node` |
| `config/agents.yaml` | 加入 `Architect→ReviewGate→Coder` 轉場規則 |

### 流程

```
Architect（產出 TechSpec）
  → ReviewGate（驗證完整性 + 寫 ADR 到 docs/adr/）
  → 通過 → Coder（prompt 注入已決策技術棧，必須遵循）
  → 不通過 → Architect（重新提交）
```

### 驗證結果
- TechSpec 模型建立與驗證 ✅
- ReviewGate 審查通過/不通過邏輯 ✅
- ADR 自動持久化到 `docs/adr/2026-05-21-{title}.md` ✅
- Supervisor 路由 ReviewGate 正確 ✅
- Coder 注入 TechSpec context ✅

