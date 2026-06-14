---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/473
type: Feature
priority: high
status: pending
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

# T57 - 隱私權政策

## 目標
確保符合隱私權規範

## 驗收標準
- [ ] App Tracking Transparency
- [ ] 隱私權政策頁面
- [ ] 數據處理說明

## AI 可執行命令
```swift
// 權限請求
ATTrackingManager.requestTrackingAuthorization { status in }
```

## 交付物
產出：`~/Projects/TaoLive-iOS/TaoLive/PrivacyPolicy.plist` + 隱私權頁面