---
github_issue: N/A
title: 事件驅動回測模擬器（DayBrainBacktestSimulator）
type: feature
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-01
updated: 2026-08-01
---

# T022 - 事件驅動回測模擬器

## 目標
實作 §12 事件驅動回測模擬器：1 分鐘 K 市場重放（08:30→13:30）、Briefing 白名單約束、Priority Engine 競態撮合、成本（手續費/證交稅/滑點）真實還原、回測報告。實作於 `src/backtest/simulator.ts`。

## 驗收標準
- [ ] 四步驟架構（§12.1）：盤前重放（載入前 3 日 + 試撮 → 產出當日 briefing）→ 盤中時間軸驅動 Loop（每分鐘廣播、算 VWAP/Surge/突破）→ Priority Engine 競態排隊與撮合 → 持倉追蹤與強制平倉
- [ ] 資料契約（§12.2）：`MinuteBar` / `TradeRecord` / `ActivePosition` 全欄位
- [ ] 觸發條件讀取 Briefing（§12.4）：`volume_surge_threshold`（預設 2.5）、時間窗（start_time / no_new_entry_after）自 `trading_plan` 載入
- [ ] 成本設定（§12.4）：手續費 `0.001425×0.28`（2.8 折）、當沖證交稅 `0.0015`、滑點 1 檔（買進 ×1.0005）
- [ ] 離場檢查（§12.4）：STOP_LOSS / TAKE_PROFIT（目標價 R:R≥2:1）/ TRAILING_STOP / FORCE_FLAT（13:10）
- [ ] Priority Engine 注入（§12.1 Step 3）：同分鐘多候選依 Rank Score 排序、Tier 與族群 40% 上限、資金不足 1 張拒絕
- [ ] 回測報告（§12.5）：summary（total_trades / win_rate / net_total_pnl / profit_factor / max_drawdown）+ engine_effectiveness（`blocked_by_briefing_bias` / `blocked_by_sector_limit` / `blocked_by_margin_cap` / `priority_ranking_conflicts_resolved`）+ trades
- [ ] 單元 + 整合測試：完整模擬日（含多標的競態、白名單攔截、假突破回收）、成本計算精確性

## 備註
- 對齊 §12.4 提供之 `DayBrainBacktestSimulator` TypeScript 完整實作範例，可直接採用擴充
- 每迭代實例化全新 Simulator 清空狀態（§13.1 Grid Search 需求）
- 三大實戰效益（§12.6）：極限情境驗證、成本真實還原、Briefing 權重調優
