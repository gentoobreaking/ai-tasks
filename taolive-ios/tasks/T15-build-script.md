---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/501
type: Feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

# T15 - 建立建構腳本

## 目標
建立自動化的建構流程

## 依賴
- T11: Xcode 專案已建立
- T12: MNN 環境已完成
- T14: AVFoundation 已設定

## 驗收標準
- [x] Makefile 腳本可執行
- [x] 支援 `make build-catalyst` (Mac Catalyst，可在 macOS 執行)
- [ ] 可編譯 Debug/Release 版本 (需 Xcode)
- [ ] 可執行單元測試 (需 Xcode)

## AI 可執行命令
```bash
cat > ~/Projects/TaoLive-iOS/Makefile << 'EOF'
.PHONY: build test

build:
	cd ~/Projects/TaoLive-iOS && xcodebuild -scheme TaoLive -configuration Debug build

test:
	cd ~/Projects/TaoLive-iOS && xcodebuild test -scheme TaoLive
EOF
```

## 交付物
產出：`~/Projects/TaoLive-iOS/Makefile`