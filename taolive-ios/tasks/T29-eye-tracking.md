---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/451
type: Feature
priority: low
status: pending
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

# T29 - 眼神追蹤整合

## 目標
實現自然的眼神注視與眨眼

## 驗收標準
- [ ] 實現眼神方向控制
- [ ] 實現眨眼動畫
- [ ] 實現視線避開行為

## AI 可執行命令
```swift
// ARKit Eye Tracking
let eyeTrackingConfig = ARFaceTrackingConfiguration()
```

## 交付物
產出：`~/Projects/TaoLive-iOS/TaoLive/EyeTracker.swift`