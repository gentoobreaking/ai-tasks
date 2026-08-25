# algs/factor-scoring.md — 100 分評分引擎（F4–F9）

總分 = 因子①(25) + 因子②(30) + 因子③(20) + 因子④(15) + 因子⑤(10)。
所有數據缺失時該子項給 0 分並在輸出標註 `N/A`（不中斷流程）。

## 因子① 基本面成長（25 分）

| 子項 | 數據源 | 計分 |
|---|---|---|
| 2026 EPS 預估成長率 | yfinance earnings_estimate period=0y 的 `growth` | ≥30%→10；15~30%→7；5~15%→4；0~5%→2；<0 或無資料→0 |
| 月營收 YoY（近3月平均） | TWSE t187ap14_L／備援 FinMind TaiwanStockMonthRevenue | >20%→6；10~20%→4；0~10%→2；<0→0 |
| ROE（最近季） | FinMind FinancialStatements／yfinance info `returnOnEquity` | >15%→3；8~15%→2；0~8%→1；<0→0 |
| 毛利率趨勢（最近兩季） | FinMind FinancialStatements：毛利額/營收，近兩季差 | 上升→2；持平（±0.5pct 內）→1；下降→0；資料不足→0 |
| 自由現金流（最近季） | FinMind CashFlowsStatement | 為正→4；為負或無資料→0 |

（10+6+3+2+4 = 25 分）

## 因子② EPS 預估上修（30 分）— 全部真實券商共識，禁代理指標

| 子項 | 數據源 | 計分 |
|---|---|---|
| 1M 上修幅度 | eps_trend period=0y：(current − 30daysAgo) / abs(30daysAgo) | ≥5%→12；2~5%→9；0~2%→6；下修(<0)→0 |
| 3M 上修幅度 | 同上 vs 90daysAgo | ≥10%→8；5~10%→6；0~5%→3；下修→0 |
| 上修/下修動能 | eps_revisions upLast30days vs downLast30days（period=0y） | up≥down 且 up≥5→6；up>down→4；相等→2；down>up→0 |
| 相對產業預估 | growth_estimates period=0y stockTrend vs indexTrend | stock>index→4；否則→0 |

- 分析師覆蓋不足（numberOfAnalysts < 3 或無資料）：因子②全 0 分，標註「無覆蓋」
- 目標價另取 `get_analyst_price_targets()` 存欄位供 T013 使用

## 因子③ 法人/主力籌碼（20 分）

| 子項 | 數據源 | 計分 |
|---|---|---|
| 外資 5 日淨買超 | TWSE fund/T86（主）／FinMind InstitutionalInvestorsBuySell（備援） | 合計>0→6；≤0→0 |
| 外資 20 日淨買超 | 同上 | >0→4；≤0→0 |
| 投信 5 日淨買超 | 同上 | >0→4；≤0→0 |
| 投信 20 日淨買超 | 同上 | >0→2；≤0→0 |
| 三大法人方向一致 | 同上 | 20 日外資與投信同向買超→2；否則→0 |
| 主力/大戶動向 | FinMind TaiwanStockShareholding：外資持股比率 20 日變化 | 增加→2；持平/減少→0 |

## 因子④ 一個月波段動能（15 分）

| 子項 | 數據源 | 計分 |
|---|---|---|
| 股價 > 20MA | 日線（yfinance 主／FinMind TaiwanStockPrice 備援） | 是→3 |
| 20MA 向上彎 | 今日 20MA > 5 日前 20MA | 是→3 |
| 20MA > 60MA 或黃金交叉進行中（近5日內穿越） | 日線 | 是→3 |
| 5 日均量 > 20 日均量 | 成交量 | 是→3 |
| 近 10 日相對大盤轉強 | 個股10日報酬 − 加權指數10日報酬 | >0→3 |

## 因子⑤ 股價低位階（10 分）

| 子項 | 計分 |
|---|---|
| 距 60 日高點回撤 | ≥5%→3；<5%→1 |
| 距 120 日高點回撤 | ≥8%→3；<8%→1 |
| 52 週位置 | 收盤位於 52W 高低區間下半部→2；上半部→0 |
| 止跌確認 | 近 5 日出現最低價且其後任一日收紅站上 5MA→2；否則→0 |

## 加總器（F9）——產出兩份 100 分量化表

1. 對 universe.csv 每檔計算五因子＋進場區/停損/目標價/R/R（公式見 entry-stop-target.md，
   純確定性計算，全體 50 檔都算）
2. **表一（全量量化表）**：50 檔全體、純依 total 降序，每檔完整欄位：
   `ticker｜name｜sector｜total｜2026EPS｜2027EPS｜上修幅度(1M/3M)｜近20日法人買賣超｜
   主力買賣超(=近20日投信+外資合計淨買超張數)｜距前高%｜20MA｜60MA｜目前股價｜
   合理進場區｜停損｜1個月目標價｜R/R`
3. **表二（前 10 量化表）**：表一的 Top10 子集（同欄位同排序）
4. 明細 CSV 同步輸出兩份；同分 tie-break：先 f2 降序 → 再 count（universe）降序
