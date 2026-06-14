---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/462
type: Feature
priority: medium
status: pending
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

# T46 - 離線緩存策略

## 目標
實現離線數據緩存

## 驗收標準
- [ ] 實現本地緩存
- [ ] 實現模型預下載
- [ ] 實現緩存清理策略

## AI 可執行命令
```swift
let cache = CacheManager(maxSize: 2 * 1024 * 1024 * 1024)
```

## 交付物
產出：`~/Projects/TaoLive-iOS/TaoLive/CacheManager.swift`