---
github_issue: N/A
title: 新增工具 get_block_trades_detail（交易輔助與全市場清單）
type: feature
priority: high
status: done
depends_on: ["T008"]
assignee: pi with opencode/x-preview-f-free
created: 2026-08-25
updated: 2026-08-25
---

# T043 - 新增工具 `get_block_trades_detail`（交易輔助與全市場清單）

## 目標
對齊線上遠端 MCP（TWSEMCPServer）的同名工具，於本機 tw-quant-mcp 新增 `get_block_trades_detail`，
提供「查詢集中市場鉅額交易逐筆明細（含配對交易、盤後鉅額等交易別）。」之查詢能力。工具名稱**沿用遠端命名**以利對照。

## 遠端參考實作（twstockmcpserver）

### 工具描述
```
查詢集中市場鉅額交易逐筆明細（含配對交易、盤後鉅額等交易別）。
與 get_block_trades_daily（openapi 版，僅有量值統計總數）不同，此工具回傳每一筆
鉅額交易的個股代號、交易別、成交價與成交量金額。
注意：來源端點不支援伺服器端股票代號篩選，stock_no/name 為本地端過濾。

Args:
    date: 查詢日期，格式 YYYYMMDD，例如 "20260610"（需為交易日）
    stock_no: 股票代號（選填），指定則只回傳該股票的鉅額交易
    name: 股票名稱關鍵字（選填）
    limit: 回傳筆數上限（預設 50）
    offset: 跳過前 N 筆（預設 0，搭配 limit 分頁）

Returns:
    每筆鉅額交易的股票代號、名稱、交易別、成交價、成交股數、成交金額
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
- [x] `tools/list` 可見 `get_block_trades_detail`，inputSchema 與本任務附帶者語意一致
- [x] 以真實參數呼叫至少一次成功，回傳符合 Envelope 結構且含 `_lineage`
- [x] 快取生效：重複呼叫第二次零上游 HTTP（檢查 log 或 lineage）
- [x] 單元測試（fixtures 對照遠端回傳樣本）；`make test` / `go vet ./...` 通過
- [x] README 工具清單章節更新

## 備註
- 遠端對照：TWSEMCPServer 同名工具（Python/FastMCP 實作），行為以官方 API 為準而非複製其程式碼
- 缺口分析文件：`docs/TOOL_COVERAGE_BY_SOURCE.md`
