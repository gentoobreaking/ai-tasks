---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/461
type: Feature
priority: high
status: pending
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

# T45 - 模型壓縮

## 目標
壓縮 AI 模型減少 App 大小

## 驗收標準
- [ ] 量化模型 (FP16/INT8)
- [ ] 減少模型層數
- [ ] 測試精度損失

## AI 可執行命令
```bash
mnnoptimize --model model.mnn --quantize int8
```

## 交付物
產出：壓縮後模型 `~/Projects/TaoLive-iOS/models/`