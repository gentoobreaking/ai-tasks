> **Quant Engine 決定「數字與排名」；AI 只負責「解釋」。AI 不得修改估值、買點、分數與排名。**

另外，v0.2 會把你之前關注的 **Buffett 量化選股、ETF、回測、Artifact Locking、每日自動報表** 一起納入。

# Taiwan Equity Quantitative Screening & Valuation Platform

## Implementation Specification v0.2

**Document Status:** Development Ready
**Version:** v0.2
**Target:** Taiwan Stock Market
**Primary Language:** Python 3.12+
**Database:** PostgreSQL 16+
**Deployment:** Docker Compose / Kubernetes
**Primary Output:** Daily Top 30 Undervalued Stocks + Top 10 ETFs
**AI Role:** Analyst / Explanation Layer only

---

# 1. Executive Summary

本系統的目標是建立一套每日自動執行的台股量化分析平台。

系統每天自動：

1. 收集台股市場資料
2. 收集財務資料
3. 清洗及驗證資料
4. 計算估值指標
5. 計算基本面品質
6. 計算成長性
7. 計算股息能力
8. 計算價格相對位置
9. 計算 Buffett Score
10. 計算 Fair Value
11. 計算三階段 Buy Zone
12. 產生股票 Composite Score
13. 產生 Top 30
14. 產生 ETF Ranking
15. 執行歷史回測
16. 產生風險分析
17. 呼叫 LLM 產生文字解讀
18. 產生 Markdown / HTML / JSON / CSV 報表
19. 判斷是否觸發價格警報

系統不得依賴 LLM 決定核心金融數值。

---

# 2. Design Principles

## 2.1 Deterministic First

以下項目必須由程式計算：

* PE
* PB
* ROE
* EPS Growth
* Revenue Growth
* Dividend Yield
* Historical Percentile
* Fair Value
* Buy Zone
* Factor Score
* Composite Score
* Ranking

LLM 不得修改上述結果。

---

# 2.2 Explainability

每一個排名必須可以回答：

> 為什麼這檔股票排名第 3？

系統必須提供：

```text
Valuation Score
Growth Score
Quality Score
Dividend Score
Price Position Score
Buffett Score
Momentum Score
Risk Score
```

並且所有分數都可以追溯到原始資料。

---

# 2.3 Reproducibility

同一天、相同資料版本：

```text
Input Dataset
      +
Model Version
      +
Parameter Version
      ↓
Identical Result
```

必須得到完全一致的結果。

---

# 2.4 AI Isolation

LLM 只能讀取：

```text
Immutable Quant Result
```

不能直接修改：

```text
Fair Value
Score
Ranking
Buy Zone
```

---

# 3. High-Level Architecture

```text
                       ┌──────────────────────┐
                       │ Taiwan Market Data   │
                       │ 財報 / 股價 / 股利   │
                       └──────────┬───────────┘
                                  │
                                  ▼
                       ┌──────────────────────┐
                       │ Data Collector       │
                       └──────────┬───────────┘
                                  │
                                  ▼
                       ┌──────────────────────┐
                       │ Data Validation      │
                       └──────────┬───────────┘
                                  │
                                  ▼
                       ┌──────────────────────┐
                       │ PostgreSQL           │
                       │ Raw + Normalized     │
                       └──────────┬───────────┘
                                  │
             ┌────────────────────┼────────────────────┐
             ▼                    ▼                    ▼
       ┌───────────┐        ┌───────────┐       ┌───────────┐
       │ Valuation │        │ Fundamental│       │ Technical │
       │ Engine    │        │ Engine     │       │ Engine    │
       └─────┬─────┘        └─────┬─────┘       └─────┬─────┘
             │                    │                    │
             └────────────────────┼────────────────────┘
                                  ▼
                       ┌──────────────────────┐
                       │ Factor Score Engine  │
                       └──────────┬───────────┘
                                  │
                                  ▼
                       ┌──────────────────────┐
                       │ Fair Value Engine    │
                       └──────────┬───────────┘
                                  │
                                  ▼
                       ┌──────────────────────┐
                       │ Ranking Engine       │
                       └──────────┬───────────┘
                                  │
                     ┌────────────┴────────────┐
                     ▼                         ▼
             ┌──────────────┐          ┌──────────────┐
             │ Backtest      │          │ Alert Engine │
             └──────────────┘          └──────────────┘
                     │
                     ▼
             ┌──────────────┐
             │ AI Analyst   │
             └──────┬───────┘
                    │
                    ▼
             ┌──────────────┐
             │ Report       │
             │ Generator    │
             └──────────────┘
```

---

# 4. Repository Structure

使用 Python monorepo。

