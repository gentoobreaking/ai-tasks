---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/474
type: Feature
priority: low
status: pending
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

# T58 - 內購整合

## 目標
實現應用內購買功能

## 驗收標準
- [ ] StoreKit 配置
- [ ] 購買流程實現
- [ ] 訂閱管理

## AI 可執行命令
```swift
StoreKit.requestPayment(productID: "premium")
```

## 交付物
產出：`~/Projects/TaoLive-iOS/TaoLive/StoreManager.swift`