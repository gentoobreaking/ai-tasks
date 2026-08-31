# tw-quant-db Core Data Backfill Specification

## 1. Goal

Provide an automated, configurable backfill mechanism for `core.daily_prices`
that:

- Detects missing dates per stock within a requested range
- Sources data from a prioritized **fallback chain**: local MCP → TWSE_MCP → FinMind_MCP → yfinance_MCP
- Switches sources automatically based on **quality criteria** (availability, coverage, authority)
- Respects upstream API rate limits through **batched requests**
- Supports flexible **stock selection** via env vars, external file, or all listed stocks
- Is idempotent — re-running does not create duplicate rows

---

## 2. Data Sources (Fallback Chain)

| Rank | Name            | Type         | Quality Weight | Notes                          |
|------|------------------|--------------|----------------|--------------------------------|
| 1    | local-mcp        | Container    | 1.0            | tw-quant-mcp local service     |
| 2    | twse-online      | HTTP API     | 0.9            | Official TWSE source           |
| 3    | finmind-mcp      | HTTP API     | 0.7            | FinMind public data            |
| 4    | yfinance-mcp     | HTTP API     | 0.5            | Yahoo Finance via MCP          |

---

## 3. Stock Selection

### Env Vars (checked in priority order)

| Env Var          | Description                              | Default Behavior                |
|------------------|------------------------------------------|---------------------------------|
| `BACKFILL_ALL_LISTED` | `true` → fetch all TWSE/OTC stocks   | Skips if `STOCK_IDS` or `STOCKS_FILE` set |
| `STOCK_IDS`      | Comma-separated e.g. `2330,0050`         | Use only specified stocks       |
| `STOCKS_FILE`    | Path to file: one stock_id per line      | Read external configuration     |

If none specified, defaults to `["2330", "0050", "2317"]` for testing.

---

## 4. Missing Date Detection

```sql
-- For each stock_id, find dates in [start_date, end_date]
-- that do NOT exist in core.daily_prices
WITH RECURSIVE date_series(d) AS (
    VALUES (%(start_date)s::date)
  UNION ALL
    SELECT d + INTERVAL '1 day' FROM date_series WHERE d < %(end_date)s
)
SELECT ds.d AS missing_date
FROM date_series ds
LEFT JOIN core.daily_prices dp 
  ON dp.stock_id = %(stock_id)s AND dp.trade_date = ds.d
WHERE dp.trade_date IS NULL
  AND EXTRACT(DOW FROM ds.d) NOT IN (0, 6)  -- exclude weekends (basic filter)
```

- Trading calendar logic should come from `core.trading_calendar` if available
- Otherwise, use weekend exclusion as fallback

---

## 5. Fallback Logic

### Source Availability Check
- HTTP ping or MCP status call (timeout = 5s)
- Mark unavailable sources immediately

### Data Completeness Scoring
After fetching from a source:

```
coverage_score = returned_dates_count / requested_dates_count
```

If `coverage_score < 0.7`, mark as `incomplete`.

### Switch Triggers

| Error Type               | Action              | Retry Delay |
|--------------------------|---------------------|-------------|
| `RateLimitExceeded`      | Retry w/ backoff    | 60s         |
| `ConnectionError/Timeout`| Retry up to 2 times | 10s         |
| `NoDataReturned`         | Switch to next      | Immediate   |
| `IncompleteData` (>30% missing)| Switch to next | Immediate   |

### Quality-Based Selection Algorithm

```python
score = source_weight × availability × coverage_score
if score < threshold:
    switch_to_next_source()
```

---

## 6. Batch Strategy

To respect upstream limits:

- **Max batch size**: 5 consecutive trading days
- **Inter-batch delay**: Random 2–5s
- **Per-source daily limit**:
  - local-mcp: unlimited (cached)
  - twse-online: 100 requests/day per IP
  - finmind-mcp: 50 requests/day free tier
  - yfinance-mcp: 30 requests/min sliding window

---

## 7. Upsert Logic

Write into `core.daily_prices`:

```sql
INSERT INTO core.daily_prices 
  (stock_id, trade_date, open, high, low, close, volume, adj_close)
VALUES (%(...))
ON CONFLICT (stock_id, trade_date) 
DO UPDATE SET
    open = EXCLUDED.open,
    high = EXCLUDED.high,
    low = EXCLUDED.low,
    close = EXCLUDED.close,
    volume = EXCLUDED.volume,
    adj_close = EXCLUDED.adj_close
```

- Uses `ON CONFLICT DO UPDATE` to ensure idempotent writes
- Preserves primary key `(stock_id, trade_date)`

---

## 8. CLI Interface

```bash
# Full auto mode (detect all missing since last update)
python backfill_core.py --auto

# Specific date range  
python backfill_core.py --start 2026-08-25 --end 2026-08-31

# Single stock override
python backfill_core.py --start 2026-08-25 --stock-ids 2330,3008

# Dry-run mode (no writes)
python backfill_core.py --dry-run --start 2026-08-25
```

