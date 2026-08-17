> **Quant Engine 決定「數字與排名」；AI 只負責「解釋」。AI 不得修改估值、買點、分數與排名。**

# Taiwan Equity Quantitative Screening & Valuation Platform

## Implementation Specification v0.3 — Production-oriented / MCP-integrated

> **定位：Point-in-Time Taiwan Quantitative Research Platform**。核心是「資料在某一天，以當下可見的資料（reported_at / lineage / snapshot）計算出當時的估值、分數與排名」。AI 只是最後面的 Analyst Layer。

**Document Status:** Development Ready
**Version:** v0.3
**Target:** Taiwan Stock Market
**Primary Language:** Python 3.12+
**Database:** PostgreSQL 16+
**Deployment:** Docker Compose / Kubernetes
**Primary Output:** Daily Top 30 Undervalued Stocks + Top 10 ETFs
**Primary Data Source:** tw-quant-mcp（MCP Server，官方來源唯一）
**AI Role:** Analyst / Explanation Layer only

---

# 1. Executive Summary

本系統的目標是建立一套每日自動執行的台股量化分析平台，資料收集以 **tw-quant-mcp** 為主（100% 官方免費來源：TWSE / TPEx / MOPS / TAIFEX）。

系統每天自動：

1. 透過 tw-quant-mcp 收集台股市場資料（日 K / 報價）
2. 透過 tw-quant-mcp 收集財務資料（財報 / 月營收 / 估值 / 股利 / 籌碼）
3. 清洗及驗證資料（含 lineage 新鮮度與成熟度檢查）
4. 計算估值指標
5. 計算基本面品質
6. 計算成長性
7. 計算股息能力
8. 計算價格相對位置
9. 計算 Buffett Score
10. 計算 Fair Value（Bear / Base / Bull）
11. 計算三階段 Buy Zone
12. 產生股票 Composite Score（Stock Engine）
13. 產生 ETF Composite Score（獨立 ETF Engine）
14. 產生 Top 30 與 Top 10 ETF
15. 執行歷史回測（Point-in-Time）
16. 產生風險分析
17. 呼叫 LLM 產生文字解讀（只解釋，不修改）
18. 產生不可變 Snapshot（Artifact Locking，可一路追溯）
19. 產生 Markdown / HTML / JSON / CSV 報表
20. 判斷是否觸發價格警報（寫入 alert_log）

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

# 2.3 Reproducibility（Snapshot 第一）

同一天、相同資料與參數：

```text
Input Dataset
      +
Model Version
      +
Parameter Version
      +
Data Version
      ↓
snapshot_id = hash(market_date, model_version, parameter_version, data_version)
      ↓
Identical Result
```

**版本欄位不散落在各結果表**。所有版本資訊集中在 `analysis_snapshot`（§5.12），結果表（factor_scores / valuations / rankings / alert_log / ai_analysis）一律以 `snapshot_id` 關聯。任何重跑產生新的 snapshot_id，歷史 snapshot 永遠不會被覆蓋。

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

# 2.5 Data Provenance（Lineage 一級公民）

所有入庫資料必須保留來源脈絡（對映 tw-quant-mcp `_lineage`）：

```text
source            →  上游機構（TWSE / TPEx / MOPS / TAIFEX）
source_role       →  CANONICAL / SEMI_OFFICIAL_REALTIME / FALLBACK
data_date         →  資料歸屬日期
freshness         →  POST_MARKET / MONTHLY / QUARTERLY / ...
grade             →  AVAILABLE / PREVIEW / NOT_YET_AVAILABLE
fetched_at        →  取得時間
```

規則（詳見 §8.1 Data Lineage Specification）：

* `grade = PREVIEW` 或新鮮度不足的資料**不得進入排名與回測**。
* 上櫃無 MCP helper 技術指標（MA/RSI），一律由引擎自存 `daily_prices` 自行計算。
* 每一筆 DB 數值都可向下一路追溯到：snapshot → ranking → factor → raw data → lineage。

---

# 2.6 Point-in-Time Data Model

系統所有計算遵循單一原則：

```text
「在某個 decision date 上，
 只能使用 reported_at / data_date <= decision date 且已驗證之資料。」
```

* 財報可用性以 `reported_at`（出表日期）為準，不是 fiscal period。
* 月營收可用性以官方公布日為準。
* 法人資料以官方釋出日（15:00 後、T-1）為準。
* 回測引擎與每日 pipeline 共用同一套 Point-in-Time 存取介面，保證兩者行為一致。

---

# 2.7 Asset Class Isolation, Infrastructure Sharing

股票與 ETF 是兩套**完全獨立**的金融邏輯（factor / valuation / weighting / ranking pipeline），各自獨立演進、獨立版本化（§30.8 / §46）；資料庫、Snapshot、Lineage、Report、API、Backtest、Alert 等工程基礎設施共用。

```text
Asset Class Model（§47 以 asset_class + strategy + version 指定）
        │
   ┌────┴────┐
   │         │
 STOCK     ETF
   │         │
 不共用 factor / valuation / weighting / ranking engine
   │         │
   └────┬────┘
        ▼
 Shared Platform（DB / Snapshot / API / Report / Backtest / Alert）
```

此原則下，Stock Engine 不讀 ETF 因子表，ETF Engine 不讀股票因子表；未來加入 REIT / 債券 ETF / 海外 ETF 不需破壞既有 engine。

---

# 3. High-Level Architecture

```text
                       ┌──────────────────────┐
                       │ Taiwan Market Data   │
                       │ 財報 / 股價 / 股利   │
                       └──────────┬───────────┘
                                  │ 上游 100% 官方來源
                                  ▼
                       ┌──────────────────────┐
                       │ tw-quant-mcp         │
                       │ (MCP Server: stdio / │
                       │  streamable-http)    │
                       └──────────┬───────────┘
                                  │ _lineage Envelope
                                  ▼
                       ┌──────────────────────┐
                       │ Providers Layer      │
                       │ mcp_provider         │
                       │ twse_bulk (價格)     │
                       │ historical (上櫃)   │
                       │ macro_context (FX/AI)│
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
                       │ (含 Lineage 檢查)    │
                       └──────────┬───────────┘
                                  │
                                  ▼
                       ┌──────────────────────┐
                       │ PostgreSQL           │
                       │ Raw + Normalized     │
                       │ (Point-in-Time)      │
                       └──────────┬───────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
        ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
        │ Stock       │   │ ETF         │   │ Backtest    │
        │ Engine      │   │ Engine      │   │ Engine      │
        │             │   │ (獨立因子)   │   │ (PIT)       │
        └──────┬──────┘   └──────┬──────┘   └─────────────┘
               │   Valuation     │   Yield/Price
               │   Fundamental   │   Volatility/Liquidity
               │   Technical     │
               ▼                 ▼
        ┌─────────────┐   ┌─────────────┐
        │ Stock       │   │ ETF         │
        │ Factor      │   │ Factor      │
        │ Score       │   │ Score       │
        │ Engine      │   │ Engine      │
        └──────┬──────┘   └──────┬──────┘
               │  Fair Value     │
               │  (Bear/Base/    │
               │   Bull)         │
               ▼                 ▼
        ┌─────────────┐   ┌─────────────┐
        │ Stock       │   │ ETF        │
        │ Ranking     │   │ Ranking    │
        │ (Top 30)    │   │ (Top 10)   │
        └──────┬──────┘   └────────────┘
               │
               ▼
        ┌─────────────┐
        │ Alert       │
        │ Engine      │
        └──────┬──────┘
               │
               ▼
        ┌─────────────┐
        │ Snapshot    │
        │ (Immutable, │
        │  Artifact)  │
        └──────┬──────┘
               │
        ┌──────┴───────┐
        ▼              ▼
 ┌────────────┐   ┌────────────┐
 │ AI Analyst │   │ Report     │
 │ (解釋層)    │   │ Generator  │
 └────────────┘   └────────────┘
        │
        ▼
   FastAPI（前端 / selector / signal 消費）
```

