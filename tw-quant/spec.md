---
title: tw-quant pipeline — 找買點量化篩選管線（T003 實作規格）
status: active
source_requirement: T003-tw-quant-buypoint.md
created: 2026-08-25
updated: 2026-08-25
assignee: pi with opencode/x-preview-f-free
---

# tw-quant pipeline 規格書

從高獲利 ETF 成分股自動建構股票池 → 100 分量化評分 → 硬淘汰 → S/A/B 訊號分級，
產出 Top 10 量化表與 Top 5 買點清單。

## 非目標（Non-goals）

- 不做盤中即時監控或自動下單
- 不修改現有 `stock_screener.py` / `etf_screener.py`
- 不使用任何「代理指標」替代券商共識預估數據（硬性約束，見 T003 §0）
- 不做回測框架（先求訊號正確，回測另立專案）

## 功能清單

| # | 功能 | 對應任務 |
|---|---|---|
| F1 | ETF 池近三年純價格報酬排名取 Top 5 | T006 |
| F2 | Top 5 成分股合併去重，不足 50 檔自動延伸持股深度 | T006 |
| F3 | MoneyDJ 族群標記，輸出 data/universe.csv（月更新快取） | T007 |
| F4 | 因子①基本面成長（25 分） | T009 |
| F5 | 因子②EPS 預估上修（30 分，真實券商共識） | T008 |
| F6 | 因子③法人/主力籌碼（20 分，TWSE 主路徑＋FinMind 備援） | T009 |
| F7 | 因子④一個月波段動能（15 分） | T010 |
| F8 | 因子⑤股價低位階（10 分） | T010 |
| F9 | 評分加總器：**兩份 100 分量化表**——
     表一：全體 50 檔完整欄位（含進場區/停損/目標價）；
     表二：前 10 名子集 | T011 |
| F9a | 欄位計算稽核文件：每個量化欄位的公式＋子項層級實際數值
     （與表格同一份文件但獨立章節，供稽核與二次利用）| T011、T014 |
| F10 | 硬淘汰規則引擎（套用於 Top10）| T012 |
| F11 | 合理進場區／雙軌停損／1個月目標價／風報比計算 | T013 |
| F12 | S/A/B 訊號分級（含風報比門檻串接） | T013 |
| F13 | FinMind REST 備援通道（rate limit 新通道） | T005 |
| F14 | e2e 全流程執行＋markdown/CSV 報表 | T014 |

## 模組樹

```
tw-quant/
├── pipeline_screener.py        # 進入點（T004）
├── config_pipeline.json        # ETF 候選清單、權重、節流參數（T004）
├── common/
│   ├── finmind.py              # FinMind REST client＋備援邏輯（T005）
│   ├── etf_yahoo.py            # 重用：fetch_top10_holdings
│   ├── yf_utils.py             # 重用：批次下載、get_stock_info
│   ├── twse.py                 # 重用：fund/T86
│   ├── cache.py / rate_limit.py / kd.py / scoring.py  # 重用
├── data/universe.csv           # 股票池快取（T004 schema / T007 產生）
└── screening_results/pipeline_YYYYMMDD.md + .csv   # 輸出（T014）
```

## 流程圖

```
config ETF候選 → [F1]三年報酬Top5 → [F2]成分股去重(≥50)
  → [F3]MoneyDJ族群標記 → universe.csv
  → [F5]EPS預估 [F4]基本面 [F6]籌碼 [F7]動能 [F8]位階
  → [F9]加總＋進場區/停損/目標價計算
  → 表一：50檔全量量化表（純分數排序）
  → 表二：Top10 子集
  → [F10]硬淘汰 → [F12]S/A/B 分級 → Top5
  → [F14]報表輸出
```

## 資料源地圖（2026-08-25 全數實測驗證，詳見 T003 §2）

| 數據 | 主路徑 | 備援 |
|---|---|---|
| EPS 預估／上修／產業對比／目標價 | yfinance（get_earnings_estimate / get_eps_trend / get_eps_revisions / get_growth_estimates / get_analyst_price_targets） | 無（唯一免費源） |
| 三大法人買賣超 | TWSE fund/T86 | FinMind InstitutionalInvestorsBuySell |
| 月營收／財報 | TWSE t187ap14_L / yfinance | FinMind TaiwanStockMonthRevenue / FinancialStatements |
| 日線 K 檔 | yfinance | FinMind TaiwanStockPrice |
| 外資持股變化 | FinMind TaiwanStockShareholding | TWSE MI_Q21 |
| 族群分類 | MoneyDJ ZHA（Big5） | FinMind TaiwanStockIndustryChain（Backer 付費，暫不用） |

## 演算法規格文件索引（任務拆解必讀）

| 演算法檔 | 對應功能 | 對應模組 | 對應任務 |
|---|---|---|---|
| [algs/stage0-universe.md](algs/stage0-universe.md) | F1–F3 | pipeline_screener.py stage0 | T006、T007 |
| [algs/factor-scoring.md](algs/factor-scoring.md) | F4–F9 | pipeline_screener.py factors | T008、T009、T010、T011 |
| [algs/entry-stop-target.md](algs/entry-stop-target.md) | F11 | pipeline_screener.py targets | T013 |
| [algs/signal-grading.md](algs/signal-grading.md) | F10、F12 | pipeline_screener.py grading | T012、T013 |

### 支援性任務（無獨立演算法檔但必要）

| 任務 | 內容 |
|---|---|
| T004 | 管線骨架、config_pipeline.json、universe.csv schema |
| T005 | common/finmind.py REST client、rate_limit finmind 通道 |
| T014 | e2e 整合、markdown/CSV 報表 |

### 條件式任務（鎖在外部條件後）

目前無。
