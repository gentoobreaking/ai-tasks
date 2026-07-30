---
github_issue: ""
title: "[Phase 1] 特徵工程 — 條件與指標計算"
type: feature
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-30
updated: 2026-07-30
---

# T002 - 特徵工程

## 目標
基於資料管線產出的原始資料，計算 10–20 個可解釋條件（Feature），涵蓋技術面、籌碼面、市場廣度等面向。

對應規格：`§3.1.4 條件示例`

## 驗收標準
- [x] 指數 vs 月線/季線位置（站上／跌破）— `index_vs_ma20`, `index_vs_ma60`
- [x] 外資近 3 日、近 5 日淨買賣超方向與金額級距 — `foreign_net_3d_sum`, `foreign_5d_trend`
- [x] 量能是否大於 5 日均量（可設定倍數門檻）— `volume_ratio`
- [x] 台積電相對大盤強弱（漲跌幅差）— `rs_2330_vs_index`（2330 5d 報酬 - 大盤 5d 報酬）
- [~] 漲跌家數比例（市場廣度）— `market_breadth`（以外資買超家數比例 proxy，需 TWSE 每日漲跌家數 API 才能精確）
- [x] RSI(14) 計算 — `rsi14`
- [x] 布林通道（上下軌、中軌、目前位置）— `bb_position`
- [x] 均線排列判斷（MA5 / MA20 / MA60 多空排列）— `ma_alignment`
- [x] 本益比河流位置（股價/EPS 歷史分位）— `pe_percentile` + `pe_river`，已回填 252 日歷史 PE
- [x] 股價淨值比河流位置（股價/每股淨值 歷史分位）— `pb_percentile` + `pb_river`，已回填歷史 PB
- [x] 殖利率計算 — `dividend_yield`, `dy_signal`
- [x] 每個特徵輸出可序列化（CSV 或 DB）— JSON 存入 features 表

## 備註
- 具體參數（均量倍數門檻、法人金額級距等）由回測決定，不預先寫死
- 特徵需可版本化管理
