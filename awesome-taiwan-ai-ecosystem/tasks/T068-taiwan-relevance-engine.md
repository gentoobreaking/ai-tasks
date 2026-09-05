---
github_issue: N/A
title: Taiwan Relevance Engine — Decouple from MCP identity, independent scoring
assignee: pi
type: feat
priority: high
status: done
depends_on: ["T065", "T066", "T067"]
created: 2026-09-05
updated: 2026-09-05
---

# T068 - Taiwan Relevance Engine — Decouple from MCP identity, independent scoring

## 目標

重構現有台灣相關性評分引擎，使其完全獨立於 MCP identity 與 AI relevance（規格書 §4.3, §45, §61 Phase 2）。

現有代碼在 `internal/engines/taiwan_scoring.go`（對應 T014），需重構為獨立模組。

演算法參考: [algs/taiwan-classification.md](../algs/taiwan-classification.md)。

## 驗收標準

- [ ] `internal/engines/taiwan_relevance.go` 新建/重構：
  - [ ] `Score(entity *Entity, signals TaiwanSignals) TaiwanRelevance` 核心函數
  - [ ] 輸入：Entity（含 repository, README, source code, endpoints, data sources）
  - [ ] 輸出：`TaiwanRelevance{Score, Level, Evidence, Confidence}`
  - [ ] **不依賴** entity.Classification, entity.MCPIdentity, entity.AIRelevance
- [ ] 確定性評分規則（規格書 §17, algs/taiwan-classification.md §30-42）：
  - [ ] official Taiwan domain match: +40
  - [ ] Taiwan government API detected: +40
  - [ ] Taiwan financial API detected: +35
  - [ ] Taiwan-specific dataset detected: +30
  - [ ] Taiwan-specific keyword found: +20
  - [ ] Taiwan language detected: +15
  - [ ] Taiwan company/service detected: +15
  - [ ] README Taiwan mention: +5
- [ ] 等級閾值（規格書 §17）：
  - [ ] >=70 → T5, >=55 → T4, >=40 → T3, >=20 → T2, >=5 → T1, <5 → T0
- [ ] Evidence 記錄：每條規則產生對應 Evidence（rule, source, location, matched_text, content_hash, score, timestamp）
- [ ] Confidence：確定性規則 = 1.0，LLM 輔助時 < 1.0
- [ ] 可配置的 Taiwan 信號字典（T069 交付前先硬編碼，再整合配置）
- [ ] 單元測試：每條規則獨立測試、組合測試、閾值邊界測試
- [ ] 確定性測試：同輸入 100 次產生相同分數與分類（規格書 §TST-018）
- [ ] Evidence 完整性測試（規格書 §TST-019）

## 備註

- **關鍵**：Taiwan relevance 必須不增加 MCP confidence（規格書 §4.3）
- 原 `TaiwanRelevance` struct 保留但在新 Entity 中內嵌使用
- 配置檔案路徑：`config/taiwan_signals.yaml`（T069）
- LLM 輔助分類僅在 ambiguous zone (20-55) 觸發（algs/taiwan-classification.md §176-187）

## 執行紀錄

- 待執行