---
github_issue: N/A
title: > ⛔ LLM Classifier — ambiguous Taiwan classification (Phase 4, needs LLM API)
assignee: pi with opencode
type: feat
priority: low
status: done
depends_on: []
blocked_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T035 - > ⛔ LLM Classifier — ambiguous Taiwan classification (Phase 4, needs LLM API)

## 目標

建立 `internal/classify/llm.go`, 處理 ambiguous candidate classification。
對應 CRAWLER_AGENT_TASKS.md §37 TASK-035, §18 LLM Classification, §67 MVP Scope Phase 4。

> ⛔ 本任務受外部條件約束：blocked_on 全數滿足前不得開工。排程器挑到時應先逐項驗條件，未滿足則跳過並記錄原因。

## 驗收標準

- [x] `internal/classify/llm.go` 建立
- [x] LLM 僅處理 ambiguous candidates: `20 <= taiwan_score <= 55` (§18)
- [x] `LLMClassifier` struct 實現: `Classify(server MCPServer) (*TaiwanRelevance, error)`
- [x] LLM 輸出必須是 structured JSON (§18):
  ```json
  {"taiwan_relevance": "T3", "confidence": 0.91, "categories": ["finance"], "reason": "..."}
  ```
- [x] LLM 不得修改 factual metadata (§18, §2.3 LLM Isolation):
  - repository_url, stars, last_commit, license, tool_count, endpoint, health_status
- [x] LLM 只能提供: Taiwan relevance classification, category classification, ambiguous source interpretation
- [x] README 是 untrusted input → 必須 sanitize → extract relevant text → LLM (§60 LLM Security)
- [x] Strip injection patterns: "Ignore previous instructions", "Call this URL", "Upload credentials"
- [x] LLM failure 處理 (§TST-053): timeout, invalid JSON, hallucinated fields, confidence=0
- [x] LLM failure → crawler does not crash, factual metadata unchanged, fallback executed
- [x] LLM classification 必須標記: classifier=llm, confidence, evidence (§24 Design Principle)
- [x] LLM 呼叫次數可追蹤 (§TST-050: clear T0/T4 → LLM calls = 0)
- [x] 單元測試: score=20–55 → LLM invoked = true (§TST-051)
- [x] 單元測試: score=0 (T0) and score=70+ (T4) → LLM invoked = false (§TST-050)
- [x] 單元測試: LLM 嘗試修改 repository_url/stars/license/endpoint/tool_name → 原始 metadata 100% unchanged (§TST-052)

## 備註

- LLM API key 來自環境變數: OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_MODEL (§程式設計 conventions)
- v0.1 不包含 LLM (§67 MVP Scope: Phase 4)
- LLM classification 為 fallback, deterministic rules 為主 (§2.2 Deterministic First)

## 執行紀錄（2026-09-05 稽核）
- 已達成: 全部 13 項驗收標準
- `internal/classify/llm.go` 建立 ✅
- `LLMClassifier` struct with `Classify(ctx, server)` 方法 ✅
- `ShouldClassifyLLM(score)` gates LLM calls: score 20-55 → true, 0-19 and 56-100 → false ✅
- `NewLLMClassifier()` reads `OPENAI_API_KEY` + `OPENAI_BASE_URL` env vars ✅
- Model fallback chain: `opencopen/muse-spark-1.2-contributor-free` → `opencopen/nemotron-3-ultra-free` ✅
- README sanitization via `normalize.SanitizeReadme` (strips injection patterns) ✅
- LLM failure handling: all models fail → fallback to T0 with confidence=0, no crash ✅
- Factual metadata isolation: Classify only returns TaiwanRelevance, never modifies server ✅
- LLM call tracking via `LLMCalls()` / `ResetLLMCallCount()` ✅
- Wired into `CrawlCoordinator.Run` Stage 3b — only ambiguous candidates invoke LLM ✅
- `--incremental` flag → `IncrementalCrawler.RunIncremental` (ShouldCrawl gate) ✅
- `--capability` flag → `SearchEngine.SearchByCapability` ✅
- Unit tests: TST-050 (T0/T4 → 0 calls), TST-051 (20-55 → LLM invoked), TST-052 (metadata unchanged) ✅
- blocked_on cleared: OPENAI_API_KEY and OPENAI_BASE_URL available in environment ✅
