---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/463
type: Feature
priority: high
status: pending
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

# T47 - 完整離線模式

## 目標
實現完全離線運行

## 驗收標準
- [ ] 離線 ASR 功能
- [ ] 離線 TTS 功能
- [ ] 離線 LLM 功能

## AI 可執行命令
```swift
let offlineMode = OfflineMode(enabled: true)
```

## 交付物
產出：`~/Projects/TaoLive-iOS/TaoLive/OfflineManager.swift`