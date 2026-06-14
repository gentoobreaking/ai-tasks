---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/605
type: Feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-19
updated: 2026-05-19
howto: 
---

  1. 在 interface/tg_bot.py 新增 reply handler
     - 偵測回覆的訊息是否為 imboring/notification 通知
     - 解析回覆文字（支援：開始 Txxx、狀態、列表、指派、跳過）
  2. 建立指令路由表
     - 「開始 T098」→ 執行 task_executor_node
     - 「狀態」→ 執行 read_task_status.py
     - 「列表」→ 列出所有 pending 任務
  3. 回覆格式：保留原始通知的 context（thread_id、task_id）
  4. 錯誤處理：不認識的指令回傳幫助訊息

# T098 - Telegram 互動回覆

## 目標
讓使用者可以回覆 Telegram Bot 的通知訊息，直接執行任務操作（開始任務、查狀態、列表），不需回到 terminal。

## 驗收標準
- [x] 回覆 imboring 通知可執行對應動作
- [x] 支援指令：開始 Txxx、狀態、列表
- [x] 不認識的指令回傳幫助選項
- [x] 非同步執行，不 blocking bot 主循環
- [x] imboring 通知附帶回覆提示

## 備註
- 需保留原始通知中的 thread_id / task_id 以便 routing
- 指令解析支援中文：開始、啟動、查狀態、有哪些任務
- 回覆時在 Telegram 顯示執行結果摘要
