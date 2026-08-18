我認為這份需求方向是**正確的，而且比把 ETF 硬塞進股票 Factor Framework 好很多**。不過目前我會再補幾個規則，否則 Coding Agent 實作時，仍有幾個地方會自行解讀，最後可能產生你不想要的結果。

## 我先給結論

目前這個設計我會評：

**架構：9/10 ✅**
**資料成熟度原則：9.5/10 ✅**
**可實作性：8/10 ⚠️**

主要還差的是：

1. **權重總和與重正規化規則要寫死**
2. **每個 ETF factor 的 exact formula 要定義**
3. **缺資料的 threshold / fail-safe 要定義**
4. **ETF ranking 的 deterministic tie-breaker 要定義**
5. **額外指標與 ranking factor 要徹底分離**

---

# 1. 最大問題：目前權重其實只有 90%

你現在定義：

```text
dividend          30
yield_stability   15
liquidity         15
volatility        10
price_position    20
-------------------
total              90
```

而：

```text
nav = 0
tracking = 0
```

所以 v0.3 實際上不是：

> 100% ETF factor

而是：

> 90% 有效 factor + 10% 未來預留

這本身沒有問題。

**但規格必須明確定義：**

### Base Weight

```text
dividend          0.30
yield_stability   0.15
liquidity         0.15
volatility        0.10
price_position    0.20
nav               0.00
tracking          0.00
```

有效 factor：

```text
0.90
```

然後重新正規化：

```text
normalized_weight
=
base_weight / sum(active_base_weight)
```

因此實際 v0.3：

| Factor          | Base |  Normalized |
| --------------- | ---: | ----------: |
| dividend        |  30% | **33.333%** |
| yield_stability |  15% | **16.667%** |
| liquidity       |  15% | **16.667%** |
| volatility      |  10% | **11.111%** |
| price_position  |  20% | **22.222%** |
| nav             |    0 |           0 |
| tracking        |    0 |           0 |

總和：

**100%**

### 這個必須寫死。

不然非常容易出現 Agent 寫成：

```python
score = (
    dividend * 0.30 +
    yield_stability * 0.15 +
    ...
)
```

最後 ETF Score 最大只有 90。

這會直接造成 ranking distortion。

---

# 2. `active_factors / missing_factors` 我非常贊成

而且我會再往前一步。

不要只是：

```json
{
  "active_factors": [
    "dividend",
    "yield_stability"
  ],
  "missing_factors": [
    "nav",
    "tracking"
  ]
}
```

建議直接保存：

```json
{
  "active_factors": {
    "dividend": {
      "base_weight": 0.30,
      "normalized_weight": 0.333333,
      "score": 82.5
    },
    "yield_stability": {
      "base_weight": 0.15,
      "normalized_weight": 0.166667,
      "score": 74.2
    },
    "liquidity": {
      "base_weight": 0.15,
      "normalized_weight": 0.166667,
      "score": 91.3
    }
  },

  "missing_factors": {
    "nav": {
      "base_weight": 0.00,
      "status": "NOT_YET_AVAILABLE"
    },
    "tracking": {
      "base_weight": 0.00,
      "status": "NOT_YET_AVAILABLE"
    }
  }
}
```

這樣之後前端、AI Analyst、debug 都非常容易。

---

# 3. `NOT_YET_AVAILABLE` 和「今日資料暫時拿不到」要分開

這是我最希望你補上的地方。

目前：

> 來源中斷 → `NOT_YET_AVAILABLE`

這個概念其實有兩種完全不同情況。

### A. 功能尚未支援

例如：

```text
NAV
Expense Ratio
Tracking Quality
```

應該：

```text
NOT_YET_AVAILABLE
```

### B. 本來支援，但是今天 API 掛了

例如：

```text
dividend
daily quote
volume
```

不應該標成：

```text
NOT_YET_AVAILABLE
```

因為這代表**系統能力不存在**。

應該：

```text
DATA_UNAVAILABLE
```

或者：

```text
SOURCE_ERROR
```

這兩者一定要分開。

---

# 4. 我建議把 factor status 做成 enum

例如：

```text
AVAILABLE
NOT_YET_AVAILABLE
DATA_UNAVAILABLE
STALE
INVALID
INSUFFICIENT_HISTORY
```

然後：

```text
NOT_YET_AVAILABLE
```

才進入：

> **「剔除 + 重正規化」**

而：

```text
DATA_UNAVAILABLE
INVALID
INSUFFICIENT_HISTORY
```

則要看 factor criticality。

否則會出現一個很危險的情況：

