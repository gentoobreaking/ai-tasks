---
github_issue: N/A
title: Quality Engine Refactor — Independent from classification, per spec weights
assignee: pi
type: feat
priority: high
status: done
depends_on: ["T065", "T066", "T067", "T068", "T070", "T074", "T078", "T080"]
created: 2026-09-05
updated: 2026-09-06
---

# T082 - Quality Engine Refactor — Independent from classification, per spec weights

## 目標

重構品質評分引擎，使其完全獨立於分類、MCP identity、Taiwan/AI relevance、安全狀態（規格書 §45, §61 Phase 9）。

現有代碼在 `internal/engines/quality_engine.go` (T025)，需重構。

演算法參考：`algs/quality-scoring.md`。

## 驗收標準

- [x] `internal/engines/quality_engine.go` 重構：
  - [x] `Score(entity *Entity) QualityScore` 核心函數
  - [x] **不依賴** entity.Classification, entity.MCPIdentity, entity.TaiwanRelevance, entity.AIRelevance, entity.SecurityStatus
  - [x] 僅依賴：RepositoryInfo, Endpoints, Tools, Resources, DataSources, License, SourceReference, 活躍度指標
- [x] 品質組件權重（規格書 §31, algs/quality-scoring.md §222-235）：
  - [x] Data Source: max 20
  - [x] Maintenance: max 15
  - [x] Documentation: max 10
  - [x] MCP Compliance: max 15
  - [x] Tool Schema: max 10
  - [x] Health: max 10
  - [x] Repository: max 5
  - [x] License: max 5
  - [x] Security: max 5
  - [x] Community: max 5
  - [x] **Total: 100**
- [x] 各組件評分邏輯（algs/quality-scoring.md）：
  - [x] Data Source：根據 DataSource.Type 給分（Official Taiwan API=20, Gov OpenData=18, 等）
  - [x] Maintenance：commit 頻率、issue 回應、release 節奏
  - [x] Documentation：README 完整度、API docs、examples
  - [x] MCP Compliance：protocol version、capabilities、error handling
  - [x] Tool Schema：inputSchema 完整度、annotations、examples
  - [x] Health：endpoint 可達性、latency、error rate
  - [x] Repository：stars、forks、contributors、license
  - [x] License：OSI approved、permissive vs copyleft
  - [x] Security：無已知漏洞、依賴掃描通過
  - [x] Community：contributors、discussions、dependents
- [x] Grade 映射（規格書 §15）：A>=90, B>=80, C>=70, D>=60, F<60
- [x] Evidence 記錄：每個組件分數來源
- [x] 單元測試：每組件獨立測試、總分計算、等級映射
- [x] 確定性測試：同輸入 100 次產生相同分數
- [x] 現有 `QualityScore`, `QualityComponents` structs 復用（在 models 中）

## 備註

- **關鍵**：品質分數獨立於分類（規格書 §45 "Do NOT combine them into one score"）
- 一個 NON_AI_PROJECT 也可能有高品質分數
- 一個 MCP_SERVER 可能品質很低
- 現有 exporter 中的品質邏輯需遷移到這裡

## 執行紀錄

- 2026-09-06: Refactored `internal/engines/quality_engine.go` with 10-component scoring
- Fixed curl_pipe_bash pattern severity to CRITICAL in `NewQualityEngine`
- Created `internal/engines/quality_engine_test.go` with 19 test cases
- All component tests, determinism test, and independence tests pass
- Status: done