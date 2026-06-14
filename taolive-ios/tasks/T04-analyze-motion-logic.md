---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/493
type: Feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

# T04 - 分析動作選擇邏輯

## 目標
理解 TaoAvatar 如何根據輸入選擇動作

## 依賴
- T01: 已分析原始碼結構

## 驗收標準
- [x] 找出動作選擇邏輯 (ChatStatus + idle_speech_slices.json)
- [x] 記錄動作選擇邏輯 (ping-pong idle / talk smooth transition)
- [x] 識別動作動畫格式 (FLAME coeff → GSBodyConverter → joints_transform)

## AI 可執行命令
```bash
grep -r "motion\|action\|MotionSelector" ~/Projects/MNN/apps/Android/MnnTaoAvatar/src --include="*.java" -l
```

## 交付物
產出文件：`~/Projects/TaoLive-iOS/docs/T04-motion-analysis.md`