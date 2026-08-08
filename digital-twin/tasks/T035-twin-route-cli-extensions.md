---
github_issue: 
title: twin route CLI 擴充 (--list-agents, --show-rules, --dry-run)
type: feature
priority: low
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-06
updated: '2026-08-09'
---

# T035 - twin route CLI 擴充 (--list-agents, --show-rules, --dry-run)

## 目標
T008 實作了基本的 `twin route --task-id --auto`，需擴充 CLI 功能以利除錯與查看。

## 驗收標準
- [x] `twin route --list-agents`：列出所有 agents（id, role, model, capabilities 摘要）
- [x] `twin route --show-rules`：列出所有 routing rules（id, delegate_to, keywords 摘要）
- [x] `twin route --tags tag1,tag2 --dry-run`：不寫 routing.json，僅輸出路由結果與匹配 rule
- [x] `twin route --task-id T002 --auto --dry-run`：同理，僅輸出不寫檔
- [x] `agent_registry.py` CLI 同步支援上述參數

## 備註
- T008 summary 後續建議第 7 點
- 低優先級，方便除錯與開發時確認路由邏輯
- `--dry-run` 適合 CI/CD 或開發時驗證路由規則
---

## 驗證結果（2026-08-09）
- `./twin route --list-agents`：列出 4 分身（my/cloud-arch/docs-sync/quant-dev）id+role+model+capabilities ✅
- `./twin route --show-rules`：列出 rule-quant/cloud/docs/default + keywords 摘要 ✅
- `./twin route --tags kubernetes,docker --dry-run`：輸出 cloud-arch + rule-cloud，未寫檔 ✅
- `./twin route --task-id T002 --auto --dry-run`：輸出 my + rule-default，未產生 routing.json ✅
- `agent_registry.py` CLI 同步支援（twin 透傳）✅
- 測試：test_agent_registry 10→14 passed（新增 dry-run 不產生檔案等 4 項）；全量 119 passed + 1 skipped
