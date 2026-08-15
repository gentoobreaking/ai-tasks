---
github_issue: "#101"
title: 修改 realtime_quotes.py 使用 MCP 實時數據
type: data
priority: high
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2025-08-15
updated: 2025-08-15
---

# T145 - 修改 realtime_quotes.py 使用 MCP 實時數據

## 目標
將 `tw_quant_selector/data/realtime_quotes.py` 中的 `poll_realtime` 函式與 SSE 推流機制，改為優先呼叫 tw-quant-mcp 取得實時報價，若 MCP 不可用則降級至原有 yfinance/twstock 來源。

## 內容說明
- **修改檔案**: `tw_quant_selector/data/realtime_quotes.py`
- **變更點**:
  - `poll_realtime()` 函式：改為調用 MCP client `GetRealtimeData(stock_id)` 
  - 保留原有 SSE 建立連線邏輯，但資料來源變更為 MCP
  - 新增 `MCP_FALLBACK_ENABLED` 環境變數開關 (預設 True)
  - 當 MCP 回傳錯誤或超時時，自動切換至 yfinance/twstock 查詢
  - 新增 `get_mcp_status()` 回傳 MCP 連線健康度 (供前端狀態面板顯示)
- **輸出變更**: 
  - `realtime_quotes.py` 的輸出格式（`close`, `change`, `change_pct` 等）需與 MCP 回傳的字段對照，若不一致需做欄位映射轉換
  - 新增 `_mcp_last_error` 變數記錄最後一次 MCP 錯誤訊息（供調試使用）

## 驗收標準
- [x] 呼叫 `poll_realtime()` 時，優先向 MCP 發送請求
- [x] MCP 返回資料時，直接使用；MCP 失敗時，自動回落至 yfinance/twstock 並回傳資料
- [x] `get_mcp_status()` 回傳 `{"healthy": true/false, "last_error": "..."}`
- [x] 前端 SSE 接收到的訊息格式與原始版本一致（`close`, `volume`, `timestamp` 等）
- [x] 單元測試：測試 MCP 失敗時的 fallback 行為，確保不會中斷輪詢循環

## 實作摘要 (2026-08-16)

`MISApiClient.fetch_all()` 加入了 MCP-first 邏輯：

```python
if os.environ.get("TW_USE_MCP", "").lower() in ("1", "true", "yes"):
    try:
        mcp_quotes = self._fetch_via_mcp(stock_ids, key_stock_ids)
        if mcp_quotes:
            return mcp_quotes
    except Exception as exc:
        log.warning("mis.mcp_failed_fallback_mis", error=str(exc))

# 原有 MIS 路徑
base = self._batch_all(stock_ids)
z_map = self._fetch_key_z(key_stock_ids or stock_ids[:5], quota=5)
...
```

`_fetch_via_mcp` 走 `data.mcp.realtime_adapter.fetch_quotes_async()`，並使用 `_quote_to_realtime_quote` 維持 `RealtimeQuote` 形狀。

新增 `get_mcp_status()` 函式供 API endpoint 使用。

檔案：`src/tw_quant_selector/data/realtime_quotes.py`

## 備註
- MCP 實時採用 8 秒採樣間隔，需與原有 MIS 8秒採樣邏輯對齊
- 若 MCP 連線中斷，應記錄錯誤並嘗試重連，而非直接退出背景任務
- 苗頭目錄 `tw_quant_selector/data/` 中可能需要新增 `mcp_client.py` (或 `.go`) 的匯入模組
- 環境變數: `MCP_FALLBACK_ENABLED` (預設 `true`)、`MCP_RETRY_MAX` (重試次數，預設 `3`)、`MCP_RETRY_JITTER` (jitter 時間,預設 `1000`ms)
