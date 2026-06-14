---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/704
title: 策略預設組合與宇宙篩選強化
type: feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-27
updated: 2026-05-28
howto: 前端 Strategy 頁面改造
---

# T061 - 策略預設組合與宇宙篩選強化

## 目標
一鍵載入六位大師的建議權重組合（快速預設模式），並將宇宙篩選條件改為滑桿+即時回饋。

- 來源：spec §3.3、§5

## 驗收標準
- [x] 快速預設按鈕列：巴菲特/葛拉漢/彼得林區/葛林布拉特/歐尼爾/費雪
- [x] 點擊後自動載入對應的四因子權重（參照 spec §3.3 權重對應表），滑桿即時更新
- [x] 載入後可在滑桿基礎上微調，鎖定狀態保留
- [x] 宇宙篩選區塊：市值下限（0-200億）、日均成交額（0-5000萬）、排除金融/KY 股開關
- [x] 每個條件右側顯示即時預估篩選影響（「篩掉 ~N 檔」）
- [x] 實作 `estimate_universe_size()` 前端估算函數
- [x] 排除全額交割股為固定條件（不可關閉），顯示在清單最上方

## 備註
- 前端僅做估算，精確數值由每日排程計算
- 快速預設是 §3.3 模式三，不做後端變更，只調整前端權重滑桿
- 宇宙估算基數假設 ~1,300 檔（上市+上櫃）