**Stock Engine 與 ETF Engine 是兩條獨立 pipeline**：因子定義、input source、scoring、ranking 各自獨立（§12–26 vs §30），絕不混用同一個 ranking engine。

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
│       ├── providers/
│       │   ├── base.py          # MarketDataProvider / FundamentalDataProvider / ...
│       │   ├── mcp_client.py    # tw-quant-mcp JSON-RPC client（stdio / streamable-http）
│       │   ├── mcp_provider.py  # MCP 工具 → Normalized Model（含 _lineage 對映）
│       │   ├── mcp_normalize.py # Envelope → dict 轉換（參考 tw-quant-signal 模式）
│       │   ├── twse_bulk.py     # TWSE STOCK_DAY_ALL 全市場單日價格（批量，選用）
│       │   ├── historical.py    # HistoricalPriceProvider（上櫃歷史價格回補）
│       │   └── macro_context.py # MacroContextProvider（Yahoo Finance，FALLBACK）
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
│       ├── factors/             # Stock Domain（§2.7，與 etf/ 隔離）
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
│       │   ├── pe.py            # EPS 三層模型（ACTUAL / NORMALIZED / MODEL_ESTIMATED）
│       │   ├── pb.py
│       │   ├── dividend.py
│       │   ├── dcf.py
│       │   └── engine.py
│       │
│       ├── etf/                 # ETF Domain（Asset Class Isolation，§2.7）
│       │   ├── data_adapter.py  # ETF Data Adapter（TWSE/MOPS/投信官方資料 → 內部 schema）
│       │   ├── factors/
│       │   │   ├── distribution.py
│       │   │   ├── yield_stability.py
│       │   │   ├── liquidity.py
│       │   │   ├── volatility.py
│       │   │   ├── price_position.py
│       │   │   ├── tracking_diff.py
│       │   │   └── nav_discount.py
│       │   ├── metrics/         # informational（不計分）：underlying_pe/pb、expense、fund_size
│       │   │   ├── underlying.py
│       │   │   └── expense.py
│       │   ├── scoring.py       # Weight Model + 重正規化 + ranking_validity
│       │   └── ranking.py       # deterministic tie-breaker
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
│       ├── api/
│       │   ├── main.py          # FastAPI
│       │   ├── schemas.py       # Response Envelope {data, meta, error}
│       │   └── routes.py
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
│       ├── snapshot.py          # Snapshot 生命週期（create/freeze/hash/archive）
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

PostgreSQL。**版本集中管理（Snapshot architecture）**：`analysis_snapshot` 是唯一的版本擁有者，結果表只帶 `snapshot_id`。

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

來源：tw-quant-mcp `get_symbol_list`（上市/上櫃/ETF 合併 Registry，ETF 為 6 碼或 00 開頭代號）。

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

    source VARCHAR(100),
    data_date DATE,
    freshness VARCHAR(30),

    PRIMARY KEY(symbol, trade_date)
);
```

* `adjusted_close` 依 K 線 adjust 參數（上市）或回補源（上櫃）取得，回測一律使用調整價。
* 保留 `source` / `data_date` / `freshness`（對映 MCP `_lineage`）。

---

# 5.3 financials

```sql
CREATE TABLE financials (
    symbol VARCHAR(10) NOT NULL,
    fiscal_year INTEGER NOT NULL,
    fiscal_quarter INTEGER NOT NULL,
    revision INTEGER NOT NULL DEFAULT 1,

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

    operating_cash_flow NUMERIC(20,4),
    investing_cash_flow NUMERIC(20,4),
    capex NUMERIC(20,4),
    free_cash_flow NUMERIC(20,4),

    reported_at DATE NOT NULL,
    observed_at TIMESTAMP NOT NULL,
    source VARCHAR(100),
    source_timestamp TIMESTAMP,

    PRIMARY KEY(symbol, fiscal_year, fiscal_quarter, revision)
);
```

**關鍵欄位：**

* `reported_at`（出表日期）：Point-in-Time 的唯一判準，對映 tw-quant-mcp `table_date`。
* `observed_at`：系統首次入庫時間（稽核用）。
* `operating_cash_flow` / `investing_cash_flow` / `capex` / `free_cash_flow`：Quality（FCF）、Buffett（FCF）、DCF 輸入。`capex` 可用 `investing_cash_flow` 近似並於 `source` 註記方法。
* `revision`：MOPS 財報更正時不得覆蓋舊版本（PK 含 revision），計算只用「截至 decision date 可見的最新 revision」。

---

# 5.3a monthly_revenues

Growth Score 的 `revenue_yoy` 以台股月營收年增率為準（tw-quant-mcp `get_monthly_revenue`）。

```sql
CREATE TABLE monthly_revenues (
    symbol VARCHAR(10) NOT NULL,
    year_month DATE NOT NULL,
    revenue NUMERIC(20,4),
    yoy_growth NUMERIC(10,4),
    mom_growth NUMERIC(10,4),
    cumulative_revenue NUMERIC(20,4),
    reported_at DATE,
    observed_at TIMESTAMP NOT NULL,
    source VARCHAR(100),

    PRIMARY KEY(symbol, year_month)
);
```

---

# 5.4 estimates

分析師預估與公司指引必須和歷史實際財報分離。本表**只存分析師/公司來源**（v0.3 初期空表）；引擎內部的估計值存在 valuations（§5.8）並標 `estimate_method`。

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

    estimate_method VARCHAR(50) NOT NULL,
    source VARCHAR(100),

    PRIMARY KEY(symbol, estimate_date, fiscal_year, estimate_method)
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

    source VARCHAR(100),

    PRIMARY KEY(symbol, fiscal_year)
);
```

