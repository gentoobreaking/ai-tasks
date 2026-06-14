---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/664
title: 效能預算
type: feature
priority: medium
status: done
assignee: gemini-3-flash-preview
created: 2026-05-26
updated: 2026-05-26
howto: |
  1. Set up Vite performance budget plugin to warn on bundle size
  2. Implement lazy loading for routes (React.lazy + Suspense)
  3. Ensure TanStack Table virtualization for tables >100 rows
  4. Use lightweight-charts (Canvas-based) for charts with >1000 data points
  5. Implement above-fold prefetching via TanStack Query prefetchQuery
  6. Restrict polling to /monitor only (60s), cleanup on page unmount
  7. Audit bundle with vite-bundle-analyzer, tree-shake unnecessary deps
  8. Verify: FCP < 1.5s, TTI < 3s, LCP < 2.5s in Lighthouse
---

# T030 - Performance Budget & Optimization

## 目標
建立效能預算與優化框架，確保前端符合 spec 定義的 FCP/TTI/LCP 目標，以及套裝大小限制。

## 驗收標準
- [x] Vite 設定中已配置效能預算監控（bundle size warning < 250KB gzipped，不含圖表函式庫）
- [x] 所有頁面使用 `React.lazy` + `Suspense` 進行路由級懶加載
- [x] 表格超過 100 筆時自動啟用 TanStack Table 虛擬化
- [x] 圖表資料點超過 1000 時使用 Canvas 渲染（lightweight-charts）
- [x] 首屏資料使用 TanStack Query 的 `prefetchQuery` 預先載入
- [x] 輪詢僅在 `/monitor` 頁面啟用（60 秒間隔），切換頁面時自動清除
- [x] 初始載入無 blocking request（所有非首屏請求非同步）
- [x] Lighthouse 檢測：FCP < 1.5s、TTI < 3s、LCP < 2.5s
- [x] Bundle 分析無明顯可 tree-shake 的未使用依賴

## 備註
- 參考 spec §8 完整效能規格
- 使用 `vite-bundle-analyzer` 進行 bundle 分析
