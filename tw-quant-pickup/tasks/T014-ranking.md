---
github_issue: N/A
title: Ranking（Stock Top 30 / ETF Top N / Stability / Entry/Exit）
type: task
priority: P0
status: done
depends_on: [T012, T013]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T014 - Ranking（Stock Top 30 / ETF Top N / Stability / Entry/Exit）

## 目標

實作 Stock Ranking（Top 30）與 ETF Ranking（Top N）兩條獨立 pipeline（§31 / §32），加上 Ranking Stability（§33）、New Entry Detection（§34）、Exit Detection（§35）。Sprint 4 acceptance：ranking deterministic + reproducible（snapshot_id 重跑不覆蓋）。

## 驗收標準

- [x] Stock Ranking：composite score 排序，輸出 Top 30，含 score_breakdown（§31 / §5.9）
- [x] ETF Ranking：獨立 pipeline，Top N，含 active_factors + ranking_validity（§32 / §30.2-30.4）；tie-breaker 依 §30.4（composite → data_quality → liquidity → symbol）
- [x] Ranking 輸出寫入 rankings 表，以 snapshot_id 關聯（不覆蓋歷史，§45 / §84 #1）
- [x] Stability（§33）：排名變動記錄（rank delta、correlation），供 report 讀取
- [x] New Entry（§34）：新進 Top 30 偵測並標記
- [x] Exit（§35）：跌出 Top 30 偵測並標記
- [x] 同 snapshot 重跑結果 bit-identical（deterministic + reproducible acceptance）
- [x] tie-break 規則明確定義（§31 有定義時）——不得靠 dict 序等不穩定排序

## 完成記錄

- 交付：`ranking/`（rank.py / stability.py / pipeline.py / __init__.py）
- 測試：34 個新增（31 unit + 3 e2e live-PG）；完整套件 528 passed, 2 skipped；ruff clean
- Stock Ranking（§31）：adjusted DESC → composite DESC → symbol ASC 確定性排序；Top 30（可設）；每筆含 score_breakdown（factors/risk/composite/adjusted，§63）
- ETF Ranking（§32）：重用 etf.ranking.rank_etfs（§30.4 tie-breaker），Top N（預設 10），ranking_type='ETF'，score_breakdown 含 ranking_validity/active_factors/tie_breakers
- 寫入（§5.9）：rankings 表 ON CONFLICT DO NOTHING — 同 snapshot_id 重跑不覆蓋（e2e 驗證）；JSONB score_breakdown 用 psycopg Jsonb wrapper
- Stability（§33）：rank/score delta + momentum（🔥）+ Spearman rank correlation（共同 symbol）
- New Entry（§34）/ Exit（§35）：NEW_ENTRY INFO / EXIT_TOP30 WARNING → alert_log（§5.10，FK analysis_snapshot 需先 seed snapshot）
- 確定性：rank_stocks/compute_stability 同輸入重跑 bit-identical（unit test）
- e2e：live-PG 寫入→重跑同 snapshot 資料保留、JSONB roundtrip、alert_log FK 寫入

## 備註

- New Entry / Exit 需「前一 snapshot」資料：從 analysis_snapshot 讀前一天 frozen 結果比較（勿讀在計算中狀態）