來源：tw-quant-mcp `get_dividend_history`（含決議進度）＋ `get_exdividend_calendar`（ex_date）。`payout_ratio` 以實際公布之 Net Income 與 EPS 計算。

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

    availability_date DATE NOT NULL,

    PRIMARY KEY(symbol, trade_date)
);
```

來源：tw-quant-mcp `get_institutional_investors`。`availability_date` = 資料對外可用日期（15:00 後釋出），Point-in-Time 判斷用。

---

# 5.7 factor_scores

股票專用（ETF 見 5.7b）。**只帶 `snapshot_id`，不帶版本欄位**（版本在 §5.12）。

```sql
CREATE TABLE factor_scores (
    snapshot_id VARCHAR(30) NOT NULL REFERENCES analysis_snapshot(snapshot_id),
    symbol VARCHAR(10) NOT NULL,

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

    PRIMARY KEY(snapshot_id, symbol)
);
```

---

# 5.7b etf_factor_scores

ETF 使用與股票不同的因子集。**獨立 ETF pipeline 的輸出**。

```sql
CREATE TABLE etf_factor_scores (
    snapshot_id VARCHAR(30) NOT NULL REFERENCES analysis_snapshot(snapshot_id),
    symbol VARCHAR(10) NOT NULL,

    distribution_score NUMERIC(8,4),
    yield_stability_score NUMERIC(8,4),
    liquidity_score NUMERIC(8,4),
    volatility_score NUMERIC(8,4),
    price_position_score NUMERIC(8,4),
    tracking_diff_score NUMERIC(8,4),
    nav_discount_score NUMERIC(8,4),
    underlying_valuation_score NUMERIC(8,4),

    composite_score NUMERIC(8,4),
    active_factors JSONB NOT NULL,
    missing_factors JSONB NOT NULL,
    ranking_validity JSONB NOT NULL,

    PRIMARY KEY(snapshot_id, symbol)
);
```

* `active_factors`：實際參與加權的因子，**每因子記錄 `base_weight` / `normalized_weight` / `score`**（§30.2 重正規化）。
* `missing_factors`：未參與之因子，**每因子記錄原因/狀態**（§30.3：`NOT_YET_AVAILABLE` / `DATA_UNAVAILABLE` / `INSUFFICIENT_HISTORY` …）。
* `ranking_validity`：`{status: VALID|DEGRADED|INVALID, active_factor_count, minimum_active_factors}`（§30.4）。

---

# 5.8 valuations

```sql
CREATE TABLE valuations (
    snapshot_id VARCHAR(30) NOT NULL REFERENCES analysis_snapshot(snapshot_id),
    symbol VARCHAR(10) NOT NULL,

    actual_ttm_eps NUMERIC(14,4),
    normalized_eps NUMERIC(14,4),
    model_estimated_eps NUMERIC(14,4),
    estimate_method JSONB,

    pe_fair_value NUMERIC(14,4),
    pb_fair_value NUMERIC(14,4),
    dividend_fair_value NUMERIC(14,4),
    dcf_fair_value NUMERIC(14,4),

    bear_value NUMERIC(14,4),
    base_value NUMERIC(14,4),
    bull_value NUMERIC(14,4),
    fair_value NUMERIC(14,4),

    buy_zone_1 NUMERIC(14,4),
    buy_zone_2 NUMERIC(14,4),
    buy_zone_3 NUMERIC(14,4),

    current_price NUMERIC(14,4),

    PRIMARY KEY(snapshot_id, symbol)
);
```

* `actual_ttm_eps` / `normalized_eps` / `model_estimated_eps`：§13 的 EPS 三層模型輸出。
* `estimate_method`：`{"type": "INTERNAL_MODEL", "growth_source": "HISTORICAL_EPS_CAGR", "confidence": "LOW"}`。
* `bear_value` / `base_value` / `bull_value`：§27 三態估值；`fair_value = base_value`。

---

# 5.9 rankings

```sql
CREATE TABLE rankings (
    snapshot_id VARCHAR(30) NOT NULL REFERENCES analysis_snapshot(snapshot_id),
    ranking_type VARCHAR(20) NOT NULL,
    symbol VARCHAR(10) NOT NULL,

    rank INTEGER NOT NULL,
    score NUMERIC(8,4),

    fair_value NUMERIC(14,4),
    current_price NUMERIC(14,4),

    buy_zone_1 NUMERIC(14,4),
    buy_zone_2 NUMERIC(14,4),
    buy_zone_3 NUMERIC(14,4),

    score_breakdown JSONB NOT NULL,

    PRIMARY KEY(snapshot_id, ranking_type, symbol)
);
```

`ranking_type`：`STOCK` / `ETF`。`score_breakdown`：§63 因子拆解，直接進 API payload。

---

# 5.10 alert_log

```sql
CREATE TABLE alert_log (
    alert_id BIGSERIAL PRIMARY KEY,
    snapshot_id VARCHAR(30) NOT NULL REFERENCES analysis_snapshot(snapshot_id),
    alert_date DATE NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    alert_type VARCHAR(40) NOT NULL,
    severity VARCHAR(10) NOT NULL,
    payload JSONB,
    created_at TIMESTAMP NOT NULL
);
```

`alert_type`：`BUY_ZONE_1_TRIGGERED` / `BUY_ZONE_2_TRIGGERED` / `BUY_ZONE_3_TRIGGERED` / `INVESTIGATE` / `NEW_ENTRY` / `EXIT_TOP30` / `RISK_FLAG`。
`severity`：`INFO` / `WARNING` / `CRITICAL`。

---

# 5.11 universe_flags 與 universe_snapshot

```sql
CREATE TABLE universe_flags (
    symbol VARCHAR(10) NOT NULL,
    flag_date DATE NOT NULL,

    attention BOOLEAN DEFAULT FALSE,
    disposition BOOLEAN DEFAULT FALSE,
    disposition_reason TEXT,
    suspended BOOLEAN DEFAULT FALSE,

    PRIMARY KEY(symbol, flag_date)
);
```

來源：tw-quant-mcp `get_attention_disposition_stocks`。

```sql
CREATE TABLE universe_snapshot (
    snapshot_id VARCHAR(30) NOT NULL REFERENCES analysis_snapshot(snapshot_id),
    symbol VARCHAR(10) NOT NULL,

    market VARCHAR(20) NOT NULL,
    sector VARCHAR(100),
    security_type VARCHAR(20) NOT NULL,
    in_universe BOOLEAN NOT NULL,
    excluded_reason VARCHAR(100),

    PRIMARY KEY(snapshot_id, symbol)
);
```

`universe_snapshot` 記錄「該 snapshot 當下納入計算的股票集合與排除原因」，回答「這檔為什麼沒被排進來」。

---

# 5.12 analysis_snapshot（唯一版本擁有者）

```sql
CREATE TABLE analysis_snapshot (
    snapshot_id VARCHAR(30) PRIMARY KEY,
    market_date DATE NOT NULL,

    model_version VARCHAR(50) NOT NULL,
    parameter_version VARCHAR(50) NOT NULL,
    data_version VARCHAR(50) NOT NULL,

    created_at TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,

    source_status JSONB NOT NULL,
    data_quality JSONB NOT NULL,
    quant_result_hash VARCHAR(64) NOT NULL,

    UNIQUE(market_date, model_version, parameter_version, data_version, created_at)
);
```

範例：

```yaml
snapshot_id: 20260818-210000-a82f

market_date: 2026-08-18

model_version: v0.3.0
parameter_version: p20260818-001
data_version: d20260818-001

created_at: 2026-08-18T21:00:00+08:00

source_status:
  twse: OK
  tpex: OK
  mops: OK

data_quality:
  status: PASS
  errors: 0
  warnings: 3

quant_result_hash: <sha256 of quant_result.json>
```

`snapshot_id` 格式：`YYYYMMDD-HHMMSS-<hex6>`（時間 + 短雜湊，重跑必不同）。

追蹤鏈：

```text
snapshot
 ↓
ranking
 ↓
factor_scores
 ↓
valuation
 ↓
raw financial data (reported_at 判定可用性)
 ↓
source lineage
```

---

# 5.13 ai_analysis

AI 輸出必須可被追溯與驗證（§44）。

```sql
CREATE TABLE ai_analysis (
    snapshot_id VARCHAR(30) NOT NULL REFERENCES analysis_snapshot(snapshot_id),
    symbol VARCHAR(10) NOT NULL,
    analysis_level INTEGER NOT NULL,

    output JSONB NOT NULL,
    status VARCHAR(20) NOT NULL,
    validator_report JSONB,

    PRIMARY KEY(snapshot_id, symbol)
);
```

`status`：`VALID` / `INVALID`（hallucination check 失敗）/ `REJECTED`（schema 失敗）。

---

# 5.14 Database ERD

```text
事實表（Fact / Raw）
  stocks ─ 1:N ─ daily_prices
  stocks ─ 1:N ─ financials        (reported_at / revision)
  stocks ─ 1:N ─ monthly_revenues
  stocks ─ 1:N ─ dividends
  stocks ─ 1:N ─ institutional_flow
  stocks ─ 1:N ─ universe_flags

版本擁有者
  analysis_snapshot (model/parameter/data version + hash + data_quality)

結果表（以 snapshot_id 關聯）
  analysis_snapshot ─┬─ universe_snapshot
                     ├─ factor_scores          (STOCK 因子)
                     ├─ etf_factor_scores      (ETF 因子)
                     ├─ valuations             (EPS 三層 / FV / Buy Zones)
                     ├─ rankings               (Top 30 / Top 10)
                     ├─ alert_log
                     └─ ai_analysis

獨立參考
  earnings_estimates  (分析師，v0.3 空表預留)
```

---

# 6. Data Source Abstraction

Data Collector 不得直接綁死單一供應商。

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

class MarketBulkProvider(Protocol):
    """全市場單日價格（TWSE STOCK_DAY_ALL 等批量源），效能用。"""

    def get_all_prices(self, trade_date: date) -> list[DailyPrice]:
        ...

class HistoricalPriceProvider(Protocol):
    """上櫃/歷史價格回補（tw-quant-mcp 上櫃 K 線未接線 → 回補源）。"""

    def get_historical_prices(
        self,
        symbol: str,
        start_date: date,
        end_date: date
    ) -> list[DailyPrice]:
        ...

class MacroContextProvider(Protocol):
    """全球/總經脈絡備援（Yahoo Finance 等第三方，source_role = FALLBACK）。

    範圍限制（白名單）：
    - VIX（^VIX）
    - USD/TWD（USDTWD=X）
    - 美國指數：NASDAQ（^IXIC）、SOX（^SOX）、S&P 500（^GSPC）
    - 10Y 殖利率（^TNX）

    不得提供：
    - 任何台股個股之 Fair Value / Score / Ranking 輸入
    - 台股基本面 / 籌碼 / 估值資料
    """

    def get_market_context(self, date: date) -> list[MacroQuote]:
        ...
```

**v0.3 官方首選實作是 `McpProvider`**（stdio 或 streamable-http 連 tw-quant-mcp），`TwseBulkProvider` 只提供「當日全市場價格」單一目的（效能），`HistoricalProvider` 只服務「上櫃歷史回補」與「回測歷史」（實作候選：FinMind、Yahoo Finance），`MacroContextProvider` 只服務 §75 的 global / macro 脈絡（實作候選：Yahoo Finance）。容器內部署用 `MCP_TRANSPORT=streamable-http`（`MCP_HTTP_ADDR=127.0.0.1:8787`），避免逐 call spawn process。

所有出口資料保留 Lineage 三欄（`source` / `data_date` / `freshness`），供 validation 與報表使用。

---

# 7. Data Source Priority

```text
Primary Source:  tw-quant-mcp 盤後/籌碼/基本面工具
      ↓
Bulk Source:     TWSE STOCK_DAY_ALL 全市場當日價格（效能）
      ↓
Fallback:        HistoricalProvider（上櫃歷史 / 回補）
      ↓
Fallback:        MacroContextProvider（VIX / USD-TWD / 美股指數 / 10Y，§75）
      ↓
INVALID
```

備援資料（FALLBACK）原則：

