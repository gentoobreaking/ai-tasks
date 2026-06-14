---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/569
title: kanban_* Tool Interface
type: Feature
priority: high
assignee: OpenCode DeepSeek V4 Flash
status: done
created: 2026-05-18
updated: 2026-05-21
howto: 

---

  ## 實作摘要

  ### 新增檔案

  **`engine/tools/kanban/__init__.py`** — 匯出所有 kanban 工具

  **`engine/tools/kanban/kanban_tools.py`** — 9 個 `@tool` 裝飾器工具：

  | 工具 | 功能 | 參數 |
  |------|------|------|
  | `kanban_show` | 讀取任務詳情（含完整 worker context） | `task_id`（可選，預設讀 `HERMES_KANBAN_TASK`） |
  | `kanban_list` | 列出任務 | `assignee` / `status` / `tenant` / `limit` |
  | `kanban_create` | 建立任務 | `task_id` / `title` / `body` / `assignee` / `parents` |
  | `kanban_complete` | 完成任務 | `task_id` / `summary` / `metadata` |
  | `kanban_block` | 封鎖任務 | `task_id` / `reason` |
  | `kanban_heartbeat` | 發送進度信號 | `task_id` / `progress` |
  | `kanban_comment` | 添加評論 | `task_id` / `body` |
  | `kanban_link` | 建立父子依賴 | `parent_id` / `child_id` |
  | `kanban_unblock` | 解除封鎖 | `task_id` / `reason` |

  ### 設計要點
  - 所有工具使用 `@tool` 裝飾器，保持一致風格
  - `HERMES_KANBAN_TASK` 環境變數控制當前任務；未設定時工具返回 "not available" 訊息
  - 工具透過 `KANBAN_TOOLS_ENABLED=1` 環境變數動態啟用（在 graph.py 的 tools list 中條件加入）
  - 回傳值皆為結構化 JSON 字串

  ### 修改檔案
  - `engine/graph.py` — 匯入 `KANBAN_TOOLS`，條件式加入 tools list

# T079 - kanban_* Tool Interface

## 目標
實作 `kanban_*` 工具接口，封裝 LangGraph state 與 SQLite Kanban 的雙向同步。

## 驗收標準
- [x] 建立 `engine/tools/kanban/` 目錄結構
- [x] `kanban_show` - 讀取當前任務（使用 HERMES_KANBAN_TASK 環境變數）
- [x] `kanban_list` - 列出任務（支持 assignee / status / tenant 過濾）
- [x] `kanban_create` - 建立任務（支持 title / body / assignee / parents）
- [x] `kanban_complete` - 完成任務（summary + metadata）
- [x] `kanban_block` - 封鎖任務（reason）
- [x] `kanban_heartbeat` - 發送進度信號
- [x] `kanban_comment` - 添加評論
- [x] `kanban_link` - 添加父子依賴
- [x] `kanban_unblock` - 解除封鎖
- [x] 根據環境變數動態啟用/停用這些工具
- [x] 與現有 LangGraph tool system 整合
- [x] 實現 `check_fn` 條件觸發（僅在 dispatcher spawn 的 worker 中啟用）

## 備註
- 借鑒 Hermes 的 `kanban_*` toolset 設計
- 工具結果為結構化 JSON
- 與 LangGraph 的 tool calling 機制整合
