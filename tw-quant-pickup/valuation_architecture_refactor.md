# Task: Refactor Stock Valuation Architecture

你現在要修改現有的 Taiwan Stock Quantitative Ranking 系統。

**不要把這個任務理解成「新增幾個估值公式」。**

本次變更的核心是重新定義三個完全不同的概念：

1. **Historical Valuation**
2. **Fair Value**
3. **Buy Zone**

這三者必須在 architecture、data model、service/module、API、ranking 與 report 中清楚分離。

---

# 1. Core Design Principle

請嚴格遵守以下關係：

```text
Historical Valuation
        ↓
「現在相對歷史估值是否便宜？」
        │
        ▼
Forward / Intrinsic Valuation
        ↓
「公司未來合理價值是多少？」
        │
        ▼
Fair Value
(Bear / Base / Bull)
        │
        ▼
Margin of Safety
        │
        ▼
Buy Zone
```

不得將以上三層合併成單一 `valuation_score` 或單一 `fair_value`。

---

# 2. Historical Valuation

Historical Valuation 是一個 **relative valuation model**。

目的：

> 判斷目前估值相對於公司自身歷史區間的位置。

它不是 Fair Value。

---

## 2.1 Historical P/B

資料來源：

- 證交所 / 櫃買中心每日公布的個股 P/B
- 評估期間：最近 5 年
- 使用 point-in-time historical data

若公司上市櫃未滿 5 年：

```text
status = INSUFFICIENT_HISTORY
```

不得自行補足。

---

## 2.2 P/B Historical Range

定義：

```text
PB_min = 5Y minimum P/B
PB_max = 5Y maximum P/B

PB_range = PB_max - PB_min

Q = PB_range / 4
```

四分位界線：

```text
Q1 = PB_min + Q
Q2 = PB_min + 2Q
Q3 = PB_min + 3Q
```

定義：

```text
PB_POSITION =
    (current_pb - PB_min)
    / (PB_max - PB_min)
```

範圍：

```text
0.0 = 5Y low
0.5 = midpoint
1.0 = 5Y high
```

---

## 2.3 P/B Historical Classification

依證交所歷史區間評價：

```text
PB_POSITION <= 0.25
    → CHEAP

0.25 < PB_POSITION < 0.75
    → FAIR

PB_POSITION >= 0.75
    → EXPENSIVE
```

這個分類是：

```text
historical_relative_valuation
```

不是：

```text
intrinsic_value
```

---

## 2.4 Historical Cheap / Expensive Price

使用 CURRENT BVPS 將歷史 P/B 區間轉換為目前公司的對應價格。

```text
cheap_pb =
    PB_min + (PB_max - PB_min) / 4

expensive_pb =
    PB_min + 3 * (PB_max - PB_min) / 4
```

價格：

```text
historical_cheap_price =
    current_bvps * cheap_pb

historical_expensive_price =
    current_bvps * expensive_pb
```

注意：

這不是預測價格。

它的語意是：

> 「如果市場重新給目前 BVPS 所對應的歷史 P/B 區間，價格大約在哪裡？」

---

# 3. Historical PE

建立與 P/B 類似的 5Y Historical PE Model。

資料：

```text
PE_min
PE_max
PE_Q1
PE_Q2
PE_Q3
current_pe
```

計算：

```text
PE_POSITION =
    (current_pe - PE_min)
    / (PE_max - PE_min)
```

分類：

```text
<= 0.25 → CHEAP
0.25~0.75 → FAIR
>= 0.75 → EXPENSIVE
```

注意：

PE <= 0、EPS <= 0 時不得直接套用。

應標示：

```text
INVALID
NOT_APPLICABLE
```

---

# 4. Historical Dividend Yield

建立 5Y Historical Dividend Yield Position。

注意：

殖利率和 PE/PB 的方向不同：

> 殖利率越高，通常代表估值越便宜。

因此 position 必須反向處理。

```text
Yield_min
Yield_max

YIELD_POSITION =
    (current_yield - Yield_min)
    / (Yield_max - Yield_min)
```

再轉成 valuation cheapness：

```text
YIELD_CHEAPNESS =
    1 - YIELD_POSITION
```

或明確定義：

```text
high yield = cheap
low yield = expensive
```

不得直接把高殖利率視為高分而忽略股利品質。

---

# 5. Historical Valuation Score

Historical Valuation 只回答：

> 「現在相對自己的歷史位置是否便宜？」

建立：

```text
historical_valuation_score
```

例如：

```text
Historical PB Position
Historical PE Position
Historical Yield Position
```

再依產業設定權重。

但注意：

**Historical Valuation Score 不得直接等於 Fair Value。**

---

# 6. Fair Value

Fair Value 是完全不同的 layer。

目的：

> 對公司未來基本面建立合理價格估計。

Fair Value 必須產生：

```text
bear_value
base_value
bull_value
```

---

# 7. Fair Value Formula

Fair Value 不得使用：

```text
Base Value × 0.8
Base Value × 1.2
```

來假造 Bear / Bull。

必須從不同 fundamental scenarios + valuation assumptions independently calculate。

一般股票：

