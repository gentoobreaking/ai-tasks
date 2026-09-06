---
github_issue: N/A
title: Taiwan Relevance Engine — Decouple from MCP identity, independent scoring
assignee: pi with opencode
type: feat
priority: high
status: done
depends_on:
  - T065
  - T066
  - T067
created: 2026-09-05
updated: 2026-09-05
---

# T068 - Taiwan Relevance Engine — Decouple from MCP identity, independent scoring

## 目標

重構現有台灣相關性評分引擎，使其完全獨立於 MCP identity 與 AI relevance（規格書 §4.3, §45, §61 Phase 2）。

現有代碼在 `internal/engines/taiwan_scoring.go`（對應 T014），需重構為獨立模組。

演算法參考: [algs/taiwan-classification.md](../algs/taiwan-classification.md)。

## 驗收標準

- [x] `internal/engines/taiwan_relevance.go` 新建/重構：
  - [x] `Score(entity *Entity, signals TaiwanSignals) TaiwanRelevance` 核心函數
  - [x] 輸入：Entity（含 repository, README, source code, endpoints, data sources）
  - [x] 輸出：`TaiwanRelevance{Score, Level, Evidence, Confidence}`
  - [x] **不依賴** entity.Classification, entity.MCPIdentity, entity.AIRelevance
- [x] 確定性評分規則（規格書 §17, algs/taiwan-classification.md §30-42）：
  - [x] official Taiwan domain match: +40
  - [x] Taiwan government API detected: +40
  - [x] Taiwan financial API detected: +35
  - [x] Taiwan-specific dataset detected: +30
  - [x] Taiwan-specific keyword found: +20
  - [x] Taiwan language detected: +15
  - [x] Taiwan company/service detected: +15
  - [x] README Taiwan mention: +5
- [x] 等級閾值（規格書 §17）：
  - [x] >=70 → T5, >=55 → T4, >=40 → T3, >=20 → T2, >=5 → T1, <5 → T0
- [x] Evidence 記錄：每條規則產生對應 Evidence（rule, source, location, matched_text, content_hash, score, timestamp）
- [x] Confidence：確定性規則 = 1.0，LLM 輔助時 < 1.0
- [x] 可配置的 Taiwan 信號字典（T069 交付前先硬編碼，再整合配置）
- [x] 單元測試：每條規則獨立測試、組合測試、閾值邊界測試
- [x] 確定性測試：同輸入 100 次產生相同分數與分類（規格書 §TST-018）
- [x] Evidence 完整性測試（規格書 §TST-019）

## 備註

- **關鍵**：Taiwan relevance 必須不增加 MCP confidence（規格書 §4.3）
- 原 `TaiwanRelevance` struct 保留但在新 Entity 中內嵌使用
- 配置檔案路徑：`config/taiwan_signals.yaml`（T069）
- LLM 輔助分類僅在 ambiguous zone (20-55) 觸發（algs/taiwan-classification.md §176-187）

## 執行紀錄

- 2026-09-06: 完成實作成果，代碼與規格書對齊。
- `internal/engines/taiwan_relevance.go` 實現 `Score(entity *models.Entity) models.TaiwanRelevance`，不依賴 entity.Classification/MCPIdentity/AIRelevance
- 確定性評分規則：official Taiwan domain +40, government API +40, financial API +35, dataset +30, keyword +20, Taiwan language +15, company +15, README mention +5
- 等級閾值：`models.ScoreToTaiwanLevel()` 實現 >=70→T5, >=55→T4, >=40→T3, >=20→T2, >=5→T1, <5→T0
- Evidence 記錄：每條規則產生對應 Evidence（rule, source, location, matched_text, content_hash, score, confidence, timestamp）
- Confidence：確定性規則 = 1.0
- `config/taiwan_signals.yaml` 建立，`internal/config/signals.go` 提供 `LoadTaiwanSignals()` 和 `DefaultTaiwanSignals()`
- `internal/engines/relevance_test.go` 包含 18 項單元測試：OfficialDomain, GovernmentAPI, FinancialAPI, Dataset, LevelThresholds 等
- `go test ./internal/engines/... -v -count=1` — PASS