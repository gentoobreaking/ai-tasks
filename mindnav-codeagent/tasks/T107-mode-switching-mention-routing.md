---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/622
type: Feature
priority: P1
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-21
updated: 2026-05-21
howto: 
---

  1. 在 config/agents.yaml 中區分 mode: primary 與 subagent
  2. primary agent 可 spawn 其他 agent；subagent 只能被呼叫執行
  3. 實作 @mention pattern 偵測：用戶在訊息中輸入 @agent_name 時直接路由
  4. @mention 路由優先權高於 description-driven 路由
  5. 支援 Tab 切換 primary agent（類似 OpenCode 的 Tab 切換 Build/Plan）
  6. 在 Supervisor route() 中整合 mode 判斷邏輯
  7. 只允許 primary agent 顯示在 Tab 切換清單中
  8. 更新測試驗證 mode 切換與 @mention 路由

# T107 - Mode Switching + @mention Routing

## 目標
實作 OpenCode 風格的 primary/subagent mode 切換（Tab 鍵）與 @mention 直接路由，讓用戶可直觀地指定由哪個 agent 處理。

## 驗收標準
- [x] config 中 mode (primary/subagent) 正確區分 agent 類型
- [x] @mention 路由：訊息中 @agent_name 時直接路由到該 agent
- [x] @mention 優先權高於 description-driven 路由
- [ ] Tab 切換 primary agent（需前端/TUI 配合）
- [x] subagent 不可 spawn 其他 agent（mode constraint）
- [x] primary 可 spawn subagent（經 Task tool）

## 備註
- @mention pattern: /@([a-zA-Z_-]+)/ 在 Supervisor 中匹配
- Tab 切換需 frontend/TUI 配合實作
- subagent 只能透過 @mention 或 Task tool 呼叫