```text
Fair Value =
    Valuation Model 1
    + Valuation Model 2
    + ...
```

每個 scenario 都必須獨立計算。

---

# 8. Scenario Model

建立：

```text
BEAR
BASE
BULL
```

每一個 scenario 至少包含：

```text
Revenue Growth
EPS / FCF
Operating Margin
Valuation Multiple
WACC
Terminal Growth
Dividend
BVPS
ROE
```

依產業選擇適用欄位。

---

# 9. PE Fair Value

基本模型：

```text
PE Fair Value =
    Scenario EPS
    ×
    Scenario Normalized PE
```

所以：

```text
bear_pe_value =
    bear_eps × bear_pe

base_pe_value =
    base_eps × base_pe

bull_pe_value =
    bull_eps × bull_pe
```

---

# 10. PB Fair Value

適用產業：

- Financial
- Banks
- Securities
- Insurance
- Asset-heavy businesses

公式：

```text
PB Fair Value =
    Scenario BVPS
    ×
    Scenario Normalized PB
```

---

# 11. Dividend Fair Value

適用：

- Mature companies
- Stable dividend stocks

公式：

```text
Dividend Fair Value =
    Expected Dividend
    /
    Target Yield
```

Target Yield 必須有資料依據，例如：

```text
5Y historical median yield
sector yield
risk-adjusted target yield
```

不得任意指定。

---

# 12. DCF Fair Value

需要：

```text
Revenue
Revenue Growth
Operating Margin
Tax
Capex
Working Capital
FCF
WACC
Terminal Growth
```

公式：

```text
Enterprise Value =
Σ FCF_t / (1 + WACC)^t
+
Terminal Value / (1 + WACC)^n
```

Terminal Value：

```text
TV =
FCF_(n+1)
/
(WACC - g)
```

必須驗證：

```text
WACC > terminal_growth
```

否則：

```text
INVALID
```

---

# 13. Multi-Model Fair Value

每個產業使用不同 valuation model weights。

例如 Technology：

```text
PE       40%
DCF      40%
PB       10%
Dividend 10%
```

Financial:

```text
PB       45%
PE       25%
Dividend 20%
DCF      10%
```

模型權重必須存在 configuration，不得 hard-code。

---

# 14. Fair Value Aggregation

每個 scenario 分別計算。

例如：

```text
Bear:
    PE   = 200
    DCF  = 210
    PB   = 190
    DIV  = 180

Base:
    PE   = 280
    DCF  = 290
    PB   = 260
    DIV  = 220

Bull:
    PE   = 350
    DCF  = 370
    PB   = 320
    DIV  = 250
```

套用 model weights：

```text
bear_value =
    Σ(weight_i × model_value_i_bear)

base_value =
    Σ(weight_i × model_value_i_base)

bull_value =
    Σ(weight_i × model_value_i_bull)
```

必須保證：

```text
bear_value <= base_value <= bull_value
```

若不成立：

```text
VALUATION_INVALID
```

---

# 15. Buy Zone

Buy Zone 不是 historical valuation。

Buy Zone 是：

> **以 Base Fair Value 為基礎套用 Margin of Safety。**

定義：

```text
buy_zone_1 =
    base_value × 0.90

buy_zone_2 =
    base_value × 0.80

buy_zone_3 =
    base_value × 0.70
```

其中：

```text
Zone 1 = 10% discount
Zone 2 = 20% discount
Zone 3 = 30% discount
```

---

# 16. Buy Zone State

定義：

```text
current_price > buy_zone_1
    → WATCH

buy_zone_2 < current_price <= buy_zone_1
    → BUY_ZONE_1

buy_zone_3 < current_price <= buy_zone_2
    → BUY_ZONE_2

current_price <= buy_zone_3
    → BUY_ZONE_3
```

---

# 17. Bear Value Interaction

如果：

```text
current_price < bear_value
```

不得自動判斷：

```text SUPER CHEAP
```

而應：

```text
INVESTIGATE
```

原因可能是：

- 基本面惡化
- Earnings collapse
- Structural change
- Scenario model too conservative
- Data issue

---

# 18. Margin of Safety

定義：

```text
MOS =
    (base_value - current_price)
    / base_value
```

例如：

```text
Base Value = 280
Current = 250

MOS =
(280 - 250) / 280
= 10.71%
```

如果：

```text
MOS > 0
```

表示目前價格低於 Base Value。

如果：

```text
MOS < 0
```

表示價格高於 Base Value。

---

# 19. Upside / Downside

計算：

```text
Upside =
    (base_value - current_price)
    / current_price
```

Bear downside：

```text
Downside =
    (bear_value - current_price)
    / current_price
```

Bull upside：

```text
Bull Upside =
    (bull_value - current_price)
    / current_price
```

---

# 20. Risk / Reward

建立：

```text
Reward =
    bull_value - current_price

Risk =
    current_price - bear_value
```

如果：

```text
Risk > 0
```

則：

```text
RiskReward =
    Reward / Risk
```

若 current price <= bear value：

```text
RiskReward = UNDEFINED
State = INVESTIGATE
```

不要產生虛假的無限大。

