---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/690
title: Animation & Motion System
type: feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-27
updated: 2026-05-27
howto: |
  1. 在 CSS 變數中加入 Duration / Easing Semantic Tokens。
  2. 實作數字翻滾動畫（animateNumber）用於 KPI 卡片數值更新。
  3. 實作表格行展開/收合動畫（max-height + opacity）。
  4. 實作路由頁面切換動畫（淡入淡出 + 微幅上移）。
  5. 圖表首次繪製動畫（stroke-dashoffset 從左往右）。
  6. 遵守 prefers-reduced-motion。
---

# T047 - Animation & Motion System

## 目標
建立統一的動畫系統，包含時間尺度（Duration Scale）、easing 曲線、數字翻滾動畫、行展開動畫、頁面切換動畫、圖表入場動畫。

## 驗收標準
- [ ] CSS 變數 `--dur-interaction / --dur-transition / --dur-animation / --dur-entrance / --ease-exit / --ease-enter / --ease-bounce` 定義到位
- [ ] `animateNumber()` utility 實作：requestAnimationFrame 翻滾，顯著變動才動畫，`prefers-reduced-motion` 時直接切換
- [ ] 表格行展開：max-height + opacity transition，300ms ease-out
- [ ] 路由切換：fade + translateY(8px)，250ms ease-in-out
- [ ] 圖表首次繪製：stroke-dashoffset 動畫 800ms，從左往右
- [ ] 所有動畫符合 spec §2.1 Duration Scale 表格

## 備註
- 不依賴第三方動畫函式庫（react-spring / framer-motion），使用純 CSS + requestAnimationFrame
- 數字翻滾動畫僅用於 KPI 卡片，不用於表格