```text
source_role           = FALLBACK（lineage 必標）
適用範圍（白名單）      = ①上櫃歷史價格（回測/技術指標）② Market Context（Risk 用）
禁止                  = 進入個股 Fair Value / Score / Ranking / Buy Zone
缺源時                = 維持 unavailable，不得由 LLM 或統計推測填補
```

絕對禁止：

```text
API failed
   ↓
LLM guess
```

---

# 7.1 Data Coverage & MCP → DB Mapping

| 需求（本 spec） | tw-quant-mcp 工具 | 目的地表 | 狀態 |
|---|---|---|---|
| Universe / 交易日曆 | `get_symbol_list`, `get_trading_calendar` | stocks, universe_snapshot | ✅ AVAILABLE |
| 日 K / 報價 | `get_stock_daily_quote`, `get_stock_daily_kline` | daily_prices | ⚠️ 上櫃 K 線未接線（HistoricalProvider 補） |
| 財報 | `get_financial_statements`（含 `table_date`） | financials | ✅ AVAILABLE |
| 月營收 | `get_monthly_revenue` | monthly_revenues | ✅ AVAILABLE |
| PE/PB/殖利率/ROE | `get_valuation_ratios`（ROE 為官方年化估計） | daily 估值快照（僅參考） | ✅ AVAILABLE |
| 股利 | `get_dividend_history`, `get_exdividend_calendar` | dividends | ✅ AVAILABLE |
| 法人買賣超 | `get_institutional_investors`（15:00 後齊） | institutional_flow | ✅ AVAILABLE |
| 外資持股 | `get_foreign_shareholding_history`（T-1，僅上市） | institutional_flow 延伸 | ⚠️ 僅上市 |
| 注意/處置股 | `get_attention_disposition_stocks` | universe_flags | ✅ AVAILABLE |
| TAIEX | `get_twse_index` + TPEx 指數 | market_context 快照 | ✅ AVAILABLE |
| 期貨/選擇權 | `get_futures_daily_ohlc`, `get_put_call_ratio` 等 | market_context 快照 | ✅ AVAILABLE |
| 分析師預估 | 無 | earnings_estimates | ❌ v0.3 空表，引擎 `INTERNAL_MODEL` |
| ETF NAV/費用率/追蹤 | 無 | etf_factor_scores.missing_factors | ❌ `NOT_YET_AVAILABLE` |
| 歷史 PE/PB | 僅當日 | 引擎由 daily_prices+financials 自算 | ⚠️ 自算保證重現性 |
| VIX/US/匯率/10Y | 無 | market_context（標 unavailable） | ❌ tw-quant-mcp 無源 → MacroContextProvider（Yahoo Finance，FALLBACK） |

### 備援來源清單（FALLBACK）

| 目的 | 來源 | 用途白名單 | source_role | 狀態 |
|---|---|---|---|---|
| 上櫃歷史價格 | FinMind `TaiwanStockPrice`（selector 已驗證）或 Yahoo Finance | 回測 / 技術指標（daily_prices 回補） | FALLBACK | ⚠️ v0.3 首選 FinMind，Yahoo 為備選 |
| VIX | Yahoo Finance `^VIX` | Market Context → Risk Context | FALLBACK | ⚠️ 選用 |
| USD/TWD | Yahoo Finance `USDTWD=X` | Market Context → Risk Context | FALLBACK | ⚠️ 選用 |
| NASDAQ / SOX / S&P | Yahoo Finance `^IXIC` / `^SOX` / `^GSPC` | Market Context → Risk Context | FALLBACK | ⚠️ 選用 |
| 10Y 殖利率 | Yahoo Finance `^TNX` | Market Context → Risk Context | FALLBACK | ⚠️ 選用 |

備援資料全部標 `source_role = FALLBACK`，須與官方資料（CANONICAL）在報表與 metadata 中明確區分。**任何 FALLBACK 資料不得進入個股 Fair Value / Score / Ranking / Buy Zone。**

**注意**：tw-quant-mcp 對官方來源有請求級 Rate Limit + Jitter（嚴禁高頻抓取）。collector 不得自行加速繞過；大量抓取一律走批量工具（`get_symbol_list` / `screen_stocks`）或 Bulk Source。

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
reported_at   ← tw-quant-mcp table_date
period_end    ← fiscal_year + fiscal_quarter
source
```

避免 Look-Ahead Bias。

---

# 8.1 Data Lineage Specification

每個 collector 出口寫入 DB 前，必須同時寫入 lineage 中繼資料（可為同一表欄位或 lineage 表）：

```text
欄位            來源（MCP _lineage）
source          lineage.source
source_role     lineage.source_role
data_date       lineage.data_date
freshness       lineage.freshness
grade           lineage.grade
fetched_at      lineage.fetched_at
```

傳播規則：

```text
1. Raw 資料:      逐列保存 lineage 欄位（§5.2–5.6）
2. 計算結果:       由 snapshot 記錄來源版本；factor 的 warnings 記錄缺源清單
3. 報表/AI 資料:   由 quant_result.json 的 data_version 關聯回 snapshot
4. 禁止:          任何數值在缺少 lineage 的情況下進入 ranking
```

成熟度守門（grade gate）：

```text
grade = AVAILABLE        → 可用於 ranking / backtest
grade = PREVIEW          → 僅可用於研究輸出，不得進排名（例：get_stock_trend_composite）
grade = NOT_YET_AVAILABLE → 功能未支援（如 ETF expense ratio）→ 剔除並重正規化
freshness 不足           → 標記不入 index（例：法人 15:00 前、外資 T-1）
source_role = FALLBACK   → 僅限白名單用途（§7）：上櫃歷史 / Market Context（Risk 用）
                           禁止進入個股 Fair Value / Score / Ranking / Buy Zone
```

Factor status enum（與「功能未支援」徹底分離，§30.3）：

```text
AVAILABLE              資料齊，正常參與加權
NOT_YET_AVAILABLE      功能未支援 → 剔除 + 重正規化（ETF §30.2）
DATA_UNAVAILABLE       本支援但今日來源失敗 → 依因子 criticality，不得靜默剔除
STALE                  超過新鮮度門檻 → 依因子 criticality
INVALID                驗證失敗（§8 / §62）→ 依因子 criticality
INSUFFICIENT_HISTORY   歷史不足 → 依 §30.5 / §10 規則
```

核心規則：**來源失敗（DATA_UNAVAILABLE）時，禁止「把因子從權重拿掉」——否則今日 ranking 模型在不知情下整個換掉。** 缺損時輸出 DEGRADED（§30.4），不硬產 Top N。

---

# 9. Look-Ahead Bias Prevention

這是回測最重要的規則之一。

例如：

```text
2025 Q4 財報
出表日期 (reported_at) = 2026-03-15
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
period_end    ← 財報歸屬期間
reported_at   ← 出表日期（唯一可用性判準）
observed_at   ← 系統入庫時間（稽核）
```

regression test 必須以真實 `reported_at` 驗證（fixture 含 table_date）。所有算式（含因子、估值、回測 selection）共用同一個 Point-in-Time 存取介面（§2.6）。

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

注意股/處置股/停止交易狀態取自 `universe_flags`（每日更新，§5.11），不可用靜態排除清單。

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
Model Estimated EPS × Normalized PE
```

## EPS 三層模型（v0.3 正式定義）

不要把「歷史 EPS」與「模型自己的估計」混為一談。拆成三層：

### A. Actual EPS（純事實）

```text
actual_ttm_eps = 以 reported_at 判定可見性之最近 4 季 EPS 加總
```

### B. Normalized EPS（排除異常）

```text
normalized_eps = actual_ttm_eps 排除:
    - 一次性收益 / 一次性損失
    - 極端季度（單季 EPS 偏離 3Y 平均 > 3σ）
    - 低基期轉折（如 EPS 由負轉正之過度放大）
```

### C. Estimated EPS（引擎內部估計）

```text
model_estimated_eps
=
normalized_eps × (1 + conservative_growth)

conservative_growth =
    min(EPS CAGR 3Y, Revenue CAGR 3Y)，且下限 0
```

命名與署名原則：

```text
INTERNAL_MODEL 產出        → 命名為 model_estimated_eps
未來 ANALYST_CONSENSUS 產出 → 命名為 forward_eps（新欄位）
model_estimated_eps 嚴禁對外宣稱或寫入 forward_eps 語意欄位
```

估計參數完整保存：

```yaml
estimate_method:
  type: INTERNAL_MODEL
  growth_source: HISTORICAL_EPS_CAGR
  confidence: LOW
```

未來接入分析師預估時：

