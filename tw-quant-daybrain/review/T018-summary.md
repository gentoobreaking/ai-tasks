# T018 Summary — 空方策略引擎（BULL_TRAP_VWAP_SHORT）

- 完成日期：2026-08-11
- Commit：`7091b99`
- 狀態：done（8/8 驗收全勾）

## 實作內容

`src/engine/bull_trap_vwap_short.ts`（14984 bytes）：
- **checkEligibility（§7.1）**：`scan_daytrade_eligibility` 過守門 + `can_short_first == true` / `margin_short_available == true` / `is_disposition == false` 三條件；呼叫失敗或守門失敗 → 不 eligible（保守）
- **scoreShortSignal（§7.3）**：四條件各 +25——price < vwap、volumeSurgeType == BEARISH_BREAKDOWN、跌破盤前 15 分低點、台指黑棒開高走低；今日已漲 ≥6.5% **Veto -100**；門檻 75
- **BullTrapVwapShortEngine**：
  - 進場時間窗 09:15–11:30（秒級邊界）；**11:30 禁開新空優先**於時間窗；13:00 forceCoverDue
  - `fetchTwoCandlesBelowVwap`：`get_intraday_kline({symbol,timeframe:'1m'})` 末 2 根 close < vwap（進場條件，非評分項）
  - `fetchTaifexBearish`：`{symbol:'TX'}` 末根 open ≥ close（開高走低）
  - `fetchPriceChangePct`：`get_intraday_quote` change_pct；資料未知 → 0 且 Veto 不誤觸發
  - 守門失敗/非交易時段 isError → unknown → 0 分註記（不 throw）
- **buildPayload（§7.5）**：SELL_TO_OPEN / stop_loss +1.5% / target -2.0% / max_holding 45min / risk_warning（距漲停空間 + 資券狀況）

## 空方 vs 多方風控差異（§7.4 對比 §6.4）
| 項目 | 多方（T017） | 空方（T018） |
|---|---|---|
| 進場窗 | 09:05–11:30 | 09:15–11:30（等頭部確立）|
| 停訊 | 12:30 | **11:30 禁新空** |
| 強制平倉 | 13:10 FORCE_FLAT_ALL | **13:00 強制回補** |
| Veto | 距漲停 <1.5% -50 | 已漲 ≥6.5% **-100** |
| 停損 | -1.5% 或破 VWAP 1 分鐘 | +1.5% / 站回 VWAP 1 分鐘 / 破當日高點 |
| 停利 | +2.0% 平 50% + 回檔 1.0% 全平 | -2.0% 補 50% + 自最低反彈 0.8% 全補 |

## 對接決策（tw-quant-mcp v1.3）
- 連續 2 根 1 分 K：`get_intraday_kline({symbol,timeframe:'1m',limit:2})`（個股）
- 台指黑棒：`get_intraday_kline({symbol:'TX',timeframe:'1m'})`（開高走低 = open ≥ close）
- 今日漲跌幅：`get_intraday_quote({symbol}).change_pct`
- 非交易時段全數 isError → unknown → 0 分註記不 throw（同 T017 模式）

## 測試
14 tests：四條件組合、6.5% Veto 邊界（6.49 不觸發）、資格掃描失敗三路徑（can_short_first=false / 處置股 / 守門失敗）、時間窗秒級邊界（11:30:01 排除）、11:30 禁開新空、13:00 強制回補、K 線守門失敗、非時間窗不呼叫、DEFAULT_SHORT_PARAMS 完整。

全套測試：**267/267 pass**（253 + 14）+ lint/type check 過。
