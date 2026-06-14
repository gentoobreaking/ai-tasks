---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/460
type: Feature
priority: low
status: pending
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

# T39 - 環境場景

## 目標
實現背景環境與虛擬場景

## 驗收標準
- [ ] 實現天空盒
- [ ] 實現 3D 場景加載
- [ ] 實現景深效果

## AI 可執行命令
```swift
let skybox = Skybox(texture: envTexture)
```

## 交付物
產出：`~/Projects/TaoLive-iOS/TaoLive/Environment.swift`