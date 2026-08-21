# 台股個股：估值、合理價與 Buy Zone 定義與數學規格

**Document:** Taiwan Stock Valuation & Buy Zone Specification  
**Version:** v0.1  
**Scope:** 台灣上市 / 上櫃普通股  
**用途:** Quant Engine / AI Analyst / Backtest / Daily Ranking

---

## 1. 核心概念

本規格將三個概念嚴格分離：

1. **估值（Valuation）**：使用一種或多種估值模型，計算公司在特定基本面假設下的價值。
2. **合理價（Fair Value）**：將多個估值模型整合後得到的 Bear / Base / Bull 情境價值。
3. **Buy Zone（買進區間）**：在 Base Fair Value 上套用 Margin of Safety（安全邊際）後得到的價格區間；它不是另一個估值模型。

因此：

```text
Financial Data
      ↓
Scenario Assumptions
      ↓
Valuation Models
      ↓
Bear / Base / Bull Fair Value
      ↓
Margin of Safety
      ↓
Buy Zones
```

---

## 2. 價值的三種層級

### 2.1 Intrinsic / Model Value

單一估值模型的輸出，例如：

```text
PE Model Value
PB Model Value
DCF Model Value
Dividend Model Value
```

### 2.2 Fair Value

多模型整合後的價值：

```text
Bear Value
Base Value
Bull Value
```

### 2.3 Buy Zone

根據 Base Value 與安全邊際計算：

```text
Buy Zone 1 = Base Value × (1 - MOS1)
Buy Zone 2 = Base Value × (1 - MOS2)
Buy Zone 3 = Base Value × (1 - MOS3)
```

**Buy Zone 不可被解讀為保證報酬率或買進訊號。**

---

# 3. 四個重要價格

系統至少輸出：

```text
bear_value
base_value
bull_value
current_price
```

並另外輸出：

```text
buy_zone_1
buy_zone_2
buy_zone_3
```

必要的狀態：

```text
WATCH
NEAR_BUY_ZONE_1
BUY_ZONE_1
BUY_ZONE_2
BUY_ZONE_3
INVESTIGATE
OVERVALUED
```

---

# 4. 情境估值：Bear / Base / Bull

## 4.1 定義

三種價值不是由 Base Value 直接乘上固定倍數得到，而是來自三組不同的基本面與估值假設。

```text
Bear  = Downside Fundamental Scenario
Base  = Central / Expected Scenario
Bull  = Upside Fundamental Scenario
```

每個情境都必須獨立計算。

基本約束：

```text
Bear Value ≤ Base Value ≤ Bull Value
```

若違反，結果標記 `INVALID_MODEL_OUTPUT`。

---

# 5. PE 估值模型

適用：科技、電子、消費、工業等盈利較穩定且 PE 有意義的公司。

## 5.1 基本公式

```text
PE Fair Value = Forward / Normalized EPS × Target PE
```

數學式：

\[
FV_{PE,s}=EPS_s\times PE_s
\]

其中 `s ∈ {Bear, Base, Bull}`。

---

## 5.2 EPS 定義

優先順序：

```text
1. TTM Actual EPS
2. Normalized EPS
3. Analyst Consensus EPS
4. Internal Model Estimated EPS
```

如果使用第 4 類，必須標：

```text
estimate_method = INTERNAL_MODEL
```

不得將 Internal Model Estimated EPS 標記為 Analyst Consensus。

---

## 5.3 Target PE

優先使用：

```text
5Y historical median PE
```

Fallback：

```text
3Y historical median PE
→ sector median PE
→ configured sector default
```

建議情境：

```text
Bear PE  = historical 25th percentile
Base PE  = historical 50th percentile / median
Bull PE  = historical 75th percentile
```

公式：

\[
FV_{PE,Bear}=EPS_{Bear}\times PE_{25}
\]

\[
FV_{PE,Base}=EPS_{Base}\times PE_{50}
\]

\[
FV_{PE,Bull}=EPS_{Bull}\times PE_{75}
\]

---

# 6. PB 估值模型

適用：金融股、資產型公司、PB 與 ROE 有穩定關係的企業。

公式：

