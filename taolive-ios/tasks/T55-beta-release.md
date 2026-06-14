---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/471
type: Feature
priority: high
status: pending
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

# T55 - Beta 發布

## 目標
發布 Beta 版本供測試

## 驗收標準
- [ ] 準備 Beta Build
- [ ] TestFlight 發布
- [ ] 收集反饋
- [ ] 修復 Bug

## AI 可執行命令
```bash
xcodebuild -workspace TaoLive.xcworkspace -scheme TaoLive -configuration Release build
```

## 交付物
產出：Beta IPA `~/Projects/TaoLive-iOS/Release/TaoLive-beta.ipa`