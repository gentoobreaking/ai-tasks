對，你這個問題非常關鍵。**我重新查了台灣 ETF 的官方資料來源後，答案是：其實「缺的資料」比前一版 spec 判斷的多，而且不少可以補到官方等級。**

你 Agent 的 review 是「以目前 `tw-quant-mcp` 已封裝的工具能力」來看，所以它說：

> `tw-quant-mcp` 沒有 NAV / Expense Ratio / Tracking Quality

這句是對的。

但如果問題改成：

> **「台灣 ETF 本身真的沒有官方資料嗎？」**

答案就是：**不是。**

TWSE 官方明確指出，ETF 相關資訊可從證交所、投信發行人、MOPS、投信投顧公會等取得，而且其中包含即時預估淨值、折溢價、追蹤差距、基金規模、持股等資訊。([臺灣證券交易所][1])

---

# 先看最重要的：NAV

這個其實 **完全可以拿到**。

證交所自己的 ETF 即時淨值介接規格就明確列出：

```text
ETF代號
成交價
投信/總代理人預估淨值
預估折溢價幅度
前一營業日淨值
資料日期
資料時間
```

甚至要求投信透過固定 HTTP/HTTPS URL，以 JSON 提供資料。([台灣證券交易所證券集中交割系統][2])

所以我們可以直接算：

```text
NAV Premium/Discount
=
(Market Price - NAV) / NAV
```

例如：

```text
市場價格 = 33.20
NAV      = 33.05

Premium
= (33.20 - 33.05) / 33.05
= +0.45%
```

這比「NOT_YET_AVAILABLE」好非常多。

---

# 更重要的是：NAV 不只一種

ETF Engine 我建議區分：

```text
previous_day_nav
estimated_intraday_nav
market_price
premium_discount
```

例如：

```json
{
  "market_price": 33.20,
  "estimated_nav": 33.05,
  "previous_nav": 32.98,
  "premium_discount": 0.00454
}
```

這樣我們甚至可以做：

> **目前 ETF 是不是買在異常溢價？**

這對 ETF Engine 很有價值。

TWSE 也特別提醒投資人注意 ETF 市價相對 NAV 的溢價/折價風險。([臺灣證券交易所][3])

---

# 第二個：Tracking Quality

這個也**不是沒有資料**。

TWSE 官方 ETF 資訊就有：

> **追蹤差距**

而且 ETF 專區甚至直接提供「追蹤差距」相關資訊。([臺灣證券交易所][4])

所以之前 v0.3 把：

```text
tracking = 0
NOT_YET_AVAILABLE
```

其實太保守了。

### 應該改成：

```text
Tracking Difference / Tracking Quality
```

可以從官方公布的 tracking difference 建構。

例如：

```text
Index Return = 10.0%
ETF Return   = 9.4%

Tracking Difference = -0.6%
```

然後轉成 score。

---

# 第三個：Expense Ratio

這個比較麻煩，但也不是完全沒有。

TWSE 明確指出：

* ETF 公開說明書
* 投信發行人網站
* MOPS
* 基金資訊觀測站

都可以查到 ETF 的完整資訊。([臺灣證券交易所][1])

所以：

> **Expense Ratio 可以取得，但資料型態可能不是每天一筆的標準化行情資料。**

這和 NAV 完全不同。

因此我建議：

```text
NAV
→ daily market data

Tracking Difference
→ periodic official disclosure

Expense Ratio
→ fund metadata / prospectus
```

也就是 ETF Engine 應該有：

```text
Daily Metrics
Periodic Metrics
Static Fund Metadata
```

三層資料。

---

# 第四個：Underlying PE / PB

這個反而是我認為最值得重新設計的地方。

你可以有兩種方法。

### 方法 A：官方公布

有些 ETF / 投信會公布：

```text
Portfolio PE
Portfolio PB
```

但不是所有 ETF 的格式都一致。

### 方法 B：我們自己算

如果可以拿到 ETF 成分股權重：

```text
ETF
 ↓
Components
 ↓
Weights
 ↓
Stock PE / PB
```

就可以算：

### Weighted PE

不能簡單做：

```text
PE = Σ PE_i × Weight_i
```

因為 PE 不適合直接做算術加權。

比較正確的是從：

```text
Price / Earnings
```

的 underlying exposure 重建。

或者至少明確標成：

