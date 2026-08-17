---
github_issue: N/A
title: Database Schema 與 Migrations（PostgreSQL，§5 全表）
type: task
priority: P0
status: pending
depends_on: [T001]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T002 - Database Schema 與 Migrations（PostgreSQL，§5 全表）

## 目標

依 §5.1–§5.14 建立全部資料表與可重複執行的 migrations，含 Lineage 四欄（source / data_date / freshness / grade + source_role）與 snapshot_id 關聯設計。產出 ERD 文件（§5.14，交付物之一）。

## 驗收標準

- [ ] 表格齊全：stocks / daily_prices / financials / monthly_revenues / estimates（v0.3 空表）/ dividends / institutional_flow / factor_scores / etf_factor_scores / valuations / rankings / alert_log / universe_flags / universe_snapshot / analysis_snapshot / ai_analysis
- [ ] `financials` PK 含 `revision`（財報更正不覆蓋，§84 #7）
- [ ] `monthly_revenues` 表存在（§5.3a）
- [ ] 原始資料表（daily_prices/financials/monthly_revenues/dividends/institutional_flow）皆含 lineage 三欄 `source` / `data_date` / `freshness`（§5.2–5.6），並支援 `source_role`（CANONICAL / SEMI_OFFICIAL_REALTIME / FALLBACK）
- [ ] `analysis_snapshot` 為版本唯一擁有者（§45）：snapshot_id（格式 `YYYYMMDD-HHMMSS-xxxx`）、model/parameter/data version、hash
- [ ] 結果表（rankings / factor_scores / valuations / alert_log）以 `snapshot_id` 關聯，重跑不覆蓋（§45）
- [ ] `etf_factor_scores` 含 `active_factors` / `missing_factors` JSONB（§5.7b）：active 含 base_weight / normalized_weight / score；missing 含原因/狀態
- [ ] `etf_factor_scores` 含 `ranking_validity` JSONB（VALID / DEGRADED / INVALID + factor 計數，§30.4）與 8 因子欄位（distribution / yield_stability / liquidity / volatility / price_position / tracking_diff / nav_discount / underlying_valuation，§5.7b）
- [ ] `ai_analysis` 含 `status` + `validator_report` JSONB（§5.13、§84 #17）
- [ ] Migrations 可重複執行（idempotent），`make migrate` 可跑
- [ ] ERD（§5.14）文件產出，routing 圖清楚標示 snapshot_id 關聯

## 備註

- PIT 欄位：financials 有 `reported_at`，機構資料有 `observed_at` / `availability_date`（§84 #2）
- estimates 表 v0.3 留空但 schema 存在（§7.1 分析師預估列）
- 大表（daily_prices）以 symbol + trading_day 建 index；snapshot 關聯表以 snapshot_id index