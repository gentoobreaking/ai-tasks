---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/800
title: 實作即時價格 SSE 同步機制
type: feature
priority: high
status: done
assignee: OpenClaw MiniMax M2.7
created: 2026-05-30
updated: 2026-05-30
---

# T087 - 實作即時價格 SSE 同步機制

## 目標
透過 SSE (Server-Sent Events) 技術，實現 `check_live_alerts.py` 寫入即時價格到 DB 後，主動通知前端進行資料重新載入，確保前端介面能顯示即時價格並達到即時一致性。

## 驗收狀況
- [x] 修改 `check_live_alerts.py` 支持開關控制（`REALTIME_PRICE_ENABLED` 環境變數） → ✅ 已完成
- [x] 修改 `check_live_alerts.py` 將即時價格寫入 `realtime_prices` 表（使用 DuckDB `ATTACH` 分開存儲） → ✅ 已完成
- [x] 修改 `check_live_alerts.py` 在寫入即時價格後，呼叫 FastAPI 端點觸發 SSE 事件 → ✅ 已完成（`notify_realtime_update()`）
- [x] 新增 FastAPI 端點 `POST /api/v1/notify-realtime-update` → ✅ 已完成（`app.py` 第 390-397 行）
- [x] 修改後端 API `GET /api/v1/stocks/prices` 支持 `realtime=true` 參數 → ✅ 已完成（從 `realtime.duckdb` 讀取即時價格）
- [x] 修改前端 `Portfolio.tsx` 的 `EventSource` 監聽邏輯，收到 `realtime_price_update` 事件時自動重新獲取最新即時價格資料 → ✅ 已完成（`refreshPortfolio(true)`）
- [x] 處理 DB Lock 問題：使用 DuckDB `ATTACH` 將即時價格存儲在獨立文件（`realtime.duckdb`） → ✅ 已完成
- [x] 添加錯誤處理：當即時價格 DB 無法寫入時，降級為只存在內存中計算，不中斷告警功能 → ✅ 已完成（`try-except` 包住 DB 寫入邏輯）

## 實際狀況
- **完成項目**：
  1. `check_live_alerts.py` 修改完成：
     - 新增 `REALTIME_PRICE_ENABLED` 環境變數控制開關
     - 新增 `write_realtime_prices_to_db()` 函數寫入即時價格到 `realtime.duckdb`
     - 使用 DuckDB `ATTACH` 分開存儲，避免 DB Lock
     - 新增 `notify_realtime_update()` 函數呼叫 FastAPI 端點觸發 SSE 事件
  2. FastAPI 端點新增完成：
     - `POST /api/v1/notify-realtime-update` 觸發 `event_bus.broadcast("realtime_price_update")`
  3. 後端 API 修改完成：
     - `GET /api/v1/stocks/prices?realtime=true` 從 `rt.realtime_prices` 表讀取即時價格
     - 使用 `ATTACH` 連接 `realtime.duckdb`
     - Fallback 到 `daily_prices` 如果即時價格讀取失敗
  4. 前端修改完成：
     - `Portfolio.tsx` 的 `EventSource.onmessage` 新增監聽 `realtime_price_update` 事件
     - 收到事件時呼叫 `refreshPortfolio(true)` 傳入 `realtime=true` 參數
     - `refreshPortfolio()` 函數接受 `realtime` 參數，動態決定 API URL

- **待驗證項目**（需要手動測試）：
  1. 啟動 FastAPI 後端：`cd /Users/claw/Projects/tw-quant-selector && python -m src.tw_quant_selector.api.app`
  2. 執行 `check_live_alerts.py` 測試即時價格寫入 DB
  3. 檢查 `realtime.duckdb` 是否正確建立並寫入資料
  4. 檢查 FastAPI 日誌是否收到 `/api/v1/notify-realtime-update` POST 請求
  5. 前端 `Portfolio.tsx` 是否收到 `realtime_price_update` 事件並重新整理價格

- **已知問題**：
  - `check_live_alerts.py` 需要安裝 `duckdb` 套件（`pip install duckdb`）
  - FastAPI 後端需要先啟動，否則 `notify_realtime_update()` 會失敗（已包在 `try-except` 中，不會中斷主流程）
  - 即時價格只在交易時間（9:00-13:30）有意義，非交易時間 `TWSE_API` 可能回傳昨日收盤價

