---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/490
type: Feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

# T01 - 下載並分析 TaoAvatar Android 原始碼

## 目標
研究 MNN TaoAvatar Android 原始碼結構

## 驗收標準
- [x] 列出所有關鍵檔案
- [x] 每個檔案的功能說明
- [x] 找出核心類別（MainActivity, AudioBlendShapePlayer, NnrAvatarRender 等）

## AI 可執行命令
```bash
cd ~/Projects
git clone https://github.com/alibaba/MNN.git --depth 1
find ~/Projects/MNN/apps/Android/MnnTaoAvatar -type f \( -name "*.java" -o -name "*.cpp" -o -name "*.xml" \) | head -50
```

## 交付物
產出文件：`~/Projects/TaoLive-iOS/docs/T01-source-analysis.md`

## 備註
需要先有 TaoAvatar 原始碼才能分析