---

# 21. Important Separation

資料模型必須明確分開：

```text
Historical Valuation
--------------------
historical_pe_position
historical_pb_position
historical_yield_position
historical_valuation_score
historical_classification


Fair Value
--------------------
bear_value
base_value
bull_value
valuation_model_breakdown


Buy Zone
--------------------
buy_zone_1
buy_zone_2
buy_zone_3
margin_of_safety
buy_zone_state
```

禁止使用單一：

```text
valuation_score
```

混合這三層概念。

---

# 22. Ranking Usage

Top 30 Ranking 必須可以同時看到：

```text
Historical Valuation Score
Fundamental Quality Score
Growth Score
Fair Value
Margin of Safety
Risk / Reward
Buy Zone State
```

建議：

```text
Historical Valuation
```

作為：

> relative valuation factor

而：

```text
Fair Value + Margin of Safety
```

作為：

> intrinsic valuation / price-attractiveness layer

---

# 23. Example

假設：

```text
Current Price = 250

Historical PB Position = 0.22
Historical PE Position = 0.31

Bear Value = 205
Base Value = 280
Bull Value = 340
```

則：

```text
Historical Valuation:
PB = CHEAP
PE = FAIR

MOS:
(280 - 250) / 280
= 10.71%

Buy Zone 1:
252

Buy Zone 2:
224

Buy Zone 3:
196

Current State:
BUY_ZONE_1
```

報告應表達：

```text
Historical valuation is relatively inexpensive,
while intrinsic valuation indicates approximately
10.7% margin of safety.

Current price is near Buy Zone 1.
```

---

# 24. Architecture

不要把所有估值邏輯放在同一個 module。

建議：

```text
valuation/
├── historical/
│   ├── pe.py
│   ├── pb.py
│   ├── dividend_yield.py
│   └── engine.py
│
├── intrinsic/
│   ├── pe.py
│   ├── pb.py
│   ├── dividend.py
│   ├── dcf.py
│   └── engine.py
│
├── scenario/
│   └── engine.py
│
└── buyzone/
    └── engine.py
```

---

# 25. AI Role

LLM 不得計算或覆寫：

```text
bear_value
base_value
bull_value
historical_valuation_score
buy_zone_1
buy_zone_2
buy_zone_3
```

LLM 只允許：

```text
Explain
Summarize
Identify risks
Explain valuation changes
```

---

# 26. Required Tests

至少建立：

### Historical P/B

```text
5Y Min / Max
Q1 / Q2 / Q3
Position
Classification
```

### Historical PE

同上。

### Historical Yield

反向 ranking 正確。

### Fair Value

驗證：

```text
bear <= base <= bull
```

### Buy Zone

驗證：

```text
zone1 > zone2 > zone3
```

### MOS

驗證：

```text
Base = 100
Current = 80
MOS = 20%
```

### State

測試：

```text
110 → WATCH
90  → BUY_ZONE_1
75  → BUY_ZONE_2
60  → BUY_ZONE_3
```

### Invalid Scenario

如果：

```text
WACC <= terminal_growth
```

必須：

```text
INVALID
```

---

# 27. Acceptance Criteria

Implementation 完成前，必須確認：

```text
[ ] Historical Valuation and Fair Value are separate modules
[ ] Historical PE/PB/Yield Position is independently calculable
[ ] Historical valuation does not directly become Fair Value
[ ] Bear/Base/Bull are independently calculated scenarios
[ ] Fair Value uses sector-specific valuation models
[ ] Buy Zone derives from Base Fair Value
[ ] Bear/Base/Bull cannot be generated by Base × arbitrary constants
[ ] Margin of Safety is calculated
[ ] Risk/Reward is calculated
[ ] Current valuation state is deterministic
[ ] Missing data is never invented
[ ] LLM cannot modify quantitative results
[ ] All formulas have unit tests
[ ] Existing ranking API remains backward compatible where possible
[ ] Model version is incremented
```

---

# 28. Expected Deliverables

完成後請不要只修改 code。

請輸出：

```text
1. Architecture change summary
2. Modified file list
3. Database schema changes
4. Formula implementation
5. Configuration changes
6. Unit tests
7. Regression test results
8. Example calculation for at least:
   - one technology stock
   - one financial stock
9. API response example
10. Remaining limitations
```

---

# 29. Do Not Do

不要：

- 把歷史 PB 四分位直接當 Fair Value
- 把 Bear/Base/Bull 用 Base × 0.8 / 1.2 產生
- 把 Buy Zone 當 Fair Value
- 讓 AI 猜估值
- 用券商目標價直接當 Base Value
- 使用 look-ahead financial data
- 因為缺資料自行補值
- 將所有產業使用相同 valuation weights

---

# Final Architectural Definition

最終系統必須符合：

```text
Historical Valuation
    =
Relative valuation against own history

Fair Value
    =
Forward / intrinsic valuation under scenarios

Buy Zone
    =
Base Fair Value × Margin of Safety
```

三者必須可以獨立計算、獨立測試、獨立追蹤版本。

完成後回報實際 implementation 與測試結果，不要只描述理論設計。