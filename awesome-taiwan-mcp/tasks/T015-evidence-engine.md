---
github_issue: N/A
title: Evidence Engine — scoring rule evidence provenance
type: feat
priority: high
status: pending
depends_on: [T014]
assignee: agent
created: 2026-09-05
updated: 2026-09-05
---

# T015 - Evidence Engine — scoring rule evidence provenance

## 目標

建立 evidence collection 與 persistence, 確保每個 scoring rule 都有對應 evidence。
對應 CRAWLER_AGENT_TASKS.md §17 TASK-017, §16 Taiwan Evidence, §5.4 Registry Schema Evidence, §66 Data Provenance。

## 驗收標準

- [ ] `Evidence` struct 在 models 套件中實現 (§16): Type, Source, Location, ContentHash, MatchedText, Rule, Score, Timestamp, Confidence
- [ ] `EvidenceCollector` (或 `EvidenceEngine`) 實現: `Add(evidence Evidence)`, `All() []Evidence`
- [ ] 每個 scoring rule (T014) 必須呼叫 `EvidenceCollector.Add()` 產生 evidence (§TASK-017: 每個 scoring rule 必須產生 rule, source, location, matched value, score, timestamp, content hash)
- [ ] Evidence 不得只保存純數字 (§TASK-017: 禁止只保存 "score = 40")
- [ ] Evidence 保存的內容: rule name, source (README/package.json/manifest/Repository/etc), location (file path or URL), matched_value, score/weight, timestamp, content_hash (sha256 of matched text)
- [ ] Content hash 使用 sha256 of matched_text
- [ ] Evidence 儲存到 SQLite `evidence` table (T004)
- [ ] Evidence 包含在 MCPServer.TaiwanRelevance.Evidence 中
- [ ] Evidence 匯出到 registry.json 的 taiwan_relevance.evidence 陣列
- [ ] 單一 server 的 evidence 能全部匯出為 JSON array
- [ ] 單元測試: 每個 scoring rule 都有對應 evidence 且 evidence 欄位完整 (§TST-019: 100% scored rules have corresponding evidence)

## 備註

- Evidence 是 classification 可信度的基礎
- Evidence 不應只保存 LLM 判斷, 必須保存原始來源 (§24 Registry Schema Design Principle)
- Data provenance 可追溯每個欄位 (§66 Data Provenance)
