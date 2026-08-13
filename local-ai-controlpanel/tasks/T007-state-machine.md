---
github_issue: N/A
title: State Machine（Phase 1）：Task 狀態機與轉移管制
type: feature
priority: high
status: pending
depends_on: [T005, T006]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-13
updated: 2026-08-13
---

# T007 - State Machine

## 目標

依 spec §9 Task Lifecycle / State Machine：手寫狀態機（不用 LangGraph，§6 決策紀錄），實作固定狀態與合法轉移；Phase 1–5 版本 **沒有 ESCALATE 分支**，`model_limitation → STOP` 為硬性（§24）。v0.4 的 `DEGRADED` 旗標與 `STRONGER_MODEL` 分支以型別預留但 Phase 1–5 不觸發。

## 驗收標準

- [ ] §9 全部狀態（CREATED → … → COMPLETE 及 FAIL→REFLECTION 分支）與轉移表實作
- [ ] 非法轉移拋錯（e.g. RESEARCHING → IMPLEMENTING 直接跳過 EVIDENCE_VALIDATION）
- [ ] `EVIDENCE_VALIDATION` 四分支（PASS / RESEARCH_AGAIN / BLOCK → ASK_USER|STOP / DEGRADED）可用
- [ ] `model_limitation` 分類回傳 `STOP`（Phase 1–5 硬限制）
- [ ] 每次轉移記錄時間戳（供 event log / Observability §32）

## 備註

- 狀態機是純 logic 模組（不碰 DB/網路），與 T006 Task Manager 分層。
- `ASK_USER` 狀態需能暫停等待 approve 輸入（對應 §45.5 `POST /api/v1/tasks/:id/approve`，T008 提供）。