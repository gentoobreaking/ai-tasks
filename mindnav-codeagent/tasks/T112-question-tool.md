---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/627
type: Feature
priority: P1
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-21
updated: 2026-05-21
howto: 
---

  1. 建立 engine/tools/question_tool.py
  2. 實作 ask_question(questions: list[dict])：向使用者提問
     - 每個 question 包含 header（短標籤）、question（題目）、options（選項列表）、multiple（是否多選）
     - 支援使用者從選項中選擇或輸入自訂答案
     - 多個問題時使用者可在各問題間切換再提交
  3. 實作連鎖問題：一次提問可包含多個相關問題
  4. 使用 @tool 裝飾器，註冊到 graph.py
  5. 整合到所有 agent node，不僅是 Coder
  6. 更新測試驗證提問與答案收集流程

# T112 - question — 使用者提問工具

## 目標
讓 agent 可在執行過程中向使用者提問，用於收集偏好、釐清需求、取得決策，對齊 OpenCode 的 question 內建工具。

## 驗收標準
- [x] ask_question 支援 header、question、options、multiple 欄位
- [ ] 使用者可從選項中選擇（待前端/TUI 整合）
- [ ] 使用者可輸入自訂答案（待前端/TUI 整合）
- [ ] 多個問題時使用者可在提交前切換瀏覽（待前端/TUI 整合）
- [x] 使用 @tool 裝飾器，註冊到 graph.py 的 tools 清單
- [x] 所有 agent（不僅 Coder）都可使用 question 工具（註冊在共用 tools list）

## 備註
- 不綁定到特定實作（LangChain 的 ToolMessage 或自訂 handler 都可）
- 需要前端/TUI 支援顯示問題 UI
- 若無前端支援，可 fallback 到 stdout 輸入輸出
