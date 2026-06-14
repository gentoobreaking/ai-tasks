---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/610
title: Telegram Bot 整合
type: Feature
priority: medium
status: done
assignee: OpenCode MinniMax-M2.7
created: 2026-05-13
updated: 2026-05-13
depends: T019
---

# T020 - Telegram Bot 整合

## 目標
讓 JARVIS 可透過 Telegram 即時對話，支援文字與語音輸入/輸出。

## 實作內容

### 1. Bot 程式
- `bot_telegram.py` — 獨立 Telegram bot 程序
- 使用 `python-telegram-bot` 套件

### 2. 支援功能
- `/start` — 啟動訊息
- 文字訊息 → LLM 回應 → 回傳文字
- 語音訊息 → ASR → LLM → TTS → 回傳語音
- 使用者 ID 白名單過濾

### 3. 設定
透過 `~/.jarvis_config.json` 的 `telegram` 區塊設定：
```json
{
  "telegram": {
    "enabled": true,
    "bot_token": "<TOKEN>",
    "allowed_user_ids": [123456789]
  }
}
```

## 驗收標準
- [x] Telegram 傳文字可收到 JARVIS 回覆
- [x] Telegram 傳語音可收到語音回覆（ASR → LLM → TTS）
- [x] bot token 儲存在 `~/.jarvis_config.json`（不外洩）
- [x] 白名單以外的使用者無法使用