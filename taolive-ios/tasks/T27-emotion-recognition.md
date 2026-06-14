---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/449
type: Feature
priority: low
status: pending
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

## 原因
EmotionRecognizer.swift 不存在（未實作）。情緒辨識為可選功能，低優先序。需等 face tracking 實作後再評估需求。

# T27 - 情緒辨識整合

## 目標
辨識用戶情緒並調整數位人表情

## 驗收標準
- [ ] 訓練情緒分類模型
- [ ] 映射到 Blend Shapes
- [ ] 實現自然過渡

## AI 可執行命令
```bash
coremltools convert emotion_model.pt --output emotion.mlmodel
```

## 交付物
產出：`~/Projects/TaoLive-iOS/TaoLive/EmotionRecognizer.swift`
