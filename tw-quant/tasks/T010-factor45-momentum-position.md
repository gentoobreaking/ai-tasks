---
github_issue: N/A
title: 因子④⑤ 波段動能與低位階評分（F7/F8）
type: feat
priority: medium
status: done
depends_on:
- T004-pipeline-skeleton
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-25
updated: 2026-08-25
---

# T010 - 因子④動能（15分）與因子⑤位階（10分）

## 目標
依 algs/factor-scoring.md 因子④⑤實作，日線數據 yfinance 主路徑、
FinMind TaiwanStockPrice 備援（經 T005 with_fallback）。

## 驗收標準
- [x] 因子④ 五子項各 3 分：現價>20MA／20MA 今>5日前／20MA>60MA 或近5日黃金交叉／
      5日均量>20日均量／個股10日報酬−大盤10日報酬>0
- [x] 因子⑤ 展開：距60日高回撤≥5%→3(<5%→1)；距120日高回撤≥8%→3(<8%→1)；
      收盤位於52W區間下半部→2；近5日低點後任一日收紅站上5MA→2
- [x] 大盤基準：^TWII（加權指數）同區間日線
- [x] interface：`score_momentum(ticker) -> {f4:int, ma20:float, ma60:float,
      dist_60d_high:float}`、`score_position(ticker) -> {f5:int}`
- [x] MA 自算（pandas rolling），不依賴 yfinance 內建均線欄位
- [x] 快取日線 12h；單元測試：合成 120 根 K 線序列驗證黃金交叉偵測與回撤百分比計算
      （例：最高100、現價90 → 回撤10%）

## 備註
RSI14 一併在此模組計算輸出（供 T012 H5 使用）：`rsi14` 欄位。