```text
ANALYST_CONSENSUS
        ↓
forward_eps（新來源優先使用）
        ↓
估值模型本體不需改動
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

Historical Percentile 一律由引擎自算（close ÷ actual_ttm_eps，以 reported_at 防 look-ahead）。

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

v0.3 支援簡化 DCF。

```text
FCF = Operating Cash Flow − Capex
（Capex 以 investing_cash_flow 近似時必須在 source 註記）
```

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

DCF 在資料不足時不得硬算（銀行/壽險等現金流結構不適用之產業，依 Sector Profile 降低或排除 DCF 權重）。

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
  revenue_yoy: 25    # 來自 monthly_revenues（月營收 YoY）
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

ROE 需使用 rolling / normalized value（官方 ROE 為年化估計，僅作交叉驗證，不直接入分數）。`fcf` 取自 financials 之 free_cash_flow 欄位。

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

不應自動判定為高股息優質股（與 Price Position / Risk 聯合判斷）。

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

技術指標一律由引擎以自存 `daily_prices` 計算（上櫃 MCP 無 helper 指標）。

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

注意：不足 5 個交易日（15:00 未齊、T-1 釋出）時，該因子標記資料不足，不臆測。

---

# 24. Buffett Score

v0.3 正式加入 Buffett Factor。

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

門檻與乘數全部放 config/risk.yaml。

---

# 27. Fair Value

Fair Value 必須產生：

```text
Conservative Value  (bear_value)
Base Value          (base_value)
Optimistic Value    (bull_value)
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

三值皆入庫（§5.8 valuations）。

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

v0.3 合理性檢查（validation）：

```text
bear_value < base_value < bull_value
且 Zone1 > Zone2 > Zone3
```

若不利（如 Bear > Zone1），判定為配置/模型錯誤並阻擋排名輸出。

---

# 29. Buy Signal（State Machine）

判斷順序（由上而下，先命中先採用；**明確 state machine**）：

```text
Current < Bear Value
    → INVESTIGATE          ← 最高優先：低於保守估值，先確認資料或基本面是否異常

Current > Zone1
    → WATCH

Zone2 < Current <= Zone1
    → BUY_ZONE_1

Zone3 < Current <= Zone2
    → BUY_ZONE_2

Current >= Bear Value AND Current <= Zone3
    → BUY_ZONE_3
```

狀態轉移規則：

```text
先判 INVESTIGATE 條件（Critical 等級）
再判 Zone 區間
任何兩狀態不可同時成立（互斥，validation 檢查）
```

「BUY」不是實際下單指令，而是系統估值狀態。

---

# 30. ETF Model（獨立 ETF Data Adapter + ETF Engine）

ETF 不使用股票模型/因子/ranking engine（Asset Class Isolation，§2.7）。

```text
                    Quant Platform
                         │
              ┌───────────┴───────────┐
              │                       │
         Stock Engine            ETF Engine
              │                       │
              │                       ├── ETF Data Adapter（TWSE/MOPS/投信）
              │                       ├── factors/（own 8 factors）
              │                       ├── scoring.py（Weight Model + 重正規化）
              │                       └── ranking.py（tie-breaker）
              └───────────┬───────────┘
                          ▼
                   Shared Platform
```

## 30.1 ETF Data Adapter（官方來源）

tw-quant-mcp 無 ETF 專用工具；TWSE / MOPS / 投信 / 基金資訊觀測站之官方資料由新層 `etf/data_adapter.py` 統一抓取與正規化。資料分級：

```text
L1 官方每日     market price / volume / turnover / NAV / 預估 NAV / Premium-Discount / units outstanding
L2 官方定期     tracking difference / fund size / holdings / distribution / financial report
L3 官方可重建   underlying PE / PB（derived 標註，不得偽裝 official）
L4 目前不可得   NOT_YET_AVAILABLE（custom tracking quality / effective expense 等）
```

Premium/Discount 公式（L1）：

```text
premium_discount = (market_price - nav) / nav
```

## 30.2 ETF Weight Model（base → normalized 寫死）

權重寫死規則（normalized_weight = base_weight / Σ base_weight of active factors，禁止未正規化直加）：

| ETF Factor           | Base | v0.3 全齊時 Effective |
| -------------------- | ---: | --------------------: |
| distribution/dividend | 20% | 20% |
| yield_stability      | 15% | 15% |
| tracking_difference  | 15% | 15% |
| liquidity            | 10% | 10% |
| volatility           | 10% | 10% |
| price_position       | 10% | 10% |
| nav_discount         | 10% | 10% |
| underlying_valuation | 10% | 10% |
| **合計**              | **100%** | **100%** |

禁止 Agent 寫成 `score = Σ factor × base_weight` 未正規化版本（會產生 90 分制）。權重由 config（`asset_class: etf`、`strategy: core`、`version: 0.3.0`）驅動（§47），未來 ETF Income / Value / Growth 策略只改 config 不換 engine。

## 30.3 Factor Status（與「缺源」分離）

```text
AVAILABLE              資料齊，正常參與
NOT_YET_AVAILABLE      功能未支援（expense ratio 等）→ 剔除 + 重正規化
DATA_UNAVAILABLE       本支援但今日 API 失敗 → 依因子 criticality，不得靜默剔除
STALE / INVALID        過期 / 驗證失敗 → 依因子 criticality
INSUFFICIENT_HISTORY   歷史不足（新 ETF）→ §30.5
```

核心規則：**DATA_UNAVAILABLE 時禁止把因子從權重拿掉**（否則今日 ETF ranking 模型會悄然整個換掉）；此時 ranking_validity 標 DEGRADED（§30.4）。

## 30.4 Ranking Validity 與 deterministic tie-breaker

```text
ranking_validity:
  VALID      active_factor_count >= minimum_active_factors（預設 5）
  DEGRADED   有缺損但仍 >= 下限
  INVALID    < 下限 → 不產出 Top N（不要硬產）

tie-breaker（同一份資料 → 永遠同樣排名）:
  1. composite_score DESC
  2. data_quality DESC
  3. liquidity_score DESC
  4. symbol ASC
```

## 30.5 歷史不足規則

```text
History >= 36M   → FULL
History 12~35M   → DEGRADED（yield_stability 照算但記 warning）
History < 12M    → INSUFFICIENT_HISTORY

config: minimum_ranking_data_quality:
          yield_stability: 12m
```

## 30.6 Factor 定義（exact formula）

```text
distribution      trailing_12m_distribution_yield → cross-sectional percentile
yield_stability   = 40% 3Y distribution CV
                  + 30% YoY stability
                  + 30% zero-cut / missing-payment penalty
liquidity         20D average turnover（成交金額），非 volume
volatility        reverse factor：cross-sectional percentile → 100 - percentile（禁止 1/vol 數值爆炸）
price_position    距 52w high / 3y high（只表達相對位置，不表達「便宜程度」；暴跌不得自動高分）
tracking_difference tracking difference（L2 官方定期揭露）越小越好
nav_discount      (market_price - nav) / nav（異常溢價扣分，§30.1）
underlying_valuation 成分股權重重建（derived，標 estimated），PE 不直接算術加權
```

## 30.7 Informational Metrics（與 ranking factor 分離）

```text
ranking_factors      → 進 composite score（§30.2）
informational_metrics → 只輸出不計分：underlying PE / PB、expense ratio、fund size、inception date
                        缺資料 → unavailable / NOT_YET_AVAILABLE，不得推測
```

## 30.8 獨立 Model Version

ETF Engine 使用獨立 model version（`ETF_ENGINE_V0_3_0`），與股票（`STOCK_ENGINE_V0_3_0`）各自演進（§46），記錄於 analysis_snapshot。

## 30.9 另外計算（有資料才輸出）

Underlying PE / PB、Expense Ratio、NAV Premium/Discount —— 一律 `informational_metrics`（§30.7），標 `derived` 或 `unavailable`，不得推測。

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

不得與股票混合（獨立 ranking_type = ETF）。

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

同時寫入 alert_log（§5.10）。

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

同時寫入 alert_log（§5.10）。

---

# 36. Price Alert

系統每天檢查：

```text
Current Price <= Buy Zone 1
Current Price <= Buy Zone 2
Current Price <= Buy Zone 3
Current Price <  Bear Value
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

寫入 `alert_log`（§5.10），報表輸出 `alerts.json`。

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
At each rebalance date (decision date):
    calculate ranking
    select Top N
    buy next available session
```

禁止使用當日收盤價直接假設可以成交於該收盤價。

回測與每日 pipeline 共用同一個 Point-in-Time 存取介面（§2.6）：decision date 當下，只能看到 `reported_at <= decision date` 的財報、`availability_date <= decision date` 的法人資料。

