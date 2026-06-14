---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/624
type: Feature
priority: P0
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-21
updated: 2026-05-21
howto: 
---

  1. 建立 engine/tools/file_tool.py
  2. 實作 read_file(path, offset?, limit?)：讀取檔案內容，支援 offset/limit 分頁
  3. 實作 write_file(path, content)：建立新檔案或覆蓋現有檔案
  4. 實作 edit_file(path, old_string, new_string, replace_all?)：精確字串替換修改
  5. 實作 apply_patch(path, patch_content)：對檔案套用 diff/patch
  6. 使用 @tool 裝飾器，接上 LangChain ToolNode
  7. 所有工具加入安全檢查：禁止寫入 .git/、致敏檔案、路徑穿越
  8. 在 graph.py 的 tools 清單中註冊，綁定到 Coder LLM
  9. 更新測試驗證各工具正確運作，包括安全性攔截

# T109 - File tools — read / write / edit / patch

## 目標
補足 mindnav-codeagent 缺少的最基礎檔案操作工具，讓 agent 可讀取、寫入、精確編輯和套用補丁，對齊 OpenCode 的內建工具。

## 驗收標準
- [x] read_file 可讀取任意檔案，支援 offset/limit 分頁（大檔案讀取指定行）
- [x] write_file 可建立新檔案或覆蓋現有檔案
- [x] edit_file 透過精確字串替換修改檔案，支援 replaceAll
- [x] apply_patch 可套用 diff/patch
- [x] 禁止寫入 .git/、環境變數檔案、路徑穿越
- [x] 所有工具使用 @tool 裝飾器，註冊到 graph.py 的 tools 清單
- [x] Coder agent 可呼叫這些工具

## 備註
- OpenCode 中 write/patch 受 edit 權限控制，我們先在工具層級分開實作
- 安全檢查：不允許寫入 .git/、.env、.opencode/ 等目錄
- 參考已存在的 shell_tool.py 風格和 @tool 寫法
