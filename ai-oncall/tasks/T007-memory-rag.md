---
github_issue: N/A
title: RAG 知識庫 memory/indexer + search
type: feat
priority: high
status: done
depends_on:
- T005
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T007 - RAG 知識庫 memory/indexer + search

## 目標
`memory/`：事故/runbook 切段入庫（embedding）＋混合檢索。
**實作依據：`algs/knowledge-flywheel.md` §D.1–D.2、§D.5。**

## 驗收標準
- [ ] 檢索支援 metadata 過濾：service/cluster/severity/time_range（§D.1——純文字相似度不足）
- [ ] 三個入库來源（postmortem 定稿/即時 override/runbook 變更）各有介面與測試
- [ ] 入库前過遮蔽層（§D.5，樣式掃描同 executor redact）
- [ ] embedding provider 以 hash/local 起步（離線可測），openai 可切