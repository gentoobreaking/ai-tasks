---
github_issue: N/A
title: Evidence model + Evidence Bundle + Shaping（Phase 3）
type: feature
priority: high
status: pending
depends_on: [T017]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-13
updated: 2026-08-13
---

# T018 - Evidence model + Evidence Bundle + Shaping

## 目標

依 spec §13 / §12.2：Evidence 為一級 Domain Object（P4）——`Evidence`（id / claim / source{type,uri,title,publisher} / version / confidence / relevance / retrievedAt / contentHash）與 `EvidenceBundle`（facts / constraints / versions / unresolvedQuestions / confidence / tokenBudget / estimatedTokens / truncated / droppedFactIds）；實作 Evidence Shaping（確定性規則，不可由 LLM 決定）。

## 驗收標準

- [ ] Evidence / EvidenceBundle 型別依 §13 完整實作
- [ ] Evidence Store（SQLite evidence 表，§27）寫入完整證據集
- [ ] Shaping 規則（§12.2）：constraints/versions 完整保留；facts 依 relevance×confidence 由高到低保留至預算用盡；unresolvedQuestions 摘要單行
- [ ] token 估算為 deterministic：`max(1, ceil(claim.length / 4))`（禁止 LLM 逐條估算，§13 註記）
- [ ] 截斷時 `truncated = true` + `droppedFactIds` 記錄，且 unresolvedQuestions 追加「另有 N 筆證據因超過 token 預算未提供」
- [ ] 截斷不影響 Evidence Store 完整保存（gate 用完整證據集，§12.2 註記）
- [ ] evidence.max_tokens / min_relevance / budget_percent 由 policy 驅動（§30）

## 備註

- Shaping 只影響「交付給 Worker 的 bundle」，不影響 Evidence Gate 判定（§12.2 規則 5）。