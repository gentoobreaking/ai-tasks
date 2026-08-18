---
github_issue: N/A
title: ETF Model（獨立 ETF Engine：權重 / Status / ranking_validity / tie-breaker）
type: task
priority: P1
status: done
depends_on: [T012a, T006, T008]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T012 - ETF Model（獨立 ETF Engine：權重 / Status / ranking_validity / tie-breaker）

## 目標

依 §30.2–30.9 實作與股票完全獨立的 ETF Engine（`etf/factors/` + `etf/scoring.py` + `etf/ranking.py`），使用 T012a 鎖定的設計契約與資料。核心要求（三份 review 的結論）：

1. 權重規則寫死：`normalized_weight = base_weight / Σ(base_weight of active factors)`，全齊 100%、任何情境合計 = 1（禁止 90 分制）
2. Factor status 分離：NOT_YET_AVAILABLE（剔除+重正規化）≠ DATA_UNAVAILABLE（不得靜默剔除）
3. Informational metrics 與 ranking factor 徹底分離

## 驗收標準

- [x] 權重依 §30.2：distribution 20% / yield_stability 15% / tracking_difference 15% / liquidity 10% / volatility 10% / price_position 10% / nav_discount 10% / underlying_valuation 10%，自 `config`（asset_class: etf, strategy: core）讀取
- [x] 重正規化公式落實：active_factors 各因子記錄 `base_weight` / `normalized_weight` / `score`（§5.7b JSONB）；任何 VALID ranking 權重和 = 1
- [x] Factor status enum（§30.3 / §8.1）：AVAILABLE / NOT_YET_AVAILABLE / DATA_UNAVAILABLE / STALE / INVALID / INSUFFICIENT_HISTORY，missing_factors 記錄原因/狀態
- [x] DATA_UNAVAILABLE（API 掛）不得靜默剔除因子 → ranking_validity 標 DEGRADED；不可產生「今日模型突然換掉」的 ranking（§30.3）
- [x] `ranking_validity`（§30.4）：VALID（≥5 active factors）/ DEGRADED / INVALID（< 下限 → 不產出 Top N）
- [x] deterministic tie-breaker：composite DESC → data_quality DESC → liquidity DESC → symbol ASC（§30.4）
- [x] 歷史不足規則（§30.5）：≥36M FULL / 12-35M DEGRADED / <12M INSUFFICIENT_HISTORY；`minimum_ranking_data_quality` config
- [x] 8 因子 exact formula 依 §30.6（liquidity = 20D turnover 非 volume；volatility = 百分位反轉非 1/vol；yield_stability = 40% CV + 30% YoY + 30% zero-cut）
- [x] nav_discount = (market_price - nav)/nav 參與計分（T012a 提供資料）
- [x] tracking_difference、underlying_valuation 依 T012a 資料等級建構（L2 / L3-derived，標 estimated）
- [x] Informational metrics（underlying PE/PB、expense ratio、fund size）只輸出不計分（§30.7）
- [x] ETF Engine 使用獨立 model version `ETF_ENGINE_V0_3_0`（§30.8），不與股票連動
- [x] 寫入 `etf_factor_scores`（§5.7b）：含 ranking_validity JSONB；ETF 永不寫入 stock.factor_scores
- [x] unit test ≥6 組（§30.10 以下）：全齊→重正規化=1；nav/tracking NOT_YET_AVAILABLE→仍 VALID 和=1；dividend DATA_UNAVAILABLE→DEGRADED 且權重不變；只剩 1 因子→INVALID；同輸入→同分數同排名

## 完成記錄

2026-08-18 完成 T012（ETF Engine, spec §30.2-30.9）：

- **etf/factors/**：`common.py`（FactorStatus enum §30.3、EtfFactorResult、ETF_FACTOR_WEIGHTS §30.2、percentile_rank）+ `formulas.py`（8 因子 exact formula §30.6：distribution cross-sectional percentile / yield_stability 40%CV+30%YoY+30%zero-cut / tracking_difference 越小越好 / liquidity 20D turnover 非 volume / volatility 100-percentile 反轉禁 1/vol / price_position 距 52w/3y high / nav_discount (market-nav)/nav 異常溢價扣分 / underlying_valuation PE 反轉百分位標 estimated）
- **etf/scoring.py**：權重重正規化 `renormalize_weights`（normalized = base/Σactive，任何 VALID 權重和=1 禁 90 分制）、`compute_ranking_validity`（VALID≥5 / DEGRADED（DATA_UNAVAILABLE 不靜默剔除）/ INVALID<5 不產 Top N）、`score_etf`、EtfScoringResult.to_db_row（§5.7b JSONB：active_factors/missing_factors/ranking_validity）
- **etf/ranking.py**：deterministic tie-breaker（composite DESC → data_quality DESC → liquidity DESC → symbol ASC）、歷史不足規則（≥36M FULL / 12-35M DEGRADED / <12M INSUFFICIENT_HISTORY）
- **etf/pipeline.py**：compute_etf_factors（8 因子組合）→ build_scoring → build_etf_rows → write_etf_factor_scores（ON CONFLICT DO UPDATE/DO NOTHING，ETF 永不寫 stock.factor_scores §2.7）
- **config/etf.yaml**：asset_class etf / strategy core / version 0.3.0 / factor_weights §30.2 / minimum_active_factors 5 / history_thresholds（36M/12M）/ minimum_ranking_data_quality.yield_stability 12m / model_version ETF_ENGINE_V0_3_0（§30.8）
- **測試**：tests/unit/test_etf_engine.py（23 tests：全齊重正規化=1、NOT_YET_AVAILABLE 剔除+重正規化仍 VALID、DATA_UNAVAILABLE→DEGRADED 權重不變、只剩 1 因子→INVALID、同輸入同分數同排名確定性、tie-breaker 順序、歷史規則、informational 分離）+ test_etf_formulas.py（22 tests：8 因子公式手算對照，含 NAV=0 防呆/負 PE INVALID/缺源 status）
- 完整套件：421 passed, 29 skipped，ruff clean
- Informational metrics 分離（§30.7）：underlying PE/PB、expense ratio、fund size 只輸出不計分
- ETF 獨立 model version ETF_ENGINE_V0_3_0（§30.8），與股票 STOCK_ENGINE_V0_3_0 分離

## 備註

- 由此任務取代舊版「ETF Model」內容（2026-08-18 依 review-v0.3/v0.4/v0.5 改版）
- 與股票 Engine 的隔離是驗收重點：不共用 factor 模組、不共用 ranking（§2.7 / §30）
- 若因來源尚未接通（如 tracking）導致因子全缺，遵守 DATA_UNAVAILABLE 語意而非默默改模型