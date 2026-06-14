---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/438
type: Feature
priority: high
status: pending
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

## 原因
模型未下載，MNN framework 無法連結 Catalyst（用 stub headers 繞過）。需要等 git-lfs pull 完成後，重新對接 MNN framework。

# T12 - MNN iOS SDK 整合

## 目標
在 iOS 專案中整合 MNN 框架

## 驗收標準
- [x] MNN CocoaPods 配置完成 (Podfile)
- [ ] MNN 基礎推理可運行 (需 Xcode)
- [ ] 測試模型加載 (需 Xcode)

## AI 可執行命令
```bash
# Podfile 添加
pod 'MNN', '~> 3.9'
```

## 交付物
產出：`~/Projects/TaoLive-iOS/Podfile`（含 MNN 配置）