```text
tw-equity-quant/
│
├── pyproject.toml
├── README.md
├── Makefile
├── Dockerfile
├── docker-compose.yml
├── .env.example
│
├── config/
│   ├── scoring.yaml
│   ├── valuation.yaml
│   ├── universe.yaml
│   ├── schedule.yaml
│   └── risk.yaml
│
├── src/
│   └── twquant/
│       │
│       ├── cli/
│       │   └── main.py
│       │
│       ├── collectors/
│       │   ├── market.py
│       │   ├── fundamental.py
│       │   ├── dividend.py
│       │   ├── institutional.py
│       │   └── universe.py
│       │
│       ├── normalization/
│       │   ├── market.py
│       │   ├── fundamental.py
│       │   └── validation.py
│       │
│       ├── factors/
│       │   ├── valuation.py
│       │   ├── growth.py
│       │   ├── quality.py
│       │   ├── dividend.py
│       │   ├── price_position.py
│       │   ├── momentum.py
│       │   ├── institutional.py
│       │   └── buffett.py
│       │
│       ├── valuation/
│       │   ├── pe.py
│       │   ├── pb.py
│       │   ├── dividend.py
│       │   ├── dcf.py
│       │   └── engine.py
│       │
│       ├── ranking/
│       │   ├── stock.py
│       │   ├── etf.py
│       │   └── composite.py
│       │
│       ├── backtest/
│       │   ├── engine.py
│       │   ├── portfolio.py
│       │   ├── metrics.py
│       │   └── benchmark.py
│       │
│       ├── ai/
│       │   ├── analyst.py
│       │   ├── prompts.py
│       │   ├── schema.py
│       │   └── validator.py
│       │
│       ├── reports/
│       │   ├── daily.py
│       │   ├── markdown.py
│       │   ├── html.py
│       │   └── csv.py
│       │
│       ├── alerts/
│       │   ├── price.py
│       │   └── ranking.py
│       │
│       ├── models/
│       │   ├── stock.py
│       │   ├── financial.py
│       │   ├── valuation.py
│       │   └── ranking.py
│       │
│       └── db/
│           ├── models.py
│           ├── repository.py
│           └── migrations/
│
└── tests/
    ├── unit/
    ├── integration/
    ├── regression/
    └── backtest/
```

---

# 5. Database Design

PostgreSQL。

---

## 5.1 stocks

```sql
CREATE TABLE stocks (
    symbol VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    market VARCHAR(20) NOT NULL,
    sector VARCHAR(100),
    industry VARCHAR(100),
    security_type VARCHAR(20) NOT NULL,
    listed_date DATE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

---

# 5.2 daily_prices

```sql
CREATE TABLE daily_prices (
    symbol VARCHAR(10) NOT NULL,
    trade_date DATE NOT NULL,
    open NUMERIC(14,4),
    high NUMERIC(14,4),
    low NUMERIC(14,4),
    close NUMERIC(14,4),
    adjusted_close NUMERIC(14,4),
    volume BIGINT,
    turnover NUMERIC(20,2),

    PRIMARY KEY(symbol, trade_date)
);
```

---

# 5.3 financials

```sql
CREATE TABLE financials (
    symbol VARCHAR(10) NOT NULL,
    fiscal_year INTEGER NOT NULL,
    fiscal_quarter INTEGER NOT NULL,

    revenue NUMERIC(20,4),
    gross_profit NUMERIC(20,4),
    operating_income NUMERIC(20,4),
    net_income NUMERIC(20,4),

    eps NUMERIC(14,4),
    book_value_per_share NUMERIC(14,4),

    total_assets NUMERIC(20,4),
    total_liabilities NUMERIC(20,4),
    equity NUMERIC(20,4),

    roe NUMERIC(10,4),
    roa NUMERIC(10,4),

    source VARCHAR(100),
    source_timestamp TIMESTAMP,

    PRIMARY KEY(symbol, fiscal_year, fiscal_quarter)
);
```

---

# 5.4 estimates

分析師預估與公司指引必須和歷史實際財報分離。

```sql
CREATE TABLE earnings_estimates (
    symbol VARCHAR(10) NOT NULL,
    estimate_date DATE NOT NULL,
    fiscal_year INTEGER NOT NULL,

    eps_estimate NUMERIC(14,4),
    revenue_estimate NUMERIC(20,4),

    analyst_count INTEGER,
    low_estimate NUMERIC(14,4),
    high_estimate NUMERIC(14,4),

    source VARCHAR(100),

    PRIMARY KEY(symbol, estimate_date, fiscal_year)
);
```

---

# 5.5 dividends

```sql
CREATE TABLE dividends (
    symbol VARCHAR(10) NOT NULL,
    fiscal_year INTEGER NOT NULL,

    cash_dividend NUMERIC(14,4),
    stock_dividend NUMERIC(14,4),
    payout_ratio NUMERIC(10,4),

    ex_date DATE,
    payment_date DATE,

    PRIMARY KEY(symbol, fiscal_year)
);
```

---

# 5.6 institutional_flow

```sql
CREATE TABLE institutional_flow (
    symbol VARCHAR(10) NOT NULL,
    trade_date DATE NOT NULL,

    foreign_net BIGINT,
    investment_trust_net BIGINT,
    dealer_net BIGINT,
    total_net BIGINT,

    PRIMARY KEY(symbol, trade_date)
);
```

---

# 5.7 factor_scores

```sql
CREATE TABLE factor_scores (
    symbol VARCHAR(10) NOT NULL,
    score_date DATE NOT NULL,

    valuation_score NUMERIC(8,4),
    growth_score NUMERIC(8,4),
    quality_score NUMERIC(8,4),
    dividend_score NUMERIC(8,4),
    price_position_score NUMERIC(8,4),
    momentum_score NUMERIC(8,4),
    institutional_score NUMERIC(8,4),
    buffett_score NUMERIC(8,4),

    risk_score NUMERIC(8,4),

    composite_score NUMERIC(8,4),

    model_version VARCHAR(50) NOT NULL,

    PRIMARY KEY(symbol, score_date, model_version)
);
```

---

# 5.8 valuations

```sql
CREATE TABLE valuations (
    symbol VARCHAR(10) NOT NULL,
    valuation_date DATE NOT NULL,

    pe_fair_value NUMERIC(14,4),
    pb_fair_value NUMERIC(14,4),
    dividend_fair_value NUMERIC(14,4),
    dcf_fair_value NUMERIC(14,4),

    fair_value NUMERIC(14,4),

    buy_zone_1 NUMERIC(14,4),
    buy_zone_2 NUMERIC(14,4),
    buy_zone_3 NUMERIC(14,4),

    current_price NUMERIC(14,4),

    model_version VARCHAR(50) NOT NULL,

    PRIMARY KEY(symbol, valuation_date, model_version)
);
```

---

# 5.9 rankings

```sql
CREATE TABLE rankings (
    ranking_date DATE NOT NULL,
    symbol VARCHAR(10) NOT NULL,

    rank INTEGER NOT NULL,
    score NUMERIC(8,4),

    fair_value NUMERIC(14,4),
    current_price NUMERIC(14,4),

    buy_zone_1 NUMERIC(14,4),
    buy_zone_2 NUMERIC(14,4),
    buy_zone_3 NUMERIC(14,4),

    ranking_type VARCHAR(20) NOT NULL,

    model_version VARCHAR(50) NOT NULL,

    PRIMARY KEY(
        ranking_date,
        symbol,
        ranking_type,
        model_version
    )
);
```

---

# 6. Data Source Abstraction

Data Collector 不得直接綁死單一供應商。

建立：

```python
class MarketDataProvider(Protocol):

    def get_daily_prices(
        self,
        symbols: list[str],
        start_date: date,
        end_date: date
    ) -> list[DailyPrice]:
        ...
