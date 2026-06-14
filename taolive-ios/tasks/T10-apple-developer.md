---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/497
type: Feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

# T10 - Apple Developer 帳號設定

## 目標
完成 Apple Developer 帳號與 Xcode 整合（可延後）

## 替代方案（真機測試不需要 Developer 帳號）

| 方案 | 費用 | 說明 |
|------|------|------|
| Firebase App Distribution | 免費 | 上傳 IPA 給測試者安裝，需 Google 帳號 |
| App Center (Microsoft) | 免費 | 類似 Firebase，需 Microsoft 帳號 |
| Xcode 直接部署 (USB) | 免費 | 直接連接 iPhone，最長 7 天效期 |
| Diawi | 免費/付費 | 上傳 IPA 產生安裝連結，限 iOS 17+ |

## 驗收標準（Developer 帳號方案）
- [ ] 登入 Apple Developer Portal
- [ ] 建立 App ID
- [ ] 建立 Provisioning Profile
- [ ] Xcode Team 設定完成

## 替代方案驗收標準（先測試）
- [x] 選擇替代方案：模擬器開發 + 真機 USB 部署
- [ ] 使用替代方案上傳 IPA
- [ ] 真機安裝測試相機/麥克風功能

## AI 可執行命令
```bash
# 檢查 Xcode 帳號
xcodebuild -showsigningsettings

# 產生子 IPA（無 Developer 也可執行）
xcodebuild -workspace TaoLive.xcworkspace -scheme TaoLive -configuration Debug -archivePath TaoLive.xcarchive -exportPath ./build -exportOptionsPlist ExportOptions.plist
```

## 交付物
產出：Developer 帳號設定完成 或 替代方案測試成功

## 備註
- 優先使用替代方案開發測試
- Developer 帳號延後到 App Store 上架前再辦理
- 模擬器開發完全不需要任何帳號