上櫃股票歷史價格由 HistoricalPriceProvider 回補；無法回補之標的於回測中標記排除並記錄原因。

---

# 37.1 Backtest Data Availability Matrix

| 資料 | 源（tw-quant-mcp/批量） | 可用歷程 | Point-in-Time 可用時點 | 限制 |
|---|---|---|---|---|
| 上市日 K | `get_stock_daily_kline` | ≥10Y | 當日 T 盤後 | adjust 依官方參數 |
| 上櫃日 K | HistoricalProvider（回補：FinMind / Yahoo Finance） | 回補 ≥5Y | 當日 T 盤後 | 未接線源；回補後不可再改變；FALLBACK 標註 |
| 財報 | `get_financial_statements` | ≥10Y 季度 | `reported_at` 起 | revision 取可見最新 |
| 月營收 | `get_monthly_revenue` | ≥5Y | 官方公布日 | YoY 基準為去年同月 |
| 股利 | `get_dividend_history` / 行事曆 | ≥5Y | 決議公布 | 擬議（progress）與確定需區分 |
| 法人買賣超 | `get_institutional_investors` | ≤2M（可累積） | T 日 15:00 後 | 5D/20D 因子需累積天數 |
| 外資持股 | `get_foreign_shareholding_history` | 上市限定 | T-1 | 僅上市 |
| 估值比率當日 | `get_valuation_ratios` | 當日快照 | 當日盤後 | PE/PB 歷史由引擎重算 |
| 注意/處置 | `get_attention_disposition_stocks` | 當日 | 當日盤後 | 歷史回溯需自行累積 |
| 指數/期權 | `get_twse_index` / `get_put_call_ratio` | ≥5Y | 盤後 | 只進 Risk Context |

回測窗口可行性：

```text
1M / 3M        → 全部資料類別可用
6M / 1Y        → 全部可用（注意/處置需累積）
3Y / 5Y        → 上櫃股依 HistoricalProvider 回補品質；法人因子無 5Y 歷史 → 該因子於早期窗口標 DATA_MISSING
```

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

AI 產出（§5.13 ai_analysis）與 snapshot 綁定，validator 報告一併保存。

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

重新生成或移除該段。結果與報告保存於 `ai_analysis.validator_report`。

---

# 45. Artifact Locking

建立：

```text
quant_result.json
```

內容：

```json
{
  "snapshot_id": "20260818-210000-a82f",
  "model_version": "v0.3.0",
  "parameter_version": "p20260818-001",
  "data_version": "d20260818-001",
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
Immutable Artifact (snapshot_id)
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

權限。hash 同步寫入 `analysis_snapshot.quant_result_hash`（§5.12）。

---

# 45.1 Snapshot Lifecycle

```text
CREATE  →  collectors/validation/factors/valuation/ranking 完成，產生 snapshot_id
VALIDATE→  data_quality PASS / source_status 全 OK
FREEZE  →  產出 quant_result.json + sha256 → 寫入 analysis_snapshot
CONSUME →  Report / AI / API 全部唯讀消費 frozen snapshot
ARCHIVE →  snapshot 永久保留；同日重跑 = 新 snapshot_id，舊 snapshot 永不覆蓋
```

生命週期規則：

```text
1. snapshot_id 只在 FREEZE 時產生（內容確定後）
2. AI 與 Report 只讀 frozen snapshot
3. 任何欄位修正 = 重新產生新 snapshot，禁止 UPDATE 舊 snapshot 子表
4. snapshot 提供完整追蹤鏈（§5.12）
```

---

# 46. Model / Parameter / Data Versioning

版本資訊唯一保存在 `analysis_snapshot`（§5.12）。結果表一律以 `snapshot_id` 關聯，不各自複製版本欄位。

版本規則：

```text
修改公式 / 權重    → model_version 升級（v0.3.0 → v0.3.1）
修改 config YAML   → parameter_version 變化（p20260818-001 → -002）
資料日期/內容變化   → data_version 變化（d20260818-001 → d20260819-001）
```

Asset Class 各自獨立版本：Stock `STOCK_ENGINE_V0_3_0`、ETF `ETF_ENGINE_V0_3_0`（§30.8），互不連動升級。

不變規則：

```text
任何版本差異 → 新 snapshot_id、新列
歷史 snapshot 及其子表永不被覆蓋或刪除
```

範例：同一天 21:00 與 22:00 各跑一次 → `20260818-210000-*` 與 `20260818-220000-*` 兩個 snapshot 並存，可對比。

---

# 47. Configuration

所有權重放在 YAML。

例如：

```yaml
asset_class: stock        # stock | etf（Asset Class Model，§2.7）
strategy: value_growth    # ETF 支援 core / income / value / growth（§30.2）
model_version: "0.3.0"

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

ETF 權重（§30.2）以同一結構、不同 `asset_class` 區分，Engine 依 Asset Class Model 選擇 pipeline。

禁止在 Python code 裡散落 magic numbers。

---

# 48. CLI

系統必須提供 CLI：

```bash
twquant collect
twquant validate
twquant calculate
twquant valuation
twquant rank
twquant snapshot
twquant backtest
twquant report
twquant alert
twquant daily
twquant serve        # FastAPI dev server
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
→ snapshot (FREEZE)
→ report
```

任何 critical stage failure：

```text
Pipeline FAILED
```

不得產生假成功報告（不 FREEZE 半成品）。

---

# 49. Daily Pipeline

建議：

```text
18:00
    Collect Market Data（價格 / 籌碼；freshness 檢查）

19:00
    Fundamental Update（財報 / 月營收 / 股利 / 估值）

20:00
    Validation（含 universe_flags、注意/處置股）

20:30
    Factor Calculation（Stock Engine / ETF Engine）

21:00
    Valuation

21:15
    Ranking

21:20
    Alert

21:30
    AI Analyst

21:40
    Snapshot（FREEZE）＋ Report
```

實際時間必須由市場資料取得完成狀態決定，不應硬假設 API 在某時間一定完成（例：法人買賣超 15:00 後才齊、外資持股 T-1 釋出）。freshness 檢查通過才進入後續 stage。

---

# 50. Report Format

每天（對應 snapshot_id）：

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

`metadata.json` 含 snapshot_id、model / parameter / data version 與各 stage 的 lineage 摘要。

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

Model Metadata (snapshot_id)
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

# 53. API Contract

v0.3 提供 FastAPI（供前端直接消費，包含日後 selector / signal 整合）。

**Response Envelope**（與 tw-quant-selector 對齊）：

```json
{
  "data": {},
  "meta": {
    "snapshot_id": "20260818-210000-a82f",
    "model_version": "v0.3.0",
    "parameter_version": "p20260818-001",
    "data_version": "d20260818-001",
    "generated_at": "2026-08-18T21:40:00+08:00"
  },
  "error": null
}
```

```text
GET /api/v1/stocks
GET /api/v1/stocks/{symbol}
GET /api/v1/ranking/stocks?date=&limit=&min_score=
GET /api/v1/ranking/stocks/{symbol}?date=
GET /api/v1/ranking/etfs?date=
GET /api/v1/ranking/dates          # 有排名的日期清單（日曆回看）
GET /api/v1/valuation/{symbol}?date=
GET /api/v1/alerts?date=&type=
GET /api/v1/snapshots/{date}       # 當日 quant_result.json 原樣回傳（含 snapshot_id）
GET /api/v1/reports/{date}
GET /api/v1/backtest/{strategy}
```

`/api/v1/ranking/stocks` 每筆必須含 `score_breakdown`（§5.9 / §63），供前端直接繪製因子拆解。

---

# 53.1 前端整合原則（selector / signal 對齊）

日後 tw-quant-pickup 可能與 tw-quant-selector 或 tw-quant-signal 的前端結合。契約原則：

1. **純 API 消費**：pickup 不 embedding 前端，只暴露 REST API 與每日檔案報表。其他系統的前端透過本 API 讀取（不吃 pickup 的 DB，不共用 schema — selector / signal 的 `valuations` / `signals` 表語意與本系統不同）。
2. **慣例對齊**：
   * `/api/v1/...` 前綴（selector 同）
   * Response Envelope `{data, meta, error}`（selector 同）
   * 日期一律 `?date=YYYY-MM-DD` 參數 + `/ranking/dates` 日曆端點（對齊 selector `/signals/calendar`）
   * 台股顏色慣例 紅漲綠跌（前端渲染由各自維護）
