---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/625
type: Feature
priority: P0
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-21
updated: 2026-05-21
howto: 
---

  1. 建立 engine/tools/search_tool.py
  2. 實作 grep_file(pattern, include?, path?)：以 regex 搜尋檔案內容
     - 支援完整正規表示式
     - 支援 include 檔案模式過濾（如 "*.py", "*.{ts,tsx}"）
     - 預設遵循 .gitignore（透過 ripgrep 或自訂邏輯）
  3. 實作 glob_file(pattern, path?)：以 glob 模式匹配檔案路徑
     - 支援 "**/*.js"、"src/**/*.ts" 等模式
     - 回傳按修改時間排序的結果
     - 預設遵循 .gitignore
  4. 使用 @tool 裝飾器，註冊到 graph.py
  5. 支援 .ignore 檔案覆蓋 .gitignore 行為（選項式）
  6. 更新測試驗證搜尋正確，含 pattern 過濾與 .gitignore 遵循

# T110 - Search tools — grep / glob

## 目標
補足程式碼搜尋工具，讓 agent 可用正規表示式搜尋內容和 glob 模式匹配檔案路徑，對齊 OpenCode 的 grep/glob 內建工具。

## 驗收標準
- [x] grep_file 以 regex 搜尋內容，回傳檔案路徑+行號
- [x] grep_file 支援 include 過濾（如 "*.py"）
- [x] grep_file 遵循 .gitignore（透過 pathspec）
- [x] glob_file 以 glob 模式搜尋，回傳按修改時間排序
- [x] glob_file 遵循 .gitignore（透過 pathspec）
- [ ] 支援 .ignore 檔案明確允許被忽略的路徑（待 pathspec 整合）
- [x] 所有工具使用 @tool 裝飾器，註冊到 graph.py 的 tools 清單

## 備註
- 底層可使用 ripgrep（已存在於 macOS），或 Python 的 glob + re 實作
- 遵循 .gitignore 避免搜尋 node_modules、.venv 等目錄
- .ignore 支援為選項功能，和 OpenCode 一致
