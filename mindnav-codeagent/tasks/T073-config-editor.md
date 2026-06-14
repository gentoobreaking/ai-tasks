---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/563
title: Config Editor
type: Feature
priority: medium
assignee: OpenCode DeepSeek V4 Flash
status: done
created: 2026-05-18
updated: 2026-05-21
howto: null
---

# T073 - Config Editor

## 目標
在 Dashboard 中實現基於表單的 YAML 設定編輯器，取代直接編輯 YAML 檔案的方式。

## 驗收標準
- [x] 自動從 `DEFAULT_CONFIG` 發現所有設定欄位（靜態 schema 映射到 agents.yaml）
- [x] 分 tab 組織（model / agents / workflow / rag / skills / memory / system）
- [x] 根據類型渲染正確的輸入元件：
  - [x] 布林值 → toggle switch
  - [x] 字串 → text input
  - [x] 數字 → number input
  - [x] 列表 → 可增刪的 list editor
  - [x] 嵌套 dict → 可展開的 key-value editor
  - [x] agents → 專用 agent editor（model + authorized_skills）
- [x] Save 按鈕寫入 `config/agents.yaml`
- [x] Reset to defaults 按鈕（備份原檔後清空）
- [x] Export as JSON
- [x] Import from JSON

## 已實作功能

### Backend (`router_v1.py`)
- `GET /api/v1/config` — 取得 config + schema + tabs（支援 `?tab=` 過濾）
- `GET /api/v1/config/schema` — 取得完整 schema
- `PUT /api/v1/config` — 部分更新（deep merge）並寫入 YAML
- `POST /api/v1/config/reset` — 重置（備份原檔為 `.yaml.bak`）
- `GET /api/v1/config/export` — 匯出為 JSON
- `POST /api/v1/config/import` — 從 JSON import 並寫入 YAML

### Frontend (`ConfigPage.tsx`)
- 7 個 tab：Model / Agents / Workflow / RAG / Skills / Memory / System
- 動態表單渲染：dict（可展開）/ list（可增刪）/ agents（專用編輯器）/ bool（toggle）/ string / number
- 儲存 / 重置 / Export JSON / Import JSON 按鈕
- 訊息提示（成功/錯誤）
- Layout nav 加「⚙️ Config」tab

### Config Schema
| Tab | 欄位 |
|-----|------|
| Model | providers, fallback (list) |
| Agents | agents（各角色 model + authorized_skills） |
| Workflow | supervisor_workflow, route_optimization, node_rules |
| RAG | rag_config |
| Skills | auto_skill_extraction, skill_matching, skills_guard, skill_optimization, skill_sharing, skill_regression |
| Memory | memory_policy, prompt_layering |
| System | user_feedback, maintenance_cron, git_audit_policy |

## 備註
- 改動 `config/agents.yaml` 後，需重啟 engine/frontend 服務讓 `ConfigLoader` cache 失效
- Import JSON 時直接覆寫檔案（不做深層 validation）
- Reset 會自動備份至 `agents.yaml.bak`
