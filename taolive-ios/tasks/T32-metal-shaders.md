---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/453
type: Feature
priority: high
status: pending
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

## 原因
Shaders.metal 存在但未與 SceneKitRenderer 整合。Metal 著色器需要與 NNR 模型綁定後才能渲染真實 avatar 外觀。

# T32 - Metal 著色器開發

## 目標
編寫自訂 Metal 著色器渲染數位人

## 驗收標準
- [ ] 實現頂點/片段著色器
- [ ] 實現陰影著色器
- [ ] 實現皮膚渲染

## AI 可執行命令
```swift
let library = device.makeDefaultLibrary()
```

## 交付物
產出：`~/Projects/TaoLive-iOS/TaoLive/Shaders.metal`
