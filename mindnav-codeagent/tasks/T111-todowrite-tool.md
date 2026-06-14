---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/626
type: Feature
priority: P1
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-21
updated: 2026-05-21
howto: 
---

  1. 建立 engine/tools/todowrite_tool.py
  2. 實作 todo_create(items: list[dict])：建立新的待辦清單
     - 每個 item 有 content、status（pending/in_progress/completed/cancelled）、priority
  3. 實作 todo_update(item_id: str, status: str, content?: str)：更新項目狀態
  4. 實作 todo_list(project?: str)：列出當前工作階段的待辦事項
  5. 使用 @tool 裝飾器，註冊到 graph.py
  6. todowrite 只在特定 subagent 啟用（預設對 subagent 停用）
  7. 支援跨工作階段持久化（選項式：寫入暫存檔或 memory）
  8. 更新測試驗證 CRUD 操作正確

# T111 - todowrite — 任務清單管理工具

## 目標
讓 agent 像 OpenCode 一樣可以在編碼工作階段中建立和管理待辦清單，用於追蹤複雜多步驟任務的進度。

## 驗收標準
- [x] todo_create 支援 content、status、priority 欄位
- [x] todo_update 可更新狀態和內容
- [x] todo_list 列出當前工作階段的所有項目
- [x] 使用 @tool 裝飾器，註冊到 graph.py 的 tools 清單
- [x] 預設對 subagent 停用（透過 permission 控管）
- [x] 支援可選的持久化儲存（JSON 檔案寫入 .opencode/todowrite.json）

## 備註
- 和現有 kanban 工具不同：todowrite 是輕量級的工作階段任務清單，kanban 是專案級任務管理
- 參考 OpenCode 的 todowrite：僅規劃待辦，不綁定到特定 workflow
- 預設停用 subagent，避免子 session 干擾 parent 的任務清單
