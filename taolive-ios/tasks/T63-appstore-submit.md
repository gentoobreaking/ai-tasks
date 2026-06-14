---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/479
type: Feature
priority: high
status: pending
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

# T63 - App Store 提交

## 目標
提交 App 到 App Store

## 驗收標準
- [ ] 準備發布 Build
- [ ] 填寫 App Store 資訊
- [ ] 提交審核
- [ ] 通過審核上線

## AI 可執行命令
```bash
# Transporter 上傳
xcodebuild -exportArchive -archivePath TaoLive.xcarchive -exportOptionsPlist ExportOptions.plist
```

## 交付物
產出：App Store 上架成功