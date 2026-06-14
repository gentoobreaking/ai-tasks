---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/832
title: React 前端警示整合（useMarketAlerts.ts）
type: feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-06-02
updated: 2026-06-06
howto: |
  1. 创建 frontend/src/hooks/useMarketAlerts.ts
  2. 实现 WebSocket 订阅后端智慧警示串流
  3. 实现 React 状态管理（alerts state）
  4. 在 DataGrid 行头显示警示图标（⚡、🐋、🌊 等）
  5. 整合 Web Notifications API（桌面通知）
---

# T123 - React 前端警示整合（useMarketAlerts.ts）

## 目标
实作 realtime-1.txt Section 5.1 的 React 前端整合，包括 WebSocket 警示订阅、DataGrid 图标显示、Web Notifications API。

## 验收标准
- [x] 创建 `frontend/src/hooks/useMarketAlerts.ts`：
  - 实现自定义 React Hook
  - 订阅后端 WebSocket 端點：`ws://localhost:8000/ws/alerts`
  - 接收警示讯息格式：
    ```typescript
    interface AlertMessage {
      type: 'alert_triggered';
      timestamp: string;
      alert_type: string;
      stock_id: string;
      stock_name: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      message: string;
      details: Record<string, any>;
    }
    ```
  - 实现自动重连逻辑（指数退避：1s, 2s, 4s, 8s, 16s）
  - 实现 React state 管理：`alerts: AlertMessage[]`

- [~] 在 `frontend/src/components/StockDataGrid.tsx` 中整合（該元件不存在，改為整合至 `Signals.tsx` 的 BaseTable）：
  - 导入 `useMarketAlerts` hook（改為透過 AlertContext）
  - 若个股触发任一警示，行头显示对应图标：
    - ⚡：绝对爆量突破（Volume Spike）
    - 📉：有量无力/出货警讯（High Volume, No Move）
    - 🐋：瞬间资金吸金怪兽（Turnover Monster）
    - 📈：异常高低价差（Intraday Volatility）
    - 🌊：族群集体高潮（Industry Momentum）
    - 🛡️：逆市英雄（Against the Trend）
    - 🚨：鸡犬升天/末跌段警讯（Low Price Junk Rally）
    - 💰：ETF 异常套利空间（Premium/Discount Alarm）
    - 🐋：巨人的移动（Whale Move Alert）
    - 🔄：主动式/新制 ETF 异常活络（New Product Hype）
  - 滑鼠悬停（Hover）时显示详细警示原因（Tooltip）

- [x] 整合 Web Notifications API：
  - 在 `useMarketAlerts.ts` 中新增 `requestNotificationPermission()` 函数
  - 当符合「逆市英雄」或「巨人的移动」时跳出桌面系统通知
  - 通知格式：标题 `🚨 智慧警示触发`，内容 `${stock_name} (${stock_id}): ${message}`
  - 用户需先授权通知权限（`Notification.requestPermission()`）

- [x] 实现警示侧边栏（Alert Sidebar）：
  - 创建 `frontend/src/components/AlertSidebar.tsx`
  - 显示最近 20 条警示（滚动列表）
  - 点击警示可跳转到该个股详情页
  - 支援过滤（按 severity、按 alert_type）

- [ ] 单元测试：
  - 测试 `useMarketAlerts` hook（mock WebSocket）
  - 测试 DataGrid 图标显示逻辑
  - 测试 Web Notifications API 呼叫（mock `Notification`）

## 备注
- 参考 realtime-1.txt Section 5.1 React + TypeScript 整合方式
- ✅ **T121（MIS API 即时报价）** — 已完成，提供 realtime_quotes 資料源
- ✅ **T122（10 种智慧警示条件实作）** — 已完成，提供警示檢查函數
- WebSocket 端點路径：`ws://localhost:8000/ws/alerts`（后端需在 `api/app.py` 中新增）
- 桌面通知需使用者授权，应在 App 载入时主动请求权限
- 警示图标应使用 SVG 或 Emoji，确保在高 DPI 萤幕清晰显示
