---
github_issue: N/A
title: Evidence Gate（Phase 3）：兩階段評估 + 降級政策 + 卡死防護
type: feature
priority: high
status: done
depends_on:
- T018
- T010
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-13
updated: '2026-08-17'
spec_version: v3
---
# T019 - Evidence Gate

## 目標

依 spec §14：**沒有 Evidence 就不允許 Implementation 修改 artifact**（Rule 3）。實作 14.1 兩階段評估（Stage 1 research 執行狀態 COMPLETE/PARTIAL/FAILED；Stage 2 證據評估 SUFFICIENT/INSUFFICIENT/INSUFFICIENT_LOW_CONFIDENCE）、14.2 降級政策（research_failure：retry 2 次、on_partial / on_failed、override 記錄 actor）、14.3 降級三鐵律、14.4 卡死防護流程。

## 驗收標準

- [x] `validate(task, bundle)` 回傳 EvidenceDecision（PASS / RESEARCH_AGAIN / BLOCK / DEGRADED）
- [x] Stage 1 與 Stage 2 獨立判定；**Stage 2 的 BLOCK 永不降級（知識缺口，硬性）**
- [x] Stage 1 PARTIAL/FAILED 依 §14.2 政策走：低風險 + 本地證據足夠 → allow_local（degraded, flagged）；高風險 → ask_user
- [x] 降級一律帶旗標：`{ status: 'DEGRADED'; reason; scope; originalDecision; flags }`；覆寫記錄 actor 與理由
- [x] 卡死防護：research 失敗重試 ×2（5s / 30s 退避）後才進入降級判定
- [x] gate block 次數記錄（供 §36.2 Prevention Rate：`evidence_gate_blocks / (blocks + hallucinations_that_passed_gate)`）
- [x] BLOCK 時狀態機進入 ASK_USER 或 STOP（配合 T007）

## 備註

- 降級路徑只由 Stage 1 的 PARTIAL/FAILED 觸發（§14.1）。
- benchmark 中 `research_degraded_tasks` 單獨計數（§14.3 規則 3）。