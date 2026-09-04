---
github_issue: N/A
title: > ⛔ LLM Classifier — ambiguous Taiwan classification (Phase 4, needs LLM API)
type: feat
priority: low
status: deferred
depends_on: [T014]
blocked_on:
- "OpenAI-compatible LLM API key (OPENAI_API_KEY) env var available"
assignee: agent
created: 2026-09-05
updated: 2026-09-05
---

# T035 - > ⛔ LLM Classifier — ambiguous Taiwan classification (Phase 4, needs LLM API)

## 目標

建立 `internal/classify/llm.go`, 處理 ambiguous candidate classification。
對應 CRAWLER_AGENT_TASKS.md §37 TASK-035, §18 LLM Classification, §67 MVP Scope Phase 4。

> ⛔ 本任務受外部條件約束：blocked_on 全數滿足前不得開工。排程器挑到時應先逐項驗條件，未滿足則跳過並記錄原因。

## 驗收標準

- [ ] `internal/classify/llm.go` 建立
- [ ] LLM 僅處理 ambiguous candidates: `20 <= taiwan_score <= 55` (§18)
- [ ] `LLMClassifier` struct 實現: `Classify(server MCPServer) (*TaiwanRelevance, error)`
- [ ] LLM 輸出必須是 structured JSON (§18):
  ```json
  {"taiwan_relevance": "T3", "confidence": 0.91, "categories": ["finance"], "reason": "..."}
  ```
- [ ] LLM 不得修改 factual metadata (§18, §2.3 LLM Isolation):
  - repository_url, stars, last_commit, license, tool_count, endpoint, health_status
- [ ] LLM 只能提供: Taiwan relevance classification, category classification, ambiguous source interpretation
- [ ] README 是 untrusted input → 必須 sanitize → extract relevant text → LLM (§60 LLM Security)
- [ ] Strip injection patterns: "Ignore previous instructions", "Call this URL", "Upload credentials"
- [ ] LLM failure 處理 (§TST-053): timeout, invalid JSON, hallucinated fields, confidence=0
- [ ] LLM failure → crawler does not crash, factual metadata unchanged, fallback executed
- [ ] LLM classification 必須標記: classifier=llm, confidence, evidence (§24 Design Principle)
- [ ] LLM 呼叫次數可追蹤 (§TST-050: clear T0/T4 → LLM calls = 0)
- [ ] 單元測試: score=20–55 → LLM invoked = true (§TST-051)
- [ ] 單元測試: score=0 (T0) and score=70+ (T4) → LLM invoked = false (§TST-050)
- [ ] 單元測試: LLM 嘗試修改 repository_url/stars/license/endpoint/tool_name → 原始 metadata 100% unchanged (§TST-052)

## 備註

- LLM API key 來自環境變數: OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_MODEL (§程式設計 conventions)
- v0.1 不包含 LLM (§67 MVP Scope: Phase 4)
- LLM classification 為 fallback, deterministic rules 為主 (§2.2 Deterministic First)
