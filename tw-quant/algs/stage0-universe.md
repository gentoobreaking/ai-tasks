# algs/stage0-universe.md — 股票池建構（F1–F3）

## Step A：ETF 池排名取 Top 5（F1）

1. 讀取 `config_pipeline.json` 的 `etf_candidates`（可調清單，初值）：
   ```
   0050.TW   元大台灣50        （市值型）
   006208.TW 富邦台灣50        （市值型）
   00850.TW  國泰台灣領袖50    （市值型）
   00692.TW  富邦公司治理      （市值型）
   0056.TW   元大高股息        （高股息）
   00878.TW  國泰永續高股息    （高股息）
   00919.TW  群益台灣精選高息  （高股息）
   00929.TW  復華台灣科技優息  （高股息）
   00713.TW  元大台灣高息低波  （高股息）
   ```
2. yfinance 批次下載近三年日線（重用 `yf_utils`），取**未還原 Close**
3. 三年報酬率 = `close[-1] / close[0] − 1`（純價格報酬，**不含配息再投資**——
   不可用 Adj Close / TaiwanStockPriceAdj）
4. 報酬率降序取 **Top 5**；樣本不足三年者以實際區間計算並標註

## Step B：成分股合併去重（F2）

1. 對 Top 5 各呼叫 `fetch_top10_holdings(ticker)` 取前十大持股
2. 合併去重規則：
   - ticker 正規化為 4 位數字代號（剔除 `00XXB.TW` 類 ETF 自身與非普通股）
   - 記錄每檔出現的 ETF 數 `count` 與來源列表 `etf_sources`
3. 去重後若 < 50 檔：對 count 最高的 ETF 依權重順序延伸持股至第 15、20 名，
   迭代直到 ≥50 或持股耗盡
4. 排序：先按 `count` 降序、再按在 Top1 ETF 的權重順序

## Step C：MoneyDJ 族群標記（F3）

1. GET `https://www.moneydj.com/Z/ZH/ZHA/ZHA.djhtm`
   （User-Agent: Mozilla/5.0；回應為 **Big5**，需 decode('big5', errors='ignore')）
2. 解析產業連結 `/z/zh/zha/zh00.djhtm?a=C######` → 產業名稱映射表
3. 對股票池相關產業逐頁 GET，解析個股連結
   `javascript:Link2Stk('AS####')` → 建立 stock_no → industry 映射
4. 每頁間隔 ≥2s（走 rate limiter `"moneydj"` 通道）；結果快取 30 天
5. 找不到分類的標記 `sector=UNKNOWN`

## 輸出：data/universe.csv

| 欄位 | 說明 |
|---|---|
| ticker | 4 位數字代號 |
| name | 中文名 |
| sector | MoneyDJ 產業名 |
| etf_sources | 來源 ETF 列表（`\|` 分隔） |
| count | 出現於幾檔 Top5 ETF |

更新策略：universe.csv 每 7 天自動重建；單獨執行 `pipeline_screener.py --rebuild-universe` 可強制重建。
