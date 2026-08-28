---
id: T015
project: gold-analysis
source_project: gold-analysis-core
title: 實現實時數據推送
assignee: "pi with opencode/x-preview-f-free"
priority: medium
type: feature
status: done
created: 2026-04-07
updated: 2026-04-09
estimate: 3天
depends_on:
  - T003
  - T014
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/221
---

## 目標
建立 WebSocket 連接，實現客戶端-服務器雙向通信，推送實時數據。

## 驗收標準
- [ ] WebSocket 服務器建立完成
- [ ] 客戶端 WebSocket 連接完成
- [ ] 實時價格推送完成
- [ ] 實時決策推送完成
- [ ] 斷線重連機制完成
- [ ] 連接狀態管理完成

## 產出
| 檔案 | 路徑 | 說明 |
|------|------|------|
| WebSocket 模組 | `backend/app/realtime/websocket.py` | 服務器/客户端/消息格式 |
| 實時推送入口 | `backend/app/realtime/__init__.py` | 統一導出 |
| WebSocket 測試 | `tests/test_websocket.py` | 完整測試覆蓋 |

## 備註
Phase 3 實時層。實現完整 WebSocket 服務：ConnectionManager、WebSocketServer、WebSocketClient、RealtimePushService。需 `pip install websockets`。