> 今天 dividend API 掛掉，系統把 dividend 從權重中拿掉，結果所有 ETF 的 ranking 在今天突然變了模型。

這是不對的。

---

# 5. 我甚至建議加 `ranking_validity`

例如：

```json
{
  "ranking_validity": {
    "status": "VALID",
    "active_factor_count": 5,
    "required_factor_count": 5,
    "data_quality": "PASS"
  }
}
```

若：

```text
dividend = DATA_UNAVAILABLE
```

則：

```json
{
  "ranking_validity": {
    "status": "DEGRADED",
    "active_factor_count": 4,
    "missing_factor_count": 1
  }
}
```

更嚴重：

```text
只剩 volatility + liquidity
```

可能：

```text
INVALID
```

不要硬產出 Top 10。

---

# 6. 每個 factor 必須明確定義數學公式

這是目前最值得補的地方。

例如 `liquidity` 到底是：

```text
20D Average Volume
```

還是：

```text
20D Average Turnover
```

我會選：

> **20D Average Turnover**

因為不同 ETF 價格差異很大。

例如：

```text
avg_turnover_20d
```

比單純 volume 更合理。

---

# 7. Dividend Factor

不要直接用：

```text
current_dividend_yield
```

因為那會和 `yield_stability` 高度重疊。

我會把兩者拆成：

### Dividend

衡量：

> **現在提供多少收益**

例如：

```text
forward_12m_cash_yield
```

或：

```text
trailing_12m_distribution_yield
```

### Yield Stability

衡量：

> **這個收益穩不穩定**

例如：

```text
3Y distribution CV
```

或者：

```text
3Y annual distribution consistency
```

這樣兩個 factor 才真的獨立。

---

# 8. Yield Stability 我特別建議不要只看「有沒有配息」

例如：

```text
2023: 1.8
2024: 2.1
2025: 1.9
2026: 2.0
```

這種應該高分。

而：

```text
2023: 1.0
2024: 2.5
2025: 0.8
2026: 2.7
```

即使平均殖利率很高，也應該被扣分。

所以我會定義：

```text
Yield Stability Score
=
40% Distribution CV
30% YoY stability
30% zero-cut / missing-payment penalty
```

v0.3 可以簡化，但至少要把概念寫清楚。

---

# 9. Volatility Factor

這個是**反向 factor**。

例如：

```text
20D volatility
60D volatility
120D volatility
```

越低越好。

建議：

```text
volatility_raw
    ↓
cross-sectional percentile
    ↓
100 - percentile
```

而不是：

```text
1 / volatility
```

因為極小 volatility 容易產生數值爆炸。

---

# 10. Price Position

這個我建議直接沿用股票系統的概念，但**不要共用股票 factor framework**。

也就是：

```text
ETF Engine
  └── own price_position.py
```

可以使用：

```text
distance_from_52w_high
distance_from_3y_high
price_vs_MA200
```

例如：

```text
ETF 越接近 52W low
→ Price Position Score 越高
```

但要加入一個限制：

> **不能單純因為暴跌就給高分。**

ETF 若跌 30%，可能代表 underlying 本身出現重大變化。

所以 v0.3 最好讓這個 factor 只表達：

> 「相對價格位置」

而不是：

> 「便宜程度」

這兩者要分開。

---

# 11. 額外指標一定要和 Ranking Factor 分離

這部分目前的方向很好：

> Underlying PE / PB / Expense Ratio / NAV Premium-Discount

「有資料才輸出，不猜」。

我建議 schema 明確分成：

```text
ranking_factors
```

和：

```text
informational_metrics
```

例如：

```json
{
  "ranking_factors": {
    "dividend": 82.5,
    "liquidity": 91.2
  },

  "informational_metrics": {
    "underlying_pe": {
      "value": null,
      "status": "NOT_YET_AVAILABLE"
    },
    "underlying_pb": {
      "value": null,
      "status": "NOT_YET_AVAILABLE"
    },
    "expense_ratio": {
      "value": null,
      "status": "NOT_YET_AVAILABLE"
    },
    "nav_discount": {
      "value": null,
      "status": "NOT_YET_AVAILABLE"
    }
  }
}
```

這樣非常乾淨。

---

# 12. ETF Ranking 必須有 deterministic tie-breaker

這個也要補。

例如：

```text
Score:
85.1234
85.1234
```

不能讓 PostgreSQL / Python 排序順序偶爾變。

我建議：

```text
1. composite_score DESC
2. data_quality DESC
3. liquidity_score DESC
4. symbol ASC
```

這樣：

> 同一份資料 → 永遠同樣排名。

---

