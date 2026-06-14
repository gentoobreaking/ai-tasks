---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/456
type: Feature
priority: medium
status: pending
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

# T35 - 頭髮渲染

## 目標
實現真實的頭髮渲染

## 驗收標準
- [ ] 實現頭髮幾何體
- [ ] 實現 Anisotropic 着色
- [ ] 實現頭髮陰影

## AI 可執行命令
```swift
// 頭髮渲染
let hairMaterial = HairMaterial(anisotropic: true)
```

## 交付物
產出：`~/Projects/TaoLive-iOS/TaoLive/HairRenderer.swift`