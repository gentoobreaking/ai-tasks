---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/458
type: Feature
priority: high
status: pending
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

# T37 - 光照系統

## 目標
實現多光源照明系統

## 驗收標準
- [ ] 實現方向光/點光/聚光燈
- [ ] 實現 IBL 環境光
- [ ] 實現即時陰影

## AI 可執行命令
```swift
let light = DirectionalLight(position: .zero, direction: SIMD3(0,-1,-1))
```

## 交付物
產出：`~/Projects/TaoLive-iOS/TaoLive/LightingSystem.swift`