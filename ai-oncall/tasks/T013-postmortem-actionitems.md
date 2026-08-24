---
github_issue: N/A
title: postmortem 草稿與 action items 追蹤
type: feat
priority: medium
status: done
depends_on:
- T009
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T013 - postmortem 草稿與 action items 追蹤

## 目標
`postmortem/`：resolved 後彙整時間線→Markdown 草稿推播；
**草稿中修正事項自動建追蹤清單（負責人/期限/狀態），逾期未結提醒（F19）**；
定稿後入库 RAG（知識飛輪，algs/knowledge-flywheel.md §D.2）。

## 驗收標準
- [ ] 草稿含：時間線、根因（人工修正欄）、動作紀錄、影響範圍
- [ ] action items CRUD + 逾期提醒；定稿觸發 RAG 入库
- [ ] Markdown commit 至 incidents repo（git 操作有測試）