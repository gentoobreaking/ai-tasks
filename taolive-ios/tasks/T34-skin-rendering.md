---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/455
type: Feature
priority: high
status: pending
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

# T34 - 皮膚渲染優化

## 目標
實現真實的皮膚渲染效果

## 驗收標準
- [ ] 實現 Subsurface Scattering
- [ ] 實現皮膚陰影
- [ ] 實現毛孔細節

## AI 可執行命令
```swift
// SSS 參數
let skinMaterial = SkinMaterial(sss: true, translucency: 0.3)
```

## 交付物
產出：`~/Projects/TaoLive-iOS/TaoLive/SkinMaterial.swift`