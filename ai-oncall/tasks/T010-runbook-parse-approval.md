---
github_issue: N/A
title: runbook 解析與批准閘門語意
type: feat
priority: high
status: done
depends_on:
- T006
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T010 - runbook 解析與批准閘門語意

## 目標
`runbook/{parse,approval}`：YAML runbook 定義解析、風險分級（read-only/mutating）、
批准閘門語意（dry-run 先行、逾期升級鏈呼叫 schedule、拒絕捕獲）。
**實作依據：`algs/approval-executor.md` §B.1–B.2、B.5。**

## 驗收標準
- [x] 風險分級依 §B.1 表格：read-only 自動執行；mutating 三段式 dry-run→批准→執行
- [x] 逾期升級依 §B.2：5 分鐘再提醒→排班換渠道→再逾時才棄單；時間線記完整嘗試軌跡；v1 無排班時固定 admin
- [x] 拒絕捕獲依 §B.5：一句話原因即時入 RAG（不等 postmortem），有整合測試
- [x] YAML schema 驗證與錯誤彙總

## 執行紀錄（2026-08-24 稽核）
- 已達成 4 項並打勾。
- **未竟事項**：無。
- 補充（證據）：test_t010_runbook.py：read-only auto_approved／mutating PENDING→APPROVED；逾時鏈式升級（admin→secondary→manager 後才 ABANDONED，attempts 全記 attempts 時間線）；v1 固定 admin 空操作升級；拒絕原因即時 index_override 入 RAG（整合測試含檢索驗證＋verify_chain）；YAML 五類錯誤聚合回報。