3. **無 SSE**：每日批次報表用 REST GET 即可；selector 的 SSE 只服務其自身投組異動，pickup 不引入即時同步。
4. **score_breakdown 內嵌**：ranking payload 含因子拆解（signal 的四燈號卡、selector 的因子排名頁可無痛嵌入）。
5. **alert_log API**：前端可顯示歷史價格警報（對齊 selector 的 alert-history 頁面）。
6. **snapshot 對外**：`/api/v1/snapshots/{date}` 讓外部檢視與稽核「當天誰被排第幾名、為什麼」。
7. 整合路線圖：signal 的個股頁加「估值 / Buy Zone」卡片 → selector 儀表板加「Pickup Top 30」看板，全部吃 pickup API，不做 DB join。

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
  "last_snapshot_id": "20260818-210000-a82f",
  "data_freshness": "POST_MARKET"
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
snapshot_freeze_duration
```

Prometheus metrics：

```text
twquant_pipeline_success
twquant_pipeline_duration_seconds
twquant_data_quality_errors
twquant_ranking_count
twquant_ai_failures
twquant_alert_count
twquant_snapshot_hash_mismatch
```

---

# 56. Docker Compose

至少：

```text
postgres
app          # 內含 tw-quant-mcp 二進位（streamable-http）
scheduler
```

AI 若使用外部 API：

```text
app
 └── HTTPS → LLM Provider
```

不需要在第一版自己架 LLM。

tw-quant-mcp 在容器內以 `MCP_TRANSPORT=streamable-http` 執行，app 以 HTTP 連 `127.0.0.1:8787`（參考 tw-quant-selector 的 container 建置方式，第二階段自動 build Go 二進位）。

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

EPS 三層模型測試：

```text
A. actual_ttm_eps：4 季加總、缺一季、reported_at 邊界
B. normalized_eps：一次性收益剔除、3σ 極端季、低基期轉折
C. model_estimated_eps：growth 過高被 min() 截斷、negative growth → 0
```

---

# 60. Regression Test

建立固定 Dataset：

```text
tests/fixtures/
    stock_2317.json
    stock_2357.json
    stock_2880.json
    mcp_response_*.json      # tw-quant-mcp 錄製之 Envelope（含 _lineage）
```

每次修改模型：

```text
old result（舊 snapshot）
vs
new result（新 snapshot）
```

若結果大幅變化：

```text
FAIL
```

除非明確更新 model version。兩個 snapshot 並存，可回溯 diff。

---

# 61. Backtest Test

至少測：

```text
No look-ahead (reported_at 驗證)
Transaction cost
Slippage
Missing data
Delisted stock
Suspended stock
Dividend adjustment
Stock split
Capital increase
OTC historical fallback (HistoricalProvider)
Point-in-Time 介面一致性（回測 vs 每日 pipeline 同介面）
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

這是未來 UI 最重要的資料之一。入庫（§5.9）並原樣進 API payload（§53）。

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

v0.3 使用：

```text
WATCH
BUY_ZONE_1
BUY_ZONE_2
BUY_ZONE_3
OVERVALUED
HIGH_RISK
INVESTIGATE
DATA_INVALID
```

這樣可以降低 AI 將系統誤解成自動交易系統的風險。

---

# 67. No Auto Trading

v0.3：

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

每天完整保存（via snapshot 子表）：

```text
Universe (universe_snapshot)
Prices (daily_prices)
Fundamentals (financials / monthly_revenues / dividends)
Factors (factor_scores / etf_factor_scores)
Valuation (valuations)
Ranking (rankings)
AI Analysis (ai_analysis)
```

所以可以回答：

> 「2026/8/18 系統為什麼把鴻海排第一？」

追蹤鏈：snapshot → ranking → factor_scores → valuation → raw data → lineage（§5.12）。

---

# 71. Performance Goal

MVP：

```text
Universe <= 3000 securities

Full calculation < 5 minutes

Daily report < 10 minutes

資料收集（含全市場價格與財報）< 30 minutes
```

不包含外部 API latency。收集預算靠批量來源（STOCK_DAY_ALL 全市場/日、monthly revenue 全市場/月、估值全市場）與並行控制達成；逐檔工具（財報三表、股利）由 tw-quant-mcp 本地快取（L1/L2）與有限併發支撐。

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

每日加入（官方優先，缺源時由 MacroContextProvider 補）：

```text
TAIEX                      ← get_twse_index（AVAILABLE，CANONICAL）
TAIEX PE
TAIEX PB                   ← 無法取得 → unavailable
USD/TWD                    ← 無源 → MacroContextProvider（FALLBACK）→ 缺則 unavailable
US market                  ← 無源 → MacroContextProvider（FALLBACK）→ 缺則 unavailable
NASDAQ                     ← 無源 → MacroContextProvider（FALLBACK）→ 缺則 unavailable
SOX                        ← 無源 → MacroContextProvider（FALLBACK）→ 缺則 unavailable
VIX                        ← 無源 → MacroContextProvider（FALLBACK）→ 缺則 unavailable
10Y yield                  ← 無源 → MacroContextProvider（FALLBACK）→ 缺則 unavailable
PCR / 期貨法人部位          ← get_put_call_ratio 等（AVAILABLE，CANONICAL）
```

分級：

```text
required:  TAIEX、PCR/期貨部位 → 必須取得（CANONICAL），缺則 Risk Context 標 degraded
optional:  VIX / USD-TWD / 美股指數 / 10Y
           → ① MacroContextProvider 有資料 → 使用（source_role = FALLBACK 標註）
           → ② 仍無資料 → 輸出 "unavailable"，不得由 LLM 或統計推測填補
```

MacroContextProvider 規範：

```text
- 白名單欄位：VIX / USD-TWD / NASDAQ / SOX / S&P 500 / 10Y（§6）
- lineage：source = YAHOO_FINANCE，source_role = FALLBACK，data_date 記錄實際資料日期
- 只影響 Risk Context
- 禁止：進入個股 Fair Value / Score / Ranking / Buy Zone
- 不取得 API Key（yfinance 免費端點），無 key 儲存需求
```

Market Context 只影響：

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
Snapshot: 20260818-210000-a82f
Model: v0.3.0
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

Snapshot ID:
Data Version:
Model Version:
Parameter Version:
Generated At:
============================================================
```

---

# 77. MVP Development Order

不要一次讓 AI Coding Agent 寫完整個專案。

## 77.0 Implementation Dependency Graph

```text
providers（mcp / bulk / historical）
   ↓
collectors + normalization
   ↓
validation（lineage gate）
   ↓                       ┌──────────────┐
   ├───────────────────────┤ analysis_    │
   │                       │ snapshot DDL │
   ▼                       └──────────────┘
factorials（stock factors / etf factors）── 可並行
   ↓
valuation（EPS 三層 → FV → Buy Zones）
   ↓
ranking（stock / etf 獨立）
   ↓
alert
   ↓
snapshot FREEZE（snapshot_id + hash）
   ↓
ai_analysis（只能讀 frozen snapshot）
   ↓
report + FastAPI
   │
   └──────────► backtest（共用 PIT 介面，可後期接入）
