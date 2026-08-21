# 台灣 ETF：估值、合理價與 Buy Zone 定義與數學規格

**Document:** Taiwan ETF Valuation & Buy Zone Specification  
**Version:** v0.1  
**Scope:** 台灣上市 ETF / 受益憑證  
**用途:** ETF Quant Engine / ETF Ranking / AI Analyst / Backtest

---

## 1. 核心概念

ETF 與股票完全不同：

```text
股票 → 公司企業價值
ETF → 基金資產 / NAV / 指數與持倉價值
```

因此 ETF 不使用股票的：

```text
EPS
ROE
公司 DCF
公司 PB
Buffett Score
```

ETF Engine 必須獨立計算：

1. Market Price
2. NAV / Estimated NAV
3. Premium / Discount
4. Distribution / Yield
5. Yield Stability
6. Liquidity
7. Volatility
8. Price Position
9. Tracking Difference
10. Underlying Valuation（如資料可得）

---

# 2. ETF 的三層價值概念

ETF 的「合理價」不能照搬股票的 EPS × PE。

應拆成：

### Layer 1 — NAV

基金單位的資產淨值。

### Layer 2 — Market Fair Price

依 NAV、折溢價、流動性、追蹤品質等估算市場合理交易價格。

### Layer 3 — Buy Zone

對 Market Fair Price / NAV-based Fair Value 施加安全邊際。

---

# 3. NAV 定義

## 3.1 Previous NAV

前一營業日基金官方淨值：

```text
previous_nav
```

## 3.2 Estimated Intraday NAV

若官方提供盤中預估淨值：

```text
estimated_nav
```

優先使用 latest valid estimated NAV。

## 3.3 Market Price

ETF 當日市場價格：

```text
market_price
```

---

# 4. Premium / Discount

ETF 市價相對 NAV：

\[
PremiumDiscount=\frac{Price-NAV}{NAV}
\]

其中：

```text
> 0  = Premium
< 0  = Discount
= 0  = At NAV
```

例如：

```text
Price = 33.20
NAV   = 33.05
```

\[
\frac{33.20-33.05}{33.05}=0.454\%
\]

結果：

```text
Premium = +0.454%
```

---

# 5. ETF 合理價格的核心觀念

ETF 的 Fair Price 不應只是：

```text
NAV × arbitrary multiplier
```

第一優先模型是：

\[
FairPrice_{NAV}=NAV\times(1+NormalizedPremiumDiscount)
\]

例如歷史正常折溢價中位數：

```text
Normalized Premium = +0.10%
```

NAV = 33.05：

\[
FairPrice=33.05\times1.001=33.083
\]

約：

```text
33.08
```

---

# 6. Normalized Premium / Discount

優先使用 ETF 自身歷史資料：

```text
3Y median premium/discount
```

若資料不足：

```text
1Y median
→ comparable ETF category median
→ 0%
```

Fallback 必須記錄：

```text
premium_source
premium_lookback
fallback_reason
```

不得將 fallback 假裝成官方值。

---

# 7. ETF Fair Value Scenarios

ETF 可以建立：

```text
Conservative Value
Base Value
Optimistic Value
```

但其來源與股票不同。

核心變數不是 EPS，而是：

```text
NAV
Underlying Asset Value
Normal Premium/Discount
Tracking Difference
Distribution / Carry
```

---

# 8. Conservative / Base / Optimistic NAV Scenarios

如果有 underlying / index forecast，則可以先建立 NAV scenario：

```text
NAV_Bear
NAV_Base
NAV_Bull
```

然後套用情境折溢價：

\[
FV_s=NAV_s\times(1+PD_s)
\]

其中：

```text
s ∈ {Bear, Base, Bull}
PD_s = scenario normalized premium/discount
```

---

# 9. ETF Fair Value：簡化模型

若沒有可靠的 NAV 預測，只具備當前 NAV：

\[
FV_{Base}=NAV_{current}\times(1+PD_{median})
\]

Bear：

\[
FV_{Bear}=NAV_{current}\times(1+PD_{low})
\]

Bull：

\[
FV_{Bull}=NAV_{current}\times(1+PD_{high})
\]

其中可使用歷史折溢價 percentiles：

```text
PD_low    = historical 10th / 25th percentile
PD_median = historical 50th percentile
PD_high   = historical 75th / 90th percentile
```

注意：這表示「折溢價情境」，不是預測 ETF 基本資產本身會上漲或下跌。

---

# 10. Underlying Valuation

若 ETF 成分與權重資料可取得，可額外計算：

```text
Underlying PE
Underlying PB
Underlying Yield
Top10 Concentration
Sector Concentration
```

這些可以作為 ETF Valuation / Risk 因子，但必須區分：

```text
OFFICIAL
DERIVED
ESTIMATED
UNAVAILABLE
```

不得把自行推導值當成官方資料。

---

# 11. Underlying PE

若能取得持倉與權重，避免直接使用：

\[
PE=\sum_i w_iPE_i
\]

因為 PE 的簡單算術加權通常不具正確的財務意義。

優先考慮以 underlying earnings exposure 推導：

