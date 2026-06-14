---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/500
type: Feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

# T14 - AVFoundation 音頻處理

## 目標
使用 AVFoundation 處理音頻輸入輸出

## 驗收標準
- [x] 實現 Audio Session 配置 (AudioManager.swift)
- [x] 實現麥克風錄製 (AVAudioEngine tap)
- [x] 實現音頻播放 (AVAudioPlayerNode)

## AI 可執行命令
```swift
try AVAudioSession.sharedInstance().setCategory(.playAndRecord)
```

## 交付物
產出：`~/Projects/TaoLive-iOS/TaoLive/AudioManager.swift`