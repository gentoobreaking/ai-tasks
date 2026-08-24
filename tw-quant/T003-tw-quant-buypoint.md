---
github_issue:
title: 台股篩選腳本-找買點
priority: high
status: pending
depends_on: []
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-25
---

台股 50 檔 → 量化篩選 → Top 10 → Top 5

# 台股 50 檔

第一階段: 先建立股票池
從：
半導體
AI Server
PCB
CPO/光通訊
記憶體
IC設計
電源
散熱
半導體設備
半導體材料
挑出 50 檔。

第二階段：Top 50 → Top 10

先把這 50 檔全部做成真正的「100 分量化表」
純粹依照量化分數排序。留下前 10 的「100 分量化表」。

每檔列出 2026 EPS、2027 EPS、EPS 上修幅度、近20日法人買賣超、主力買賣超、距離前高%、20/60MA、目前股價、合理進場區、停
損、1個月目標價。

量化篩選(高勝率候選股):
總分設成 100 分：
因子                 權重    具體量化內容
①  基本面成長        25分    2026 EPS 成長、營收成長、毛利率/ROE、自由現金流
②  EPS/產業預估上修  30分    1M/3M EPS 上修幅度、2026/27 EPS 上修、產業預估
③  法人/主力籌碼     20分    外資 5/20 日、投信 5/20 日、三大法人、主力、大戶持股變化趨勢
④  一個月波段動能    15分    20MA、60MA、量價、RSI、1M 相對強弱
⑤  股價低位階        10分     距 60 日高點、120 日高點、52W 高點、52週位置、回檔幅度

最重要的一點:策略不是「分數越低越便宜」。
=> 獲利預期向上 + 籌碼開始轉多 + 2027 成長 + 股價還在合理低位階
=> 現在還沒漲、但最可能開始漲

③  法人/主力籌碼
真正的趨勢分：
法人/主力 20 分
外資 5 日：6 分
外資 20 日：4 分
投信 5 日：4 分
投信 20 日：2 分
三大法人方向：2 分
主力/大戶：2 分

④  一個月波段動能 - 短線轉強(跌深，但開始轉強)
15 分：
股價 > 20MA：3
20MA 開始上彎：3
20MA > 60MA 或正在黃金交叉：3
5日成交量 > 20日均量：3
近 5～10 日相對大盤轉強：3

⑤  股價低位階
10 分
距 60 日高點：3
距 120 日高點：3
52W 相對位置：2
最近 20 日回檔後是否止跌：2

第三階段：Top 10 → Top 5

再加一個「硬淘汰」
只要符合下面任一項，直接剔除：
2027 EPS 負成長 → ❌ 淘汰
最近 3 個月 EPS 大幅下修 → ❌ 淘汰
法人持續大幅賣超 → ❌ 淘汰
股價已經離前高非常近且 RSI 過熱 → 降分
基本面沒有成長，只靠題材 → ❌ 淘汰

最理想的訊號

① EPS 預估上修
↓
② 股價回檔但基本面沒壞
↓
③ 外資/投信開始回補
↓
④ 成交量放大突破 20 日線
↓
⑤ 做 1 個月波段

再做一層「訊號分級」
必須同時滿足：
🟢 S級：研究進場 - EPS上修 + 法人轉買 + 股價低位階 + 2027成長
🟡 A級：等待買點 - EPS上修 + 2027很好 + 股價低,但法人還沒轉買。(埋伏股)
🟠 B級：基本面好&股價偏高 - EPS上修 + 法人狂買 + 2027很好,可是股價已經漲 50%、創歷史新高。
🔴 淘汰: 淘汰 - EPS下修 + 法人賣超 + 2027成長下降


---

# 架構 Spec（2026-08-25 討論定稿）

## 0. 硬性約束

- **禁止代理指標模擬**：因子②必須用真實券商共識預估數據（已找到來源，見下）。
  若某項數據取得有困難，先停下來與使用者討論作法，不得自行降級替代。

## 1. 整體管線

```
Stage 0  股票池建構（自動）    → data/universe.csv 快取
Stage 1  100分量化表評分       → Top50 → Top10
Stage 2  硬淘汰 + S/A/B 訊號分級 → Top5
```

- 新增獨立進入點 `pipeline_screener.py`，不動 stock_screener / etf_screener
- 重用 `common/`：cache（SQLite）、rate_limit、yf_utils、twse、etf_yahoo
- 輸出：`screening_results/pipeline_YYYYMMDD.md`（量化表）+ CSV 明細

## 2. 資料源地圖（2026-08-25 全數實測驗證）

