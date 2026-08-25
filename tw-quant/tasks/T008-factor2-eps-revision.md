---
github_issue: N/A
title: 因子② EPS 預估上修評分（F5）——真實券商共識
type: feat
priority: high
status: done
depends_on:
- T004-pipeline-skeleton
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-25
updated: 2026-08-25
---

# T008 - 因子②：yfinance EPS 預估與上修（30 分）

## 目標
依 algs/factor-scoring.md 因子②，實作四子項計分並快取。⛔ 禁止任何代理指標模擬。

## 驗收標準
- [x] interface：`score_eps_revision(ticker) -> {f2:int(0-30), eps_2026:float|None,
      eps_2027:float|None, rev_1m:float|None, rev_3m:float|None, target_mean:float|None,
      analysts:int, note:str}`
- [x] 四子項計分完全展開實作：
      1M 上修幅度 12 分制（≥5%→12/2~5%→9/0~2%→6/<0→0）
      3M 上修幅度 8 分制（≥10%→8/5~10%→6/0~5%→3/<0→0）
      revisions 動能 6 分制（up≥down且up≥5→6/up>down→4/相等→2/down>up→0）
      相對產業 4 分制（stockTrend>indexTrend→4）
- [x] 數據源固定為 yfinance：get_earnings_estimate / get_eps_trend / get_eps_revisions /
      get_growth_estimates / get_analyst_price_targets；不新增其他來源
- [x] numberOfAnalysts < 3 或無資料 → 全 0 分、note="無覆蓋"、eps/target 欄位 None
- [x] 快取 24h（cache key `pipeline_eps_{ticker}`）；yfinance 呼叫走既有 rate limiter 節奏
- [x] 單元測試：以台積電實測值建 mock（current=107.64, 30daysAgo=106.65,
      90daysAgo=97.999）斷言 rev_1m≈+0.93%、rev_3m≈+9.84%、f2 落在正確分組

## 備註
實測 2330.TW：2026EPS=107.64（34 位）、1M 上修 28 次/下修 0 次。
Yahoo 易 429：批次間隔 ≥1s，失敗重試 ≤2 次，仍失敗記 N/A 續行。
