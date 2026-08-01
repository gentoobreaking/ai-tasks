---
github_issue: N/A
title: 複合分析引擎（財報體檢 / 篩選）
type: feature
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-08-01
---

# T017 - Composite Engines

## 目標
實作 `pkg/engine/composite/`（§6 架構圖、§10.D）：`get_financial_health_check` 五面向評分、`screen_stocks` 價值/成長篩選、`screen_high_yield` 高殖利率排行；全部走快取 + 記憶體計算，不重複打上游（§12.4）。

## 驗收標準
- [x] 五面向評分（獲利能力/成長性/財務結構/配息政策/公司治理）：每面向 0~100 分與總分，計算規則於 config 可調、輸出版本號
- [x] 評分輸入僅依賴 T014 已快取之 raw 資料（財報/營收/估值/ESG/股利），禁止在引擎內直接呼叫 Adapter
- [x] `screen_stocks`：value（低 PE/PB、高殖利率）與 growth（營收/獲利成長）條件組合、排序、`top_n` 限制
- [x] `screen_high_yield`：min_yield 過濾、排行、配息穩定性（連年配息年數）
- [x] 單元測試：評分計算正確性、條件組合、邊界（缺財報資料之個股跳過並註記）
- [x] 整合測試：mock 驗證全流程對上游 Adapter 之呼叫次數 = 1（快取命中）

## 備註
- 引擎輸出為 helper 資料，`_lineage.source_role=helper` 且 `derived_from` 標明所有父資料集
- 評分規則為產品核心邏輯，版本化（scoring_version）並隨輸出回傳，便於日後回測

## 實作紀錄
### 引擎（`pkg/engine/composite/`）
- `screen.go` 自 `pkg/engine` 遷移並擴充：`ValueCriterion` 加 `Sort`/`TopN`/`MinProfitGrowth`；`HighYieldCriterion` 加 `MinConsecutive`/`TopN`；`ScreenSort` 列舉（None/PE/Yield/PB/Growth）；`sortMatches`（PE 升冪無 PE 置後、yield/growth 遞減、PB 升冪）＋`limitMatches`
- `health.go` 新增五面向評分引擎：
  - 獲利能力：毛利率 ≥40、營益率 ≥20、純益率 ≥15 → 100，達 1 項 80、達 2 項 90、低於全部 60，再依毛利率至滿分線線性加分（上限 100）
  - 成長性：營收/淨利 YoY（最新季 vs 去年同期），各 0~100（≥20/25% 為 100 分線性），取平均；無同期資料不評分並註記
  - 財務結構：負債比於 0.4~0.8 線性 + 現金流為正 +5（上限 100）；缺資產負債表不評分
  - 配息政策：`連年配息年數/5 × 70 + min(配息年度數/總年度數/0.8, 1) × 30 + 殖利率 ≥5% +5`（上限 100）
  - 公司治理：基分 50 + ESG 揭露 +25 + 公司治理揭露 +25
  - 缺資料面向一律 0 分 + `available=false` + `note` 註記，不臆測、不跳過整檔
- 評分規則版本化：`DefaultScoringConfig` v1 內建；`MCP_SCORING_CONFIG` 指向 JSON 檔部分覆寫（`pkg/config` `Scoring()`，權重/門檻/加分全可調，Version 空回填 v1）

### 工具接線（`pkg/mcp/`）
- `get_financial_health_check` 接線完成（原為未接線錯誤）：score 五面向 + `scoring_version`、`total_score` 為加權總和（0.3/0.2/0.2/0.15/0.15，四捨五入至 1 位）、radar chart（T016 `chart.ForTool` 供應）、score 資料完整透出
- `screen_stocks` 新增 `sort`（pe 預設|yield|pb|growth，非法值報錯）、`min_profit_growth` 參數，`limit` 即 `top_n` 透傳引擎
- `screen_high_yield` 新增 `min_consecutive`（連年配息年數過濾）
- `screenMetrics`：`ConsecutiveYears`（上市依股利歷史逐年統計，OTC 有股利→1）；`ProfitGrowth`（MOPS 損益表摘要整批，最新季 vs 去年同期，零額外上游呼叫）
- lineage：health → `source_role=helper`、`derived_from` 為 6 個父資料集 union（income_summary/profit_ratios/balance_sheet/dividend/esg/company_governance）、cached = 父資料集 cached union；`screen_*` 維持 canonical 角色不變（T014）

### 驗證
- 單元測試：`health_test.go` 6 項（滿分、缺資料、無同期財報、配息中斷、客製規則、治理部分揭露）＋ `screen_test.go` 新增 3 項（排序/top_n、成長條件組合＋獲利成長、配息穩定性）
- `config_test.go` 新增 3 項：預設 v1、JSON 部分覆寫（版本/權重/門檻）、檔案缺失/格式錯誤
- 整合測試（`app_de_test.go`，mock 驗證快取）：`TestDEGetFinancialHealthCheck`（2330 期望值 profit 100/growth 69.4/structure 100/dividend 58/governance 100/total 87.6）、`TestDEGetFinancialHealthCheckCacheHit`（兩次查詢後各上游資料集呼叫次數 = 1，esg 鍵 `topic=1`）、`TestDEGetFinancialHealthCheckMissingData`（1101 缺獲利/成長/治理 → available=false 註記）、`TestDEScreenStocksProfitGrowth`（僅 2330 +17.9% 命中，derived_from 含 income_summary）
- `go vet ./...` 通過；全套件 `go test ./... -count=1` 通過（`TestWaitSequentialTiming` 為既有 rate-limiter 時序敏感測試，單獨重跑即過，與 T017 無關）
- commit: `feat(T017): 複合分析引擎（五面向財報評分/價值成長與高殖利率篩選，驗收完成）`