\[
PE_{portfolio}\approx\frac{\sum_i w_iP_i}{\sum_i w_iE_i}
\]

其中 `w_i` 為基金持倉權重，`P_i` 與 `E_i` 為對應價格 / 每股盈餘。

若資料無法支援可靠推導，輸出：

```text
underlying_pe.status = UNAVAILABLE
```

不得猜測。

---

# 12. Underlying PB

可近似為：

\[
PB_{portfolio}\approx\frac{\sum_i w_iMarketValue_i}{\sum_i w_iBookValue_i}
\]

或採供應方已提供之 portfolio PB。

若使用自算值，必須標示：

```text
derivation_method = WEIGHTED_BALANCE_SHEET_AGGREGATION
```

---

# 13. Tracking Difference

若 ETF 追蹤指數：

\[
TD=R_{ETF}-R_{Index}
\]

例如：

```text
ETF return   = 9.4%
Index return = 10.0%
```

則：

\[
TD=-0.6\%
\]

通常絕對值越小越好。

若使用 annualized tracking difference：

\[
ATD=Annualized(R_{ETF}-R_{Index})
\]

必須明確記錄 lookback period。

---

# 14. Tracking Quality Score

若採 0–100：

可以依歷史 tracking difference 的絕對值百分位反向轉換：

\[
Score_{tracking}=100-PercentileRank(|TD|)
\]

也可以加入 tracking error：

\[
TrackingError=StdDev(R_{ETF}-R_{Index})
\]

v0.x 至少需要一致定義，不得混用不同期間。

---

# 15. Expense Ratio

Expense Ratio 是 ETF 成本因子，不是直接的「便宜價格」。

可用於 Quality / Cost Score：

\[
CostScore=100-PercentileRank(ExpenseRatio)
\]

數值越低越好。

如果官方資料未取得：

```text
expense_ratio.status = UNAVAILABLE
```

不得用管理費、經理費等單一項目自行冒充完整 expense ratio，除非 schema 明確改名。

---

# 16. Dividend / Distribution Value

ETF 不應使用股票的 EPS × PE 估值。

若策略是 Income ETF，可使用：

\[
FV_{Income}=ExpectedDistribution/TargetYield
\]

例如：

```text
Expected annual distribution = 2.2
Target yield = 7%
```

\[
FV=2.2/0.07=31.43
\]

這是 Income Fair Value，不是 NAV Fair Value。

---

# 17. Multi-Model ETF Fair Value

如果同時有 NAV Model 與 Income Model：

\[
FV_s=w_{NAV}FV_{NAV,s}+w_{Income}FV_{Income,s}+w_{Underlying}FV_{Underlying,s}
\]

但必須避免把高度重複的資訊雙重計算。

推薦 v0.x：

```text
NAV / Premium-Discount = primary
Income Model             = strategy-dependent secondary
Underlying valuation     = context / secondary
```

---

# 18. ETF Buy Zone

ETF Buy Zone 必須與 Fair Value 分開。

如果採 Base Fair Price：

\[
BZ1=FV_{Base}\times(1-MOS_1)
\]

\[
BZ2=FV_{Base}\times(1-MOS_2)
\]

\[
BZ3=FV_{Base}\times(1-MOS_3)
\]

v0.1 baseline：

```text
MOS1 = 5%
MOS2 = 10%
MOS3 = 15%
```

ETF 的安全邊際可比個股小，因為 ETF 本身已具分散效果；但實際幅度應依 ETF 類型調整。

---

# 19. ETF 不應直接使用股票的 10 / 20 / 30% MOS

股票個別公司可能因：

- 盈餘不確定性
- 個別公司風險
- 財報波動
- 產業週期

需要較大的 MOS。

ETF 通常個別公司風險較低，因此可採較小 MOS。

但：

```text
高波動 ETF
高槓桿 ETF
商品型 ETF
主題集中 ETF
```

應考慮較大的 MOS。

---

# 20. ETF Buy Zone State Machine

```text
Current Price > Buy Zone 1
    → WATCH

Buy Zone 2 < Current Price <= Buy Zone 1
    → BUY_ZONE_1

Buy Zone 3 < Current Price <= Buy Zone 2
    → BUY_ZONE_2

Current Price <= Buy Zone 3
    → BUY_ZONE_3
```

若市場價格長時間顯著低於 NAV 或歷史折價區間，需檢查：

```text
Tracking Problem
Underlying Market Crash
Leverage Effect
Corporate Action
Data Error
```

不得直接視為「超級便宜」。

---

# 21. ETF Price Position

可計算：

```text
Distance from 52W High
Distance from 3Y High
Price / MA60
Price / MA200
```

但此 factor 代表「市場價格位置」，不等於「內在價值折價」。

兩者不得混為一談。

---

# 22. ETF Valuation Signals

可以輸出：

```text
NAV Premium / Discount
Historical Premium / Discount Percentile
Underlying PE Percentile
Underlying PB Percentile
Current Distribution Yield Percentile
```

例如：

```text
Current discount = -1.8%
Historical median = -0.2%
Historical percentile = 20th
```

