---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/443
type: Feature
priority: high
status: pending
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

## 原因
SherpaMNN.swift 是 stub（只回傳虛擬文字），模型為 LFS 指針尚未下載。需要等 git-lfs pull 完成。

# T21 - Sherpa MNN iOS 整合

## 目標
在 iOS 中整合 Sherpa MNN 離線 ASR

## 驗收標準
- [ ] 編譯 Sherpa MNN iOS 版本
- [ ] 整合到 Xcode 專案
- [ ] 測試離線語音辨識

## AI 可執行命令
```bash
git clone https://github.com/k2-fsa/sherpa-onnx.git
```

## 交付物
產出：`~/Projects/TaoLive-iOS/TaoLive/SherpaMNN.swift`
