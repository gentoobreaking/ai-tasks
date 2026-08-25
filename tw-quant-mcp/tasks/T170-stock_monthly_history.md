---
github_issue: N/A
title: 新增工具 get_stock_monthly_history（行情歷史與指數）
type: feature
priority: medium
status: done
depends_on: ["T008"]
assignee: pi with opencode/x-preview-f-free
created: 2026-08-25
updated: 2026-08-25
---

# T170 - 新增工具 `get_stock_monthly_history`（行情歷史與指數）

## 目標
對齊線上遠端 MCP（TWSEMCPServer）的同名工具，於本機 tw-quant-mcp 新增 `get_stock_monthly_history`，
提供「查詢個股月成交資訊（最高價、最低價、加權平均價、週轉率）。」之查詢能力。工具名稱**沿用遠端命名**以利對照。

## 遠端參考實作（twstockmcpserver）

### 工具描述
```
查詢個股月成交資訊（最高價、最低價、加權平均價、週轉率）。
與 get_stock_monthly_avg_history（每日的月均價序列）不同，此工具是「每月一筆」的彙總。
只有 date 的年份會影響查詢結果：查當年會回傳至今每月資料，查過去年份則回傳該年全部12個月。

Args:
    stock_no: 股票代號，例如 "2330"（台積電）
    date: 任意日期 YYYYMMDD，僅年份有效，例如 "20250101" 查民國114年整年

Returns:
    該年度每月的最高價、最低價、加權平均價、成交筆數、成交金額、成交股數、週轉率
```

### 輸入參數 Schema（inputSchema）
```json
{
  "properties": {
    "stock_no": {
      "title": "Stock No",
      "type": "string"
    },
    "date": {
      "title": "Date",
      "type": "string"
    }
  },
  "required": [
    "stock_no",
    "date"
  ],
  "type": "object"
}
```

### 參數摘要
`stock_no`(string), `date`(string)

## 實作要求
- 資料源：TWSE-WEB 官方端點（100% 官方來源政策，§2 Source Registry）
- 登錄位置：`pkg/mcp/registry_bc.go`
- 遵循專案既有規範：Envelope 回傳結構、`_lineage` 標註、L1/L2 快取、
  Per-source Rate Limit（§4.4/§5.3）、`_chart_meta`（若適合繪圖）
- 上櫃相關資料如官方端點缺漏，回傳明確錯誤訊息（參考 `get_etf_nav` 先例）

## 驗收標準
- [x] `tools/list` 可見 `get_stock_monthly_history`，inputSchema 與本任務附帶者語意一致
- [x] 以真實參數呼叫至少一次成功，回傳符合 Envelope 結構且含 `_lineage`
- [x] 快取生效：重複呼叫第二次零上游 HTTP（檢查 log 或 lineage）
- [x] 單元測試（fixtures 對照遠端回傳樣本）；`make test` / `go vet ./...` 通過
- [x] README 工具清單章節更新

## 備註
- 遠端對照：TWSEMCPServer 同名工具（Python/FastMCP 實作），行為以官方 API 為準而非複製其程式碼
- 缺口分析文件：`docs/TOOL_COVERAGE_BY_SOURCE.md`