```

其他 interface：

```python
class FundamentalDataProvider:
    ...

class DividendDataProvider:
    ...

class InstitutionalDataProvider:
    ...

class EstimateProvider:
    ...
```

---

# 7. Data Source Priority

建議採：

```text
Primary Source
      ↓
Secondary Source
      ↓
Cached Historical Data
      ↓
INVALID
```

絕對禁止：

```text
API failed
   ↓
LLM guess
```

---

# 8. Data Quality Rules

每筆資料至少檢查：

### Price

```text
close > 0
high >= low
high >= close
low <= close
volume >= 0
```

### EPS

```text
EPS must be numeric
EPS cannot silently change historical values
```

### Financial Statement

必須保存：

```text
reported_at
period_end
source
```

避免 Look-Ahead Bias。

---

# 9. Look-Ahead Bias Prevention

這是回測最重要的規則之一。

例如：

```text
2025 Q4 財報
公布日期 = 2026-03-15
```

則：

```text
2026-01-01
```

回測不得使用該財報。

只能在：

```text
2026-03-15
```

之後使用。

資料模型必須區分：

```text
period_end
reported_at
```

---

# 10. Universe Filter

股票必須滿足：

```text
market IN {TWSE, TPEx}
active = true
security_type = STOCK
```

預設排除：

* ETF
* ETN
* 權證
* 特別股
* 處置股
* 全額交割股
* 長期停止交易
* 財務資料不足

最低流動性：

```yaml
min_market_cap: configurable
min_avg_turnover_20d: configurable
```

不要硬編碼。

---

# 11. Factor System

每個 Factor 輸入：

```python
FactorInput
```

輸出：

```python
FactorResult(
    symbol,
    score,
    raw_metrics,
    explanation,
    warnings
)
```

---

# 12. Valuation Score

初版權重：

```yaml
valuation:
  weight: 30

  pe:
    weight: 40

  pb:
    weight: 25

  dividend_yield:
    weight: 20

  ev_ebitda:
    weight: 15
```

但不同產業使用不同模型。

---

# 13. PE Model

基本公式：

```text
Fair PE Value
=
Forward EPS × Normalized PE
```

Normalized PE：

優先順序：

```text
5Y historical median
→
3Y historical median
→
sector median
→
configured default
```

必須保存 fallback reason。

---

# 14. PB Model

```text
Fair Value
=
Forward BVPS × Normalized PB
```

金融股提高 PB 權重。

---

# 15. Dividend Model

```text
Fair Value
=
Expected Dividend / Target Yield
```

Target Yield 可取：

```text
5Y historical median yield
```

並加入安全係數。

---

# 16. DCF Model

v0.2 支援簡化 DCF。

```text
FCF
Revenue Growth
Operating Margin
Tax Rate
WACC
Terminal Growth
```

預設：

```yaml
forecast_years: 5
terminal_growth: 0.02
```

WACC 必須可配置。

DCF 在資料不足時不得硬算。

---

# 17. Sector Valuation Profiles

建立：

```yaml
technology:
  pe_weight: 0.50
  pb_weight: 0.10
  dividend_weight: 0.10
  dcf_weight: 0.30

