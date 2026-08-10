---
github_issue: N/A
title: 盤前多空傾向鎖定（Bias Decision Tree）
type: feature
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-01
updated: 2026-08-11
---

# T016 - 盤前多空傾向鎖定（Bias Decision Tree）

## 目標
實作 §5 盤前多空傾向鎖定：以 Bias Score（-100 ~ +100）於 08:55 鎖定 `LONG_ONLY` / `SHORT_ONLY` / `NEUTRAL_FLEXIBLE` / `NO_TRADE` 四態，防止盤中多空對砍（Whipsaw）。實作於 `src/bias/decision_tree.ts`。

## 驗收標準
- [x] 四階段決策流程（§5.1）：風控硬性關卡 → 籌碼/趨勢基調 → 消息與夜盤共振 → 盤前試撮驗證
- [x] 評分表（§5.2）全數實作：日線趨勢 ±20（5MA/20MA 位階）、法人籌碼 ±25（近 3 日累計買賣超）、夜盤/美股 ±25（台指夜盤 >±0.5% 且 NVDA/TSM ADR 同向）、盤前試撮 ±30（08:40–08:55 開高/開低）
- [x] 鎖定規則（§5.3）：≥ +50 → `LONG_ONLY`（屏蔽空訊）；≤ -50 → `SHORT_ONLY`（屏蔽多訊，`can_short_first == false` 改判 `NO_TRADE`）；中間 → `NEUTRAL_FLEXIBLE`（門檻提高至 85 分）；硬風控旗標 → `NO_TRADE`
- [x] MCP 輸入全數過 T003 守門；單節點資料逾時該節點得分以 0 計並於 rationale 註記
- [x] 輸出 `{ bias, score, rationale }`（對齊 §5.4 `evaluateDayTradeBias` 簽名）；鎖定結果寫入 `bias_locked` 事件（T004）
- [x] 單元測試：各節點權重加減、邊界（±49/±50/±51）、SHORT_ONLY 但無法先賣後買、處置股硬風控

## 備註
- 於 08:30–08:55 執行，08:55 正式鎖定並交由 T019 寫入 Tactical Briefing
- 對齊 §5.4 提供之 TypeScript 實作範例（`evaluateDayTradeBias`），可依範例擴充而非另起爐灶
- 輸入工具：`scan_daytrade_eligibility` / `get_technical_indicators` / `get_institutional_flow`（或 `get_institutional_investors`）/ `get_overnight_market_status`（或 `get_taifex_night` + `get_us_market`）/ `get_pre_market_quote`