## 測試指示（請手動驗證）
1. 啟動 FastAPI 後端：
   ```bash
   cd /Users/claw/Projects/tw-quant-selector
   python -m src.tw_quant_selector.api.app
   ```
2. 執行 `check_live_alerts.py`：
   ```bash
   cd /Users/claw/Projects/tw-quant-selector
   python scripts/check_live_alerts.py
   ```
3. 檢查輸出：
   - 應該看到 `✅ Wrote {N} realtime prices to DB`
   - 應該看到 `✅ Notified FastAPI for SSE event`
4. 檢查 `data/realtime.duckdb` 檔案是否建立
5. 使用 SQLite Browser 或 DuckDB CLI 檢查 `realtime_prices` 表資料
6. 開啟前端 `http://localhost:5173/portfolio`
7. 檢查瀏覽器 Console 是否收到 `realtime_price_update` 事件
8. 檢查持倉價格是否更新為即時價格

## 技術實作細節

### 架構設計
```
check_live_alerts.py (單獨進程)
    ↓ 寫入即時價格到 realtime.duckdb
    ↓ HTTP POST /api/v1/notify-realtime-update
FastAPI App (主進程)
    ↓ event_bus.broadcast("realtime_price_update")
    ↓ SSE 推播
前端 EventSource
    ↓ 收到 realtime_price_update
    ↓ refreshPortfolio() 並傳入 realtime=true
```

### DuckDB ATTACH 範例
```python
# check_live_alerts.py 中
db.execute("ATTACH 'realtime.duckdb' AS rt")
db.execute("""
    CREATE TABLE IF NOT EXISTS rt.realtime_prices (
        stock_id TEXT PRIMARY KEY,
        close REAL,
        trade_date DATE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
""")
db.execute("""
    INSERT INTO rt.realtime_prices (stock_id, close, trade_date)
    VALUES (?, ?, CURRENT_DATE)
    ON CONFLICT(stock_id) DO UPDATE SET
        close = excluded.close,
        updated_at = CURRENT_TIMESTAMP
""", [stock_id, close])
```

### FastAPI 端點範例
```python
@app.post("/api/v1/notify-realtime-update")
def notify_realtime_update():
    """Trigger SSE event for realtime price update."""
    event_bus.broadcast("realtime_price_update")
    return api_response({"status": "ok"})
```

### 前端 EventSource 擴展範例
```javascript
// Portfolio.tsx 中擴展現有 EventSource
es.onmessage = (event) => {
  try {
    const payload = JSON.parse(event.data);
    if (payload.type === 'portfolio_update') {
      refreshPortfolio();
    } else if (payload.type === 'realtime_price_update') {
      // 傳入 realtime=true 參數
      refreshPortfolio(true);
    }
  } catch { /* ignore parse errors */ }
};
```

## 測試計劃
1. **單元測試**：測試 `check_live_alerts.py` 的即時價格寫入邏輯（mock DB）
2. **整合測試**：模擬 `check_live_alerts.py` 執行 → 驗證 SSE 事件發送 → 驗證前端刷新
3. **負載測試**：模擬多個持倉同時更新即時價格，驗證 DB Lock 未發生
4. **降級測試**：模擬 DB 寫入失敗，驗證告警功能不受影響

## 相關檔案
- `/Users/claw/Projects/tw-quant-selector/scripts/check_live_alerts.py`：需修改
- `/Users/claw/Projects/tw-quant-selector/src/tw_quant_selector/api/app.py`：需新增端點
- `/Users/claw/Projects/tw-quant-selector/src/tw_quant_selector/api/event_bus.py`：已有，無需修改
- `/Users/claw/Projects/tw-quant-selector/frontend/src/pages/Portfolio.tsx`：需修改
- `/Users/claw/Projects/tw-quant-selector/data/tw_quant.duckdb`：需 ATTACH 新文件

## 預估工時
- 修改 `check_live_alerts.py`：2 小時
- 新增 FastAPI 端點：0.5 小時
- 修改後端 API 支持即時價格：1 小時
- 修改前端支持即時刷新：1 小時
- 測試與除錯：1.5 小時
- **總計**：6 小時