financial:
  pe_weight: 0.30
  pb_weight: 0.40
  dividend_weight: 0.20
  dcf_weight: 0.10

industrial:
  pe_weight: 0.40
  pb_weight: 0.20
  dividend_weight: 0.20
  dcf_weight: 0.20
```

其餘產業使用 default profile。

---

# 18. Growth Score

權重：

```yaml
growth:
  revenue_yoy: 25
  revenue_cagr_3y: 20
  eps_yoy: 30
  eps_cagr_3y: 25
```

EPS 成長必須處理：

```text
負 EPS
一次性收益
低基期
```

避免：

```text
EPS -1 → EPS +1
```

被錯誤判定為 +200% 高成長。

---

# 19. Quality Score

```yaml
quality:
  roe: 30
  roa: 15
  operating_margin: 20
  fcf: 20
  debt_ratio: 15
```

ROE 需使用 rolling / normalized value。

避免單季異常造成誤判。

---

# 20. Dividend Score

```yaml
dividend:
  yield: 40
  dividend_growth: 20
  payout_stability: 20
  cashflow_coverage: 20
```

不能只用殖利率排名。

例如：

```text
股價暴跌
→ 殖利率暴增
```

不應自動判定為高股息優質股。

---

# 21. Price Position Score

計算：

```text
distance_from_52w_high
distance_from_3y_high
distance_from_5y_high
price_to_ma60
price_to_ma200
```

核心概念：

```text
跌幅越大
≠
越值得買
```

必須與 Quality / Growth 聯合評分。

---

# 22. Momentum Score

目的不是追強勢股，而是避免接刀。

計算：

```text
1M Return
3M Return
6M Return
RSI
Price / MA200
```

如果：

```text
Value Score 高
但
Momentum 崩壞
```

則增加 Risk Flag。

---

# 23. Institutional Score

考慮：

```text
Foreign 5D
Foreign 20D
Investment Trust 5D
Investment Trust 20D
```

不是單純：

```text
今天外資買超
→ 高分
```

而是看 persistence。

---

# 24. Buffett Score

v0.2 正式加入 Buffett Factor。

```yaml
buffett:
  roe: 25
  earnings_stability: 20
  revenue_growth: 15
  debt: 15
  free_cash_flow: 15
  valuation: 10
```

核心理念：

```text
High Quality
+
Predictable Earnings
+
Strong Cash Flow
+
Reasonable Price
```

不是直接宣稱：

> 「這就是巴菲特選股。」

而是：

> Buffett-inspired quantitative factor model

---

# 25. Composite Score

第一版：

```text
Valuation       25%
Growth          15%
Quality         15%
Dividend        10%
Price Position  10%
Buffett         15%
Momentum         5%
Institutional    5%
```

總分：

```text
100
```

---

# 26. Risk Adjustment

另外計算：

```text
Risk Score = 0~100
```

風險來源：

* 高負債
* EPS volatility
* Revenue volatility
* 股價 volatility
* 流動性
* 估值極端
* 財報異常
* 產業循環
* 資料不足

最後：

```text
Adjusted Score
=
Composite Score × Risk Multiplier
```

例如：

```text
Risk < 20
Multiplier = 1.00

Risk 20~40
Multiplier = 0.95

Risk 40~60
Multiplier = 0.85

Risk > 60
Multiplier = 0.70
```

---

# 27. Fair Value

Fair Value 必須產生：

```text
Conservative Value
Base Value
Optimistic Value
```

例如：

```text
2317 鴻海

Bear      220
Base      280
Bull      320
```

而不是只有一個：

```text
Fair Value = 280
```

---

# 28. Buy Zones

定義：

```text
Buy Zone 1 = Base FV × 0.90
Buy Zone 2 = Base FV × 0.80
Buy Zone 3 = Base FV × 0.70
```

另外加入 Bear Value。

例如：

```text
Bear = 220
Base = 280

Zone 1 = 252
Zone 2 = 224
Zone 3 = 196
```

---

# 29. Buy Signal

```text
Current > Zone1
    → WATCH

Zone2 < Current <= Zone1
    → BUY_ZONE_1

Zone3 < Current <= Zone2
    → BUY_ZONE_2

Current <= Zone3
    → BUY_ZONE_3

Current < Bear Value
    → INVESTIGATE
```

「BUY」不是實際下單指令，而是系統估值狀態。

---

# 30. ETF Model

ETF 不使用股票模型。

ETF Factor：

```yaml
etf:
  valuation: 20
  dividend: 25
  historical_discount: 20
  volatility: 10
  liquidity: 10
  tracking_quality: 10
  concentration_risk: 5
