---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/755
title: Jitsi 語音串接 — 音訊播放回會議室
type: Feature
priority: low
status: in-progress
assignee: OpenCode MinniMax-M2.7
created: 2026-05-13
updated: 2026-05-23
depends: T021
---

# T022 - Jitsi 語音串接：回應音訊送回會議室

## 目標
讓 JARVIS 的回應語音能夠傳回 Jitsi 會議室，讓使用者聽到。

## 說明
T021 完成後 JARVIS 可以聽見使用者，但還需要把 TTS 回應音訊送回 Jitsi。
使用者才能在 Jitsi 中聽到 JARVIS 說話。

## 技術方向
- 建立自訂 MediaStream，取代 Jitsi 瀏覽器中的麥克風音軌
- 或使用 Jitsi API 的 `replaceTrack()` 注入音訊
- 或使用虛擬音效裝置（BlackHole）橋接

## 實作紀錄 (2026-05-23)
- `jitsi_audio.py` — `JitsiAudioPlayer` 類別
  - JS `JS_PLAY_AUDIO` 定位 `RTCRtpSender` → `replaceTrack(newTrack)` 注入 TTS 音訊
  - TTS WAV → `AudioContext.decodeAudioData()` → `BufferSource` → `MediaStreamDestination`
  - 播放完成後自動恢復原始麥克風音軌
  - `play_wav()` / `play_array()` 兩種介面
- `jitsi_bridge.py` — `BridgeConfig.playback_enabled` 控制
  - Chat 模式：LLM 回覆 → TTS → `JitsiAudioBridge.say_wav()` 直接播放到會議
  - 與 `JitsiAudioCapture` 的 ASR 結果也可自動播放（capture → ASR → LLM → TTS → playback 完整迴圈）

## 驗收標準
- [x] JARVIS 的 TTS 回應可在 Jitsi 會議室中被聽到 — `replaceTrack()` 虛擬麥克風
- [ ] 延遲在可接受範圍（< 3 秒） — 需實際測試驗證
- [ ] 可連續多輪對話 — 需實際測試驗證