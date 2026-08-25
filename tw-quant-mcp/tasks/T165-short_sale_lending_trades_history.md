---
github_issue: N/A
title: 新增工具 get_short_sale_lending_trades_history（行情歷史與指數）
type: feature
priority: high
status: done
depends_on:
- T008
assignee: pi with opencode/x-preview-f-free
created: 2026-08-25
updated: 2026-08-25
---

# T165 - 新增工具 `get_short_sale_lending_trades_history`（行情歷史與指數）

## 目標
對齊線上遠端 MCP（TWSEMCPServer）的同名工具，於本機 tw-quant-mcp 新增 `get_short_sale_lending_trades_history`，
提供「查詢當日融券賣出與借券賣出成交量值。」之查詢能力。工具名稱**沿用遠端命名**以利對照。

## 遠端參考實作（twstockmcpserver）

### 工具描述
```
查詢當日融券賣出與借券賣出成交量值。
與 get_short_sale_lending_balance_history（餘額）互補，此工具是「當日實際成交」的量與金額。

Args:
    date: 查詢日期，格式 YYYYMMDD，例如 "20260610"（需為交易日）
    stock_no: 股票代號（選填），指定則只回傳該股票
    name: 股票名稱關鍵字（選填）
    limit: 回傳筆數上限（預設 50）
    offset: 跳過前 N 筆（預設 0，搭配 limit 分頁）

Returns:
    每支股票的融券賣出成交數量/金額、借券賣出成交數量/金額
```

### 輸入參數 Schema（inputSchema）
```json
{
  "properties": {
    "date": {
      "title": "Date",
      "type": "string"
    },
    "stock_no": {
      "default": "",
      "title": "Stock No",
      "type": "string"
    },
    "name": {
      "default": "",
      "title": "Name",
      "type": "string"
    },
    "limit": {
      "default": 50,
      "title": "Limit",
      "type": "integer"
    },
    "offset": {
      "default": 0,
      "title": "Offset",
      "type": "integer"
    }
  },
  "required": [
    "date"
  ],
  "type": "object"
}
```

### 參數摘要
`date`(string), `stock_no`(string，預設 ), `name`(string，預設 ), `limit`(integer，預設 50), `offset`(integer，預設 0)

## 實作要求
- 資料源：TWSE-WEB 官方端點（100% 官方來源政策，§2 Source Registry）
- 登錄位置：`pkg/mcp/registry_bc.go`
- 遵循專案既有規範：Envelope 回傳結構、`_lineage` 標註、L1/L2 快取、
  Per-source Rate Limit（§4.4/§5.3）、`_chart_meta`（若適合繪圖）
- 上櫃相關資料如官方端點缺漏，回傳明確錯誤訊息（參考 `get_etf_nav` 先例）

## 驗收標準
- [x] `tools/list` 可見 `get_short_sale_lending_trades_history`，inputSchema 與本任務附帶者語意一致
- [x] 以真實參數呼叫至少一次成功，回傳符合 Envelope 結構且含 `_lineage`
- [x] 快取生效：重複呼叫第二次零上游 HTTP（檢查 log 或 lineage）
- [x] 單元測試（fixtures 對照遠端回傳樣本）；`make test` / `go vet ./...` 通過
- [x] README 工具清單章節更新

## 備註
- 遠端對照：TWSEMCPServer 同名工具（Python/FastMCP 實作），行為以官方 API 為準而非複製其程式碼
- 缺口分析文件：`docs/TOOL_COVERAGE_BY_SOURCE.md`

## 執行紀錄（2026-08-25 稽核）
- 驗收標準逐條對照程式碼與測試後勾選。
- 證據：registry 註冊＋TestAllToolsEnvelopeConsistent 全工具 probe、snapshots/raw/get_short_sale_lending_trades_history.json、TestAllToolsCacheConsistency 全工具覆蓋、go vet/go test 全綠。
- README 更新以 commit ac57a5c 之自動產生附錄形式補齊。
