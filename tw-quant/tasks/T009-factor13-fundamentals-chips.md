---
github_issue: N/A
title: 因子①③ 基本面與籌碼評分（F4/F6）＋FinMind 備援串接
type: feat
priority: high
status: done
depends_on:
- T004-pipeline-skeleton
- T005-finmind-client
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-25
updated: 2026-08-25
---

# T009 - 因子①基本面（25分）與因子③籌碼（20分）

## 目標
依 algs/factor-scoring.md 因子①③實作；TWSE/yfinance 為主路徑，
FinMind 經 `with_fallback()` 為備援。

## 驗收標準
- [x] 因子① 五子項展開（總分 25）：2026 EPS growth（10分制：≥30%→10/15~30%→7/
      5~15%→4/0~5%→2/<0→0）、營收YoY近3月均（6分制）、ROE（3分制：>15%→3/8~15%→2/
      0~8%→1/<0→0）、毛利率趨勢（2分制：近兩季毛利額/營收，上升→2/持平±0.5pct→1/
      下降→0）、FCF 正負（4/0）
- [x] 因子③ 六子項展開：外資5日(6)/外資20日(4)/投信5日(4)/投信20日(2)/
      三大法人同向(2)/外資持股比率20日變化(2)
- [x] 籌碼主路徑 TWSE fund/T86 重用 common/twse.py；
      拋例外或空值時 fallback FinMind InstitutionalInvestorsBuySell 並 log「備援啟用」
- [x] 月營收 YoY 主路徑 TWSE t187ap14_L；備援 FinMind TaiwanStockMonthRevenue
- [x] ROE／毛利率：FinMind FinancialStatements 最近季與前一季
      （毛利率 = 毛利額/營收，取近兩季比較趨勢）；yfinance info returnOnEquity 為次選
- [x] 外資持股變化：FinMind TaiwanStockShareholding 近 20 日比率差 >0 → 2 分
- [x] 快取各 12h；interface：`score_fundamentals(ticker)`、`score_chips(ticker)`
- [x] 單元測試：mock 三路徑（primary OK／primary fail→fallback OK／both fail 全 0 分+N/A 標註）

## 備註
FinMind 免費 600 req/hr：50 檔 × ~4 dataset ≈ 200 呼叫，僅在備援觸發時消耗，安全。