\[
FV_{PB,s}=BVPS_s\times PB_s
\]

其中：

```text
BVPS = Book Value Per Share
PB_s = Scenario Target P/B
```

情境可設定為：

```text
Bear PB = historical 25th percentile
Base PB = historical median
Bull PB = historical 75th percentile
```

金融股建議同時檢查 ROE 與 PB 是否合理匹配。

---

# 7. Dividend Yield 估值模型

適用：成熟、高股息、現金流穩定企業。

公式：

\[
FV_{DIV,s}=\frac{DPS_s}{TargetYield_s}
\]

其中：

```text
DPS = Expected Cash Dividend Per Share
TargetYield = Required / Normalized Yield
```

例如：

```text
DPS = 5
Target Yield = 5%

FV = 5 / 0.05 = 100
```

注意：高殖利率不等於高品質，因此 DPS 必須搭配 payout ratio、FCF coverage、earnings stability。

---

# 8. DCF 估值模型

適用：能建立相對可信 FCF 預估的公司。

基本公式：

\[
EV=\sum_{t=1}^{n}\frac{FCF_t}{(1+WACC)^t}+\frac{TV}{(1+WACC)^n}
\]

Terminal Value：

\[
TV=\frac{FCF_{n+1}}{WACC-g}
\]

其中：

```text
FCF = Free Cash Flow
WACC = Weighted Average Cost of Capital
g = Terminal Growth Rate
```

股權價值：

\[
EquityValue = EV - NetDebt + NonOperatingAssets
\]

每股價值：

\[
FV_{DCF} = \frac{EquityValue}{DilutedSharesOutstanding}
\]

---

# 9. Multi-Model Fair Value

不得只依賴單一估值模型。

令：

```text
w_PE
w_PB
w_DIV
w_DCF
```

且：

\[
w_{PE}+w_{PB}+w_{DIV}+w_{DCF}=1
\]

則情境 `s` 的 Fair Value：

\[
FV_s=w_{PE}FV_{PE,s}+w_{PB}FV_{PB,s}+w_{DIV}FV_{DIV,s}+w_{DCF}FV_{DCF,s}
\]

不同產業使用不同權重。

### 科技 / 半導體範例

```text
PE       50%
DCF      35%
PB        5%
Dividend 10%
```

### 金融範例

```text
PE       30%
PB       50%
Dividend 20%
DCF       0%
```

若某模型不可用，該模型權重必須移除並重新正規化，而不是假設數值。

---

# 10. Scenario Assumption

Bear / Base / Bull 必須由基本面假設驅動。

## 10.1 Revenue

例如：

```text
Bear: revenue growth = low case
Base: revenue growth = central case
Bull: revenue growth = high case
```

## 10.2 Margin

例如：

```text
Bear: operating margin deteriorates
Base: margin remains normalized
Bull: margin expands
```

## 10.3 EPS / FCF

EPS / FCF 必須由 revenue、margin、tax、share count 等推導；不得直接手填價格。

---

# 11. Scenario Fair Value Example

假設：

```text
EPS Bear = 15.5
EPS Base = 17.5
EPS Bull = 19.5

PE Bear = 13x
PE Base = 16x
PE Bull = 18x
```

則：

```text
Bear = 15.5 × 13 = 201.5
Base = 17.5 × 16 = 280.0
Bull = 19.5 × 18 = 351.0
```

輸出：

```text
bear_value = 202
base_value = 280
bull_value = 351
```

---

# 12. Margin of Safety

Margin of Safety（MOS）不是「預測跌幅」，而是針對模型不確定性保留的折價。

基本概念：

\[
MOS=1-\frac{Price}{FairValue}
\]

若目前股價 250、Base Value 280：

\[
MOS=1-\frac{250}{280}=10.71\%
\]

---

# 13. Buy Zone

## 13.1 基本公式

第一版採固定安全邊際：

```text
Zone 1 MOS = 10%
Zone 2 MOS = 20%
Zone 3 MOS = 30%
```

因此：

\[
BZ1=BaseValue\times0.90
\]

\[
BZ2=BaseValue\times0.80
\]

\[
BZ3=BaseValue\times0.70
\]

例如 Base Value = 280：

