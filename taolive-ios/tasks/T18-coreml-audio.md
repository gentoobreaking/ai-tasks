---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/441
type: Feature
priority: medium
status: pending
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

# T18 - CoreML 音頻處理

## 目標
使用 CoreML 進行音頻特徵提取

## 驗收標準
- [ ] 訓練音頻特徵模型
- [ ] 轉換為 CoreML 格式
- [ ] 整合 iOS 推理

## AI 可執行命令
```bash
coremltools convert model.pt --output model.mlmodel
```

## 交付物
產出：`~/Projects/TaoLive-iOS/TaoLive/AudioFeatureExtractor.swift`