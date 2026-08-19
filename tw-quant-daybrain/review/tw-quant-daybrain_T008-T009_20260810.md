# T008/T009 完成記錄（2026-08-10）

## T008 風控系統與持倉狀態機（§11）✅ commit `2ab4b44`
- `src/risk/risk_manager.ts`（17886 bytes）+ `risk_manager.test.ts`（12516 bytes）
- 倉位規模：風險＝權益×0.5%（上限 1%）、股數＝風險÷(進場−停損)、單標曝險≤10% 權益（含既有曝險併計）、MAX_POSITIONS 2
- 狀態機：IDLE→SCANNING→ARMED→TRIGGERED→ENTERED→MANAGED→CLOSED→LOGGED；POSITION_STATE_TRANSITIONS 白名單；TRIGGERED→ENTERED 需 confirmEntry（人工/紙上交單，T014 介面）
- 出場優先序（evaluateExit + evaluateAndClose）：硬停損（多 -1.5%/跌破 VWAP；空 +1.5%/站回 VWAP/突破當日高點）> 目標價 R:R≥2:1（部分獲利 50%→MANAGED 移動停利成本價）> 時間停損 > 假突破回收；移動停利追蹤 extrema 回檔 1%（多空雙向）
- 每日上限：-3%→DAILY_LOCKOUT、連 3 停損→次日 50%、單日 10 筆；時間限制 canOpenPosition + forceFlatDirective（13:00 空強回、13:10 FORCE_FLAT_ALL）
- 測試 150 pass；除錯重點：partialTake 的 ev.exit=false 分支順序（先檢查 partialTake 再 !exit）、測試 trigger 價位（triggerPrice 105 vs 100）、position_closed 缺 position_id

## T009 盤中監控循環（§4 Phase 2 + Phase 3）✅ commit `2410b5e`（+`4620530` restore 摘要檔）
- `src/engine/intraday_loop.ts`（14333 bytes）+ `intraday_loop.test.ts`（13387 bytes）
- tick() 流程：checkPhase3 → LOCKOUT 檢查 → perSymbol [fetchVwap+fetchSurge（先過 gate.check INTRADAY_SIGNAL，失敗寫 freshness_gate_fail）] → 節流（perTick Set）→ 雙 tick 確認 → 過期檢查 → 假突破回收檢查 → 評分輸入 → 開盤緩衝 → canOpenNewPosition → Bias blocked_actions 攔截 → score() → SignalAdvice → pending 追蹤 → PriorityEngine 排序 → signal_issued 事件
- SignalAdvice（§14.2）：signal_id（YYYYMMDD-HHMM-ssSSS）/ts（isoInTaipei）/grade/score/score_breakdown/strategy/recommended_entry/target_price/stop_loss_price/rr_ratio/position_size_shares/data_quality/expiry_ts
- Phase 3 六觸發點：11:30 short_stop_new、12:30 no_new_position_warn、13:00 hard_stop_new、13:10 force_flat_warn、13:15 force_flat_remind、13:20 force_flat_final → 皆寫 phase_end（phase:3, trigger, detail）防重入
- 依賴注入：BriefingProvider（T019 stub）、PriorityEngine（T020 stub）、McpCallFn、FreshnessGate 實例、TickConfirmer、RiskManager
- 測試 164 pass（+14）；設計決策：volumeSurgeThreshold 由 scoring engine 持有（loop 不重複設）

## 執行規範（後續任務沿用）
每完成一任務：git commit（附摘要）→ 更新 `~/tasks/tw-quant-daybrain/tasks/TXXX.md` frontmatter（status done + checkbox 全勾）→ 更新專案 README.md → 逐項驗收（tests/build/lint）。**不更新** `~/tasks/tw-quant-daybrain/README.md`（自動）。注意 git add -A 會誤刪未追蹤摘要檔——T001-T004 summary.md 已 restore（`4620530`）。

## git log 現況
`4620530` restore 摘要 → `2410b5e` T009 → `2ab4b44` T008 → `4d83ddf` T007 → `a365cd9` T006 → `c8ac507` T005

## 待續
T010（JournalEntry 統計/績效指標）起。剩餘任務：T010-T024（含 T011 事件回放工具、T012 績效指標、T013 參數最佳化、T014 紙上交單 UI、T015 回測引擎、T016 Bias 決策樹、T017/T018 策略引擎、T019 Briefing 載入、T020 Priority Engine、T021 盤後流程、T022 LLM 檢討、T023 排程整合、T024 部署）。
