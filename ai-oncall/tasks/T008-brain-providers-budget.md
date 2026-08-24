---
github_issue: N/A
title: LLM providers 子套件與 token 預算
type: feat
priority: high
status: done
depends_on:
- T005
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T008 - LLM providers 子套件與 token 預算

## 目標
`brain/providers/`：多 provider 備援呼叫（逾時/熔斷/降級鏈）；`brain/budget.py`：
每 Incident token/次數上限。**實作依據：`algs/triage-pipeline.md` §A.3–A.4。**
providers 為獨立子套件——低頻變動，禁止與 prompt 邏輯耦合（數位分身 providers.py 教訓）。

## 驗收標準
- [ ] 備援鏈：主 provider 失敗切下一個，全失敗拋出明確例外
- [ ] budget 依 §A.3/A.4：次數上限（預設 6）與 token 上限，超限丟 BudgetExceeded 例外供 triage 降級
- [ ] 消耗入 /metrics（F12）
- [ ] providers 以 fake 測試，不打真 API