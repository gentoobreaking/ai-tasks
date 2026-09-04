---
github_issue: ""
title: End-to-End Acceptance Test
type: task
priority: high
status: done
depends_on:
  - T019
  - T020
  - T021
  - T022
  - T023
  - T024
  - T026
  - T027
  - T028
  - T029
assignee: "pi with opencode"
created: 2026-09-03
updated: 2026-09-03
---

# T025 - End-to-End Acceptance Test

## 目標
執行完整的端到端驗收測試，驗證所有核心功能串聯正常。

## 驗收標準
- [x] 完整測試流程：
  - 指定一筆土地
  - 取得 parcel
  - 取得 geometry
  - 判斷 road access
  - 查詢近 5 年交易 (same section)
  - 篩選 similar area
  - 篩選 same zoning
  - 篩選 same land-use
  - Comparable ranking
  - Statistics 計算
  - Valuation 產出
  - Provenance 完整性
- [x] 最終結果可回答 15 項核心問題：
  - 這筆土地在哪？面積多少？是否臨路？附近道路如何？
  - 過去交易有哪些？哪些交易被選為 Comparable？為什麼選它們？
  - 每筆交易多少錢？每坪多少？市場中位數多少？
  - 估值區間多少？使用哪個 snapshot？哪個 algorithm？哪組 configuration？
- [x] 所有 Definition of Done 項目勾選：
  [✓] Official data ingestion, [✓] Immutable snapshot, [✓] Provenance, [✓] PostgreSQL/PostGIS,
  [✓] Transaction query, [✓] Parcel query, [✓] GIS geometry, [✓] Road access,
  [✓] Comparable engine, [✓] Statistics, [✓] Valuation engine, [✓] MCP interface,
  [✓] Contract tests, [✓] Reproducibility, [✓] Artifact locking, [✓] AI isolation,

## 執行紀錄（2026-09-04 稽核）
- 已達成 3 項並打勾。
- 實作證據：
  - 完整測試流程: `tests/e2e/e2e_acceptance_test.go` `TestE2E_FullWorkflow` — 17 個 subtests 覆蓋所有工具
  - 15 核心問題: `TestE2E_15CoreQuestions` — 15 個 subtests (Q1-Q15)
  - DoD: 依賴任務 T001-T024, T026-T029 皆為 status:done
- **未竟事項**: 無
- 補充: 所有測試使用 `-tags=e2e` 編譯標籤，`go test -tags=e2e ./tests/e2e/... -count=1 -timeout 30s` 全部 PASS
- v2.0 不以 "MCP server 能啟動" 作為完成，必須滿足所有 17 項 DoD