```text
estimated_underlying_pe
```

而不是假裝它是官方值。

---

# ETF 成分股其實也能拿

TWSE / MOPS 本身就有 ETF 基本資料與持股資訊。TWSE 也明確指出可以查：

* 每週投資產業類股比率
* 每月前五大持股
* 每季持股明細

以及基金相關揭露。([投資人知識網][5])

另外，ETF 公開資訊與投信網站也有 PCF / 申購買回清單等資訊。([宅在家學習網][6])

所以如果之後願意做：

```text
ETF Constituents Engine
```

那很多我們原本以為「沒有」的指標其實都可以自己重建。

---

# 我現在反而會重新定義資料層

我會把 ETF 資料分成 **4 級**。

## Level 1 — 官方每日可得

```text
Market Price
Volume
Turnover
NAV
Estimated NAV
Premium / Discount
Units Outstanding
```

這些應該直接進 v0.3。

TWSE 的 ETF 即時淨值規格已經明確提供其中多項。([台灣證券交易所證券集中交割系統][2])

---

## Level 2 — 官方定期揭露

```text
Tracking Difference
Fund Size
Holdings
Distribution
Financial Report
```

這些不一定每天更新，但可以做 historical snapshots。

---

## Level 3 — 官方公開資訊可重建

```text
Underlying PE
Underlying PB
Sector Concentration
Top 10 Concentration
Single Stock Concentration
```

例如：

```text
ETF
 ↓
Holdings
 ↓
Weight
 ↓
Stock Fundamentals
 ↓
Derived Metrics
```

這些一定要標：

```text
derived
```

而不是：

```text
official
```

---

## Level 4 — 目前真的拿不到

這才標：

```text
NOT_YET_AVAILABLE
```

例如某些：

```text
custom tracking quality
portfolio turnover
effective expense
```

如果沒有可靠的來源，就不要硬猜。

---

# 所以我會修改原本 ETF Engine

之前：

```text
dividend
yield_stability
liquidity
volatility
price_position

NAV = unavailable
Tracking = unavailable
Expense = unavailable
```

我現在比較建議：

```text
ETF Engine
│
├── Ranking Factors
│   ├── Dividend
│   ├── Yield Stability
│   ├── Liquidity
│   ├── Volatility
│   ├── Price Position
│   └── Tracking Difference   ← 可加入
│
├── Valuation / Market Metrics
│   ├── NAV
│   ├── Premium / Discount
│   ├── Underlying PE
│   └── Underlying PB
│
└── Fund Metadata
    ├── Expense Ratio
    ├── Fund Size
    ├── Inception Date
    └── Tracking Method
```

---

# 甚至我會改掉你現在的權重

你目前：

```text
dividend          30
yield_stability   15
liquidity         15
volatility        10
price_position    20
```

問題是：

**這比較像「高股息 ETF 排名器」，而不是完整 ETF 評價器。**

因為：

> Dividend 30% + Yield Stability 15%

已經把 ETF 的主要評分集中在配息。

對 006208、0050 這種低配息但大盤型 ETF，就很吃虧。

---

# 我比較推薦兩階段

### Layer A：ETF Quality Score

```text
Liquidity
Volatility
Tracking Difference
Yield Stability
Fund Size
```

### Layer B：ETF Valuation Score

```text
NAV Premium/Discount
Underlying PE
Underlying PB
Price Position
```

### Layer C：Income Score

```text
Dividend Yield
Distribution Stability
```

然後：

```text
ETF Composite
=
Quality
+
Valuation
+
Income
```

這會比把所有東西硬塞進 5 個 factor 更合理。

---

# 特別是 NAV Premium/Discount，我認為非常值得加進去

因為這直接回答：

> **「ETF 現在是不是買貴了？」**

例如：

```text
ETF A
Price = 100
NAV = 100.2
Discount = -0.2%

ETF B
Price = 103
NAV = 100
Premium = +3%
```

即使兩支 ETF 的：

```text
Dividend
Liquidity
Volatility
Price Position
```

完全相同。

我也會比較偏向：

**A。**

因為 B 多付了 3% 溢價。

而且證交所本身就提醒 ETF 投資人應注意市場價格與 NAV 的折溢價。([臺灣證券交易所][3])

---

# 所以你的 Agent 說「沒有資料」其實要拆成兩層理解

它說：

