---
github_issue:
title: Fix: initialize ping engine so models show actual status instead of pending
type: bugfix
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T058 - Fix: initialize ping engine so models show actual status instead of pending

## 目標
在 Bubble Tea 重構中，ping engine 從未被初始化，導致所有模型顯示 pending 狀態。修復此問題。

## 驗收標準
- [x] SetRegistry() 中初始化 ping engine（NewEngine、SetRegistry、SetModels、Start）
- [x] 加入 tickMsg 類型與 tea.Tick(500ms) 定期重新渲染
- [x] Init() 和 Update() 正確處理 tick 訊息
- [x] 模型狀態正確顯示（up/down/noauth/ratelimit）

## 備註
- 舊程式碼在 TUI.Init() 中呼叫 t.engine.Start() 啟動 ping 引擎
- 舊程式碼使用 onPingUpdate 回呼標記 renderPending
- 新程式碼使用 tea.Tick 定期觸發重新渲染，ping engine 在後台更新模型狀態