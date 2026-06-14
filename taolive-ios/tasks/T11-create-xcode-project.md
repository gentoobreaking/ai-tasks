---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/498
type: Feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

# T11 - 建立 Xcode 專案框架

## 目標
建立 TaoLive-iOS Xcode 專案

## 驗收標準
- [x] Xcode 專案框架建立 (project.yml + Package.swift)
- [x] 支援 Mac Catalyst (可於 macOS 直接編譯執行驗證)
- [ ] Team 設定完成 (需 Xcode)
- [ ] 模擬器可運行 (需 Xcode)

## AI 可執行命令
```bash
mkdir -p ~/Projects/TaoLive-iOS
cd ~/Projects/TaoLive-iOS
xcodegen create-project --name TaoLive --platform ios --bundle-id com.taolive.ios
open TaoLive.xcodeproj
```

## 交付物
產出：`~/Projects/TaoLive-iOS/TaoLive.xcodeproj`