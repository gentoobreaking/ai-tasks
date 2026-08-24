---
github_issue: N/A
title: Telegram 決策層互動與排班升級鏈
type: feat
priority: medium
status: pending
depends_on:
- T010
- T004
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T012 - Telegram 決策層互動與排班升級鏈

## 目標
`interact/`（callback → 批准/拒絕/忽略語意，串 tracker 與 approval）+
`schedule/`（ICS/API 排班匯入，升級鏈 primary→secondary→manager）。
**實作依據：`algs/approval-executor.md` §B.2。**

## 驗收標準
- [ ] inline 按鈕三分支（批准/拒絕+原因/逾時）行為有測試
- [ ] 排班未設定時固定 admin（v1 降級），設定後依序升級
- [ ] 權限：僅 admin 角色可批准 mutating 動作（RBAC 沿數位分身三級模式）