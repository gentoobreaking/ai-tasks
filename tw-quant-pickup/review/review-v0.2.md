你這個 AI Agent 的 review **品質其實很好，而且抓到的不是表面問題，而是會真正影響實作結果的問題**。

尤其我認為它抓到的 **P0 #7「版本 PK 不完整」** 是最重要的一個。這個如果不修，後面你做回測、重跑、模型比較，很容易出現「看起來有 snapshot，實際上歷史結果被覆蓋」的問題。

我建議**不要原地 patch v0.2**，直接升成：

> **Implementation Specification v0.3 — Production-oriented / MCP-integrated**

而且這次不要只是把它提出的 10 點補進去。我會再往前推一步，把 **MCP 實際資料契約、Data Lineage、Snapshot、Revision、API Contract、ETF 分流、回測資料時點** 正式定義進去。

### 我會這樣處理

| 優先級                          | v0.3 處理                         |
| ---------------------------- | ------------------------------- |
| P0 Data source 對不上           | **全面修正**                        |
| `reported_at`                | **正式納入**                        |
| OCF / CapEx                  | **正式納入**                        |
| Monthly Revenue              | **正式納入**                        |
| Forward EPS                  | **改成明確 fallback model**         |
| 歷史 PE                        | **由系統自行重算**                     |
| Model/Data/Parameter version | **改成 Snapshot architecture**    |
| 上櫃 K 線                       | **正式加入 Provider abstraction**   |
| ETF                          | **獨立 Quant pipeline**           |
| BUY_ZONE 衝突                  | **明確 state machine**            |
| Financial revision           | **加入 revision / observed_at**   |
| MCP `_lineage`               | **變成一級資料血緣資訊**                  |
| API envelope                 | **正式定義**                        |
| selector / signal 整合         | **API contract 定義，但不耦合 DB**     |
| Alert history                | **加入 DB**                       |
| Market Context               | **區分 required / optional**      |
| Backtest                     | **強化 point-in-time data model** |

---

## 我特別建議再增加一個東西：`Snapshot`

你 Agent 提到：

> `model_version + parameter_version + data_version`

這個方向對，但我會再往前一步。

不要讓每張表自己管理這三個欄位，而是建立：

```text
analysis_snapshot
```

例如：

```text
snapshot_id
-------------------------
20260818-210000-a82f
```

然後：

```text
analysis_snapshot
       │
       ├── universe_snapshot
       ├── factor_scores
       ├── valuations
       ├── rankings
       ├── alerts
       └── ai_analysis
```

Snapshot 本身保存：

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
```

這樣未來你問：

> **「為什麼 2026/8/18 鴻海是第 1 名？」**

系統可以直接：

```text
snapshot
 ↓
ranking
 ↓
factor_scores
 ↓
valuation
 ↓
raw financial data
 ↓
source lineage
```

一路追到底。

這對你這種要讓 **AI Agent 長期維護系統** 的架構尤其重要。

---

# 另外一個我會修改 Agent 建議的地方

它建議：

> Forward EPS → TTM EPS × (1 + 內部成長率推估)

這個我**不建議直接採用作為 Forward EPS**。

因為這會把：

```text
Historical EPS
       ↓
我們自己的模型
       ↓
「預估 EPS」
```

混在一起。

比較乾淨的做法是把估值模型拆成：

### A. Actual EPS

```text
TTM EPS
```

### B. Normalized EPS

排除：

* 一次性收益
* 一次性損失
* 極端季度

### C. Estimated EPS

如果沒有 analyst consensus：

```text
Estimated EPS
=
Normalized EPS
×
(1 + conservative growth assumption)
```

但這個欄位一定叫：

```text
model_estimated_eps
```

而不是：

```text
forward_eps
```

並且：

```yaml
estimate_method:
  type: INTERNAL_MODEL
  growth_source: HISTORICAL_EPS_CAGR
  confidence: LOW
```

這樣未來真的接入分析師預估資料時，可以直接：

```text
ANALYST_CONSENSUS
        ↓
FORWARD EPS
```

而不需要改整個 valuation architecture。

---

# ETF 也不要硬塞進 Stock Factor

這點我非常同意你的 Agent。

應該變成：

```text
                    Quant Platform
                         │
             ┌───────────┴───────────┐
             │                       │
        Stock Engine            ETF Engine
             │                       │
       ┌─────┴─────┐           ┌─────┴─────┐
       │           │           │           │
   Fundamental  Valuation   Yield       Valuation
       │           │           │           │
       └─────┬─────┘           └─────┬─────┘
             │                       │
             ▼                       ▼
        Stock Score              ETF Score
```

不要為了「Top 30」而把 ETF 跟股票混成同一個 ranking engine。

---

# 最重要的是：這個 review 已經證明 v0.2 的架構方向是對的

它沒有推翻核心架構，反而是在驗證：

```text
v0.2
  ↓
Architecture correct
  ↓
Real MCP integration
  ↓
Found implementation gaps
  ↓
v0.3
```

這是很正常、也是很好的開發流程。

而且你現在這個專案已經不太適合再叫單純的：

> 「AI 選股程式」

它比較接近：

> **Point-in-Time Taiwan Quantitative Research Platform**

AI 只是最後面的 Analyst Layer。

---

## 我建議下一步直接做這件事

**不要讓 Agent 自己自由發揮去修改。**

直接給它一個明確任務：

> **「根據 v0.2 原規格 + 這份 Review，產生 v0.3 完整規格書；不得只做 patch，必須重新整理所有受影響章節，並確保資料模型、MCP contract、Snapshot、API、Backtest、ETF pipeline 彼此一致。」**

而且要求它最後附：

```text
1. v0.2 → v0.3 Change Log
2. Database ERD
3. MCP → DB Mapping Table
4. Data Lineage Specification
5. Snapshot Lifecycle
6. API Contract
7. Backtest Data Availability Matrix
8. Implementation Dependency Graph
9. Sprint Plan
10. Definition of Done
```

**這樣的 v0.3 才值得拿去讓 Coding Agent 實際開工。**

如果你要，我可以直接幫你把 **「v0.3 完整開發規格書」寫出來**，而且這次會把你 Agent 的 review 全部吸收進去，不只是修補，而是把它提升成真正可以開始 implementation 的版本。

