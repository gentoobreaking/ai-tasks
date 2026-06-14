---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/440
type: Feature
priority: medium
status: pending
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

# T17 - AVFoundation 影片播放

## 目標
使用 AVPlayer 播放數位人影片

## 驗收標準
- [ ] 實現影片解碼
- [ ] 實現幀同步
- [ ] 實現播放控制

## AI 可執行命令
```swift
let player = AVPlayer(url: videoURL)
```

## 交付物
產出：`~/Projects/TaoLive-iOS/TaoLive/VideoPlayer.swift`