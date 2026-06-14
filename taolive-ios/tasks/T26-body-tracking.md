---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/448
type: Feature
priority: medium
status: pending
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

# T26 - 身體追蹤整合

## 目標
使用 Vision 身體姿勢估計

## 驗收標準
- [ ] 配置身體姿勢偵測
- [ ] 映射到骨骼動畫
- [ ] 實現姿勢控制

## 原因
BodyTracker.swift 是 stub。需要等 UniTalker-MNN 的 body_converter.mnn 模型就緒後實作。

## AI 可執行命令
```swift
let bodyPoseRequest = VNDetectHumanBodyPoseRequest()
```

## 交付物
產出：`~/Projects/TaoLive-iOS/TaoLive/BodyTracker.swift`