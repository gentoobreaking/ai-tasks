---
github_issue: N/A
title: 新增工具 get_market_institutional_amounts_history（行情歷史與指數）
type: feature
priority: high
status: done
depends_on: ["T008"]
assignee: pi with opencode/x-preview-f-free
created: 2026-08-25
updated: 2026-08-25
---

# T146 - 新增工具 `get_market_institutional_amounts_history`（行情歷史與指數）

## 目標
對齊線上遠端 MCP（TWSEMCPServer）的同名工具，於本機 tw-quant-mcp 新增 `get_market_institutional_amounts_history`，
提供「查詢台灣上市市場三大法人（自營商、投信、外資及陸資）買賣金額統計表（單日）。」之查詢能力。工具名稱**沿用遠端命名**以利對照。

## 遠端參考實作（twstockmcpserver）

### 工具描述
```
查詢台灣上市市場三大法人（自營商、投信、外資及陸資）買賣金額統計表（單日）。
與 get_twse_institutional_investors_summary（個股買賣超股數）不同，此工具回傳的是
「市場層級」的買賣「金額」總計，適合快速回答「外資今天整體買超/賣超多少」。

Args:
    date: 查詢日期，格式 YYYYMMDD，例如 "20260610"（需為交易日）

Returns:
    自營商（自行買賣/避險）、投信、外資及陸資（含外資自營商）的買進/賣出/買賣差額金額（元），及三大法人合計
```

### 輸入參數 Schema（inputSchema）
```json
{
  "properties": {
    "date": {
      "title": "Date",
      "type": "string"
    }
  },
  "required": [
    "date"
  ],
  "type": "object"
}
```

### 參數摘要
`date`(string)

## 實作要求
- 資料源：TWSE-WEB 官方端點（100% 官方來源政策，§2 Source Registry）
- 登錄位置：`pkg/mcp/registry_bc.go`
- 遵循專案既有規範：Envelope 回傳結構、`_lineage` 標註、L1/L2 快取、
  Per-source Rate Limit（§4.4/§5.3）、`_chart_meta`（若適合繪圖）
- 上櫃相關資料如官方端點缺漏，回傳明確錯誤訊息（參考 `get_etf_nav` 先例）

## 驗收標準
- [x] `tools/list` 可見 `get_market_institutional_amounts_history`，inputSchema 與本任務附帶者語意一致
- [x] 以真實參數呼叫至少一次成功，回傳符合 Envelope 結構且含 `_lineage`
- [x] 快取生效：重複呼叫第二次零上游 HTTP（檢查 log 或 lineage）
- [x] 單元測試（fixtures 對照遠端回傳樣本）；`make test` / `go vet ./...` 通過
- [x] README 工具清單章節更新

## 備註
- 遠端對照：TWSEMCPServer 同名工具（Python/FastMCP 實作），行為以官方 API 為準而非複製其程式碼
- 缺口分析文件：`docs/TOOL_COVERAGE_BY_SOURCE.md`
