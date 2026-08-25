---
github_issue: N/A
title: 新增工具 get_options_daily_history（期貨與選擇權）
type: feature
priority: medium
status: pending
depends_on: ["T013"]
assignee: pi with opencode/x-preview-f-free
created: 2026-08-25
updated: 2026-08-25
---

# T150 - 新增工具 `get_options_daily_history`（期貨與選擇權）

## 目標
對齊線上遠端 MCP（TWSEMCPServer）的同名工具，於本機 tw-quant-mcp 新增 `get_options_daily_history`，
提供「查詢選擇權每日OHLC歷史行情（可回溯查詢，非僅最新一日）。」之查詢能力。工具名稱**沿用遠端命名**以利對照。

## 遠端參考實作（twstockmcpserver）

### 工具描述
```
查詢選擇權每日OHLC歷史行情（可回溯查詢，非僅最新一日）。
與 get_daily_options_market_report（openapi 版，僅能查最新一個交易日）不同，此工具
可查詢任意過去起訖日期。因資料量龐大（單日單契約逾6000筆，涵蓋全部履約價與到期月份），
強烈建議指定 contract_month 縮小範圍；若未指定且資料量過大，會改為列出可用到期月份。

Args:
    start_date: 起始日期，格式 YYYYMMDD，例如 "20260601"
    end_date: 結束日期，格式 YYYYMMDD。與 start_date 區間不可超過一個月
    contract: 選擇權契約代碼，預設 TXO（臺指選擇權）。其他常用：TEO（電子選擇權）、
        TFO（金融選擇權）
    contract_month: 到期月份/週次，例如「202606」或「202606W1」。留空且資料量過大時，
        會回傳可用到期月份清單供選擇
    call_put: 篩選「買權」或「賣權」，留空則顯示全部

Returns:
    區間內每個交易日、指定到期月份各履約價的開高低收、成交量、結算價、未沖銷契約數
```

### 輸入參數 Schema（inputSchema）
```json
{
  "properties": {
    "start_date": {
      "title": "Start Date",
      "type": "string"
    },
    "end_date": {
      "title": "End Date",
      "type": "string"
    },
    "contract": {
      "default": "TXO",
      "title": "Contract",
      "type": "string"
    },
    "contract_month": {
      "default": "",
      "title": "Contract Month",
      "type": "string"
    },
    "call_put": {
      "default": "",
      "title": "Call Put",
      "type": "string"
    }
  },
  "required": [
    "start_date",
    "end_date"
  ],
  "type": "object"
}
```

### 參數摘要
`start_date`(string), `end_date`(string), `contract`(string，預設 TXO), `contract_month`(string，預設 ), `call_put`(string，預設 )

## 實作要求
- 資料源：TAIFEX-DL 官方端點（100% 官方來源政策，§2 Source Registry）
- 登錄位置：`pkg/mcp/registry_fg.go`
- 遵循專案既有規範：Envelope 回傳結構、`_lineage` 標註、L1/L2 快取、
  Per-source Rate Limit（§4.4/§5.3）、`_chart_meta`（若適合繪圖）
- 上櫃相關資料如官方端點缺漏，回傳明確錯誤訊息（參考 `get_etf_nav` 先例）

## 驗收標準
- [ ] `tools/list` 可見 `get_options_daily_history`，inputSchema 與本任務附帶者語意一致
- [ ] 以真實參數呼叫至少一次成功，回傳符合 Envelope 結構且含 `_lineage`
- [ ] 快取生效：重複呼叫第二次零上游 HTTP（檢查 log 或 lineage）
- [ ] 單元測試（fixtures 對照遠端回傳樣本）；`make test` / `go vet ./...` 通過
- [ ] README 工具清單章節更新

## 備註
- 遠端對照：TWSEMCPServer 同名工具（Python/FastMCP 實作），行為以官方 API 為準而非複製其程式碼
- 缺口分析文件：`docs/TOOL_COVERAGE_BY_SOURCE.md`
