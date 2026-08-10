# T017 Summary — 做多策略引擎（VWAP_SURGE_LONG）

- 完成日期：2026-08-11
- Commit：`c94cd2d`
- 狀態：done（7/7 驗收全勾）

## 實作內容

`src/engine/vwap_surge_long.ts`（11931 bytes）：
- **scoreLongSignal 純函式**（§6.3）：四條件各 +25——VWAP 站穩（price > vwap 且偏離 ≤ +1.5%）、爆量 ≥2.5 倍、突破盤前 15 分高點、台指 1 分 K 紅棒；距漲停 <1.5% Veto -50；門檻 75（NEUTRAL 日可設 85）
- **VwapSurgeLongEngine**：
  - 進場時間窗 09:05–11:30（秒級邊界，`11:30:01` 排除）
  - 12:30 停訊優先於時間窗；13:10 forceFlatDue
  - `fetchTaifexBullish`：`get_intraday_kline({symbol:'TX',timeframe:'1m'})` 末根 close≥open；守門失敗/非交易時段 isError → unknown → 0 分註記（不 throw）
  - `buildPayload`：§6.5 Signal Payload（entry/stop_loss -1.5%/target +2.0%/max_holding 60min/suggested_size 1~2 張）
- **DEFAULT_LONG_PARAMS**：§6.2/§6.4 全參數，可經 Tactical Briefing 動態覆寫（不硬編碼）

## 對接決策（tw-quant-mcp v1.3 實際契約）
- 台指紅棒：spec 說 WTX 1 分 K，實際契約 `get_intraday_kline` 支援 symbol 參數 → 用 `{symbol:'TX',timeframe:'1m'}`（非交易時段 isError → 0 分，不 throw）
- Anchor（昨收/昨高低）：`get_stock_daily_kline({symbol, date:月初})` 取前一日（引擎提供資料來源；T009 整合時帶入）

## 設計要點
- §6.2 四條件「同時滿足」為進場前提：score ≥75 但條件缺一 → 不進場（測試 3 驗證）
- 台指未知 → 不給分但註記（非條件失敗），保守處理
- 停損停利參數全部可覆寫（`params?: Partial<LongStrategyParams>`），符合「不硬編碼」要求

## 測試
14 tests：四條件組合、評分邊界（75 門檻 + 同時滿足）、Veto 邊界（恰 1.5% 不扣）、時間窗秒級邊界、12:30 停訊、13:10 forceFlatDue、守門失敗 0 分、非時間窗不呼叫台指 K、DEFAULT_LONG_PARAMS 完整。

全套測試：**253/253 pass**（239 + 14）+ lint/type check 過。
