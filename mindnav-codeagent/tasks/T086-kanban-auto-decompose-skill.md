---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/576
title: kanban-auto-decompose Skill
type: Feature
priority: high
assignee: OpenCode DeepSeek V4 Flash
status: done
created: 2026-05-18
updated: 2026-05-18
howto: null
---

# T086 - kanban-auto-decompose Skill

## 目標
實現 LLM 驅動的任務自動分解功能，讓用戶祇需輸入粗糙的想法，系統自動生成詳細的任務圖。

## 驗收標準
- [x] 建立 `skills/auto/kanban-auto-decompose.md`
- [x] 分解 prompt：
  - [x] 讀取 triage task 的粗糙想法
  - [x] 查看已安裝的 profiles + descriptions
  - [x] 讓 LLM 決定如何 fan-out
  - [x] 輸出 JSON task graph：tasks / assignees / dependencies
- [x] 實現 `decompose_task(task_id)` 函數：
  - [x] 呼叫 auxiliary LLM（或主要 model）
  - [x] 解析 JSON 回應
  - [x] 原子建立所有 child tasks + links
  - [x] 將 triage → todo
- [x] API endpoint：`POST /api/v1/kanban/tasks/<id>/decompose`
- [x] API endpoint：`POST /api/v1/kanban/tasks/<id>/specify`（單一 task spec rewrite）
- [x] 自動模式：`kanban.auto_decompose: true` 時 dispatcher tick 自動執行
- [x] 配置項：
  - [x] `auxiliary.kanban_decomposer` model
  - [x] `kanban.orchestrator_profile`
  - [x] `kanban.default_assignee`

## 備註
- 這是 Phase 3 中等風險的項目
- 借鑒 Hermes 的 decomposer 設計
- 考慮 rate limiting（每 tick 最多 N 個 decomposition）

## T086 全部完成。以下是交付物：

**新增文件**
- `engine/skills/auto/kanban-auto-decompose.md` — auto skill 定義，供 `SkillManager` 發現與匹配
- `engine/skills/kanban_decomposer.py` — 核心實現，包含：
  - `decompose_task(task_id)` — 讀取 triage task → LLM `with_structured_output(DecomposePlan)` → 原子建立 child tasks + task_links → 原始任務 `triage → todo`
  - `specify_task(task_id)` — LLM 單任務規格優化（標題、描述、worker_type、驗收標準）

**修改文件**
- `frontend_api/router_v1.py` — 新增 2 個 API endpoint：
  - `POST /api/v1/kanban/tasks/{id}/decompose`
  - `POST /api/v1/kanban/tasks/{id}/specify`
- `engine/workers/dispatcher.py` — 自動模式（config gated）：每 tick 掃描最多 `_MAX_DECOMPOSE_PER_TICK=3` 個 triage tasks，自動 decompose
- `config/agents.yaml` — 新增 `kanban` 和 `auxiliary` 配置區塊