```

另外計算：

```text
NAV Premium/Discount
Expense Ratio
Dividend Stability
Concentration
Underlying PE
Underlying PB
```

---

# 31. Stock Ranking

輸出：

```text
TOP 30 STOCK
```

每一筆：

```json
{
  "rank": 1,
  "symbol": "2317",
  "name": "鴻海",
  "price": 250,
  "score": 87.4,
  "fair_value": 280,
  "buy_zone_1": 252,
  "buy_zone_2": 224,
  "buy_zone_3": 196
}
```

---

# 32. ETF Ranking

另外：

```text
TOP 10 ETF
```

不得與股票混合。

---

# 33. Ranking Stability

每天比較：

```text
today_rank
yesterday_rank
7d_rank
30d_rank
```

產生：

```text
Rank Change
Score Change
```

例如：

```text
2317
Rank: 8 → 2
Score: 78.2 → 87.4
```

標記：

```text
🔥 Momentum of Ranking
```

---

# 34. New Entry Detection

如果：

```text
Yesterday Rank > 30
Today Rank <= 30
```

則：

```text
NEW_ENTRY = true
```

---

# 35. Exit Detection

如果：

```text
Yesterday Rank <= 30
Today Rank > 30
```

則：

```text
EXIT_TOP30 = true
```

---

# 36. Price Alert

系統每天檢查：

```text
Current Price <= Buy Zone 1
Current Price <= Buy Zone 2
Current Price <= Buy Zone 3
```

並產生：

```json
{
  "symbol": "2317",
  "alert": "BUY_ZONE_1_TRIGGERED",
  "price": 250,
  "threshold": 252
}
```

---

# 37. Backtesting Engine

Backtest 必須支援：

```text
1M
3M
6M
1Y
3Y
5Y
```

Strategy：

```text
At each rebalance date:
    calculate ranking
    select Top N
    buy next available session
```

禁止使用當日收盤價直接假設可以成交於該收盤價。

---

# 38. Backtest Portfolio

支援：

```yaml
strategy:
  top_n: 10
  rebalance: monthly
  weighting: equal
  transaction_cost: configurable
  slippage: configurable
```

之後可增加：

```text
Top 5
Top 10
Top 20
Top 30
```

---

# 39. Benchmark

至少比較：

```text
TAIEX
0050
006208
0056
00878
```

輸出：

```text
CAGR
Annualized Return
Volatility
Sharpe
Sortino
Max Drawdown
Calmar
Win Rate
Turnover
```

---

# 40. Walk-Forward Validation

不能只做：

```text
2020~2025 training
2025~2026 test
```

應採 rolling / walk-forward：

```text
Train 2018~2021
Test 2022

Train 2019~2022
Test 2023

Train 2020~2023
Test 2024

Train 2021~2024
Test 2025
```

避免模型參數過度 fitting。

---

# 41. AI Analyst Architecture

AI 接收：

```json
{
  "market_summary": {},
  "stock": {},
  "factor_scores": {},
  "valuation": {},
  "risks": {},
  "historical_changes": {}
}
```

AI 不接：

```text
Database write access
Ranking write access
Valuation write access
```

---

# 42. AI Output Schema

LLM 必須輸出 JSON：

```json
{
  "summary": "",
  "strengths": [],
  "risks": [],
  "valuation_comment": "",
  "price_comment": "",
  "fundamental_comment": "",
  "change_from_yesterday": "",
  "confidence": 0.0
}
```

Schema validation 失敗：

```text
REJECT
```

不得直接寫入正式報表。

---

# 43. AI Prompt Contract

System Prompt：

```text
You are a financial analysis assistant.

You MUST NOT modify numerical values provided by the quantitative engine.

You MUST NOT invent financial data.

You MUST only explain the supplied data.

If required data is missing, explicitly state that the data is unavailable.

Do not provide guaranteed investment outcomes.

Do not fabricate analyst estimates.

Do not change ranking, fair value, buy zones, or scores.
```

---

# 44. AI Hallucination Detection

AI 輸出後再跑：

```text
AI Output Validator
```

檢查：

```text
AI mentioned price
vs
actual price

AI mentioned EPS
vs
actual EPS

AI mentioned ranking
vs
actual ranking
```

如果不一致：

```text
AI_REPORT_STATUS = INVALID
```

重新生成或移除該段。

---

# 45. Artifact Locking

建立：

```text
quant_result.json
```

內容：

```json
{
  "model_version": "v0.2.0",
  "data_version": "2026-08-18",
  "hash": "...",
  "immutable": true
}
```

AI Analyst 只能 read。

架構：

```text
Quant Engine
     │
     ▼
Immutable Artifact
     │
     ├── Report Generator
     └── AI Analyst
```

AI 不具有：

```text
write quant result
delete quant result
modify valuation
modify ranking
```

權限。

---

# 46. Model Versioning

所有結果保存：

```text
model_version
parameter_version
data_version
```

例如：

```text
model = v0.2.0
parameter = p20260818
data = d20260818
```

如果修改公式：

```text
v0.2.0
→
v0.2.1
```

不能覆蓋歷史結果。

---

# 47. Configuration

所有權重放在 YAML。

例如：

```yaml
model_version: "0.2.0"

