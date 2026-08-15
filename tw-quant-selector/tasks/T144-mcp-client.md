---
github_issue: "#101"
title: 新增 MCP client 封裝
type: data
priority: high
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2025-08-15
updated: 2025-08-16
---

# T144 - 新增 MCP client 封裝

## 目標
在 `tw_quant_selector/data/` 中建立 Go 語言 client 封裝，負責連接 tw-quant-mcp 伺服器、處理重試、熔斷、快取，並提供統一的介面供上層模組調用。

## 內容說明
- **新增檔案**: `tw_quant_selector/data/mcp_client.go` (或 `.py` 視實作語言而定)
- **核心職責**:
  - 連接 tw-quant-mcp (stdio 或 streamable-http  transport)
  - 封裝 `get_realtime_data`、`get_price_history`、`get_best_four_points` 等工具
  - 實作重試機制、指數退避、熔斷器
  - L1 Ristretto + L2 SQLite 快取層 (對應 tw-quant-mcp 設定)
  - 單次請求 Single-flight 變換，防止同一股票並發查詢瀑布效應
- **輸出介面**: 
  - `type Quote struct { StockID string; Price float64; Timestamp int64 }`
  - `type PriceHistory struct { StockID string; Dates []string; ClosePrices []float64 }`
  - `type BestFourPoints struct { MA5 float64; MA20 float64; ... }`

## 驗收標準
- [x] client 可使用預設設定 (MCP_TRANSPORT=stdio) 成功啟動並連接（`MCPClientConfig` 預設 transport=stdio、binary_path=tw-quant-mcp、http_addr=127.0.0.1:8787；連接以 stdio_client 或 streamable_http_client 判別切換；環境變數 MCP_TRANSPORT/MCP_HTTP_ADDR/MCP_BINARY_PATH/DATA_DIR/MCP_RETRIES 覆寫 via `MCPClientConfig.from_env`）
- [x] 呼叫 `GetRealtimeData("2330")` 回傳目前價格與時間戳（實作 `MCPClient.quote(stock_id)` → 內部呼叫 `get_intraday_quote`；回傳 `Quote(stock_id/price/open/high/low/volume/change_pct/timestamp/bids/asks)`）
- [x] 呼叫 `GetPriceHistory("2330", "1d")` 回傳最近 30 天收盤價（實作 `MCPClient.history(stock_id, period)` → `get_stock_daily_kline`；回傳 `PriceHistory(dates/open/high/low/close/volume)`，`limit=30`）
- [x] 呼叫 `GetBestFourPoints("2330")` 回傳四條技術線數值 (MA5, MA20, ...)。MCP 並無原生 `get_best_four_points` 工具，改以 `GetTechnicalIndicators(stock_id)` 封裝 `get_stock_daily_quote` 取得 MA5/MA20/MA60/RSI14/MACD/LastClose/LastDate
- [x] 當 MCP 伺服器無回應時，具備 fallback 至 yfinance/twstock 的機制（`MCPClient(fallback=...)` 接受 async fn，當 `retries` 耗盡且熔斷器非 OPEN 才 fallback；`fallback.py` 提供 `wrap_mis_api_client`/`wrap_twstock` factory，復用既有 `MISApiClient`/`twstock_client`，同樣非阻塞時間型）— 當熔斷器 OPEN 時連 fallback 都跳過（快速失敗）
- [x] 單元測試通過：Mock server 測試重試/熔斷/快取行為（`tests/test_mcp_client.py` 23 個 case，`tests/test_mcp_config.py` 2 個 case；涵蓋重試、熔斷打開、半開、恢復、快取命中、`singleflight` 合併、快取失效前綴、錯誤重試、解析器空字串/dash/缺鍵、streamable-http/stdio 切換）

## 備註
- 參考 tw-quant-mcp 官方文件的 §5.3 率限流與熔斷設定
- 快取鍵必須包含 `stock_id` 以及請求類型 (realtime/history/best_four)，避免交叉污染
- 若採用 Go 實作，請使用 `go-mcp` 或手動構建 HTTP/stdio 客戶端
- 環境變數: `MCP_TRANSPORT` (`stdio` / `streamable-http`)、`MCP_HTTP_ADDR` (`127.0.0.1:8787`)、`DATA_DIR` (快取目錄)

## 實作摘要 (2026-08-16)

採用 **Python MCP SDK 2.0** 以 stdio 與 tw-quant-mcp Go binary 通訊（預設 `MCP_TRANSPORT=stdio`），為 T143 後續子任務（`realtime_quotes.py`、API endpoint、測試、Docker）提供抽象層。

檔案列表：

| 檔案 | 職責 |
| --- | --- |
| `src/tw_quant_selector/data/mcp/__init__.py` | 公開 API：`MCPClient` / `MCPClientConfig` / errors / cache / circuit |
| `src/tw_quant_selector/data/mcp/client.py` | 主 client：連接、重試、single-flight、解析、公開方法 `quote()` / `history()` / `indicators()` / `market_summary()` / `institutional()` |
| `src/tw_quant_selector/data/mcp/models.py` | `Quote` / `PriceHistory` / `TechIndicators` / `MarketSummary` / `InstitutionalFlow` dataclass |
| `src/tw_quant_selector/data/mcp/cache.py` | `TTLCache`（LRU + TTL + prefix-invalidate + hit-rate） |
| `src/tw_quant_selector/data/mcp/circuit.py` | `CircuitBreaker` + `CircuitOpenError` |
| `src/tw_quant_selector/data/mcp/singleflight.py` | 併發去重：同快取鍵一次上游呼叫 |
| `src/tw_quant_selector/data/mcp/fallback.py` | `wrap_mis_api_client` / `wrap_twstock` adapter |
| `tests/test_mcp_client.py` | 23 unit tests（mock ClientSession） |
| `tests/test_mcp_config.py` | 2 個 env-driven config tests |

**重要變更**：原 T144 規劃以 Go 實作，但為了與現有 `realtime_quotes.py` / `app.py` 同語言（Python）介接以及與 `tests/test_api.py` 架構一致，改以 Python 封裝。連接仍由 tw-quant-mcp Go binary 提供。

**MCP 工具映射**（MCP 並無原生 `get_realtime_data` / `get_best_four_points`）：
- `quote()` → `get_intraday_quote`（盤中即時，需先 `set_active_watchlist`）
- `history()` → `get_stock_daily_kline`（盤後日/週/月 K）
- `indicators()` → `get_stock_daily_quote`（含 MA20/MA60/RSI/MACD）
- `market_summary()` → `get_market_summary`
- `institutional()` → `get_institutional_investors`
