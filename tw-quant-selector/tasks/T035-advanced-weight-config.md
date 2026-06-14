---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/714
title: 進階策略權重調整器（自動平衡與即時預覽）
type: feature
priority: medium
status: done
assignee: gemini-3-flash-preview
created: 2026-05-26
updated: 2026-05-26
howto: |
  1. 在 /strategy 頁面實作權重調整滑桿 (Slider)
  2. 實作自動平衡邏輯：當調整一個滑桿時，其餘滑桿依比例縮放，確保總計永遠為 100% (spec §3.5)
  3. 實作即時影響預覽 (Live Preview)：呼叫 API 或在本機計算，顯示「若套用此設定，今日選股將有 N 檔變動」
  4. 實作「套用」前的確認 Modal，摘要權重變化
---

# T035 - Advanced Strategy Weight Configurator

## 目標
實作規格書 §3.5 定義的高級權重調整器，包含滑桿自動平衡邏輯與變動影響的即時預覽功能。

## 驗收標準
- [x] 四個策略滑桿（動能、價值、品質、成長）加總永遠自動維持在 100%
- [x] 調整任一滑桿時，其他滑桿會依目前比例自動增減補足或鎖定
- [x] 介面即時顯示「總計 100% ✓」或在不平衡時顯示警告
- [x] 調整過程中，介面顯示預覽資訊：「若套用此設定，今日選股將有 N 檔變動」（相對於目前生效的權重）
- [x] 點擊「套用」後跳出確認 Modal，列出舊權重 vs 新權重，確認後才寫入後端
- [x] 實作「重設」按鈕，回復至系統預設值（30, 25, 25, 20）

## 備註
- 滑桿步進設定為 5% (spec §3.5)
- 自動平衡演算法需處理小數點精度，避免出現 99.9% 或 100.1% 的情況
