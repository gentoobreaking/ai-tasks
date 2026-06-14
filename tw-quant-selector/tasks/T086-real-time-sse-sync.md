---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/799
title: 實作基於 SSE 的投組即時同步
type: feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-30
updated: 2026-05-30
---

# T086 - 實作基於 SSE 的投組即時同步

## 目標
透過 Server-Sent Events (SSE) 技術，實現後端資料庫更新時即時通知前端進行資料重新載入，確保前端介面與資料庫（包含腳本更新）達到即時一致性。

## 驗收標準
- [x] 後端實作 `EventBus` 管理客戶端連線。
  - `src/tw_quant_selector/api/event_bus.py` — thread-safe `queue.Queue` + `threading.Lock`
- [x] 新增 `GET /api/v1/portfolio/events` SSE 接口。
  - `src/tw_quant_selector/api/app.py` — `StreamingResponse` + 30s heartbeat + 0.5s polling
- [x] 所有修改持倉的 API 操作（POST/DELETE）及核心資料變更時，後端觸發廣播事件。
  - `add_portfolio_lot()` 與 `delete_portfolio_stock()` 皆呼叫 `event_bus.broadcast("portfolio_update")`
- [x] 前端實作 `EventSource` 監聽機制，在收到事件時自動重新獲取最新投組資料。
  - `frontend/src/pages/Portfolio.tsx` — `useEffect` 建立 `EventSource`，收到 `portfolio_update` 時呼叫 `refreshPortfolio()`
- [x] 實作自動重連機制，處理網路斷線或伺服器重啟場景。
  - EventSource 原生支援 auto-reconnect；`es.onerror` 不關閉連線，瀏覽器自動重試

## 備註
- 此變更需考量連線池管理及事件廣播的執行緒安全性。
- SSE 適合單向推播，符合本專案場景需求。
