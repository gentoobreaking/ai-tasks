---
github_issue: "#101"
title: 新增 MCP client 封裝
type: data
priority: high
status: pending
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2025-08-15
updated: 2025-08-15
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
- [ ] client 可使用預設設定 (MCP_TRANSPORT=stdio) 成功啟動並連接
- [ ] 呼叫 `GetRealtimeData("2330")` 回傳目前價格與時間戳
- [ ] 呼叫 `GetPriceHistory("2330", "1d")` 回傳最近 30 天收盤價
- [ ] 呼叫 `GetBestFourPoints("2330")` 回傳四條技術線數值 (MA5, MA20, etc.)
- [ ] 當 MCP 伺服器無回應時，具備 fallback 至 yfinance/twstock 的機制
- [ ] 單元測試通過：Mock server 測試重試/熔斷/快取行為

## 備註
- 參考 tw-quant-mcp 官方文件的 §5.3 率限流與熔斷設定
- 快取鍵必須包含 `stock_id` 以及請求類型 (realtime/history/best_four)，避免交叉污染
- 若採用 Go 實作，請使用 `go-mcp` 或手動構建 HTTP/stdio 客戶端
- 環境變數: `MCP_TRANSPORT` (`stdio` / `streamable-http`)、`MCP_HTTP_ADDR` (`127.0.0.1:8787`)、`DATA_DIR` (快取目錄)