---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/502
type: Feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

# T20 - Kokoro TTS 整合

## 目標
在 iOS 中整合 Kokoro TTS 離線語音合成

## 驗收標準
- [ ] 編譯 Kokoro C++ 庫
- [ ] 整合 ONNX Runtime
- [ ] 測試離線 TTS

## AI 可執行命令
```bash
git clone https://github.com/remsky/Kokoro-ONNX.git
```

## 交付物
產出：`~/Projects/TaoLive-iOS/TaoLive/KokoroTTS.swift`