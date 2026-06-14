---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/452
type: Feature
priority: high
status: pending
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

## 原因
SceneKitRenderer.swift 存在但未與 TaoAvatar-NNR-MNN 模型整合。渲染器顯示的是 Placeholder avatar，不是真實 3D avatar。需要等 NNR 模型（compute.nnr, render_full.nnr）下載完成。

# T31 - SceneKit 渲染器實現

## 目標
使用 SceneKit 實現數位人渲染

## 驗收標準
- [ ] 建立 SceneKit 場景
- [ ] 實現模型加載
- [ ] 實現動畫播放
- [ ] 實現光照與材質

## AI 可執行命令
```swift
import SceneKit
let scene = SCNScene()
```

## 交付物
產出：`~/Projects/TaoLive-iOS/TaoLive/SceneKitRenderer.swift`
