---
github_issue: N/A
title: 做多策略引擎（VWAP_SURGE_LONG）
type: feature
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-01
updated: 2026-08-11
---

# T017 - 做多策略引擎（VWAP_SURGE_LONG）

## 目標
實作 §6 做多當沖策略引擎：VWAP 爆量突破（適用權值股如台達電 2308）。進場判定、4×25 分評分、停損停利風控、JSON 訊號 Payload。實作於 `src/engine/vwap_surge_long.ts`。

## 驗收標準
- [x] 盤前風控門檻（§6.1）：`scan_daytrade_eligibility` 通過 `can_daytrade == true`、`is_disposition == false`；Anchor Levels 計算（昨收/昨日高低/法人買超狀態）
- [x] 進場四條件（§6.2）：時間窗 09:05–11:30；VWAP 站穩（偏離 ≤ +1.5%）；爆量 ≥2.5 倍（`detect_volume_surge`）；突破盤前 15 分高點；台指期紅棒順風
- [x] 評分（§6.3）：4 條件各 +25；距漲停 <1.5% 扣 50；score ≥75 發送建議進場（門檻可設定，NEUTRAL 日 85）
- [x] 停損停利（§6.4）：硬停損 -1.5% 或跌破 VWAP 持續 1 分鐘；+2.0% 平倉 50%、剩餘 50% 移動停利（自高點回檔 1.0%）
- [x] 時間硬風控（§6.4）：12:30 停止發訊、13:10 `FORCE_FLAT_ALL` 強制平倉警告
- [x] 訊號 Payload（§6.5）：含 timestamp / symbol / action=BUY_TO_OPEN / strategy / signal_score / execution_plan（entry/suggested_size/stop_loss/target_1/max_holding_time）/ rationale
- [x] 單元測試：四條件組合、評分邊界（74/75）、距漲停扣分、停損停利觸發、時間窗邊界

## 備註
- 掛載於 T007 通用評分框架（§8.1 策略引擎為單一標的實作）；本引擎之 4×25 分制與 §8 評分表並存
- 停損/停利參數自 Tactical Briefing 動態載入（§9.3，不硬編碼）
- 盤中由 T009 每 tick 呼叫；訊號寫入事件日誌（`signal_issued`）
