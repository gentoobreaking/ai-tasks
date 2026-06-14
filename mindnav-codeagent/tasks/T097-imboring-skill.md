---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/604
type: Feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-19
updated: 2026-05-19
howto: 
---

  1. 建立 skills/imboring/ 目錄與檔案
  2. SKILL.md — 技能說明、4 種模式（speak/telegram/both/off）、斜線指令
  3. settings.json — Notification + UserPromptSubmit hooks
  4. scripts/imboring.sh — 掃描 ~/Tasks/ 檢查活躍任務，閒置時發通知
     - 訊息含最近完成任務 + 下個待辦任務資訊
     - 支援 speak（macOS say）、telegram（curl API call）
  5. 賦予執行權限

# T097 - imboring skill

## 目標
當所有專案任務都已完成、沒有任何進行中的工作時，自動發送「好無聊」通知。

## 驗收標準
- [x] `skills/imboring/SKILL.md` — 技能說明、4 種模式、斜線指令
- [x] `skills/imboring/settings.json` — Notification + UserPromptSubmit hooks
- [x] `skills/imboring/scripts/imboring.sh` — 核心閒置偵測腳本
- [x] 支援 4 種模式：speak / telegram / both / off
- [x] 訊息含最近完成任務名稱 + 下個待辦任務名稱
- [x] 有活躍任務時安靜跳過（不發通知）
- [x] 無活躍任務時依模式發送通知
- [x] Telegram 模式需 TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID 環境變數

## 備註
- 通知內容範例：`😴 所有任務都完成了，我待命中 | 最近完成: T096 - 引擎通知 Dispatch | 下個任務: T097 - imboring skill`
- ~/.imboring_mode 可持久化模式設定