可視為相對折價，但不能直接等同於 ETF 必然上漲。

---

# 23. ETF Scenario Example

假設：

```text
Current NAV = 100
Historical PD:
10th percentile = -2.0%
Median          =  0.0%
90th percentile = +1.5%
```

則：

```text
Bear Value = 100 × (1 - 0.020) = 98.0
Base Value = 100 × (1 + 0.000) = 100.0
Bull Value = 100 × (1 + 0.015) = 101.5
```

接著若 MOS：

```text
5%
10%
15%
```

則：

```text
Buy Zone 1 = 95.0
Buy Zone 2 = 90.0
Buy Zone 3 = 85.0
```

注意：這個例子僅代表「折溢價均值回歸」模型，並沒有預測 underlying NAV 成長。

---

# 24. ETF 成長型估值

若 ETF 追蹤成長型指數，可另外建立 underlying NAV scenario：

```text
NAV Bear
NAV Base
NAV Bull
```

例如：

```text
NAV Bear = 95
NAV Base = 105
NAV Bull = 115
```

搭配折溢價：

```text
PD Bear = -1.0%
PD Base = 0.0%
PD Bull = +0.5%
```

得到：

\[
FV_{Bear}=95\times0.99=94.05
\]

\[
FV_{Base}=105\times1.00=105
\]

\[
FV_{Bull}=115\times1.005=115.575
\]

這才是 ETF 真正具有「Bear/Base/Bull」基本面含義的情境估值。

---

# 25. Data Availability States

資料欄位使用：

```text
AVAILABLE
NOT_YET_AVAILABLE
DATA_UNAVAILABLE
STALE
INVALID
DERIVED
ESTIMATED
```

差異：

```text
NOT_YET_AVAILABLE
= 系統/資料來源目前尚未支援

DATA_UNAVAILABLE
= 本來支援，但本次沒有取得

STALE
= 有資料，但超過 freshness threshold

DERIVED
= 從其他資料自行推導

ESTIMATED
= 模型估算
```

不得把上述狀態混為一談。

---

# 26. ETF Factor 與 Valuation 分離

Ranking factor：

```text
Dividend
Yield Stability
Liquidity
Volatility
Price Position
Tracking Difference
```

Valuation / informational metrics：

```text
NAV
Premium / Discount
Underlying PE
Underlying PB
Expense Ratio
```

不要因為一個指標可取得，就自動加入 ranking。

---

# 27. Buy Zone 的核心定義

ETF Buy Zone 的目的不是預測最低點。

它代表：

> **在估值合理與風險可接受的前提下，價格開始具有安全邊際。**

因此：

```text
Buy Zone ≠ Bottom Price
Buy Zone ≠ Guaranteed Return
Buy Zone ≠ NAV
Buy Zone ≠ Discount alone
```

---

# 28. ETF Risk / Reward

可使用：

\[
Upside_{Base}=\frac{BaseValue-Price}{Price}
\]

\[
Downside_{Bear}=\frac{BearValue-Price}{Price}
\]

簡化 Risk/Reward：

\[
RR=\frac{BaseValue-Price}{Price-BearValue}
\]

分母 <= 0 時標記 `UNDEFINED`。

---

# 29. ETF Ranking 與 Buy Zone

ETF Ranking Score 與 Buy Zone 必須分離。

例如一檔 ETF 可以：

```text
Quality Score = 92
Valuation Score = 60
```

即：

> 「是一支好 ETF，但現在價格未必便宜。」

因此不能因 Ranking 高就自動得到 BUY_ZONE。

---

# 30. Recommended Output Schema

```json
{
  "symbol": "00878",
  "current_price": 33.2,
  "nav": {
    "value": 33.05,
    "status": "AVAILABLE"
  },
  "premium_discount": 0.00454,
  "valuation": {
    "bear_value": 31.5,
    "base_value": 33.1,
    "bull_value": 34.2
  },
  "buy_zones": {
    "zone_1": 31.45,
    "zone_2": 29.79,
    "zone_3": 28.14
  },
  "informational_metrics": {
    "underlying_pe": {
      "value": null,
      "status": "UNAVAILABLE"
    },
    "underlying_pb": {
      "value": null,
      "status": "UNAVAILABLE"
    },
    "expense_ratio": {
      "value": null,
      "status": "UNAVAILABLE"
    }
  },
  "state": "WATCH",
  "model_version": "ETF-v0.1"
}
```

---

# 31. Deterministic Requirements

相同：

```text
snapshot_id
model_version
parameter_version
```

必須產生相同：

```text
NAV Fair Value
Premium/Discount
Bear/Base/Bull
Buy Zone
```

LLM 不得直接決定上述數字。

---

# 32. Final Principle

**ETF 估值回答：基金持有的資產目前值多少？**

**ETF 合理價回答：在正常折溢價與 underlying 情境下，市場價格合理落點在哪裡？**

**ETF Buy Zone 回答：在保留安全邊際後，什麼價格開始具有吸引力？**

ETF 不應套用個股 EPS × PE 的估值邏輯，也不應單純因為「跌很多」就被判定為便宜。