```

不存在反向依賴：backtest 不依賴 API；AI 不依賴 backtest。

---

## Sprint 0 — Data Platform

```text
Schema Migration（§5 全表，含 analysis_snapshot）
Providers Layer（McpProvider / TwseBulk / Historical）
PostgreSQL
Lineage 對映（_lineage → source/data_date/freshness/grade）
Point-in-Time 存取介面（repository 層唯一入口）
```

Acceptance：

```text
migrations 可重複執行
providers 可讀取 tw-quant-mcp 並寫入 DB
fixtures 錄製（tests/fixtures/mcp_response_*.json）
PIT repository 通過 look-ahead 單元測試
```

---

## Sprint 1 — Data

```text
Universe（universe_flags + universe_snapshot）
Market Data
Financial Data（reported_at、revision、現金流）
Monthly Revenue
Validation
```

Acceptance：

```text
1000+ stocks
data stored（含 reported_at）
no critical validation error
```

---

## Sprint 2 — Quant

```text
PE
PB
ROE
EPS Growth（EPS 三層模型前置：ACTUAL / NORMALIZED）
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
EPS 三層模型（ACTUAL / NORMALIZED / MODEL_ESTIMATED）
PE Model（Model Estimated EPS × Normalized PE）
PB Model
Dividend Model
DCF
Historical Percentile（引擎自算）
Fair Value（Bear/Base/Bull）
Buy Zones
```

Acceptance：

```text
known test stocks pass expected ranges
§28 sanity check（bear<base<bull、zones 遞減）
estimate_method JSONB 完整記錄
```

---

## Sprint 4 — Ranking

```text
Composite Score（Stock Engine）
Top 30
ETF Data Availability & Adapter Spec（§30.1 資料分級盤點 + 設計契約 4 表）
ETF Data Adapter 實作（TWSE NAV / 折溢價 / tracking，L1-L2）
ETF Engine（§30.2-30.8：因子 / 重正規化 / ranking_validity / tie-breaker）
Top 10 ETF
```

Acceptance：

```text
ranking deterministic
ranking reproducible（snapshot_id 重跑不覆蓋）
```

---

## Sprint 5 — Backtest

```text
Portfolio
Benchmark
Transaction Cost
Slippage
Walk Forward
Point-in-Time 介面（reported_at / availability_date）
OTC historical fallback
```

Acceptance：

```text
no look-ahead bias（reported_at 驗證）
Backtest Data Availability Matrix（§37.1）真實反映
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
daily report generated（含 snapshot_id）
```

---

## Sprint 7 — AI

```text
AI Analyst
Schema
Validator
Hallucination Check（ai_analysis.validator_report）
```

Acceptance：

```text
AI cannot modify quant values
AI 輸出與 snapshot 綁定可追溯
```

---

## Sprint 8 — Automation

```text
Scheduler
Alert（alert_log）
Docker
Kubernetes
Monitoring
```

---

## Sprint 9 — Frontend Read API

```text
FastAPI（envelope / calendar / score_breakdown / snapshots / alerts）
```

Acceptance：

```text
/api/v1/ranking/stocks 供前端直接渲染（含 score_breakdown）
selector / signal 前端可無痛讀取
```

---

# 78. Definition of Done

v0.3 不算完成，除非：

```text
[ ] Daily data collection works (tw-quant-mcp provider)
[ ] Data validation works (含 lineage/freshness gate)
[ ] Fundamental factors work
[ ] Valuation models work (含 EPS 三層模型)
[ ] Sector models work
[ ] Buffett score works
[ ] Composite ranking works
[ ] Top 30 generated
[ ] ETF ranking generated (獨立 Engine + active_factors + ranking_validity)
[ ] ETF DATA_UNAVAILABLE 不靜默剔除因子（DEGRADED 標註，測試覆蓋）
[ ] Buy zones generated
[ ] analysis_snapshot works (snapshot_id + hash + lineage 追蹤)
[ ] Backtest works (含 OTC fallback)
[ ] MacroContextProvider works (白名單欄位 + source_role=FALLBACK 標註，不進個股 FV)
[ ] Look-ahead bias test passes (reported_at + PIT 介面)
[ ] Report generated
[ ] AI analysis generated (validated, 與 snapshot 綁定)
[ ] AI cannot modify quant result
[ ] Alerts work (alert_log)
[ ] API contract works (envelope / calendar / score_breakdown / snapshots)
[ ] Docker deployment works
[ ] Configuration versioned
[ ] Regression tests pass
[ ] v0.2 → v0.3 Change Log 屬實（§84）
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

# 80. Future v0.4

v0.4 可以加入：

```text
ETF NAV / 費用率 / 追蹤品質（投信投顧公會、TWSE 受益憑證）
分析師預估來源（MOPS 財測 / 券商）→ forward_eps 新欄位
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

但 v0.3 不實作。

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
             DATA (with lineage)
              ↓
       DETERMINISTIC
          QUANT
              ↓
       VALUATION
              ↓
         RANKING
              ↓
      SNAPSHOT (immutable)
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

> **「在目前的基本面、歷史估值、成長性、品質、股息、價格位置與風險條件下（以當日可見資料為準），哪些股票的 Expected Value / Risk 比較有吸引力？」**

這會比單純的「AI 選股」可靠很多。

---

# 83. v0.3 Acceptance Target

第一個可用版本不追求預測市場，而追求三件事：

### ① 可重現

同樣資料 → 同樣結果（snapshot_id 保證，版本集中在 analysis_snapshot）。

### ② 可解釋

任何排名 → 可以拆解原因（score_breakdown 入庫入 API，snapshot 可一路追溯）。

### ③ 可驗證

任何策略 → 可以用歷史資料回測（Point-in-Time：reported_at / availability_date 防 look-ahead）。

只有這三件事情成立之後，才值得進一步加入 Machine Learning 或更強的 LLM。

---

# 84. v0.2 → v0.3 Change Log

| # | 項目 | v0.2 | v0.3 |
|---|---|---|---|
| 1 | 版本管理 | 每表自帶 3 版本欄位，PK 易覆蓋 | **Snapshot architecture**：版本集中於 analysis_snapshot，結果表以 snapshot_id 關聯，永遠不覆蓋 |
| 2 | Look-Ahead | 只寫「要區分 period_end/reported_at」 | **reported_at / observed_at / availability_date 正式入 schema**，Point-in-Time 存取介面統一 |
| 3 | 現金流 | 無 | financials 加入 OCF / investing CF / capex / FCF |
| 4 | 月營收 | 無 | monthly_revenues 表 + Growth Score 以月營收 YoY 為準 |
| 5 | EPS 模型 | Forward EPS 語意模糊 | **EPS 三層**：ACTUAL / NORMALIZED / MODEL_ESTIMATED + estimate_method JSONB；未來 ANALYST_CONSENSUS 直接擴充 forward_eps |
| 6 | 歷史 PE | 未定義來源 | 引擎自算（close ÷ TTM EPS，reported_at 守門） |
| 7 | 財報更正 | 無 | financials PK 加 revision，不覆蓋 |
| 8 | 上櫃 K 線 | 未定義 | HistoricalPriceProvider 抽象 + Backtest Data Availability Matrix |
| 9 | ETF | 與股票共用排行榜框架 | **獨立 ETF Engine**（etf_factor_scores + active/missing_factors） |
| 10 | BUY_ZONE | 邏輯有重疊歧義 | **明確 state machine**，INVESTIGATE 最高優先 |
| 11 | Lineage | 無 | **Data Lineage Specification（§8.1）**：grade gate + 逐層傳播 |
| 12 | 資料源 | 未指定 | **tw-quant-mcp 契約對映（§7.1）**：37 工具 vs 需求表 |
| 13 | API | 端點清單 | **API Contract（§53）**：envelope + calendar + score_breakdown + snapshots |
| 14 | 前端整合 | 無 | **§53.1 整合原則**（純 API、不耦合 DB、慣例對齊） |
| 15 | Alert | 只有 json 檔 | alert_log 表 + snapshot 關聯 + API |
| 16 | Market Context | 未定義 | **required / optional 分級**，無源標 unavailable |
| 17 | AI 輸出 | 無儲存 | ai_analysis 表（status + validator_report） |
| 18 | 回測 | 一般規則 | Point-in-Time 介面 + 資料可用性矩陣 |
| 19 | Must-have 交付物 | 無 | ERD（§5.14）、MCP→DB 對映（§7.1）、Lineage（§8.1）、Snapshot Lifecycle（§45.1）、API（§53）、備測矩陣（§37.1）、依賴圖（§77.0）、Sprint（§77）、DoD（§78） |
| 20 | ETF 權重 | 90 分制隱含、偏高股息排名器 | **Base/Normalized 寫死**（distribution 20% … underlying_valuation 10%，§30.2）+ config 策略權重（asset_class / strategy / version，§47） |
| 21 | Factor status | 單一 NOT_YET_AVAILABLE 混用 | **enum 分離**：NOT_YET_AVAILABLE vs DATA_UNAVAILABLE / STALE / INVALID / INSUFFICIENT_HISTORY（§30.3 / §8.1），來源失敗不靜默剔除 |
| 22 | ETF 資料源 | NAV/tracking 全標不支援 | **ETF Data Adapter（TWSE/MOPS/投信官方）＋資料分級 L1-L4（§30.1）**：NAV / 折溢價 / tracking difference 進 v0.3 |
| 23 | 架構 | ETF 與股票共用框架語意 | **Asset Class Isolation, Infrastructure Sharing（§2.7）** + ETF 獨立 model version（§30.8 / §46）+ ranking_validity 與 deterministic tie-breaker（§30.4） |

---

# 85. Implementation Handoff Checklist

開工前檢查（回應 review 的第 10 項交付物）：

```text
[ ] 1. v0.2 → v0.3 Change Log        → §84
[ ] 2. Database ERD                  → §5.14
[ ] 3. MCP → DB Mapping Table        → §7.1
[ ] 4. Data Lineage Specification    → §8.1
[ ] 5. Snapshot Lifecycle            → §45.1
[ ] 6. API Contract                  → §53
[ ] 7. Backtest Data Availability    → §37.1
[ ] 8. Implementation Dependency     → §77.0
[ ] 9. Sprint Plan                   → §77
[ ] 10. Definition of Done           → §78
```

全部就緒後，才允許 Coding Agent 依 Sprint 開工。