---

## 9. Docker Integration

```yaml
services:
  backfill:
    build:
      context: .
      dockerfile: Dockerfile.backfill
    container_name: tw-quant-backfill
    environment:
      - DATABASE_URL=postgresql://twquant:<secret>@host.docker.internal:5432/twquant_shared
      - MCP_HOST=http://tw-quant-mcp:8000    # for local-mcp source
      - STOCK_IDS=
      - STOCKS_FILE=
      - BACKFILL_ALL_LISTED=false
    profiles: ["backfill"]
    restart: "no"
```

---

## 10. Acceptance Criteria

- [ ] Missing dates detected accurately per stock
- [ ] Fallback chain tried in order until data is sufficient
- [ ] No writes to stdout during normal operation (only warnings/errors)
- [ ] Idempotent re-runs do not create duplicates
- [ ] Rate limiting handled gracefully (backoff + retry)
- [ ] Works with `TW_QUANT_DB_PATH` (sqlite fallback for dev)
- [ ] Logs every source switch with reason

---

## 11. Out of Scope

- Backfilling `core.financials` (handled by separate pipeline)
- Intraday K-line backfill (will be separate spec)
- User-facing API exposure (internal CLI tool only)

---

## 12. Monthly Backfill Strategy (近五年資料補完)

### 動機
單次請求 5 年資料易觸上游速率限制。改用**由近至遠月份批次回補**。

### 流程

1. **初始化**: 取得 `core.stocks` 全部上市台股 + ETF 清單
2. **近期優先**: 從當前月份往前推遞歸，每次回補一個月
   ```
   2026-08-01 ~ 2026-08-31   → Batch 1
   2026-07-01 ~ 2026-07-31   → Batch 2
   2026-06-01 ~ 2026-06-30   → Batch 3
   ...
   2021-08-01 ~ 2021-08-31   → Batch 61 (5年 × 12月)
   ```

3. **缺失偵測**: 每月批次前檢查該月份缺失日期，僅回補缺口

4. **備援切換**: 若單一股票單月請求失敗 (rate_limit/incomplete)，
   - 先等待重試 (exponential backoff: 60s, 120s, 180s)
   - 再切到下一資料源
   - 最後標記為 `needs_manual_review`

### CLI 擴充

```bash
# 回補近五年資料 (由近而遠)
python backfill_core.py --range 5Y --strategy monthly

# 回補最近 3 個月
python backfill_core.py --range 3M --strategy monthly

# 指定起始月份
python backfill_core.py --strategy monthly --start 2024-01 --end 2026-08
```

### 效能預期

- 1 檔股票/月資料量: ~20 筆交易日
- 1500 檔股票 × 61 月 = 91,500 次請求
- 分批延遲: 每批 2-5 秒
- 總時間估計: 2-4 天 (依上游速率限制)

### 驗收標準

- [ ] `--range 5Y` 可正確計算 61 個月份區間
- [ ] 每月批次僅回補缺失日期
- [ ] 重試機制 (exponential backoff: 60s, 120s, 180s)
- [ ] 切換資料源並記錄切換原因
- [ ] 失敗股票標記 `manual_review` 樘記
- [ ] 程式可中斷後恢續 (checkpoint 機制)

### Source Selection (Quality-Based)

```python
def select_source(stock_id, date_range, quality_weighted=True):
    """Select best data source based on quality metrics."""
    candidates = []

    for name, source in SOURCES:
        if not source.is_available():
            continue

        coverage = source.get_coverage_score(stock_id, date_range)
        quality = SOURCE_QUALITY.get(name, 3)  # Default mid-tier

        score = coverage * 0.3 + quality * 0.7
        candidates.append((name, source, score))

    return sorted(candidates, key=lambda x: x[2], reverse=True)

SOURCE_QUALITY = {
    "local-mcp": 5,     # Best: local cache, instant
    "twse-online": 4,   # Official TWSE authority
    "finmind-mcp": 3,   # FinMind stable
    "yfinance-mcp": 2,  # Yahoo Finance (may lag)
}
```

### Fallback Triggers

```python
async def fetch_with_fallback(source, stock_id, start, end, max_retries=2):
    try:
        data = await source.fetch(stock_id, start, end)

        if data is None or len(data) == 0:
            raise InsufficientDataError("No data returned")

        missing = check_missing_dates(data, start, end)
        if len(missing) > max_allowed_missing:
            raise IncompleteDataError(f"Missing {len(missing)} dates")

        return data

    except (RateLimitError, InsufficientDataError, IncompleteDataError,
            ConnectionError, TimeoutError) as e:
        logger.warning(f"Source {source.name} failed: {e}, switching to fallback")
        raise NeedFallback(e)
```