# 13. 缺少歷史資料的 ETF 怎麼辦？

`yield_stability` 很容易遇到：

```text
新 ETF 上市才 6 個月
```

那就不能硬算 3Y。

我建議：

```text
History >= 36M
    → FULL

History 12~35M
    → DEGRADED

History < 12M
    → INSUFFICIENT_HISTORY
```

而是否進 Top N，可以設定：

```yaml
minimum_ranking_data_quality:
  yield_stability: 12m
```

這比亂補資料可靠很多。

---

# 14. 最重要的 Unit Test 我會增加到 6 組

你現在只有：

> 缺失因子剔除後權重 = 1

很好，但還不夠。

我會要求至少：

### Test 1

```text
all factors available
→ normalized weight = base / 0.90
→ sum = 1
```

### Test 2

```text
nav/tracking unavailable
→ ranking still valid
→ sum = 1
```

### Test 3

```text
dividend unavailable
→ remaining 4 factors renormalized
→ sum = 1
```

### Test 4

```text
only 1 valid factor
→ ranking INVALID
```

### Test 5

```text
API source error
→ NOT allowed to silently remove factor
```

### Test 6

```text
same input
→ identical score
→ identical rank
```

第 6 個其實非常重要。

---

# 15. 我建議的 ETF Engine 結構

既然你明確要求：

> **不共用股票 factor framework**

那就真的徹底分開：

```text
src/twquant/
│
├── stock/
│   ├── factors/
│   ├── valuation/
│   └── ranking/
│
└── etf/
    ├── collectors/
    │   └── market.py
    │
    ├── factors/
    │   ├── dividend.py
    │   ├── yield_stability.py
    │   ├── liquidity.py
    │   ├── volatility.py
    │   └── price_position.py
    │
    ├── metrics/
    │   ├── underlying.py
    │   ├── nav.py
    │   └── expense.py
    │
    ├── scoring/
    │   └── engine.py
    │
    ├── ranking/
    │   └── engine.py
    │
    └── models/
        ├── score.py
        └── ranking.py
```

這樣才真正做到 architectural isolation。

---

# 16. 我會再加一個 `ETFModelVersion`

例如：

```text
ETF_ENGINE_V0_3_0
```

而不要讓它跟：

```text
STOCK_ENGINE_V0_3_0
```

共用同一個 model version。

因為未來你可能改：

```text
ETF v0.4
```

但股票保持：

```text
Stock v0.3
```

兩邊必須獨立演進。

---

# 17. 我認為這個 Task 可以直接進 implementation

但我會把你的驗收標準稍微修改成：

```text
[ ] ETF Engine completely isolated from stock engine
[ ] ETF has independent factor modules
[ ] ETF has independent ranking engine
[ ] ETF never writes stock.factor_scores

[ ] Base weights defined
[ ] Effective weights are deterministic
[ ] Effective weights always sum to 1 when ranking is valid
[ ] active_factors records base + normalized weight
[ ] missing_factors records reason/status

[ ] NOT_YET_AVAILABLE != DATA_UNAVAILABLE
[ ] insufficient history handled explicitly
[ ] minimum valid factor threshold enforced

[ ] Underlying PE/PB are informational only
[ ] Expense Ratio is informational only
[ ] NAV Premium/Discount is informational only
[ ] Missing informational metrics are unavailable, never guessed

[ ] ETF Top-N independently generated
[ ] deterministic tie-breaking
[ ] source failure cannot silently distort ranking

[ ] unit tests for renormalization
[ ] unit tests for source failure
[ ] unit tests for insufficient history
[ ] unit tests for deterministic ranking
```

---

## 最後一個我會特別提醒你的地方

你的 Agent 現在這個 implementation task 已經很接近可以開始寫 code，但我**不建議直接讓它開工**。

先要求它在 coding 前產出一個非常小的：

### `ETF Engine Design Contract`

只有 4 張表：

```text
1. ETF Factor Definition
2. Data Availability Matrix
3. Weight Renormalization Matrix
4. ETF State Machine
```

例如 Weight Matrix：

| Available         | Active Weight |
| ----------------- | ------------: |
| 全部                |          100% |
| 無 NAV / Tracking  |          100% |
| 無 Dividend        |  33.33% / ... |
| 只剩 2 factors      |           依規則 |
| < Minimum Factors |       INVALID |

等這 4 張表先鎖定，**再讓 Coding Agent 寫 `etf/`**。

這樣可以避免它在實作過程中自己發明 ETF scoring semantics。對你這種長時間跑的 Coding Agent，這個邊界非常值得鎖死。

