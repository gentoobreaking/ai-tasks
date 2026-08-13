---
github_issue: N/A
title: Reflection + Retry（Phase 4）：失敗分類器 + 重試政策
type: feature
priority: high
status: done
depends_on: [T011, T012]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-13
updated: 2026-08-14
---

# T020 - Reflection + Retry

## 目標

依 spec §22 / §23：Reflection Engine **不直接修改 code**，只分類失敗原因並建議下一步；Retry Policy（enabled、max_attempts: 3、六類 failure 對應 action）。Phase 1–5：`model_limitation → STOP`（§24，不是 Cloud）；v0.4 的 `stronger_model` 型別預留。

## 驗收標準

- [x] Failure Classifier 六類：coding_error / knowledge_error / requirement_error / environment_error / tool_error / model_limitation
- [x] `ReflectionResult`（classification + confidence + recommendedAction）實作
- [x] 對應動作：knowledge_error → research、coding_error → retry、requirement_error → ask_user、environment_error → repair_environment、model_limitation → **stop**（Phase 1–5）
- [x] Retry Policy：max_attempts: 3 限制生效；`retry.on` 表（§23）驅動
- [x] reflections / attempts 表記錄每次分類（§27，供 §36.2 交叉驗證：error-signature × knowledge_error）
- [x] 事件發出 reflection 型別（§45.5 SSE schema，配合 T008）

## 備註

- 分類器先以「verification output 的 error-signature 字串掃描（§36.2 第二層 pattern 清單）」輔助，加上 rule-based/LLM 離線輔助（LLM-as-judge 不得進任何報告數字，§36.2 禁止條款）。
- STRONGER_MODEL 分支屬 Phase 9（T 之後的 escalation 任務），本任務不實作。 — 已於 §25/">spec 明文時機