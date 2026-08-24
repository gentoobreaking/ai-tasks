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
- [x] 備援鏈：主 provider 失敗切下一個，全失敗拋出明確例外
- [x] budget 依 §A.3/A.4：次數上限（預設 6）與 token 上限，超限丟 BudgetExceeded 例外供 triage 降級
- [x] 消耗入 /metrics（F12）
- [x] providers 以 fake 測試，不打真 API

## 執行紀錄（2026-08-24 稽核）
- 已達成 4 項並打勾。
- **未竟事項**：無。
- 補充（證據）：test_t008_brain.py：備援鏈 fallback/all-fail（AllProvidersFailedError 含 attempts 清單）/per-provider 逾時/熔斷跳閘；TokenBudget 次數上限預設 6（test_budget_call_limit_default_6_and_exceeded）與 token 上限；BudgetLedger.totals() 供 /metrics；全以 FakeProvider 離線測試。
