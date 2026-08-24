---
github_issue: N/A
title: evalkit 評測工具與 prompt_version 追蹤
type: feat
priority: medium
status: done
depends_on:
- T009
- T007
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T015 - evalkit 評測工具與 prompt_version 追蹤

## 目標
`evalkit/`：歷史已脫敏事故回放（≥20 件起跳）→ 對比 ground truth → 命中率報告。
**實作依據：`algs/knowledge-flywheel.md` §D.3–D.4。**

## 驗收標準
- [ ] replay 離線跑 shadow 路徑；原因命中/建議可用率/平均 token 成本三項報告
- [ ] prompt_version 變更前後對比報告；品質下降版本不得上線的檢查點（spec.md §5 標準 12）
- [ ] 回放集先過遮蔽層（§D.5）