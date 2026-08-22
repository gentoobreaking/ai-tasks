---
github_issue: ""
title: "TUI search/filter enhancements: provider/tier/tag prefix filters"
type: pending
priority: medium
status: done
depends_on: []
assignee: "OpenCode with DeepSeek V4 Flash"
created: "2026-08-22"
updated: "2026-08-22"
---

# T084 - TUI search/filter enhancements: provider/tier/tag prefix filters

## 目標
擴充 TUI 搜尋功能（`/` 鍵），支援結構化前綴過濾，讓使用者能快速縮小模型清單。

## 驗收標準
- [x] 搜尋輸入支援前綴語法：
  - `provider:groq` — 只顯示 Groq provider 的模型
  - `tier:S+` — 只顯示 S+ 層級
  - `tag:coding` — 只顯示含 coding tag 的模型
  - `status:up` — 只顯示狀態為 up 的模型
  - 組合：`provider:groq tag:coding`（AND 邏輯）
- [x] 輸入時即時預覽過濾結果（debounce 150ms）
- [x] ESC 清除過濾器，回到完整列表
- [x] 過濾器狀態顯示於表格標題列（如 `Filter: provider:groq tag:coding`）
- [x] 記住上一次的過濾器，下次啟動自動套用（儲存於 config `ui.lastFilter`）

## 備註
- 修改位置：`internal/tui/table.go`（搜尋邏輯）、`internal/tui/tui.go`（config 整合）
- 解析器建議用簡單的字串分割，支援空格分隔多條件
- 現有 `SortModels` 可複用，過濾在排序前執行
- 注意效能：模型數 ~130+，客戶端過濾無壓力