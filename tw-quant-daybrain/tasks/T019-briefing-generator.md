---
github_issue: N/A
title: Tactical Briefing 產生器（盤前戰術報告）
type: feature
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-01
updated: 2026-08-11
---

# T019 - Tactical Briefing 產生器

## 目標
實作 §9 盤前戰術報告產生器：將 §5 Bias 決策結果結構化為帶 Data Lineage 之 `briefing.json`（狀態設定檔），作為盤中 Agent 之 Action 白名單與動態風控參數來源。實作於 `src/briefing/generator.ts`。

## 驗收標準
- [x] `TacticalBriefing` 型別（§9.2）全欄位：`_lineage`（generated_at / agent_version / mcp_server_version / data_sources）、`target`、`bias_assessment`（bias / score / confidence / scoring_breakdown）、`trading_plan`（allowed/blocked_actions、active_window、key_levels 含 `volume_surge_threshold`）、`risk_guardrails`（max_position_size_shares / hard_stop_loss_pct / take_profit_target_1_pct / trailing_stop_activation_pct / trailing_stop_callback_pct / max_drawdown_limit_ntd / safety_flags）
- [x] 08:55 自動產出 `briefings/YYYY-MM-DD_SYMBOL.json`（§9.1 範例格式，每標的乙份）
- [x] Bias 對應規則（§9.2）：NO_TRADE → allowed 空 / LONG_ONLY → 僅 BUY_TO_OPEN / SHORT_ONLY → 僅 SELL_TO_OPEN / NEUTRAL_FLEXIBLE → 雙向
- [x] 動態時間窗（§9.2）：`force_flat_by` 依 bias 為 `SHORT_ONLY ? "13:00" : "13:10"`
- [x] 防呆機制（§9.3）：盤中找不到當日 briefing → Agent 拒絕啟動交易；Action 白名單第一關攔截；風控參數動態載入（不硬編碼）
- [x] 產出寫入 `briefing_generated` 事件（T004）
- [x] 單元測試：四種 bias 之 allowed/blocked 對應、JSON Schema 驗證、缺檔拒絕啟動邏輯

## 備註
- 對齊 §9.2 提供之 `TacticalBriefingGenerator` TypeScript 範例，可直接採用擴充
- 為 T009 盤中循環之狀態設定檔：白名單攔截與動態風險載入皆以此為唯一來源
- `volume_surge_threshold`（§9.1 key_levels）為 T022/T023 回測與 Grid Search 之參數注入點（§13.1）
