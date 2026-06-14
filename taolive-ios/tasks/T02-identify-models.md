---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/491
type: Feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

# T02 - 識別所有 MNN 模型檔案

## 目標
找出 TaoAvatar 使用的所有 .mnn 模型並建立清單

## 驗收標準
- [x] 找出所有 .mnn 模型檔案 (7 repos + 4 NNR scenes)
- [x] 記錄每個模型的名稱、大小、用途
- [x] 建立模型對照表

## AI 可執行命令
```bash
find ~/TaoAvatar -name "*.mnn" -type f 2>/dev/null
```

## 交付物
產出文件：`~/Projects/TaoLive-iOS/docs/T02-model-list.md`

## 備註
模型可能包括：ASR、TTS、動作生成、渲染等模型