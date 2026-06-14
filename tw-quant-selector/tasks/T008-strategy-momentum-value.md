---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/672
title: 動能策略與價值策略實作
type: task
priority: high
status: done
assignee: gemini-3-flash-preview
created: 2026-05-25
updated: 2026-05-25
howto: 依 spec 5.2, 5.3
---

# T8 - 動能策略與價值策略實作

## 目標
實作 Momentum Strategy（12-1月動能 × 流動性加權）與 Value Strategy（PB/PE/殖利率等權合成）。

## 驗收標準
### Momentum
- [x] 公式正確：`(close[T-22] / close[T-252]) - 1` × `log(avg_volume_20d)` → Z-score
- [x] 參數：`lookback_long=252`, `lookback_short=22`, `min_data_days=252`
- [x] 資料不足者跳過（不計算分數）

### Value
- [x] PB score = `zscore(-log(pb_ratio))`，PB > 30 視為異常跳過
- [x] PE score = `zscore(-log(pe_ratio))`，僅 PE > 0 且 PE < 100
- [x] Yield score = `zscore(dividend_yield)`
- [x] 合成：`nanmean([pb, pe, yield])`，缺少指標者用剩餘平均

### 共通
- [x] 回傳 `{stock_id: score}`，分數越高越佳
- [x] 已 Z-score 正規化
- [x] 單元測試覆蓋邊界條件（資料不足、極端值、NULL 處理）

## 備註
PE 為虧損（負值）時不計入該指標，避免「越虧越便宜」的錯誤邏輯。
