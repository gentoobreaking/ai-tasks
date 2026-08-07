---
github_issue: 
title: .gitignore 新增 .lancedb/ 目錄忽略
type: fix
priority: low
status: pending
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-06
updated: '2026-08-06'
---

# T031 - .gitignore 新增 .lancedb/ 目錄忽略

## 目標
T009 引入 LanceDB embedded 資料庫，資料存放在專案根目錄 `.lancedb/`。此目錄為本機資料庫檔案，不應提交至 Git。需在 `.gitignore` 新增對應規則。

## 驗收標準
- [ ] `.gitignore` 新增規則：`.lancedb/`
- [ ] 驗證：`git status` 不顯示 `.lancedb/` 為 untracked
- [ ] 現有 `.lancedb/` 目錄（若已被追蹤）需移除追蹤：`git rm -r --cached .lancedb/`

## 備註
- 優先度低，可併入其他任務一併提交
- T002 (gitignore-and-hooks) 已完成，此為補充項目
- 既有 `.gitignore` 位於專案根目錄 `/Users/david/Projects/digital-twin/.gitignore`