weights:
  valuation: 0.25
  growth: 0.15
  quality: 0.15
  dividend: 0.10
  price_position: 0.10
  buffett: 0.15
  momentum: 0.05
  institutional: 0.05
```

禁止在 Python code 裡散落 magic numbers。

---

# 48. CLI

系統必須提供 CLI：

```bash
twquant collect
twquant validate
twquant calculate
twquant rank
twquant backtest
twquant report
twquant alert
twquant daily
```

完整流程：

```bash
twquant daily
```

執行：

```text
collect
→ validate
→ calculate
→ valuation
→ ranking
→ alert
→ AI analysis
→ report
```

任何 critical stage failure：

```text
Pipeline FAILED
```

不得產生假成功報告。

---

# 49. Daily Pipeline

建議：

```text
18:00
    Collect Market Data

19:00
    Fundamental Update

20:00
    Validation

20:30
    Factor Calculation

21:00
    Valuation

21:15
    Ranking

21:20
    Alert

21:30
    AI Analyst

21:40
    Report
```

實際時間必須由市場資料取得完成狀態決定，不應硬假設 API 在某時間一定完成。

---

# 50. Report Format

每天：

```text
reports/
2026-08-18/
├── daily.md
├── daily.html
├── stocks.csv
├── etfs.csv
├── alerts.json
├── quant_result.json
└── metadata.json
```

---

# 51. Daily Report

內容：

```text
Market Overview

TOP 30 Stocks

TOP 10 ETFs

Top 5 Buy Opportunities

New Entries

Largest Rank Improvements

Largest Rank Declines

Buy Zone Triggered

Risk Alerts

AI Analyst Summary

Model Metadata
```

---

# 52. Example Ranking

```text
Rank Symbol Name      Price FV   Z1   Z2   Z3   Score
-------------------------------------------------------
1    2317   鴻海      250   280  252  224  196  87.4
2    2357   華碩      620   690  621  552  483  85.9
3    2880   華南金     43    48   43   38   34   83.7
4    006208 ETF        ...
```

ETF 不進 Stock Ranking。

---

# 53. API

v0.2 建議提供 FastAPI。

```text
GET /api/v1/stocks
GET /api/v1/stocks/{symbol}
GET /api/v1/ranking/stocks
GET /api/v1/ranking/etfs
GET /api/v1/valuation/{symbol}
GET /api/v1/alerts
GET /api/v1/reports/{date}
GET /api/v1/backtest/{strategy}
```

---

# 54. Health Check

```text
GET /health
```

輸出：

```json
{
  "status": "ok",
  "database": "ok",
  "data_provider": "ok",
  "last_market_date": "2026-08-18",
  "last_ranking_date": "2026-08-18"
}
```

---

# 55. Monitoring

系統必須記錄：

```text
collector_success
collector_failure
data_missing
ranking_duration
valuation_duration
ai_duration
report_duration
```

Prometheus metrics：

```text
twquant_pipeline_success
twquant_pipeline_duration_seconds
twquant_data_quality_errors
twquant_ranking_count
twquant_ai_failures
twquant_alert_count
```

---

# 56. Docker Compose

至少：

```text
postgres
app
scheduler
```

AI 若使用外部 API：

```text
app
 └── HTTPS → LLM Provider
```

不需要在第一版自己架 LLM。

---

# 57. Kubernetes Deployment

正式環境：

```text
Namespace
  twquant

Deployment
  api

CronJob
  daily-pipeline

Deployment
  worker

StatefulSet
  PostgreSQL
```

如果 PostgreSQL 使用既有公司服務，則不需要自行部署 DB。

---

# 58. Security

API Key：

```text
Kubernetes Secret
```

禁止：

```text
.env committed to Git
API key in source code
API key in report
```

LLM Prompt 不得包含：

```text
Database credentials
API keys
Private infrastructure information
```

---

# 59. Testing

## Unit Test

每一個 factor 都必須有：

```text
normal case
edge case
missing data
invalid data
```

例如：

```text
PE = 10
Median PE = 20
```

應得到：

```text
50% discount
```

---

# 60. Regression Test

建立固定 Dataset：

```text
tests/fixtures/
    stock_2317.json
    stock_2357.json
    stock_2880.json
```

每次修改模型：

```text
old result
vs
new result
```

若結果大幅變化：

```text
FAIL
```

除非明確更新 model version。

---

# 61. Backtest Test

至少測：

```text
No look-ahead
Transaction cost
Slippage
Missing data
Delisted stock
Suspended stock
Dividend adjustment
Stock split
Capital increase
```

---

# 62. Data Integrity Test

每日檢查：

```text
Yesterday close
vs
Today open
```

異常波動不一定是錯誤，因此系統要：

```text
Detect
→ Flag
→ Investigate
```

不能直接刪除。

---

# 63. Ranking Explainability

每支股票輸出：

```json
{
  "symbol": "2317",
  "rank": 1,
  "score": 87.4,

  "score_breakdown": {
    "valuation": 27.2,
    "growth": 14.8,
    "quality": 12.9,
    "dividend": 7.5,
    "price_position": 9.2,
    "buffett": 12.6,
    "momentum": 2.1,
    "institutional": 1.1
  }
}
```

這是未來 UI 最重要的資料之一。

---

# 64. Ranking Reason

程式產生：

```text
Top contributors:

