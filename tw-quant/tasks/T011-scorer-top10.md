---
github_issue: N/A
title: 評分加總器——100分量化表輸出 Top50→Top10（F9）
type: feat
priority: high
status: done
depends_on:
- T008-factor2-eps-revision
- T009-factor13-fundamentals-chips
- T010-factor45-momentum-position
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-25
updated: 2026-08-25
---

# T011 - 評分加總器與量化表

## 目標
串接四個因子模組＋進場區/停損/目標價計算，產出**兩份 100 分量化表**。

## 驗收標準
- [x] `run_scoring(universe: DataFrame) -> DataFrame`：對每檔呼叫四因子、
      total = f1+f2+f3+f4+f5（上限 100）
- [x] **進場區/停損/目標價/R/R 對全體 50 檔都計算**（純確定性公式，見 entry-stop-target.md），
      不只算 Top10
- [x] 表一（全量量化表）：50 檔全體、純依 total 降序，欄位：
      ticker｜name｜sector｜total｜2026EPS｜2027EPS｜上修幅度(1M/3M)｜近20日法人買賣超｜
      主力買賣超（=近20日投信+外資合計淨買超張數）｜距前高%｜20MA｜60MA｜目前股價｜
      合理進場區｜停損｜1個月目標價｜R/R
- [x] 表二（前10量化表）：表一的 Top10 子集，同欄位同排序，另輸出 f1~f5 分項
- [x] 兩份表各自輸出 Markdown＋CSV（檔名含 full / top10 區別）
- [x] **稽核用明細 CSV**（pipeline_YYYYMMDD_detail.csv）：子項層級數值與得分逐欄展開，
      至少含：rev_1m_pct, rev_3m_pct, up30d, down30d, eps_growth_2026,
      rev_yoy_3m_avg, roe, gross_margin_q, gross_margin_delta, fcf, 
      外資5日/20日, 投信5日/20日, 主力買賣超(投信+外資20日合計), 外資持股變化,
      f4 五子項布林值, 距60/120日高%, 52w位置, rsi14, 及每個子項的得分
- [x] 同分 tie-break：先 f2 降序 → 再 count（universe）降序
- [x] 單元測試：合成三檔已知分數驗證加總與排序；N/A 子項不影響其他因子計算；
      斷言表二列數 ≤10 且為表一子集

## 備註
批次節奏：yfinance 預估類逐檔間隔 ≥1s；50 檔全跑約 5~10 分鐘屬正常，
進度以 logger 每 10 檔回報。
