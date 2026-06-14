---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/504
type: Feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

# T40 - 後處理效果

## 目標
實現高品質後處理渲染

## 驗收標準
- [ ] 實現 Bloom
- [ ] 實現 Tone Mapping
- [ ] 實現抗鋸齒

## AI 可執行命令
```swift
let pipeline = PostProcessPipeline(bloom: true, toneMapping: .ACES)
```

## 交付物
產出：`~/Projects/TaoLive-iOS/TaoLive/PostProcessor.swift`