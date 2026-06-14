---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/692
title: Skeleton Screen Design System
type: feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-27
updated: 2026-05-27
howto: |
  1. 建立通用 Skeleton 元件，支援不同形狀（circle / rect / bar）。
  2. 實作流光動畫（linear-gradient sweep）。
  3. 為 KPI 卡片、選股排行表、圖表製作對應的骨架屏佈局。
  4. 實作骨架屏→真實內容交叉淡出轉換。
  5. 多個骨架屏的流光時間錯開（stagger）。
---

# T049 - Skeleton Screen Design System

## 目標
建立完整的骨架屏系統，包含通用 Skeleton 元件、各元件的骨架屏形狀規格、以及骨架屏→真實內容的交叉淡出過渡。

## 驗收標準
- [ ] `Skeleton` 元件支援 `variant: 'circle' | 'rect' | 'bar'` + `width` / `height` props
- [ ] 流光動畫：左→右 linear-gradient sweep，1.5s ease-in-out infinite
- [ ] 多骨架錯開（nth-child delay 0.2s, 0.4s）
- [ ] KPI 卡片骨架屏形狀符合 spec §4.2
- [ ] 選股排行表骨架屏形狀符合 spec §4.2
- [ ] 圖表骨架屏形狀符合 spec §4.2
- [ ] 交叉淡出：skeleton-layer opacity 1→0 + real-content opacity 0→1，400ms

## 備註
- 目前各頁面已有不同實作（skelRow / skelCell / shimmer），需統一
- 參考 spec §4.1–4.3 的完整規格
