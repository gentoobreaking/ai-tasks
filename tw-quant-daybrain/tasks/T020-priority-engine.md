---
github_issue: N/A
title: Priority Ranking Engine（優先權排序與資金分配）
type: feature
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-01
updated: 2026-08-01
---

# T020 - Priority Ranking Engine

## 目標
實作 §10 優先權排序與動態資金分配：多標的同時觸發時依 Rank Score 排隊派單，Tier 資金上限、產業集中度 40% 限制、資金池風控。實作於 `src/execution/priority_engine.ts`。

## 驗收標準
- [ ] 綜合優先權得分（§10.1）：`R = 0.4×S_pre + 0.5×M_surge − 0.1×D_vwap`（S_pre 為 Briefing 得分、M_surge 為爆量倍數封頂 100、D_vwap 為 VWAP 偏離扣分）；權重可經回測調參（§13）
- [ ] 三層流程（§10.1）：第一層盤前戰術評級 → 第二層盤中即時動能 → 第三層資金池風控配額
- [ ] Tier 資金配置（§10.2）：資金池 NT$300 萬、最大槓桿 2 倍（總曝光 NT$600 萬）；S_pre≥80 → 33%（200 萬）、60–80 → 20%（120 萬）、50–60 → 10%（60 萬）、<50 → 禁止
- [ ] 產業集中度限制（§10.2）：同族群在手持倉 ≤ 總曝光 40%
- [ ] 白名單過濾（§10.3）：`allowed_actions` 不含該 action → 直接拒絕
- [ ] 競爭搶單（§10.4）：同 tick 多訊號依 Rank Score 排序依序派單；資金不足 1 張 → 拒絕
- [ ] API 對齊 §10.3 `PriorityRankingEngine`：`evaluateSignal(candidate, briefing, sector) → ExecutionDecision`、`registerPosition` / `releasePosition`
- [ ] 決策寫入 `priority_ranked` 事件（含 rankScore / allocatedCapital / reason）
- [ ] 單元測試：Rank 計算、Tier 邊界（49/50/59/60/79/80）、族群 40% 上限、白名單攔截、並發兩標的排序

## 備註
- 對齊 §10.3 提供之 TypeScript 實作範例，可直接採用擴充
- 為 T009 盤中循環之多標的資金調度核心（§4 Phase 2 步驟 5）；回測模擬器（T022）亦注入本引擎驗證競態
- §10.2 之資金池/槓桿/族群比例以 §17.1 環境變數參數化（`TOTAL_MARGIN_POOL_NTD` / `MAX_LEVERAGE` / `SECTOR_LIMIT_PCT`）
