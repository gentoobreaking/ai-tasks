---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/708
title: 因子相關性矩陣
type: feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-27
updated: 2026-05-28
howto: 後端計算 + 前端熱力圖顯示
---

# T065 - 因子相關性矩陣

## 目標
計算四因子（動能、價值、品質、成長）之間的 Pearson 相關係數，以熱力圖矩陣顯示，輔助用戶判斷分散化有效性。

- 來源：spec §7

## 驗收標準
- [x] 後端實作 `compute_factor_correlation()` 回傳 4×4 相關係數矩陣
- [x] 從 `signals` 表取回顧期內每日四因子分數
- [x] 前端以 4×4 網格顯示相關係數矩陣
- [x] 顏色編碼依 spec §7.2：>0.5 深橙、0.2~0.5 淺橙、-0.2~0.2 灰、<-0.2 綠、對角線藍
- [x] 懸停顯示自動解讀文字
- [x] 新增 `GET /api/v1/strategy/correlation` endpoint
- [x] 矩陣下方顯示綜合建議文字（哪些因子組合有效分散、哪些過度集中）

## 備註
- 後端計算較重，建議快取結果（快取 1 小時或每日計算一次）
- 需確保 signals 表有足夠歷史資料（至少 252 個交易日）才有意義