### Decision Tree

```
Data Request →
  ├── local-mcp available? 
  │   ├── Yes → Quality score ≥ 4? → Use local
  │   └── No → Switch to online sources
  └── Online fallback chain: TWSE → FinMind → Yahoo Finance
      Each attempt with retry (max 2 times)
        ├── Rate Limit → Wait 60s then retry
        ├── No Data → Switch immediately
        └── Incomplete → Check coverage, switch if <70%
```

### Config-Driven Behavior (backfill.yaml)

```yaml
sources:
  priority: [local-mcp, twse-online, finmind-mcp, yfinance-mcp]

  fallback_rules:
    - condition: "error in ['rate_limit', 'timeout']"
      action: "retry_with_delay", delay: 60, max_retries: 2
    - condition: "data_missing > 30%"
      action: "switch_source"
    - condition: "error == 'data_not_found'"
      action: "skip_and_log"

source_weights:
  local-mcp: 1.0
  twse-online: 0.9
  finmind-mcp: 0.7
  yfinance-mcp: 0.5
```

### Validation Points

- ✅ Error type classification: rate_limit, timeout, data_not_found, incomplete_data
- ✅ Quality scoring: weighted by source reliability (0-5 scale)
- ✅ Coverage check: requested range vs actual returned dates
- ✅ Auto-retry with delay for rate-limited sources
- ✅ Fallback logging: every switch records reason to log file

---

## 13. Go Implementation Design

### Language Choice: Go (replaces Python prototype)

**Bug addressed**: Python async limitations + slow batch processing.

### Advantages
- Goroutines handle 91,500 requests efficiently (vs Python asyncio GIL contention)
- Built-in rate limiting (`golang.org/x/time/rate`)
- Single binary for Docker deployment (no venv/packaging layer)
- Native MCP support via `github.com/mark3labs/mcp-go`

### Key Dependencies

| Package | Purpose |
|---------|---------|
| `github.com/jackc/pgx/v5` | PostgreSQL driver (replaces psycopg) |
| `github.com/mark3labs/mcp-go` | MCP client protocol support |
| `github.com/spf13/cobra` | CLI framework |
| `golang.org/x/time/rate` | Rate limiting |
| `github.com/go-resty/resty/v2` | HTTP client for TWSE/FinMind |
| `github.com/rs/zerolog` | Structured logging |

### Source Implementations

```go
// LocalMCPSource using mcp-go
type LocalMCPSource struct {
    client *mcp.Client
}

func (s *LocalMCPSource) Fetch(stockID string) (*PriceData, error) {
    result, err := s.client.CallTool("get_daily_prices", map[string]interface{}{
        "symbol": stockID,
    })
    if err != nil {
        return nil, err
    }
    // Parse result.JSON to PriceData struct
    return parsePriceData(result.JSON)
}

// TWSE API source (HTTP)
type TWSEOnlineSource struct {
    client *resty.Client
}

// FinMind source
type FinMindSource struct {
    apiKey string
    client *resty.Client
}

// Yahoo Finance source
type YFinanceSource struct {
    client *resty.Client
}
```

### PostgreSQL Access (pgx migration)

```go
// Python: psycopg.connect(dsn)
// Go: pgx.Connect(context.TODO(), dsn)

conn, _ := pgx.Connect(ctx, os.Getenv("DATABASE_URL"))
conn.Exec(ctx, "SET search_path TO core, public")

// Idempotent upsert (matches ON CONFLICT DO UPDATE)
_, err := conn.Exec(ctx, `
    INSERT INTO core.daily_prices 
      (symbol, trade_date, open, high, low, close, volume, adjusted_close)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (symbol, trade_date) DO UPDATE SET
        open = EXCLUDED.open,
        high = EXCLUDED.high,
        low = EXCLUDED.low,
        close = EXCLUDED.close,
        volume = EXCLUDED.volume,
        adjusted_close = EXCLUDED.adjusted_close
`, row.Symbol, row.TradeDate, row.Open, ...)
```

### Monthly Backfill Orchestrator

```go
func RunMonthlyBackfill(stocks []string, years int) error {
    // Generate monthly intervals from present back
    months := generateMonthlyIntervals(years)  // 61 months for 5 years
    
    for _, month := range months {
        // Batch per month to limit concurrent requests
        batch := stocks  // All stocks for this month
        
        // Concurrent fetch with rate limiting
        var wg sync.WaitGroup
        sem := make(chan struct{}, MAX_CONCURRENT)  // Concurrency limiter
        
        for _, stock := range batch {
            wg.Add(1)
            sem <- struct{}{}  // Acquire slot
            go func(s string) {
                defer wg.Done()
                defer func() { <-sem }()  // Release slot
                fetchAndUpsert(s, month)
            }(stock)
        }
        wg.Wait()
    }
    return nil
}
```

