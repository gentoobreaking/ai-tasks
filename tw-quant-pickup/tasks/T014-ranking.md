---
github_issue: N/A
title: Ranking（Stock Top 30 / ETF Top N / Stability / Entry/Exit）
type: task
priority: P0
status: pending
depends_on: [T012, T013]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T014 - Ranking（Stock Top 30 / ETF Top N / Stability / Entry/Exit）

## 目標

實作 Stock Ranking（Top 30）與 ETF Ranking（Top N）兩條獨立 pipeline（§31 / §32），加上 Ranking Stability（§33）、New Entry Detection（§34）、Exit Detection（§35）。Sprint 4 acceptance：ranking deterministic + reproducible（snapshot_id 重跑不覆蓋）。

## 驗收標準

- [ ] Stock Ranking：composite score 排序，輸出 Top 30，含 score_breakdown（§31 / §5.9）
- [ ] ETF Ranking：獨立 pipeline，Top N，含 active_factors + ranking_validity（§32 / §30.2-30.4）；tie-breaker 依 §30.4（composite → data_quality → liquidity → symbol）
- [ ] Ranking 輸出寫入 rankings 表，以 snapshot_id 關聯（不覆蓋歷史，§45 / §84 #1）
- [ ] Stability（§33）：排名變動記錄（rank delta、correlation），供 report 讀取
- [ ] New Entry（§34）：新進 Top 30 偵測並標記
- [ ] Exit（§35）：跌出 Top 30 偵測並標記
- [ ] 同 snapshot 重跑結果 bit-identical（deterministic + reproducible acceptance）
- [ ] tie-break 規則明確定義（§31 有定義時）——不得靠 dict 序等不穩定排序

## 備註

- New Entry / Exit 需「前一 snapshot」資料：從 analysis_snapshot 讀前一天 frozen 結果比較（勿讀在計算中狀態）