> **tw-quant-mcp 沒有工具**

✅ **正確**

但如果推論：

> **台灣官方沒有資料**

❌ **不正確**

這是非常重要的差異。

目前更準確的狀態應該是：

| 資料                  | tw-quant-mcp | 外部官方來源         | 我建議           |
| ------------------- | ------------ | -------------- | ------------- |
| NAV                 | ❌/不足         | ✅ TWSE         | **v0.3 加入**   |
| 預估 NAV              | ❌/不足         | ✅ TWSE/投信      | **v0.3 加入**   |
| Premium/Discount    | ❌/不足         | ✅ TWSE         | **v0.3 加入**   |
| Tracking Difference | ❌            | ✅ TWSE/投信/MOPS | **v0.3 加入**   |
| Expense Ratio       | ❌            | ✅ 公開說明書/基金資訊   | **v0.3 可加入**  |
| Holdings            | 部分           | ✅              | **v0.3 加入**   |
| Underlying PE       | ❌            | 部分官方/可自行計算     | **先 derived** |
| Underlying PB       | ❌            | 部分官方/可自行計算     | **先 derived** |
| Fund Size           | 部分           | ✅              | **加入**        |
| Distribution        | ✅            | ✅              | **加入**        |

TWSE 本身也明確表示 ETF 的完整資訊分散在證交所、投信公司、MOPS、投信投顧公會等來源，而非全部集中在一個 API。([臺灣證券交易所][1])

---

## 🚨 這會影響我們剛才的 v0.3 架構

所以我現在**不建議直接接受你 Agent 原本那個 ETF Task 그대로開工**。

比較好的做法是：

```text
tw-quant-mcp
        │
        ├── Official TWSE data
        │
        └── Existing MCP tools
                 │
                 ▼
          ETF Data Adapter
                 │
        ┌────────┼────────┐
        ▼        ▼        ▼
      Daily   Periodic  Derived
      Data     Data      Data
        │        │        │
        └────────┼────────┘
                 ▼
              ETF Engine
```

也就是**不是擴張股票 Engine，也不是把所有東西標成 NOT_YET_AVAILABLE，而是新增一個 `ETF Data Adapter`，專門把台灣官方 ETF 資料統一成你的內部 schema。**

這個改法我認為非常值得。

甚至我會建議下一個 task 不要叫「Implement ETF Engine」，而是先叫：

> **ETF Data Availability & Adapter Specification**

先把 **TWSE / MOPS / 投信 / tw-quant-mcp 到底各能提供什麼** 全部盤點完，再決定 ETF Ranking factor。

這樣你這套系統的資料完整度會提升一個層級。

[1]: https://www.twse.com.tw/downloads/zh/ETF/topic02.pdf?utm_source=chatgpt.com "《ETF 系列專題報導－股票ETF 特性及風險（下）》"
[2]: https://dsp.twse.com.tw/public/static/downloads/tradingDepartment/ETF%20%E7%94%B3%E8%B4%96%E8%B3%87%E8%A8%8A%E5%8F%8A%E5%8D%B3%E6%99%82%E6%B7%A8%E5%80%BC%E6%8F%AD%E9%9C%B2%E5%B0%88%E5%8D%80%E4%BB%8B%E6%8E%A5%E6%A0%BC%E5%BC%8F%E8%AA%AA%E6%98%8E_20250109142554.pdf?utm_source=chatgpt.com "ETF 申贖資訊及即時淨值揭露專區"
[3]: https://www.twse.com.tw/staticFiles/news/news/tsecnews/ff8080817698e3d40176fae336ac011d.pdf?utm_source=chatgpt.com "臺灣證券交易所股份有限公司 新聞稿"
[4]: https://wwwc.twse.com.tw/zh/ETFortune/announcementList?max=10&offset=0&type=prospectus&utm_source=chatgpt.com "重大消息 - 臺灣證券交易所｜ETF e添富"
[5]: https://investoredu.twse.com.tw/pages/TWSE_InvestmentQA.aspx?ID=11&Page=2&utm_source=chatgpt.com "TWSE 投資人知識網~ 聰明學習，謹慎投資！"
[6]: https://shl.twse.com.tw/newsArticle/detail/8a8221129265cb8b0194ca8033dd0046?type=HotKnowledge&utm_source=chatgpt.com "宅在家學習網"