1. PE historical discount
2. EPS growth
3. ROE
4. Price below normalized valuation
```

AI 只將其轉成自然語言。

---

# 65. Risk Flags

標準化：

```text
HIGH_PE
LOW_ROE
NEGATIVE_EPS
EPS_VOLATILITY
HIGH_DEBT
LOW_LIQUIDITY
DATA_MISSING
CYCLICAL_BUSINESS
HIGH_CONCENTRATION
DIVIDEND_UNSTABLE
```

報表顯示：

```text
⚠ HIGH_PE
⚠ EPS_VOLATILITY
```

---

# 66. Recommendation State

不要直接輸出：

```text
BUY
SELL
```

v0.2 使用：

```text
WATCH
BUY_ZONE_1
BUY_ZONE_2
BUY_ZONE_3
OVERVALUED
HIGH_RISK
DATA_INVALID
```

這樣可以降低 AI 將系統誤解成自動交易系統的風險。

---

# 67. No Auto Trading

v0.2：

```text
NO BROKER API
NO ORDER EXECUTION
NO AUTO BUY
NO AUTO SELL
```

系統只提供：

```text
Analysis
Ranking
Price Alert
```

未來如果加入交易 API，必須建立獨立：

```text
Execution Service
```

不得讓 Quant Engine 直接下單。

---

# 68. Parameter Optimization

不能使用：

```text
2020~2026 全部資料
→ 找最佳權重
```

這會造成 overfitting。

應使用：

```text
Training Period
Validation Period
Test Period
```

並保留 out-of-sample dataset。

---

# 69. Model Governance

每次修改：

```text
scoring.yaml
valuation.yaml
risk.yaml
```

都產生：

```text
parameter_version
```

例如：

```text
p20260818-001
```

---

# 70. Daily Snapshot

每天完整保存：

```text
Universe
Prices
Fundamentals
Factors
Valuation
Ranking
AI Analysis
```

所以可以回答：

> 「2026/8/18 系統為什麼把鴻海排第一？」

而不是只能看到今天的結果。

---

# 71. Performance Goal

MVP：

```text
Universe <= 3000 securities

Full calculation < 5 minutes

Daily report < 10 minutes
```

不包含外部 API latency。

---

# 72. AI Cost Control

LLM 不分析全部股票。

流程：

```text
3000 Stocks
    ↓
Quant Filter
    ↓
Top 100
    ↓
AI Analysis
    ↓
Top 30
```

更進一步：

```text
Top 30
    ↓
Deep AI Analysis
```

這樣可以大幅降低 token cost。

---

# 73. AI Analysis Levels

### Level 0

不使用 AI。

### Level 1

Top 100：

```text
short explanation
```

### Level 2

Top 30：

```text
fundamental + valuation + risk
```

### Level 3

Top 5：

```text
deep analysis
```

---

# 74. AI Context

AI 每次只收到：

```text
Current ranking
Previous ranking
Factor changes
Financial changes
Valuation changes
Risk flags
Market context
```

不把整個 PostgreSQL database dump 給 LLM。

---

# 75. Market Context

每日加入：

```text
TAIEX
TAIEX PE
TAIEX PB
USD/TWD
US market
NASDAQ
SOX
VIX
10Y yield
```

但 Market Context 只影響：

```text
Risk Context
```

不能直接修改個股 Fair Value。

---

# 76. Final Daily Report Example

```text
============================================================
TAIWAN EQUITY VALUE RANKING
2026-08-18
Model: v0.2.0
============================================================

MARKET
------------------------------------------------------------
TAIEX:             XXXXX
Market Risk:       MEDIUM
Valuation State:   EXPENSIVE
Trend:             BULLISH


TOP 5
------------------------------------------------------------

#1 2317 鴻海
Score:       87.4
Price:      250
Fair Value: 280

Buy Zone 1: 252
Buy Zone 2: 224
Buy Zone 3: 196

State: BUY_ZONE_1

Strength:
- EPS growth
- AI server demand
- valuation discount

Risk:
- AI capex cycle
- margin pressure


#2 2357 華碩
...


TOP 30
------------------------------------------------------------

...


ETF TOP 10
------------------------------------------------------------

...


NEW ENTRIES
------------------------------------------------------------

...


BUY ZONE ALERTS
------------------------------------------------------------

2317 BUY_ZONE_1
2880 BUY_ZONE_1


RISK ALERTS
------------------------------------------------------------

...


AI MARKET COMMENTARY
------------------------------------------------------------

...


MODEL METADATA
------------------------------------------------------------

