---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/825
title: WebSocket 即时推播整合
type: feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-06-02
updated: 2026-06-04
howto: |
   1. 创建 api/websocket_manager.py（QuoteWebSocketManager）
   2. 支持 broadcast／broadcast_changed（只推有变动的股票）
   3. 新增 app.py WebSocket 端点 /ws/quotes
   4. 新增 REST fallback GET /api/v1/quotes/realtime?stocks=...
   5. 新增 POST /api/v1/notify-websocket-update
   6. 更新 poll_realtime 加入 on_quotes callback
   7. 新增 frontend useWebSocket hook（指数退避重连）
   8. 新增 WebSocketStatus 连線状态指示器
   9. Dashboard.tsx 整合 WebSocket 即时报价更新
   10. 9 个后端测试（WebSocket manager）
---

# T116 - WebSocket 即时推播整合

## 目标
实现 FastAPI WebSocket 端點，在盘中轮询完成後主动推播即时报价更新给前端 React UI。

## 验收标准
- [x] 后端实现（`api/app.py`）：
  - 新增 WebSocket 端點：`ws://localhost:8000/ws/quotes`
  - 实现 `QuoteWebSocketManager` 类别：
    - 管理所有前端连线（ConnectionManager）
    - 提供 `broadcast(quote_data)` 方法推播给所有连线
    - 处理连线建立/关闭事件
- [x] 推播讯息格式（参考 Streamlit.md §3.5）：
  ```json
  {
    "type": "quote_update",
    "timestamp": "2025-01-15T10:30:00+08:00",
    "data": {
      "2330": {
        "price": 943.0,
        "change_pct": 2.45,
        "pe_realtime": 22.1,
        "pb_realtime": 8.3,
        "volume": 12450000
      }
    }
  }
  ```
- [x] 推播策略：
  - 只推播有变动的股票（比较上次推播的 price）
  - 今日选股 20 档：每分钟推播
  - 全市场：不主动推播，前端用 REST API 查询
- [x] 前端实现（`frontend/src`）：
  - 实现 WebSocket 连线（在 Dashboard 页面）
  - 接收推播後更新 React state（不重新整理页面）
  - 处理连线中断自动重连（指数退避：1s, 2s, 4s, 8s, 16s）
  - 显示连线状态指示器（🟢 已连线 / 🔴 离线）
- [x] 整合 T121 盘中轮询：
  - 在 `poll_realtime()` 完成後，呼叫 `on_quotes` callback
  - 传入今日选股 20 档的即时报价
- [x] 单元测试：
  - 后端：模拟 WebSocket 连线，测试推播逻辑（9 tests）
- [ ] E2E 测试：
  - 启动后端 + 前端
  - 模拟盘中轮询推播
  - 验证前端即时更新

## 备注
- 参考 Streamlit.md §3.5 WebSocket 推播规格
- ⚠️ **依赖 T121（MIS API 即时报价轮询）**，需先完成
- WebSocket 路径：`ws://localhost:8000/ws/quotes`（注意是 `ws://` 而非 `http://`）
- 前端 WebSocket 实作可参考：`https://javascript.info/websocket`
- 若 WebSocket 实作困难，可降级为前端每 10 秒轮询 REST API（`GET /api/v1/quotes/realtime?stocks=2330,2454,...`）
- 推播时机：每次 T121 盘中轮询完成後（每 5 分钟全市场，每分钟今日选股）
