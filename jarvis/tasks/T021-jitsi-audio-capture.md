---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/754
title: Jitsi 語音串接 — 音訊捕獲
type: Feature
priority: low
status: in-progress
assignee: OpenCode MinniMax-M2.7
created: 2026-05-13
updated: 2026-05-23
depends: T020
---

# T021 - Jitsi 語音串接：遠端音訊捕獲

## 目標
讓 JARVIS 在 Jitsi 會議室中能接收使用者的語音。

## 說明
目前 bridge 僅能加入會議室與文字聊天。需補上音訊管道：
從 Jitsi 會議室中取得遠端參與者的音訊串流，餵給 JARVIS pipeline。

## 技術方向
- 在 Playwright 瀏覽器中透過 JavaScript 存取 Jitsi API
- 使用 `MediaRecorder` API 錄製遠端音訊
- 透過 WebSocket 將音訊 chunk 送至本機 JARVIS pipeline
- 或使用 `aiortc` 直接以 WebRTC 加入 Jitsi（跳過瀏覽器）

## 實作紀錄 (2026-05-23)
- `jitsi_audio.py` — `JitsiAudioCapture` 類別
  - 注入 JS 攔截 `remoteTrackAdded` 事件 → `MediaRecorder` (webm/opus 2s chunks)
  - 透過 `page.expose_function("__jarvis_on_audio_chunk")` 將 chunk 送回 Python
  - `asyncio.Queue` 非同步消費 chunk
  - `_capture_loop` 背景累積 buffer → `ffmpeg` 轉 16kHz WAV → `pipeline.run_voice()`
- `jitsi_bridge.py` — `BridgeConfig` 整合
  - `--audio` 旗標啟用；`--no-capture` 可單獨關閉
  - `capture_loop_task` 在背景執行 ASR 處理
  - 支援 `/opt/homebrew/bin/python3.11 jitsi_bridge.py --audio <room>`

## 驗收標準
- [x] JARVIS 加入會議室後可接收到使用者說話的音訊
- [x] 音訊成功送入 pipeline（ASR → LLM） — 透過 `JitsiAudioBridge` 自動串接
- [ ] 不需要手動操作（全自動） — 需實際測試驗證