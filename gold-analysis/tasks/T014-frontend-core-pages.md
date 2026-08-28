---
id: T014
project: gold-analysis
source_project: gold-analysis-core
title: 開發核心頁面
assignee: "pi with opencode/x-preview-f-free"
priority: medium
type: feature
status: done
created: 2026-04-07
updated: 2026-04-09
estimate: 5天
depends_on:
  - T013
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/220
---

## 目標
開發儀表板、圖表分析、決策詳情等核心頁面。

## 驗收標準
- [ ] 儀表板頁面完成
- [ ] 圖表分析頁面完成
- [ ] 決策詳情頁面完成
- [ ] 用戶認證頁面完成
- [ ] 實時數據更新功能完成
- [ ] 圖表交互功能完成

## 產出
| 檔案 | 路徑 | 說明 |
|------|------|------|
| 儀表板 | `frontend/src/components/pages/Dashboard.tsx` | 首頁儀表板，含實時價格、K線圖、最近決策 |
| 圖表分析 | `frontend/src/components/pages/ChartAnalysis.tsx` | 技術指標分析頁面，含 RSI/MACD/EMA |
| 決策詳情 | `frontend/src/components/pages/DecisionDetail.tsx` | 決策信號展示和歷史記錄 |
| 認證頁面 | `frontend/src/components/pages/AuthPage.tsx` | 登入/註冊/忘記密碼表單 |
| K線圖組件 | `frontend/src/components/charts/PriceChart.tsx` | TradingView Lightweight Charts 封裝 |
| API 服務 | `frontend/src/services/api.ts` | Axios API 封裝 |
| 自定義 Hooks | `frontend/src/hooks/useRealtimeData.ts` | 實時數據、圖表交互、WebSocket |
| Hooks 導出 | `frontend/src/hooks/index.ts` | 統一導出 |
| 核心頁面文檔 | `frontend/docs/CORE_PAGES.md` | 頁面結構、API、路由說明 |

## 路由配置
```
/auth      → AuthPage
/          → Dashboard
/chart     → ChartAnalysis
/analysis  → ChartAnalysis
/history   → DecisionDetail
```

## 備註
Phase 3 前端層。使用 Recharts 或 TradingView Lightweight Charts。預留 API/WS 對接點。