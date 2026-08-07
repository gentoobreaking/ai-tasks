---
github_issue: 
title: twin route CLI 擴充 (--list-agents, --show-rules, --dry-run)
type: feature
priority: low
status: pending
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-06
updated: '2026-08-06'
---

# T035 - twin route CLI 擴充 (--list-agents, --show-rules, --dry-run)

## 目標
T008 實作了基本的 `twin route --task-id --auto`，需擴充 CLI 功能以利除錯與查看。

## 驗收標準
- [ ] `twin route --list-agents`：列出所有 agents（id, role, model, capabilities 摘要）
- [ ] `twin route --show-rules`：列出所有 routing rules（id, delegate_to, keywords 摘要）
- [ ] `twin route --tags tag1,tag2 --dry-run`：不寫 routing.json，僅輸出路由結果與匹配 rule
- [ ] `twin route --task-id T002 --auto --dry-run`：同理，僅輸出不寫檔
- [ ] `agent_registry.py` CLI 同步支援上述參數

## 備註
- T008 summary 後續建議第 7 點
- 低優先級，方便除錯與開發時確認路由邏輯
- `--dry-run` 適合 CI/CD 或開發時驗證路由規則