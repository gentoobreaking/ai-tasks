---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/447
type: Feature
priority: medium
status: pending
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

## 原因
FaceTracker.swift 是 stub（無 ARKit 臉部追蹤實作）。需要等 A2BS 模型就緒後，實作與 AudioToFlameBlendShape 的整合。

# T25 - 臉部追蹤整合

## 目標
使用 ARKit 臉部追蹤驅動數位人

## 驗收標準
- [ ] 配置 ARKit Face Tracking
- [ ] 映射 Blend Shapes
- [ ] 實現即時同步

## AI 可執行命令
```swift
let faceTrackingConfig = ARFaceTrackingConfiguration()
```

## 交付物
產出：`~/Projects/TaoLive-iOS/TaoLive/FaceTracker.swift`