Data Version:
Model Version:
Parameter Version:
Generated At:
============================================================
```

---

# 77. MVP Development Order

不要一次讓 AI Coding Agent 寫完整個專案。

推薦：

## Sprint 1 — Data

```text
Universe
Market Data
Financial Data
PostgreSQL
Validation
```

Acceptance：

```text
1000+ stocks
data stored
no critical validation error
```

---

## Sprint 2 — Quant

```text
PE
PB
ROE
EPS Growth
Dividend
Price Position
```

Acceptance：

```text
manual calculation matches program
```

---

## Sprint 3 — Valuation

```text
PE Model
PB Model
Dividend Model
DCF
Fair Value
Buy Zones
```

Acceptance：

```text
known test stocks pass expected ranges
```

---

## Sprint 4 — Ranking

```text
Composite Score
Top 30
ETF Top 10
```

Acceptance：

```text
ranking deterministic
ranking reproducible
```

---

## Sprint 5 — Backtest

```text
Portfolio
Benchmark
Transaction Cost
Slippage
Walk Forward
```

Acceptance：

```text
no look-ahead bias
```

---

## Sprint 6 — Report

```text
Markdown
HTML
CSV
JSON
```

Acceptance：

```text
daily report generated
```

---

## Sprint 7 — AI

```text
AI Analyst
Schema
Validator
Hallucination Check
```

Acceptance：

```text
AI cannot modify quant values
```

---

## Sprint 8 — Automation

```text
Scheduler
Alert
Docker
Kubernetes
Monitoring
```

---

# 78. Definition of Done

v0.2 不算完成，除非：

```text
[ ] Daily data collection works
[ ] Data validation works
[ ] Fundamental factors work
[ ] Valuation models work
[ ] Sector models work
[ ] Buffett score works
[ ] Composite ranking works
[ ] Top 30 generated
[ ] ETF ranking generated
[ ] Buy zones generated
[ ] Historical snapshots stored
[ ] Backtest works
[ ] Look-ahead bias test passes
[ ] Report generated
[ ] AI analysis generated
[ ] AI cannot modify quant result
[ ] Alerts work
[ ] Docker deployment works
[ ] Configuration versioned
[ ] Regression tests pass
```

---

# 79. Critical Architecture Rule

整個系統最重要的權限邊界：

```text
                  ┌────────────────────┐
                  │ Quantitative Core   │
                  │                    │
                  │ Data               │
                  │ Factors            │
                  │ Valuation          │
                  │ Ranking            │
                  └─────────┬──────────┘
                            │
                     READ-ONLY ARTIFACT
                            │
                            ▼
                  ┌────────────────────┐
                  │ AI Analyst         │
                  │                    │
                  │ Explain            │
                  │ Summarize          │
                  │ Identify Risk      │
                  └─────────┬──────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │ Report Generator   │
                  └────────────────────┘
```

**AI 永遠不能反過來控制 Quant Core。**

---

# 80. Future v0.3

v0.3 可以加入：

```text
Factor Optimization
Machine Learning
Regime Detection
Sector Rotation
Portfolio Optimization
Risk Parity
Monte Carlo
DCF Enhancement
Earnings Surprise
Institutional Behavior
Options Data
```

但 v0.2 不實作。

---

# 81. Future v1.0

最終可以形成：

```text
             Taiwan Market
                   │
                   ▼
           ┌───────────────┐
           │ Data Platform │
           └───────┬───────┘
                   ▼
           ┌───────────────┐
           │ Quant Engine  │
           └───────┬───────┘
                   ▼
       ┌────────────────────────┐
       │ Valuation + Factor     │
       │ + Buffett + Risk       │
       └────────────┬───────────┘
                    ▼
             ┌────────────┐
             │ Ranking    │
             └─────┬──────┘
                   ▼
            ┌─────────────┐
            │ Backtesting │
            └──────┬──────┘
                   ▼
            ┌─────────────┐
            │ AI Analyst  │
            └──────┬──────┘
                   ▼
        ┌─────────────────────┐
        │ Dashboard / Alert   │
        └─────────────────────┘
```

---

# 82. Final Implementation Principle

本專案不是：

```text
LLM
 ↓
「推薦一支股票」
```

而是：

```text
             DATA
              ↓
       DETERMINISTIC
          QUANT
              ↓
       VALUATION
              ↓
         RANKING
              ↓
         BACKTEST
              ↓
       ┌─────────────┐
       │     AI      │
       │ explanation │
       └─────────────┘
              ↓
          REPORT
              ↓
           HUMAN
```

最終使用者看到的是：

> **「目前哪一些股票相對便宜？」**

但系統真正回答的是：

> **「在目前的基本面、歷史估值、成長性、品質、股息、價格位置與風險條件下，哪些股票的 Expected Value / Risk 比較有吸引力？」**

這會比單純的「AI 選股」可靠很多。

---

# 83. v0.2 Acceptance Target

第一個可用版本不追求預測市場，而追求三件事：

### ① 可重現

同樣資料 → 同樣結果。

### ② 可解釋

任何排名 → 可以拆解原因。

### ③ 可驗證

任何策略 → 可以用歷史資料回測。

只有這三件事情成立之後，才值得進一步加入 Machine Learning 或更強的 LLM。


