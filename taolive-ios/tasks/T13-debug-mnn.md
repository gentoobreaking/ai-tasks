---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/499
type: Feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

# T13 - 除錯 MNN 模型轉換

## 目標
解決 MNN 模型轉換過程中的問題

## 驗收標準
- [ ] 修復轉換錯誤 (MNN 模型格式相容)
- [ ] 驗證轉換後模型可載入 (需 Xcode + 真機)
- [ ] 測試推理結果正確性 (需 Xcode + 真機)

## AI 可執行命令
```bash
mnn import --model model.onnx --output model.mnn
```

## 交付物
產出：調試記錄 `~/Projects/TaoLive-iOS/docs/T13-debug-log.md`