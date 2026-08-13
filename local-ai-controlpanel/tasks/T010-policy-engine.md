---
github_issue: N/A
title: Policy Engine（Phase 2）：YAML policies + 知識政策 + 決策評估
type: feature
priority: high
status: done
depends_on: [T005, T006, T007, T008]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-13
updated: 2026-08-13

commit: 2787725
---

# T010 - Policy Engine

## 目標

依 spec §10：Policy Engine 以 YAML/JSON 定義（`policies/*.yaml`：default / coding / research / security / escalation / sandbox），實作 `evaluateTask / evaluateResearch / evaluateArtifact / evaluateTool / evaluateExecution`；**Knowledge Policy**（unknown_dependency、version_sensitive、external_api、unfamiliar_framework、unfamiliar_repository、external_specification、low_confidence、security_sensitive → REQUIRE_RESEARCH）為核心差異化。決策過程不含 LLM（Rule 1）。

## 驗收標準

- [x] policies/*.yaml 載入 + Zod schema 驗證；`acp policy validate`（配合 T009）
- [x] `evaluateTask` 依 §11 TaskAnalysis 輸入產出 research required 決策（§10 知識政策規則）
- [x] `evaluateArtifact` 依 allowed/readonly/forbidden（§20）決策
- [x] `evaluateTool`：policy-controlled 權限（§28：network 預設禁、shell 必須 sandbox）
- [x] `evaluateExecution`：**Phase 1–5 強制 `local_only`、`allow_cloud: false`；若 allowCloud 為 true 直接 throw（§24 硬限制，程式層強制，非 prompt）**
- [x] `evaluateResearch`（evidence 足夠性 → PASS/RESEARCH_AGAIN）供 T019 Evidence Gate 使用
- [x] 決策過程無任何 LLM 呼叫（Rule 1 驗證）

## 備註

- v0.5 新增 `sandbox.yaml`（sandbox mode 設定，§30），供 T012/T016 使用。
- `evaluateEscalation` 型別預留（Phase 9 才啟用，§25）。