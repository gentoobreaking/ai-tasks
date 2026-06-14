---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/847
title: Market Dashboard 集成
type: merge
priority: medium
status: done
assignee: Openclaw DeepSeek V4 Flash
created: 2026-06-07
updated: 2026-06-07
---

# Market Dashboard 集成

## 目标
将 `tmp/market-dashboard/market-dashboard.html` + `tmp/market-dashboard/server.py` 集成进 container 前端+后端。

## 改动清单

### 后端: `src/tw_quant_selector/api/app.py`
- 新增 `# ── Market Dashboard (Quotes) ──` 块（~90 行），注册在 `serve_spa` catch-all 之前
- 3 个新路由：
  - `GET /api/market/quotes` — 全部报价（23个 symbol）
  - `GET /api/market/quote/{symbol}` — 单一报价
  - `GET /api/market/health` — 健康检查
- 复用已有 `yfinance` 依赖

### 前端: 新增 2 文件
- `frontend/src/pages/MarketDashboard.tsx` — React 组件
  - 保留原始暗色主题设计
  - 使用 React hooks 替代原生 JS
  - 数据源改为 `/api/market/quotes`（Vite proxy → backend）
  - 5 个 section（美股指标/美股观察/油价/黄金/台股）
- `frontend/src/pages/MarketDashboard.module.css` — 完整样式

### 前端: 修改 2 文件
- `App.tsx` — lazy import + `/market-dashboard` 路由
- `Sidebar.tsx` — 添加导航项 `📊 市场走势`

## 不影响的既有功能
- 所有 `/api/v1/*` 路由不受影响
- 所有既有前端页面/路由不变
- Dockerfile / docker-compose.yml 无需修改
- Sidebar 其他导航项不变

## 验证
- TypeScript: `tsc --noEmit` ✅
- Python: `ast.parse` ✅
- 路由注册顺序：`/api/market/*` 在 `serve_spa` catch-all 之前 ✅