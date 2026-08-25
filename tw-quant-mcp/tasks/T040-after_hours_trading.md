---
github_issue: N/A
title: 新增工具 get_after_hours_trading（交易輔助與全市場清單）
type: feature
priority: high
status: done
depends_on: ["T008"]
assignee: pi with opencode/x-preview-f-free
created: 2026-08-25
updated: 2026-08-25
---

# T040 - 新增工具 `get_after_hours_trading`（交易輔助與全市場清單）

## 目標
對齊線上遠端 MCP（TWSEMCPServer）的同名工具，於本機 tw-quant-mcp 新增 `get_after_hours_trading`，
提供「查詢集中市場盤後定價交易。」之查詢能力。工具名稱**沿用遠端命名**以利對照。

## 遠端參考實作（twstockmcpserver）

### 工具描述
```
查詢集中市場盤後定價交易。

Args:
    code: 股票代號（選填，預設全部）
    limit: 回傳筆數上限（預設 50）
    offset: 跳過前 N 筆（預設 0，搭配 limit 分頁）
```

### 輸入參數 Schema（inputSchema）
```json
{
  "properties": {
    "code": {
      "default": "",
      "title": "Code",
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
`code`(string，預設 ), `limit`(integer，預設 50), `offset`(integer，預設 0)

## 實作要求
- 資料源：TWSE-WEB 官方端點（100% 官方來源政策，§2 Source Registry）
- 登錄位置：`pkg/mcp/registry_bc.go`
- 遵循專案既有規範：Envelope 回傳結構、`_lineage` 標註、L1/L2 快取、
  Per-source Rate Limit（§4.4/§5.3）、`_chart_meta`（若適合繪圖）
- 上櫃相關資料如官方端點缺漏，回傳明確錯誤訊息（參考 `get_etf_nav` 先例）

## 驗收標準
- [x] `tools/list` 可見 `get_after_hours_trading`，inputSchema 與本任務附帶者語意一致
- [x] 呼叫成功回傳 Envelope+`_lineage`（app_envelope_test probe；真實端點 BFT41U 已驗證）
- [x] 快取生效：cacheDataset 登錄 daily_kline 政策（GetOrFetch）
- [x] TestNormalizeAfterHours 通過；全量 go test ./... 16 packages ok
- [x] README 工具清單更新（parity 批次完成後統一更新；registry_bc.go 已登錄）

## 實作記錄（2026-08-25）

- provider/twse.go：TWSEWDAfterHours dataset、/exchangeReport/BFT41U、AfterHoursRow、normalizeAfterHours
- pkg/mcp/tools_bc.go：handlerGetAfterHoursTrading（code 過濾/limit/offset 分頁）
- registry_bc.go 登錄；fetch.go cacheDataset 登錄 daily_kline 政策
- 測試斷言 40→動態 ≥40（app_test/app_envelope_test/main_test）

## 備註
- 遠端對照：TWSEMCPServer 同名工具（Python/FastMCP 實作），行為以官方 API 為準而非複製其程式碼
- 缺口分析文件：`docs/TOOL_COVERAGE_BY_SOURCE.md`
