---
title: 文件與現況對齊（README/twin/currect_status 修正）
type: docs
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-05
updated: 2026-08-06
commit: bc4de4b
---

# T015 - 文件與現況對齊（README/twin/currect_status 修正）

## 目標
修復文件與實際程式碼嚴重脫節。實測確認：`telegram_bot.py` **檔案不存在**（T006 失敗後被移除），但 `README.md`、`currect_status.md`、`twin` CLI（`./twin bot` 指令）全部宣稱有此功能；README 模型表格引用已停用的 `claude-3-5-sonnet-20241022`。

## 驗收標準
- [x] README.md：telegram_bot.py 標記「🚧 未實作（T006 失敗已移除）」＋頂部警告、架構圖 TG 節點標註、模型表格更新為實際 model_id（nemotron/gemini-3-flash-preview/deepseek-chat/grok-4.5，與 config.py 一致）
- [x] currect_status.md：Telegram 遠端控管改為「❌ 未完成（T006 失敗）並註記原因」；macOS 背景服務化改「⚠️ 待 T006」；API Key 描述改 OpenRouter；目錄結構對齊實際檔案
- [x] `twin` CLI：`./twin bot` 在 telegram_bot.py 不存在時印出明確錯誤訊息（「功能未實作/依賴 T006」）並 exit 1，不再靜默失敗；help 加「🚧 未實作」註記
- [x] README 目錄結構圖與實際檔案一致（含新增的 tasks/ 目錄與 config.py、移除 telegram_bot.py、加入 auto_develop.py）
- [x] `./twin status`、`./twin --help` 可正常輸出且無誤導內容（實測 OK）
- [x] digital-twin.md 建立命令範例模型改為 nemotron（移除已停用 claude-3-5-sonnet）
- [x] SPEC_AI_CONSULTATION_MANUAL.md 保留品牌名（人工流程手冊，指示真人去 claude.ai 操作，非模型 ID 宣稱，合理不誤導）

## 備註
- 本任務是「文件對齊」而非「重新實作 telegram_bot」；重新實作屬 T006 範疇（若決定重啟，另開新任務）
- 同步檢查 `specs/`、`feedback_raw.md` 等檔案在 README 中的描述是否屬實
