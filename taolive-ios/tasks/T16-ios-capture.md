---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/439
type: Feature
priority: medium
status: pending
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

# T16 - iOS 音影片擷取

## 目標
使用 AVFoundation 擷取麥克風與相機輸入

## 驗收標準
- [ ] 設定 Audio Session
- [ ] 實現 Camera 擷取
- [ ] 實現麥克風錄音

## AI 可執行命令
```swift
try AVAudioSession.sharedInstance().setCategory(.playAndRecord)
```

## 交付物
產出：`~/Projects/TaoLive-iOS/TaoLive/CaptureManager.swift`