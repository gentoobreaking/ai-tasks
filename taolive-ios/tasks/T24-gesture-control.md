---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/446
type: Feature
priority: medium
status: pending
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

# T24 - 手勢辨識整合

## 目標
整合手勢辨識控制數位人

## 驗收標準
- [ ] 整合 Vision 手勢偵測
- [ ] 映射到手勢動畫
- [ ] 測試回應延遲

## AI 可執行命令
```swift
let request = VNDetectHumanHandPoseRequest()
```

## 交付物
產出：`~/Projects/TaoLive-iOS/TaoLive/GestureController.swift`