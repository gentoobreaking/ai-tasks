---
github_issue: N/A
title: 新增工具 get_company_profitability_analysis_summary（財務與基本面）
type: feature
priority: medium
status: done
depends_on: ["T008", "T012"]
assignee: pi with opencode/x-preview-f-free
created: 2026-08-25
updated: 2026-08-25
---

# T102 - 新增工具 `get_company_profitability_analysis_summary`（財務與基本面）

## 目標
對齊線上遠端 MCP（TWSEMCPServer）的同名工具，於本機 tw-quant-mcp 新增 `get_company_profitability_analysis_summary`，
提供「查詢上市公司營益分析查詢彙總表(全體公司彙總報表)。」之查詢能力。工具名稱**沿用遠端命名**以利對照。

## 遠端參考實作（twstockmcpserver）

### 工具描述
```
查詢上市公司營益分析查詢彙總表(全體公司彙總報表)。

Args:
    page_size: 每頁筆數（預設20，最大100）
    page_number: 頁碼（預設1，從1開始）
    order_by: 排序欄位。可用欄位：公司代號、公司名稱、營業收入(百萬元)、毛利率(%)、營業利益率(%)、稅前純益率(%)、稅後純益率(%)、年度、季別
    order_direction: 排序方向，'asc' 為遞增，'desc' 為遞減（預設 'asc'）
```

### 輸入參數 Schema（inputSchema）
```json
{
  "properties": {
    "page_size": {
      "default": 20,
      "title": "Page Size",
      "type": "integer"
    },
    "page_number": {
      "default": 1,
      "title": "Page Number",
      "type": "integer"
    },
    "order_by": {
      "default": "稅後純益率(%)(稅後純益)/(營業收入)",
      "title": "Order By",
      "type": "string"
    },
    "order_direction": {
      "default": "desc",
      "title": "Order Direction",
      "type": "string"
    }
  },
  "type": "object"
}
```

### 參數摘要
`page_size`(integer，預設 20), `page_number`(integer，預設 1), `order_by`(string，預設 稅後純益率(%)(稅後純益)/(營業收入)), `order_direction`(string，預設 desc)

## 實作要求
- 資料源：TWSE-API 官方端點（100% 官方來源政策，§2 Source Registry）
- 登錄位置：`pkg/mcp/registry_de.go`
- 遵循專案既有規範：Envelope 回傳結構、`_lineage` 標註、L1/L2 快取、
  Per-source Rate Limit（§4.4/§5.3）、`_chart_meta`（若適合繪圖）
- 上櫃相關資料如官方端點缺漏，回傳明確錯誤訊息（參考 `get_etf_nav` 先例）

## 驗收標準
- [x] `tools/list` 可見 `get_company_profitability_analysis_summary`，inputSchema 與本任務附帶者語意一致
- [x] 以真實參數呼叫至少一次成功，回傳符合 Envelope 結構且含 `_lineage`
- [x] 快取生效：重複呼叫第二次零上游 HTTP（檢查 log 或 lineage）
- [x] 單元測試（fixtures 對照遠端回傳樣本）；`make test` / `go vet ./...` 通過
- [x] README 工具清單章節更新

## 備註
- 遠端對照：TWSEMCPServer 同名工具（Python/FastMCP 實作），行為以官方 API 為準而非複製其程式碼
- 缺口分析文件：`docs/TOOL_COVERAGE_BY_SOURCE.md`
