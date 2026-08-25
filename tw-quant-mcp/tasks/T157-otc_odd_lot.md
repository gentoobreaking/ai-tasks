---
github_issue: N/A
title: 新增工具 get_otc_odd_lot（上櫃市場）
type: feature
priority: low
status: pending
depends_on: ["T009"]
assignee: pi with opencode/x-preview-f-free
created: 2026-08-25
updated: 2026-08-25
---

# T157 - 新增工具 `get_otc_odd_lot`（上櫃市場）

## 目標
對齊線上遠端 MCP（TWSEMCPServer）的同名工具，於本機 tw-quant-mcp 新增 `get_otc_odd_lot`，
提供「查詢上櫃零股（不足一張）交易行情，包含零股成交價、成交量、成交金額。」之查詢能力。工具名稱**沿用遠端命名**以利對照。

## 遠端參考實作（twstockmcpserver）

### 工具描述
```
查詢上櫃零股（不足一張）交易行情，包含零股成交價、成交量、成交金額。
可指定股票代號只查單一個股。

Args:
    stock_no: 股票代號（選填），若指定則只回傳該股票的零股資料
    limit: 回傳筆數上限（預設 50）
    offset: 跳過前 N 筆（預設 0，搭配 limit 分頁；指定 stock_no 時忽略）

Returns:
    每支上櫃股的零股成交價、成交股數、成交金額、最佳買/賣價
```

### 輸入參數 Schema（inputSchema）
```json
{
  "properties": {
    "stock_no": {
      "default": "",
      "title": "Stock No",
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
  "type": "object"
}
```

### 參數摘要
`stock_no`(string，預設 ), `limit`(integer，預設 50), `offset`(integer，預設 0)

## 實作要求
- 資料源：TPEx 官方端點（100% 官方來源政策，§2 Source Registry）
- 登錄位置：`pkg/mcp/registry_bc.go（併 TPEx 來源）`
- 遵循專案既有規範：Envelope 回傳結構、`_lineage` 標註、L1/L2 快取、
  Per-source Rate Limit（§4.4/§5.3）、`_chart_meta`（若適合繪圖）
- 上櫃相關資料如官方端點缺漏，回傳明確錯誤訊息（參考 `get_etf_nav` 先例）

## 驗收標準
- [ ] `tools/list` 可見 `get_otc_odd_lot`，inputSchema 與本任務附帶者語意一致
- [ ] 以真實參數呼叫至少一次成功，回傳符合 Envelope 結構且含 `_lineage`
- [ ] 快取生效：重複呼叫第二次零上游 HTTP（檢查 log 或 lineage）
- [ ] 單元測試（fixtures 對照遠端回傳樣本）；`make test` / `go vet ./...` 通過
- [ ] README 工具清單章節更新

## 備註
- 遠端對照：TWSEMCPServer 同名工具（Python/FastMCP 實作），行為以官方 API 為準而非複製其程式碼
- 缺口分析文件：`docs/TOOL_COVERAGE_BY_SOURCE.md`
