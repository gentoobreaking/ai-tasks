---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/494
type: Feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

# T05 - 分析 NNR 渲染管線

## 目標
理解 TaoAvatar 的圖形渲染架構

## 依賴
- T01: 已分析原始碼結構

## 驗收標準
- [x] 找出渲染相關類 (NNRScene/Metal/OpenGL/Vulkan)
- [x] 記錄渲染管線流程 (Scene → SetParams → GSBody → Deform → Render)
- [x] 識別著色器實現 (NNR Metal 後端)

## AI 可執行命令
```bash
grep -r "render\|draw\|Surface\|Canvas\|GL" ~/Projects/MNN/apps/Android/MnnTaoAvatar/src --include="*.java" -l
```

## 交付物
產出文件：`~/Projects/TaoLive-iOS/docs/T05-render-analysis.md`