---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/442
type: Feature
priority: medium
status: pending
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

# T19 - Sherpa-Onnx ASR 整合

## 目標
在 iOS 中整合 Sherpa-Onnx 離線語音辨識

## 驗收標準
- [ ] 編譯 Sherpa C++ 庫
- [ ] 整合 ONNX Runtime
- [ ] 測試離線 ASR

## AI 可執行命令
```bash
git clone https://github.com/k2-fsa/sherpa-onnx.git
```

## 交付物
產出：`~/Projects/TaoLive-iOS/TaoLive/SherpaASR.swift`