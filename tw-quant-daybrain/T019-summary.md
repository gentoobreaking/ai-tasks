# T019 Summary — Tactical Briefing 產生器

- 完成日期：2026-08-11
- Commit：`6535f04`
- 狀態：done（7/7 驗收全勾）

## 實作內容

`src/briefing/generator.ts`（11944 bytes）：
- **TacticalBriefing 型別（§9.2 全欄位）**：`_lineage`（generated_at/agent_version/mcp_server_version/data_sources）、`target`、`bias_assessment`（bias/score/confidence/scoring_breakdown）、`trading_plan`（allowed/blocked_actions、active_window、key_levels 含 `volume_surge_threshold`）、`risk_guardrails`（max_position_size_shares/hard_stop_loss_pct/take_profit_target_1_pct/trailing_stop_activation_pct/trailing_stop_callback_pct/max_drawdown_limit_ntd/safety_flags）
- **actionsForBias（§9.2）**：NO_TRADE → allowed 空 / LONG_ONLY → 僅 BUY_TO_OPEN / SHORT_ONLY → 僅 SELL_TO_OPEN / NEUTRAL_FLEXIBLE → 雙向
- **forceFlatByForBias（§9.2 動態時間窗）**：SHORT_ONLY → "13:00"，其餘 → "13:10"
- **confidenceForScore**：|score| ≥70 HIGH、≥50 MEDIUM、否則 LOW
- **generate()**：資格掃描（scan_daytrade_eligibility）+ 昨日收盤/高低（get_stock_daily_kline 月份 K 取前一日）皆過 T003 守門；資格失敗 → 保守降級 can_daytrade=false + UNKNOWN source 註記；產出 `briefings/YYYY-MM-DD_SYMBOL.json` + 寫 `briefing_generated` 事件（briefing_id 必填）
- **loadBriefing()（§9.3 防呆）**：盤中找不到當日檔 → 回 null（呼叫端拒絕啟動交易）

## 對接決策（tw-quant-mcp v1.3）
- Anchor Levels：`get_stock_daily_kline({symbol,date:月初})` 月份 K 取前一日 close/high（§9.1 key_levels 計算基準）
- 資格：`scan_daytrade_eligibility`（非交易時段 isError → 保守降級）

## 測試
9 tests：四 bias 對應、force_flat_by 動態（SHORT_ONLY 13:00 vs 13:10）、confidence 邊界、LONG_ONLY 完整結構 + 檔案產出 + 事件、資格失敗降級、NEUTRAL 雙向、loadBriefing 缺檔 → null、scoring_breakdown 總分一致。

全套測試：**276/276 pass**（267 + 9）+ lint/type check 過。