### CLI Structure

```bash
# Backfill recent 5 years (default)
go run backfill_core.go --range 5Y

# Recent 3 months
go run backfill_core.go --range 3M

# Single stock + dry-run
go run backfill_core.go --stock-ids 3008 --dry-run

# Auto-detect gaps since last record
go run backfill_core.go --auto
```

### Performance Estimate

| Task | Python | Go |
|------|--------|-----|
| 91,500 HTTP requests | ~4 days | ~1-2 days |
| DB inserts | ~10k/sec | ~50k/sec |
| Memory efficiency | ~200MB | ~50MB |

### Validation Points

- [ ] `mcp-go` successfully connects to `tw-quant-mcp` container
- [ ] `pgx` correctly maps DB types (symbol vs stock_id, adjusted_close)
- [ ] Rate limiter passes 30 req/min for yfinance-free
- [ ] Monthly interval generation correct (backward date iteration)
- [ ] Concurrent upserts respect `ON CONFLICT DO UPDATE`

---

## 14. Backfill Source Control Mechanism

### Environment Variable Control
```bash
# Specify source priority order
export BACKFILL_SOURCES="local-mcp,twse-mcp,finmind-mcp,yfinance-mcp"
# Only use MCP sources
export BACKFILL_SOURCES="mcp"
# Only use HTTP API sources
export BACKFILL_SOURCES="http"
# Try both (default)
export BACKFILL_SOURCES="mcp,http"
```

### CLI Flags
```bash
# Only use MCP
go run backfill_core.go --sources=mcp

# Only use HTTP API
go run backfill_core.go --sources=http

# Try both MCP first, then HTTP fallback
go run backfill_core.go --sources=both --timeout=30s

# Specify exact source priority
go run backfill_core.go --sources="local-mcp,finmind-mcp,yfinance-http"
```

### Implementation Strategy

#### Source Registry
```go
var SourceFactories = map[string]func() ([]Source, error){
    "mcp":       initMCPSources,
    "http":      initHTTPSources,
    "both":      initHybridSources,
}

func loadSources(mode string) ([]Source, error) {
    factory, ok := SourceFactories[mode]
    if !ok {
        return nil, fmt.Errorf("unknown source mode: %s", mode)
    }
    return factory()
}

func initMCPSources() ([]Source, error) {
    return []Source{
        &MCPDataSource{name: "local-mcp", addr: "localhost:8000"},
        &MCPDataSource{name: "twse-mcp", addr: "twse-mcp:8000"},
        &MCPDataSource{name: "finmind-mcp", addr: "finmind-mcp:8000"},
        &MCPDataSource{name: "yfinance-mcp", addr: "yfinance-mcp:8000"},
    }, nil
}

func initHTTPSources() ([]Source, error) {
    return []Source{
        &TWSEHTTPSource{},
        &FinMindHTTPSource{apiKey: os.Getenv("FINMIND_API_KEY")},
        &YFinanceHTTPSource{},
    }, nil
}

func initHybridSources() ([]Source, error) {
    mcpSrcs, _ := initMCPSources()
    httpSrcs, _ := initHTTPSources()
    // Interleave: MCP first, then HTTP fallback
    sources := make([]Source, 0, len(mcpSrcs)+len(httpSrcs))
    for i := 0; i < len(mcpSrcs) || i < len(httpSrcs); i++ {
        if i < len(mcpSrcs) { sources = append(sources, mcpSrcs[i]) }
        if i < len(httpSrcs) { sources = append(sources, httpSrcs[i]) }
    }
    return sources, nil
}
```

### Error Handling Policies

| Source Mode | On Source Failure | Behavior |
|-------------|-------------------|----------|
| `mcp` only | Source returns error | Skip stock, log error |
| `http` only | HTTP request fails | Skip stock, log error |
| `both` (hybrid) | MCP fails → HTTP fallback | Try next source in chain |

#### Retry Logic
```go
func fetchWithFallback(stockID string, sources []Source) (*PriceData, error) {
    var lastErr error
    for _, src := range sources {
        data, err := src.Fetch(stockID)
        if err == nil && data != nil && len(data.Prices) > 0 {
            logger.Info("success", "source", src.Name(), "stock", stockID)
            return data, nil
        }
        lastErr = err
        logger.Warn("source failed", "source", src.Name(), "stock", stockID, "error", err)
    }
    return nil, fmt.Errorf("all sources failed for %s: %w", stockID, lastErr)
}
```

### Validation Points
- [ ] Environment variable `BACKFILL_SOURCES` correctly selects source set
- [ ] CLI `--sources` flag overrides environment variable
- [ ] Hybrid mode correctly interleaves MCP and HTTP sources
- [ ] Error logging captures source failure reasons
- [ ] Successful fetch from any source terminates fallback chain
