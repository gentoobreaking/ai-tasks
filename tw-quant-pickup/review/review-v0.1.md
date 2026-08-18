已完整讀完 spec v0.2（83 節）並核對 tw-quant-mcp 工具契約與 tw-quant-selector / tw-quant-signal 的架構與前端慣例。以下為 review。

---

## 總評

Spec 骨架非常完整：Deterministic First、AI Isolation、Artifact Locking、Look-Ahead 防範、Walk-Forward、Snapshot、Sprint 順序都對，可以直接作為開發藍圖。主要問題集中在三處：**資料模型與真實資料源（tw-quant-mcp）的落差**（有些表沒有來源、有些來源沒有表）、**版本 PK 不完整會破壞可重現性**、以及**對未來前端整合的 API/資料契約沒有定義**。

---

## 1. 與 tw-quant-mcp 的對應（可行，且大部分有現成工具）

| Spec 元件 | tw-quant-mcp 工具 | 狀態 |
|---|---|---|
| Universe（§10） | `get_symbol_list`（含 ETF 清單）、`get_trading_calendar` | ✅ |
| 日 K / 報價（§5.2） | `get_stock_daily_quote` / `get_stock_daily_kline`（TWSE） | ⚠️ 上櫃 K 線未接線 |
| 財報（§5.3） | `get_financial_statements`（已含 `table_date` 出表日期！） | ✅ |
| 月營收（Growth） | `get_monthly_revenue` | ✅ 但 spec 沒有對應表 |
| PE/PB/殖利率/ROE | `get_valuation_ratios` | ✅ 注意 ROE 為官方年化估計（`roe_method`） |
| 股利（§5.5） | `get_dividend_history` / `get_exdividend_calendar` | ✅ |
| 法人買賣超（§5.6） | `get_institutional_investors` | ✅ 15:00 前資料可能未齊 |
| 注意/處置股（§10） | `get_attention_disposition_stocks` | ✅ 但無儲存表 |
| TAIEX（§75） | `get_twse_index` + TPEx 櫃買指數 | ✅ |
| 期貨風險脈絡 | `get_put_call_ratio`、`get_institutional_futures_positions` 等 | ✅ |
| Envelope `_lineage` | freshness / data_date / grade / source | ✅ 應直接對映到 DB 的 source/資料版本欄位 |

資料源主要限制（tw-quant-mcp 官方來源政策是優勢：**完全不需要 FinMind 額度管理**，selector 花最多力氣處理的 rate-limit 問題在這裡不存在）。

---

## 2. P0 — 會卡住開發的缺口（務必修 spec）

1. **§5.3 financials 缺 `reported_at`** — §8/§9 明講要存 `reported_at`，但表結構只有 `source_timestamp`。tw-quant-mcp 已提供 `table_date`（出表日期），直接對映即可。**這是回測能否無 look-ahead 的關鍵欄位。**
2. **§5.3 financials 缺現金流量欄位** — Quality（FCF 20%）、Buffett（FCF 15%）、DCF 都需要現金流，但表沒有 `operating_cash_flow` / `capex`。tw-quant-mcp `CashFlowStatement` 有 OCF / Investing CF，務必入表。
3. **缺 `monthly_revenues` 表** — Growth Score 的 `revenue_yoy` 在台股慣例是月營收 YoY（tw-quant-mcp `get_monthly_revenue` 直接提供）。僅靠季度財報無法算。
4. **ETF 模型 §30 現階段無資料源** — tw-quant-mcp 只有 ETF 代碼與股價。NAV Premium/Discount、Expense Ratio、Tracking Quality、Underlying PE/PB **沒有任何官方工具**。建議 v0.2 將 ETF factor 縮減為可用資料（price yield + volume + volatility + discount-to-52w），NAV 類因子標 `NOT_YET_AVAILABLE`（沿用 tw-quant-mcp 的 grade 概念），並在 spec 標注未來來源（投信投顧公會 / TWSE 受益憑證）。
5. **Forward EPS / §5.4 estimates 無來源** — tw-quant-mcp 沒有分析師預估工具。PE Model（§13）依賴 Forward EPS 會卡住。務必定義替代法（例：TTM EPS × (1 + 內部成長率推估)，且標 `estimate_method`），並沿用「資料不足不得硬算 → fallback sector median」原則。
6. **歷史 PE 百分位（§2.1）無現成歷史估值** — `get_valuation_ratios` 只有當日。需在 spec 定義：歷史 PE 由引擎自行重算（daily close ÷ TTM EPS，可重現且不依賴外部），或明確採用官方當日快照。建議前者並納入 model version。
7. **版本欄位與 PK 不完整（§46 自相矛盾）** — `factor_scores` / `valuations` / `rankings` 的 PK 只有 `(symbol, score_date, model_version)`，**缺 `parameter_version` 與 `data_version`**。§46 說結果要保存三者且「不能覆蓋歷史」，但現行 PK 同一 model_version 重跑同日就會 UPSERT 覆蓋。加入 `parameter_version` + `data_version`（或每日 `snapshot_id`）為 PK。
8. **上櫃歷史 K 線缺口** — `get_stock_daily_kline` 僅上市。5Y 回測 + MA200/60 對上櫃股會破。spec §6 的 Provider 抽象正好解：加一個 `HistoricalPriceProvider`（FinMind `TaiwanStockPrice` 或 TPEx 官方，selector 已驗證過），並在 spec 明記「上櫃歷史資料屬 fallback 來源」。

---

## 3. P1 — 應該補強的點

