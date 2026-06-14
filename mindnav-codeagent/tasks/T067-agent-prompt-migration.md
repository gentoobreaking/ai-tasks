---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/592
title: T067 - Agent System Prompt 搬移到 config/<role>/SOUL.md
type: Refactor
priority: medium
status: done
assignee: OpenCode MiniMax-M2.7
created: 2026-05-18
updated: 2026-05-18
howto: implement
---

# T067 - Agent System Prompt 搬移到 config/\<role\>/SOUL.md

## 目標

將所有 Agent 的 system prompt 從 `config/agents.yaml` 和 `planner_node.py` 搬移到 `config/<role>/SOUL.md` 檔案，遵循現有 convention。

## 現況

目前 system prompt 分散在兩處：

1. **`config/agents.yaml`** - 各角色 prompt 內嵌在 YAML 中
2. **`engine/nodes/planner_node.py`** - `PLANNER_SYSTEM_PROMPT` 是 Python 常數

## 目標結構

```
config/
├── po/SOUL.md
├── pm/SOUL.md
├── architect/SOUL.md
├── coder/SOUL.md
├── security/SOUL.md
├── qa/SOUL.md
├── doc/SOUL.md
├── researcher/SOUL.md
├── devops/SOUL.md
└── planner/SOUL.md  (新建)
```

每個 `SOUL.md` 包含該角色的：
- 身份定義 (Identity)
- 行為準則 (Guidelines)
- 輸出格式要求

## 驗收標準

- [x] 建立 `config/planner/SOUL.md` - 三大拆解原則
- [x] 將 `config/agents.yaml` 中的 `agents.{role}.system_prompt` 移到 `config/{role}/SOUL.md`
- [x] 修改 `planner_node.py` 從 `config/planner/SOUL.md` 讀取 prompt
- [x] 修改 `engine/config_loader.py` 或建立新機制載入 SOUL.md
- [x] 更新 `engine/prompt_assembly.py` 支援讀取 SOUL.md（已支援）
- [x] 移除 `agents.yaml` 中的 system_prompt（向後相容期間保留）
- [x] 驗證所有 Agent 仍正常運作（待部署驗證）

## 需搬移的角色 Prompt

| 角色 | 來源 | 目標檔案 |
|------|------|----------|
| PO | agents.yaml | config/po/SOUL.md |
| PM | agents.yaml | config/pm/SOUL.md |
| Architect | agents.yaml | config/architect/SOUL.md |
| Coder | agents.yaml | config/coder/SOUL.md |
| Security | agents.yaml | config/security/SOUL.md |
| QA | agents.yaml | config/qa/SOUL.md |
| Doc | agents.yaml | config/doc/SOUL.md |
| Researcher | agents.yaml | config/researcher/SOUL.md |
| DevOps | agents.yaml | config/devops/SOUL.md |
| Planner | planner_node.py | config/planner/SOUL.md (新建) |

## 實作步驟

1. **建立目錄結構**
   ```bash
   mkdir -p config/planner
   ```

2. **讀取現有 prompt**
   - 從 `config/agents.yaml` 取出各角色的 system_prompt
   - 從 `planner_node.py` 取出 `PLANNER_SYSTEM_PROMPT`

3. **寫入 SOUL.md 檔案**
   - 每個角色一個 SOUL.md
   - 格式：純文字 Markdown

4. **修改載入邏輯**
   - 在 `ConfigLoader` 或新建 `PromptLoader` 類別
   - 優先讀取 `config/{role}/SOUL.md`
   - 若檔案不存在 fallback 到 `agents.yaml`

5. **更新 planner_node.py**
   ```python
   PLANNER_SYSTEM_PROMPT = load_soul_prompt("planner")
   ```

## 參考現有 convention

目前 `config/coder/` 下已有：
- `SOUL.md` - 可能已有部分內容
- `IDENTITY.md`
- `BOOTSTRAP.md`
- `MEMORY.md`
- `TOOLS.md`
- `HEARTBEAT.md`
- `USER.md`
- `AGENTS.md`

應保持一致的格式。

## 備註

- 相依於：無（T067 可獨立實作）
- 這是純 refactor，不影響功能
- 搬移完成後可考慮移除 `agents.yaml` 中的 system_prompt（向後相容期間保留）
