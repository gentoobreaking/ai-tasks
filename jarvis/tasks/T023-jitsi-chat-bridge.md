---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/611
title: Jitsi 聊天室串接
type: Feature
priority: medium
status: done
assignee: OpenCode MinniMax-M2.7
created: 2026-05-13
updated: 2026-05-13
depends: T020
---

# T023 - Jitsi 聊天室串接

## 目標
讓 JARVIS 可自動加入 Jitsi 會議室並透過文字聊天室對話。

## 實作內容

### 1. Bridge 自動加入會議室
- 使用 Playwright 開啟無頭 Chromium 瀏覽器
- 自動載入 Jitsi Meet 會議室 URL
- 跳過預約頁面，直接加入會議
- 設定顯示名稱為 JARVIS

### 2. 文字聊天
- 監聽會議室聊天訊息
- 新訊息自動送入 JARVIS pipeline（LLM）
- 回覆自動貼回 Jitsi 聊天室

### 3. 整合 Telegram
- `/call` 指令一鍵建立會議室
- Bot 傳送 Jitsi 連結按鈕
- 背景自動啟動 Bridge

## 檔案
- `jitsi_bridge.py` — Bridge 主程式
- `bot_telegram.py` — Telegram `/call` 指令

## 驗收標準
- [x] 執行 `/call` 後 Bot 回覆 Jitsi 連結
- [x] 背景 Bridge 自動加入同一會議室
- [x] 使用者在 Jitsi 聊天室打字 → JARVIS 回覆

## 下一步
- T021 — 語音訊號捕獲（讓 JARVIS 聽見使用者說話）
- T022 — 語音回放（讓 JARVIS 能講話給使用者聽）

## 問題分析

### 流程
```
你 (手機)                    JARVIS bot                      jitsi_bridge.py
   |                             |                                 |
   |--- /call -----------------> |                                 |
   |                             |                                 |
   |<-- Jitsi URL --------------- |                                 |
   |                             |                                 |
   |========= 開啟 Jitsi URL =========>                            |
   |                             |        (headless Chromium)       |
   |                             |        也在同一個 room           |
   |                             |                                 |
   |--- 嘗試加入 lobby ---------> |                                 |
   |   (等待核准)                |--- 應該要 auto-admit ---> ✗ 失敗
```

### 根本原因
Jitsi lobby 核准機制依賴：
1. `APP.conference._room._setLobbyEnabled()` — internal API，已被 Jitsi 移除/改變
2. 按鈕 DOM selector — 可能因 Jitsi 版本而異

### 修復方向
1. ~~建立房間時在 URL 關閉 lobby（根本解決）~~ → meet.jit.si 不支援
2. ✅ **密碼保護機制** — 房間設密碼，繞過 lobby
3. 更新 DOM selector 適配新版 Jitsi

## 密碼保護機制
- `/call` 自動產生 6 位密碼
- 密碼附加在 Jitsi URL (`config.password=XXXXXX`)
- Bot 傳送訊息時一併告知密碼
- 使用者加入時輸入密碼，直接進房間不經 lobby
- jitsi_bridge.py 也以同樣密碼加入