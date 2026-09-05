---
github_issue: N/A
title: Discovery Pipeline Refactor — Broad discovery (Taiwan + AI), no MCP keyword filter
assignee: pi
type: feat
priority: high
status: pending
depends_on: ["T065", "T068", "T070", "T072"]
created: 2026-09-05
updated: 2026-09-05
---

# T089 - Discovery Pipeline Refactor — Broad discovery (Taiwan + AI), no MCP keyword filter

## 目標

重構發現管線，實現「廣泛發現 → 精確分類」架構（規格書 §4.1, §6, §42, §43, §61 Integration）。

修改：`cmd/crawler/main.go`, `internal/sources/`, `internal/coordinator/` (新建)。

## 驗收標準

- [ ] 發現查詢策略（規格書 §6, §42）：
  - [ ] **不再**主要搜尋 "Taiwan MCP", "Taiwan MCP Server", "Taiwan MCP GitHub"
  - [ ] 改用多維度發現：
    - [ ] Taiwan signals (T069) + AI signals (T071) 組合查詢
    - [ ] GitHub: topic 搜尋、description 搜尋、代碼搜尋
    - [ ] 註冊表來源：作為發現源，非權威證明（規格書 §5, §207-211）
- [ ] Source Adapter 更新：
  - [ ] GitHubAdapter: 使用 Taiwan+AI 關鍵字搜尋，非 MCP 關鍵字
  - [ ] Registry adapters (Glama, PulseMCP, MCP.so, Official): 僅作發現源，標記 `SourceReference.TrustScore` 低於 GitHub
  - [ ] 新增：Package registries (npm, PyPI, Go pkg), Public AI directories, Taiwan open-source communities
- [ ] 發現管線階段（規格書 §43）：
  ```
  DISCOVERY (GitHub/Registries/Packages)
      ↓
  NORMALIZER (canonical identity, dedup)
      ↓
  TAIWAN RELEVANCE (T068)
      ↓
  AI RELEVANCE (T070)
      ↓
  CLASSIFIER (T072)
      ↓
  MCP IDENTITY (T074)
      ↓
  RUNTIME VERIFICATION (T078)
      ↓
  SECURITY SCANNER (T080)
      ↓
  QUALITY SCORING (T082)
      ↓
  REGISTRY VIEWS (T083)
  ```
- [ ] 協調器 `internal/coordinator/coordinator.go` 新建：
  - [ ] 管理 pipeline 階段執行順序
  - [ ] 階段間傳遞 Entity 指針
  - [ ] 錯誤處理、重試、熔斷
  - [ ] 並行度控制、進度追蹤
- [ ] CLI 更新：`crawler run --pipeline=full|discovery-only|classify-only|verify-only`
- [ ] 整合測試：完整 pipeline 跑通

## 備註

- 規格書 §42 代碼範例展示新邏輯
- 規格書 §63: "DISCOVER BROADLY → CLASSIFY EXPLICITLY → VERIFY OBJECTIVELY → PUBLISH CONSERVATIVELY"
- 現有 `cmd/crawler/main.go` 的 `discoverAndFetch` 需重構為完整 pipeline

## 執行紀錄

- 待執行