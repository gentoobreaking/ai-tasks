---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/703
title: 四因子滑桿鎖定與權重聯動
type: feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-27
updated: 2026-05-28
howto: 前端 Strategy 頁面改造
---

# T060 - 四因子滑桿鎖定與權重聯動

## 目標
實作四因子（動能、價值、品質、成長）滑桿的鎖定機制與權重聯動，確保總和永遠為 100%，防止無效設定。

- 來源：spec §4.2

## 驗收標準
- [x] 每個滑桿旁有鎖定開關（🔓/🔒），鎖定後該滑桿不可被聯動調整
- [x] 拖動任一滑桿時，其他未鎖定的滑桿自動等比例縮放以維持總和 = 100%
- [x] 若所有其他滑桿皆鎖定，拒絕調整並顯示提示
- [x] 若聯動後有策略降至 0%，彈出確認：「X 策略將被完全停用，確認嗎？」
- [x] 總和 != 100% 時，套用按鈕加灰不可點擊
- [x] 實作 `auto_rebalance(weights, changed_id, new_val, locked) -> dict` 函數
- [x] 使用 `transition: 200ms ease` 平滑動畫過渡

## 備註
- 參考 spec §4.2 的擬碼實作 auto_rebalance 邏輯
- 需讀取/寫入 localStorage 保存鎖定狀態
- 與 T061 快速預設共用滑桿狀態
