對，**而且我會建議明確做成兩套完全獨立的權重模型**。這比「股票與 ETF 共用一套 Factor，再調權重」更合理。

## 1. 股票：Stock Weight Model

股票的核心是：

> **企業價值 + 成長 + 品質 + 合理估值**

例如 v0.3：

| Factor         |   Weight |
| -------------- | -------: |
| Valuation      |      25% |
| Growth         |      15% |
| Quality        |      15% |
| Buffett        |      15% |
| Price Position |      10% |
| Dividend       |      10% |
| Momentum       |       5% |
| Institutional  |       5% |
| **合計**         | **100%** |

股票再依產業切換**估值模型**，例如科技股偏 PE/DCF，金融股偏 PB/ROE。

---

# 2. ETF：ETF Weight Model

ETF 的核心不是「公司值多少錢」，而是：

> **基金品質 + 持有成本 + 追蹤能力 + 折溢價 + 收益特性 + 市場位置**

因此 ETF 不應該使用：

```text
EPS
ROE
Debt Ratio
FCF
Buffett Score
```

這些股票 Factor。

可以設計成：

| ETF Factor              | 初始 Weight |
| ----------------------- | --------: |
| Distribution / Dividend |       20% |
| Yield Stability         |       15% |
| Tracking Difference     |       15% |
| Liquidity               |       10% |
| Volatility              |       10% |
| Price Position          |       10% |
| NAV Premium/Discount    |       10% |
| Underlying Valuation    |       10% |
| **合計**                  |  **100%** |

這會比之前的：

> Dividend 30 / Yield Stability 15 / Liquidity 15 / ...

更完整。

---

# 3. 而且 ETF 還可以再分「策略型權重」

這是我覺得你的系統之後會很好用的地方。

不用只有一個 ETF Ranking。

可以有：

### ETF Value

偏重：

```text
NAV Discount
Underlying PE/PB
Price Position
Tracking Difference
```

### ETF Income

偏重：

```text
Dividend
Yield Stability
Distribution Growth
```

### ETF Core

偏重：

```text
Liquidity
Tracking Difference
Volatility
NAV Premium/Discount
Underlying Valuation
```

### ETF Growth

偏重：

```text
Underlying Growth
Underlying Valuation
Momentum
Tracking Difference
```

---

# 4. 所以架構應該是這樣

```text
                    Taiwan Market
                         │
              ┌──────────┴──────────┐
              │                     │
           STOCK                  ETF
              │                     │
       Stock Weight Model      ETF Weight Model
              │                     │
      ┌───────┴───────┐       ┌─────┴─────┐
      │               │       │           │
   Fundamental     Valuation Quality    Valuation
      │               │       │           │
      ▼               ▼       ▼           ▼
 Stock Score                 ETF Score
      │                         │
      ▼                         ▼
 TOP 30 Stocks              TOP N ETF
```

兩邊：

* **不共用 factor**
* **不共用 ranking**
* **不共用 valuation engine**
* **不共用 score definition**

但可以共用底層：

```text
Database
Data Lineage
Snapshot
Report
API Framework
Backtest Framework
Alert Framework
```

這叫做：

> **Shared Infrastructure, Independent Domain Engines**

這是我認為最乾淨的架構。

---

# 5. 還有一個重要的「第三層」

其實我不建議把所有權重都固定寫死在程式裡。

應該是：

```yaml
asset_class: stock
strategy: value_growth
version: 0.3.0

weights:
  valuation: 0.25
  growth: 0.15
  quality: 0.15
  buffett: 0.15
  price_position: 0.10
  dividend: 0.10
  momentum: 0.05
  institutional: 0.05
```

ETF：

```yaml
asset_class: etf
strategy: core
version: 0.3.0

weights:
  distribution: 0.20
  yield_stability: 0.15
  tracking_difference: 0.15
  liquidity: 0.10
  volatility: 0.10
  price_position: 0.10
  nav_discount: 0.10
  underlying_valuation: 0.10
```

這樣未來你可以直接增加：

```text
ETF Income
ETF Core
ETF Value
ETF Growth
```

而不用改 Engine。

---

# 6. 缺資料時兩套模型都做「重新正規化」

這個原則可以共用，但**Factor 本身不能共用**。

例如 ETF：

```text
Tracking Difference = unavailable
```

原本：

```text
20 + 15 + 15 + 10 + 10 + 10 + 10 + 10 = 100%
```

扣掉 tracking：

```text
80%
```

剩餘權重重新正規化：

```text
new_weight = old_weight / 0.80
```

最後再次得到：

```text
100%
```

股票也是相同的數學機制，但因子完全不同。

---

## 最後可以把整個平台定義得很清楚

```text
                    Quant Platform
                          │
              ┌───────────┴───────────┐
              │                       │
          STOCK DOMAIN            ETF DOMAIN
              │                       │
       Stock Factors             ETF Factors
       Stock Valuation           ETF Valuation
       Stock Ranking             ETF Ranking
       Stock Weight              ETF Weight
              │                       │
              └───────────┬───────────┘
                          │
                   Shared Platform
                          │
          ┌───────────────┼───────────────┐
          │               │               │
       Snapshot        Backtest        Report
          │               │               │
        Alerts           API             AI
```

### 我會把這定義成一條架構原則：

> **Asset Class Isolation, Infrastructure Sharing**

也就是：

**股票與 ETF 的「金融邏輯」完全隔離；資料庫、Snapshot、API、報告、排程等「工程基礎設施」可以共用。**

這樣未來你再加入 **REIT、債券 ETF、海外 ETF、基金**，也不需要破壞股票 Engine。

而且這也代表我們前面 v0.3 的規格應該再補一個正式概念：**`Asset Class Model`**，由它決定使用哪一套 factor、valuation、weighting、ranking pipeline。這會讓整個架構真正穩定下來。