```text
Buy Zone 1 = 252
Buy Zone 2 = 224
Buy Zone 3 = 196
```

---

# 14. Buy Zone 不等於 Bear Value

例如：

```text
Bear Value = 202
Base Value = 280
Buy Zone 1 = 252
Buy Zone 2 = 224
Buy Zone 3 = 196
```

意義：

```text
Bear Value
= 基本面悲觀情境下的合理價值

Buy Zone
= 投資人對 Base Value 施加安全邊際後的價格
```

兩者不能混用。

---

# 15. Buy Zone State Machine

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

若：

```text
Current Price < Bear Value
```

必須額外檢查基本面是否惡化。

不要直接標示「極度便宜」，而應：

```text
INVESTIGATE
```

若 `Current Price < Bear Value` 且基本面正常，才可在報表中標示：

```text
DEEP_VALUE_CANDIDATE
```

---

# 16. Fair Value Margin

額外輸出：

\[
Upside_{Base}=\frac{BaseValue}{CurrentPrice}-1
\]

\[
Downside_{Bear}=\frac{BearValue}{CurrentPrice}-1
\]

\[
Upside_{Bull}=\frac{BullValue}{CurrentPrice}-1
\]

例如：

```text
Current = 250
Bear = 202
Base = 280
Bull = 351
```

得到：

```text
Bear downside = -19.2%
Base upside   = +12.0%
Bull upside   = +40.4%
```

---

# 17. Risk / Reward

可以計算簡化的情境 Risk/Reward：

\[
RR_{Base/Bear}=\frac{BaseValue-CurrentPrice}{CurrentPrice-BearValue}
\]

注意：分母若小於或等於 0，不得計算，標記 `UNDEFINED`。

例如：

```text
Current = 250
Base = 280
Bear = 202
```

\[
RR=\frac{280-250}{250-202}=0.625
\]

代表 Base 上行空間小於 Bear 下行風險。

這種情況不應因為「Base > Current」就直接視為高吸引力。

---

# 18. Dynamic Buy Zone（未來版本）

固定 10/20/30% MOS 是 v0.x 的簡化規則。

未來可根據估值不確定性動態調整：

\[
MOS=f(Volatility, ValuationUncertainty, EarningsRisk, DataConfidence)
\]

例如高波動、高週期性、低資料可信度公司使用更大的 MOS。

此功能不屬於 v0.1 baseline。

---

# 19. Data Quality Rules

以下資料不足時不得硬算：

- EPS
- Book Value
- Revenue
- FCF
- Dividend
- Historical PE/PB
- Share Count

替代方案必須明確標示：

```text
ACTUAL
NORMALIZED
CONSENSUS_ESTIMATE
INTERNAL_MODEL_ESTIMATE
UNAVAILABLE
```

---

# 20. Look-Ahead Bias

回測中只能使用 `reported_at` 之前已公開的資料。

例如：

```text
Fiscal Period End = 2025-12-31
Reported At       = 2026-03-15
```

則 2026-01-01 不得使用該財報。

---

# 21. Deterministic Requirements

同一：

```text
snapshot_id
model_version
parameter_version
```

下，Fair Value 必須完全可重現。

LLM 不得直接輸入：

```text
bear_value
base_value
bull_value
buy_zone_1
buy_zone_2
buy_zone_3
```

上述值必須由 Quant Engine 計算。

---

# 22. Recommended Output Schema

```json
{
  "symbol": "2317",
  "current_price": 250,
  "valuation": {
    "bear_value": 202,
    "base_value": 280,
    "bull_value": 351
  },
  "buy_zones": {
    "zone_1": 252,
    "zone_2": 224,
    "zone_3": 196
  },
  "upside": {
    "bear": -0.192,
    "base": 0.120,
    "bull": 0.404
  },
  "state": "NEAR_BUY_ZONE_1",
  "model_version": "v0.1"
}
```

---

# 23. Final Principle

**估值回答：這家公司值多少？**

**合理價回答：在不同基本面情境下，合理價值區間是多少？**

**Buy Zone 回答：在保留安全邊際後，什麼價格開始有吸引力？**

三者必須保持獨立。