| 任務書要求 | 主路徑 | 備援 | 實測結果 |
|---|---|---|---|
| 2026 EPS 預估 | yfinance `get_earnings_estimate()` period=0y | 無（唯一免費源）| 2330.TW → 107.64（34 位分析師）|
| 2027 EPS 預估 | 同上 period=+1y | 無 | 142.13（成長 32%）|
| 1M EPS 上修幅度 | `get_eps_trend()` current vs 30daysAgo | 無（Yahoo 內建歷史快照，不需自建）| +0.93% |
| 3M EPS 上修幅度 | `get_eps_trend()` vs 90daysAgo | 無 | +9.84% |
| 上修/下修次數 | `get_eps_revisions()` upLast30days/down | 無 | 28 上修 / 0 下修 |
| 產業預估對比 | `get_growth_estimates()` indexTrend | 無 | 個股 62.5% vs 產業 31.2% |
| 目標價（輸出欄位）| `get_analyst_price_targets()` mean/low/high | — | mean 3,229 |
| 法人 5/20 日買超 | TWSE fund/T86（`common/twse.py`）| **FinMind** InstitutionalInvestorsBuySell | ✅ |
| 月營收 YoY / 財報 | TWSE t187ap14_L / yfinance | **FinMind** TaiwanStockMonthRevenue / FinancialStatements | ✅ |
| 日線 K 檔 | yfinance 批次（`common/yf_utils.py`）| **FinMind** TaiwanStockPrice | ✅ |
| 族群分類 | MoneyDJ ZHA 產業頁（Big5）| — | 1161 分類，結構已解析 |

### Yahoo 預估數據注意事項
- 需要 crumb/cookie 流程，直接 requests 會 401/429；一律走 yfinance 函式庫
  （內建處理），並遵守既有 rate limiter 節奏
- 分析師覆蓋度：權值股 20~40 位、中小型可能 <5 位或無資料 → 無預估者因子②給 0 分並標註，
  不視為錯誤中斷

## 3. FinMind 備援設計

- 走 REST API 直呼（requests），**不走 MCP**——管線是全自動程序，MCP 子程序只增加故障點
- `common/rate_limit.py` 新增 `"finmind"` 通道：免費會員約 600 req/hr，
  批次抓取需節流（參考 tdcc 的 delay 模式）
- Token 放 config.json（`finmind_token`），gitignore 防漏
- 觸發條件：主路徑失敗（rate limit / 連線 / 空值）時 fallback，並在輸出標註資料來源
- FinMind 資料皆為日結更新（盤後），符合波段級用途

## 4. Stage 0 自動股票池

```
Step A: ETF 池 → 近一年績效排名取 Top 5
        候選清單放 config（含 0050 等），yfinance 批次抓報酬排序
Step B: Top 5 ETF → 成分股合併去重
        fetch_top10_holdings() × 5 ≈ 30~45 檔；
        去重後不足 50 檔時自動延伸持股檔數補足
Step C: 族群標記
        MoneyDJ ZHA 產業頁（Big5 解碼、Link2Stk('AS####') 格式）
        寫入 data/universe.csv（ticker, name, sector, etf_source）
```

- 決策：WantGoo overview 是 JS 渲染 SPA，curl 抓不到內容 → **棄用**
- universe.csv 週更新；MoneyDJ 分類頁每月更新即可

## 5. MCP 工具定位（開發用，不進管線）

- yfinance-mcp / FinMind-MCP 裝進 pi（經 mcporter），供開發對話中即時查數據、
  交叉驗證管線輸出
- 安裝手冊：~/Projects/ai-howto/pi-agent/pi-mcp-finance.md

## 6. 已定案決議（2026-08-25）

### 6.1 Top 5 ETF 排名指標
- **近三年報酬率**，**不含配息再投資**（純價格報酬）
- 候選清單放 config，yfinance 批次抓歷史價計算

### 6.2 合理進場區 / 停損 / 目標價公式

```
【進場區】
前置資格（沿用 C1/C2）：現價 > 60MA、60MA 向上、現價 > 20MA
  → 不滿足直接不給區間
若 20MA > 60MA：進場區 = [20MA, 20MA × 1.03]
若 20MA ≤ 60MA：不給區，標「待 20MA 站上 60MA 後再評」
區間每日以當日 MA 重算（動態值），不凍結在訊號日

【停損】雙軌，先到先出
技術停損 = min(進場均價 × 0.93, 發動K棒最低點 × 0.995)
邏輯停損 = 收盤跌破 60MA 且 日KD 死亡交叉 → 無條件出場
（趨勢初期邏輯停損會先觸發，屬預期行為）

【1個月目標價】
候選A = 近60日最高價；候選B = 分析師目標價 mean
目標價 = 兩者取離現價較近者；若其漲幅 < 8%，改用較遠者並降級備註

【風報比門檻】串回 S/A/B 分級
R/R = (目標價 − 進場區中值) ÷ (進場區中值 − 技術停損)
R/R ≥ 2.0 → S 級必要條件；1.5~2.0 → 最高 A 級；< 1.5 → 強制 B 級
```

設計說明：「不落入季線之下」屬於進場資格（C1）與出場紀律（邏輯停損），
不寫入區間幾何——避免 20MA<60MA 時產生上下緣倒置的非法區間。
