# T016 Summary — 盤前多空傾向鎖定（Bias Decision Tree）

- 完成日期：2026-08-11
- Commit：`1186855`
- 狀態：done（6/6 驗收全勾）

## 實作內容

`src/bias/decision_tree.ts`（9992 bytes）：
- **四階段決策**（§5.1）：風控硬性關卡 → 籌碼/趨勢基調 → 消息與夜盤共振 → 盤前試撮驗證
- **評分表**（§5.2）：日線趨勢 ±20（5MA/20MA 位階，自行以日 K 計算）、法人籌碼 ±25、夜盤 ±25、試撮 ±30（-100 ~ +100）
- **鎖定規則**（§5.3）：≥ +50 LONG_ONLY、≤ -50 SHORT_ONLY（can_short_first==false 改判 NO_TRADE）、中間 NEUTRAL_FLEXIBLE（門檻 85）、硬風控旗標 NO_TRADE
- **輸出** `{ bias, score, rationale }`（對齊 §5.4 evaluateDayTradeBias）+ `bias_locked` 事件（T004）
- **守門**：所有 MCP 輸入過 T003；單節點失敗 → 0 分 + rationale 註記；風控關卡失敗 → 保守 NO_TRADE

## 關鍵決策：對齊 tw-quant-mcp v1.3 實際契約（37 tools）

對接探查發現 **spec §2.2 理想 18 tools 與實際契約不一致**——實際無 `get_pre_market_quote` / `get_taifex_night` / `get_us_market`。資料來源改為：

| 節點 | spec 設計 | 實際對接 |
|---|---|---|
| 風控 | scan_daytrade_eligibility | 同（非交易時段 isError → 守門 fail → 保守 NO_TRADE）|
| 日線趨勢 | get_stock_daily_kline | 同（data 為日K陣列，自行算 MA5/MA20）|
| 法人籌碼 | get_institutional_investors({symbol,days}) | `({market:'tse'})` → data.rows[] 找 code + total_net（當日代理近 3 日，rationale 註記）|
| 夜盤 | get_taifex_night | `get_futures_daily_ohlc({contract:'TX'})` → session=盤後 change_pct |
| 美股 ADR | get_us_market | 契約無工具 → 0 分 + 註記 |
| 盤前試撮 | get_pre_market_quote | 契約無工具 → 0 分 + 註記（不假設工具存在）|

## 測試

`src/bias/decision_tree.test.ts` 17 tests：四階段流程（多/空）、各節點獨立加權、邊界（±45/±50/±70）、SHORT_ONLY 無法先賣 → NO_TRADE、處置股/不可當沖硬風控、風控關卡守門失敗保守 NO_TRADE、單節點守門失敗 0 分、試撮無源註記、bias_locked 事件、simpleMovingAverage（含資料不足）

全套測試：**239/239 pass**（222 + 17）+ lint/type check 過。

## 備註
- 邊界 ±49/±51 無法由權重（20/25/25/30）組出，以 ±45（20+25）與 ±70（20+25+25）驗證門檻兩側行為
- 美股 ADR 與試撮節點之「真資料源」待 tw-quant-mcp 提供對應工具後補齊（decision_tree 已留 rationale 註記機制）
