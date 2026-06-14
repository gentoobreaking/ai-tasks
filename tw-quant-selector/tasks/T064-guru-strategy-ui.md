---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/707
title: 大師策略庫 UI
type: feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-27
updated: 2026-05-28
howto: 前端 Strategy 頁面新增大師策略區塊
---

# T064 - 大師策略庫 UI

## 目標
在策略設定頁面新增大師策略庫區塊，以卡片形式展示六位大師，含條件明細與三種整合模式切換。

- 來源：spec §2.1、§2.2、§8

## 驗收標準
- [x] 六位大師卡片以 3 欄 Grid 排列（最小寬度 120px）
- [x] 每張卡片包含：相容性標籤（高/中）、姓名首字頭像圓圈（策略風格色）、中英文姓名、策略標籤 Chip
- [x] 點選卡片進入選中狀態（border 1.5px 策略色 + 背景提升）
- [x] hover 狀態：background-secondary + 120ms transition
- [x] 選中後展開條件明細，每條一行：條件名稱 + 資料來源（tertiary）+ 門檻值（mono）+ 通過數量 Chip
- [x] 通過數量 Chip 顏色依 spec §8.2：>400 綠、200-400 橙、<200 紅
- [x] 三種整合模式 Tab：篩選器 / 評分因子 / 快速預設
- [x] 切換 Tab 時下方說明文字更新且不重算預覽
- [x] 套用按鈕文案依模式動態變更

## 備註
- 僅 UI 搭建與互動邏輯，後端支援由 T067/T068 補足
- 大師資料（條件、門檻、權重）可先以前端 constant 定義
- 每張卡片的策略色：巴菲特 #2563eb、葛拉漢 #059669、彼得林區 #d97706、葛林布拉特 #7c3aed、歐尼爾 #dc2626、費雪 #0891b2
