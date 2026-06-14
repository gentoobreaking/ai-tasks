---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/445
type: Feature
priority: high
status: pending
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

## 原因
TtsService.swift 是 stub（只回傳虛擬音頻）。TTS 實際使用 Bert-VITS2-MNN（已下載），但尚未整合。需要等 git-lfs pull 完成。

# T23 - Kokoro TTS iOS 整合

## 目標
在 iOS 中整合 Kokoro TTS 離線語音合成

## 驗收標準
- [ ] 編譯 Kokoro iOS 版本
- [ ] 整合到 Xcode 專案
- [ ] 測試離線語音合成

## AI 可執行命令
```bash
git clone https://github.com/remsky/Kokoro-ONNX.git
```

## 交付物
產出：`~/Projects/TaoLive-iOS/TaoLive/KokoroTTSiOS.swift`
