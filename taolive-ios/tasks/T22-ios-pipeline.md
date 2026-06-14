---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/444
type: Feature
priority: medium
status: pending
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

## 原因
AIPipeline 連接的是 stub AI 服務（SherpaMNN、TtsService 等）。需要等各 AI 模型就緒後替換為真實推論。

# T22 - 建立 iOS 處理管線

## 目標
整合 ASR -> LLM -> TTS 處理管線

## 驗收標準
- [ ] 實現音頻 Pipeline
- [ ] 實現流式處理
- [ ] 實現錯誤處理

## AI 可執行命令
```swift
// Pipeline 整合
let pipeline = AIPipeline(asr: sherpa, llm: llm, tts: kokoro)
```

## 交付物
產出：`~/Projects/TaoLive-iOS/TaoLive/AIPipeline.swift`
