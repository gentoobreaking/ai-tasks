---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/629
type: Feature
priority: P3
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-21
updated: 2026-05-21
howto: 
---

  1. 建立 engine/tools/lsp_tool.py
  2. 實作 LSPClient 類別，支援連線到已設定的 LSP server
     - 支援 pyright、typescript-language-server 等常見 LSP
  3. 實作 LSP 操作函式：
     - lsp_go_to_definition(symbol, file_path?)
     - lsp_find_references(symbol, file_path?)
     - lsp_hover(symbol, file_path?)
     - lsp_document_symbols(file_path)
     - lsp_workspace_symbols(query)
     - lsp_go_to_implementation(symbol, file_path?)
     - lsp_call_hierarchy(symbol, file_path?)
  4. 使用 @tool 裝飾器（每個操作一個 tool），註冊到 graph.py
  5. 大功能開關：只在環境變數 OPENCODE_EXPERIMENTAL_LSP_TOOL=true 時啟用
  6. LSP server 設定從 config/agents.yaml 或獨立 config/lsp.yaml 載入
  7. 更新測試驗證 LSP 查詢正確（可 mock LSP server）

# T114 - LSP tool — 程式碼智慧工具（實驗性）

## 目標
實作 LSP 整合工具，讓 agent 可查詢定義跳轉、參考查找、懸停資訊和呼叫階層，對齊 OpenCode 的實驗性 LSP 工具。

## 驗收標準
- [x] LSPClient 可連線並與 LSP server 通訊（JSON-RPC over stdio）
- [x] go_to_definition 回傳符號定義位置
- [x] find_references 回傳所有參考位置
- [x] hover 回傳符號資訊
- [x] document_symbols / workspace_symbols 回傳符號列表
- [x] go_to_implementation 支援
- [ ] call_hierarchy 支援（待實作 incoming/outgoing calls）
- [x] 環境變數開關 OPENCODE_EXPERIMENTAL_LSP_TOOL
- [x] 使用 @tool 裝飾器，註冊到 graph.py

## 備註
- 實驗性功能，預設不啟用
- 需要專案已安裝對應 LSP server（如 pyright、typescript-language-server）
- Mock LSP server 進行 unit test
