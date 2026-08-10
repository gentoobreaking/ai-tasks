# T022 Summary — 事件驅動回測模擬器（DayBrainBacktestSimulator）

- 完成日期：2026-08-11
- Commit：`6be99bf`
- 狀態：done（8/8 驗收全勾）

## 實作內容

`src/backtest/simulator.ts`（§12）：
- **四步驟架構（§12.1）**：盤前重放（briefing 載入）→ 盤中時間軸 Loop（每分鐘廣播，滾動計算 VWAP / 1 分鐘爆量倍數（近 20 分鐘均量）/ 當日高低 / 開盤 15 分低點凍結）→ Priority Engine 競態撮合（Rank Score 排序依序派單）→ 持倉追蹤（**先離場後進場**，避免同分鐘新舊倉混淆）
- **觸發條件讀 Briefing（§12.4）**：`volume_surge_threshold`（預設 2.5）、時間窗 `start_time`/`no_new_entry_after`、`forceFlatBy` 多空不同（SHORT_ONLY → 13:00，其餘 13:10）
- **成本設定**：手續費 0.001425×0.28、當沖證交稅 0.0015、滑點買進 ×1.0005（1 檔）；空方鏡射（停損在上方、停利在下方）
- **離場**：STOP_LOSS / TAKE_PROFIT / FORCE_FLAT；**時間軸結束剩餘持倉強平收尾**（即使 forceFlatBy 該分鐘無成交 bar，以最後已知收盤價結算）
- **報告（§12.5）**：summary（win_rate/profit_factor/max_drawdown 累計曲線回撤）+ engine_effectiveness（briefing_bias/sector_limit/margin_cap/conflicts_resolved）+ trades
- 每迭代全新實例清空狀態（§13.1 Grid Search）；可注入 `rankingEngine`

`src/execution/priority_engine.ts` 修正：
- **SHORT_ONLY 負分 bias → Tier/Rank 取 `Math.abs`**（強度決定資金額度，方向由白名單決定）——T020 原實作直接吃負分導致空方永遠 Tier 4

## 測試
15 tests：成本精確計算（浮點容忍）、多頭爆量→停利（滑點後 entry、net PnL 公式驗證）、LONG_ONLY 日 SELL 白名單攔截（effectiveness 計數）、同分鐘兩標的競態排序（2382 爆量 5 倍 rank > 2308 爆量 3 倍）、Tier 4（45 分）拒絕、STOP_LOSS（exit = entry×0.985）、13:10 FORCE_FLAT、空方 13:00 回補、threshold 注入（5.0 過 / 20 擋）、時間窗注入、持倉防重複進場、報告全零結構、max_drawdown 負回撤、Grid 迭代獨立。

## 除錯紀錄
- **surgeBar high 過高** → close 不滿足 `≥ dayHigh×0.998` → 修正測試構造
- **白名單攔截移交給 Priority Engine（§12.1 Step3）**：Simulator 不再前置檢查 allowed_actions，讓 engine_effectiveness.blocked_by_briefing_bias 可計數
- **強平收尾缺失**：時間軸結束無 13:10 bar → 持倉殘留 → 新增時間軸結束強制平倉收尾
- **exitTime 字串拼接 bug**（`13:10:00:00`）→ `slice(19)` 保留時區後綴
- **priority_engine 空方 Tier**：T020 只測正值，發現負分 bug → Math.abs

全套測試：**328/328 pass** + lint/type check 過。
