---
github_issue: N/A
title: Incident 模型、風暴聚合與時間線雜湊鏈
type: feat
priority: high
status: done
depends_on:
- T005
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T006 - Incident 模型、風暴聚合與時間線雜湊鏈

## 目標
`incident/`：狀態機（open→investigating→mitigated→resolved）、correlate 聚合、hashchain。
**實作依據：`algs/triage-pipeline.md` §A.2 聚合演算法；`algs/integrity-auth.md` §E.3 雜湊鏈。**

## 驗收標準
- [ ] 聚合依 §A.2：5 分鐘窗、三標籤交集 ≥2 併入；mitigated 後只記錄不重開
- [ ] hashchain 依 integrity-auth §E.3：SHA256 鏈式雜湊 + verify_chain()；竄改偵測測試（spec.md §5 標準 15）
- [ ] 狀態機非法遷移拒絕並記錄