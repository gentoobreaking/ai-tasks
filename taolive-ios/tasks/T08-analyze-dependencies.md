---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/436
type: Feature
priority: high
status: pending
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

# T08 - 分析第三方依賴

## 目標
分析 TaoAvatar 使用的第三方庫並找出 iOS 等效方案

## 依賴
- T07: 已完成架構評估報告

## 驗收標準
- [ ] 列出所有第三方庫
- [ ] 找出 iOS 等效庫
- [ ] 記錄替代方案

## AI 可執行命令
```bash
grep -r "import\|require\|dependencies" ~/Projects/MNN/apps/Android/MnnTaoAvatar --include="*.java" | head -30
```

## 交付物
產出文件：`~/Projects/TaoLive-iOS/docs/T08-dependencies-analysis.md`