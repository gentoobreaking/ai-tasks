---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/450
type: Feature
priority: high
status: pending
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

## 原因
LipSync.swift 是 stub（只回傳零）。口型同步依賴 A2BS（AudioToFlameBlendShape）模型，需要等 UniTalker-MNN 的 audio2verts.mnn 和 verts2flame.mnn 下載完成。

# T28 - 口型同步整合

## 目標
實現 TTS 音頻到口型的同步

## 驗收標準
- [ ] 音頻特徵提取
- [ ] Viseme 映射
- [ ] 實現流式同步

## AI 可執行命令
```swift
// AVSpeechSynthesizer 口型同步
let synthesizer = AVSpeechSynthesizer()
```

## 交付物
產出：`~/Projects/TaoLive-iOS/TaoLive/LipSync.swift`