1. **收集效能 vs §71 的 5 分鐘目標** — tw-quant-mcp 盤後工具是逐檔參數（`get_stock_daily_quote`、`get_valuation_ratios`…），全市場 ~2000 檔逐檔呼叫在本地 stdio + 8 併發下約 2–4 分鐘，加 `get_stock_daily_kline` 逐檔歷史會超標。兩個解法擇一寫入 spec：(a) Market 價格走 `STOCK_DAY_ALL` 一次性全市場（selector 驗證過無速率限制，且 tw-quant-mcp 自己的 registry 就在用）；(b) 接受盤後批次 30+ 分鐘完成，放寬 §71。另外容器內應用 **streamable-http**（`MCP_HTTP_ADDR:8787`）而非逐 call spawn stdio process。
2. **BUY_ZONE 判斷順序矛盾（§29）** — `Current <= Zone3 → BUY_ZONE_3` 與 `Current < Bear → INVESTIGATE` 在價格 < Zone3 且 < Bear 時重疊（例：Bear=220、Z3=196，190 同時命中兩者）。需定義優先序（建議 INVESTIGATE 優先，視為資料異常）。
3. **財報更正（revision）覆蓋** — §5.3 PK `(symbol, fiscal_year, fiscal_quarter)` 若 MOPS 更正財報會覆蓋歷史，回測結果變動無法追溯。加 revision 欄位或 `observed_at` 保護。
4. **$ factor_scores 表不支援 ETF** — ETF factor 名稱不同（valuation/dividend/historical_discount/volatility/…），同一張表放不下。加 `etf_factor_scores` 或改 generic key-value。
5. **eta factor_scores 不支援 ETF** —（同上，型別問題）
6. **Market Context §75 部分無源** — VIX、USD/TWD、10Y、US 市場在 tw-quant-mcp 均無工具（README 明示 `get_us_market` 不存在）。請標「optional，不可得時標 unavailable」，只留 TAIEX/OTC 指數 + 期權資料進 Risk Context。
7. **CLI 與 pipeline 不一致** — §48 CLI 沒有 `twquant valuation`，但 §49 flow 有獨立 valuation stage；建議補命令並加 `twquant snapshot`。
8. **Alerts 沒有儲存表** — §36 只輸出 `alerts.json`。日後前端要歷史告警頁（selector 已有 alert_history 模式），建議加 `alert_log` 表。
9. **調整價與總報酬回測** — §5.2 有 `adjusted_close` 但未定義計算來源；§61 測試列了 stock split / dividend adjustment。建議依 tw-quant-mcp K 線 adjust 參數 + §5.5 dividends 定義清楚，否則回測 CAGR 會被除息低估。
10. **不要依賴 MCP 的 helper 指標** — `get_stock_daily_quote` 的 MA20/60、RSI 在**上櫃是 0** 且屬 helper 資料。MA200/RSI/Momentum 一律由 pickup 自存 daily_prices 計算（符合確定性原則，也避免 helper 語意版本化問題）。

---

## 4. 前端整合建議（selector / signal）

兩個既有專案都是 **FastAPI + React/TS**，selector 用 PostgreSQL、signal 用 SQLite。pickup 不用遷就任一專案的 DB，但 API/資料契約應對齊共同慣例，日後才可「直接接」：

1. **API 慣例對齊 selector**：`/api/v1/...` 前綴（spec 已是 ✅）、回應 envelope `{data, meta, error}`、日期用 `?date=YYYY-MM-DD` 參數、並提供 calendar 端點（如 `GET /api/v1/ranking/dates`，對齊 selector `/signals/calendar`）讓前端做日期回看（§70 snapshot 剛好支援）。
2. **score_breakdown 直接進 ranking payload** — §63 已定義，務必讓 `/api/v1/ranking/stocks` 每筆含 `score_breakdown`，signal 的健診卡與 selector 的因子排名頁都可無痛嵌入。
3. **純 API 輸出，不內嵌前端** — pickup v0.2 只出 FastAPI + 每日檔案報表。日後結合方式 = signal `.stock/:id` 加「估值/Buy Zone」卡片，或 selector 新增 Top-30 看板，全部吃 pickup API。SSE 不需要（每日批次非即時）。
4. **正規化 MCP Envelope 進 DB** — `_lineage` 的 `source / data_date / freshness / grade` 直接對映報表的 metadata.json 與異常偵測（grade=PREVIEW 資料不得進排名等），這是 pickups 相較 selector/signal 的加分項。
5. **命名衝突注意** — selector 已有 `valuations` / `signals` 表且語意不同；pickup 用獨立 DB/schema（spec §56 已是獨立 postgres），跨系統一律走 API 不要 join。

---

## 5. 建議的 spec 修改清單（可直接 patch）

1. §5.3 +§9：financials 加 `reported_at DATE NOT NULL`（對映 MCP `table_date`）；加 OCF / investing CF / capex 欄位
2. §5.3a 新增 `monthly_revenues(symbol, month, revenue, yoy_pct, PK(symbol, month))`
3. §5.7/5.8/5.9：PK 加 `parameter_version`, `data_version`；新增 `etf_factor_scores`；加 `alert_log` 表；加 `universe_flags(symbol, date, 注意/處置)` 表
4. §30：ETF 因子縮減 + grade 標註 + 未來來源
5. §13/§5.4：Forward EPS / 歷史 PE 的估算方法定義 + `estimate_method` 欄位
6. §29：INVESTIGATE 優先級定義
7. §6：Provider 清單加 `HistoricalPriceProvider`（解上櫃 K 線）；market collector 允許 STOCK_DAY_ALL 批量來源
8. §48：CLI 補 `valuation` / `snapshot`
9. §53：API 補 calendar 端點、envelope 規格、score_breakdown 入 ranking payload；新增「前端整合（selector/signal）」一節
10. §75：Market Context 標 optional/unavailable 語意

