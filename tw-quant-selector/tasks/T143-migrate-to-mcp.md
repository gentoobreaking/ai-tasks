---
github_issue: "#101"
title: Migrate data source to tw-quant-mcp
type: data
priority: high
status: pending
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2025-08-15
updated: 2025-08-15
---

# T143 - Migrate data source to tw-quant-mcp (Overview)

## 目標
將 tw-quant-selector 專案的資料源（股價、財報、選股等）從目前的直接 API 與脚本（如 yfinance, twstock, FinMind, 自行爬蟲）改經由 **tw-quant-mcp** (Go 實作，提供 MCP 協議服務）取得資料。

主要包含：
1. **新增 MCP Client 層**：在 `tw_quant_selector/data/` 中建立 Go 或語言绑定的 client，負責連接 tw-quant-mcp 伺服器、處理重試、熔斷、快取。
2. **修改資料層**：將 `realtime_quotes.go`、`database.go` 等模組的資料獲取邏輯改為優先呼叫 MCP 介面，fallback 至原有來源。
3. **更新 API 端點**：`src/tw_quant_selector/api/app.py` 中的 `/api/v1/portfolio/export` 等端點改為從 MCP 讀取資料後再寫入本地 DB / 檔案。
4. **前端保持不變**：前端 Portfolio.tsx 保持原有 UI，透過現有 API 存取資料，不需要改動 JSX。
5. **保持 向後相容**：確保現有的 數據結構（portfolio, stocks, daily_prices 等）不變，避免打亂穩定版本。

## 驗收標準
- [ ] MCP client 可成功連接本地/遠程 tw-quant-mcp 伺服器，並取得 realtime quote、price history、Best Four Points 等資料。
- [ ] `export_portfolio` 端點返回的 `.stock_monitor.json` 內容正確反映從 MCP 獲取的最新資料。
- [ ] 所有原有的 API 端點（/api/v1/portfolio/*, /api/v1/*）回傳的資料結構與穩定版本一致，無破壞變更。
- [ ] 單元測試通過：`tests/test_api.py` 中新增/修改測試，確保 MCP 失敗時的 fallback 行為。
- [ ] 編譯通過：`npx tsc -b` (frontend) 與 `go build` (mcp client) 無錯誤。
- [ ] 文件更新：README / 使用說明 中說明新的資料來源連線設定（環境變數、MCP transport 等）。

## 備註
- **風險**：MCP 伺服器網絡不可用時，必須有完善的 fallback 机制（繼續使用 yfinance/twstock），否則會影響實盤交易。
- **數據一致性**：MCP 返回的字段與原有 DB schema 對照需詳盡檢查，特別是 `Best Four Points`、`市值`、`流通股本` 等額外欄位，需決定是直接寫入額外欄位，或只取所需欄位。
- **版本相容**：tw-quant-mcp 目前為 v0.1.x，未來若升級需審視 API 變更點，寫入相容層。
- **環境變數**：建議新增 `MCP_TRANSPORT`、`MCP_HTTP_ADDR`、`DATA_DIR` 等環境變數，並於 Dockerfile / docker-compose.yml 中提供預設值。
- **測試覆蓋**：優先撰寫 mock server 的單元測試，避免實際連線 MCI 影響 CI。

## 子任務 (拆分文件)
- [T144 - 新增 MCP client 封裂](/tasks/tw-quant-selector/tasks/T144-mcp-client.md)
- [T145 - 修改 realtime_quotes.py 使用 MCP 實時數據](/tasks/tw-quant-selector/tasks/T145-realtime-mcp.md)
- [T146 - 更新 API 端點內部實作 (app.py)](/tasks/tw-quant-selector/tasks/T146-api-endpoint.md)
- [T147 - 撰寫單元測試與整合測試](/tasks/tw-quant-selector/tasks/T147-testing.md)
- [T148 - 更新編譯與 Docker 部署配置](/tasks/tw-quant-selector/tasks/T148-docker-deploy.md)