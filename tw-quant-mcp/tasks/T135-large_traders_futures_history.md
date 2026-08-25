---
github_issue: N/A
title: 新增工具 get_large_traders_futures_history（期貨與選擇權）
type: feature
priority: medium
status: pending
depends_on: ["T013"]
assignee: pi with opencode/x-preview-f-free
created: 2026-08-25
updated: 2026-08-25
---

# T135 - 新增工具 `get_large_traders_futures_history`（期貨與選擇權）

## 目標
對齊線上遠端 MCP（TWSEMCPServer）的同名工具，於本機 tw-quant-mcp 新增 `get_large_traders_futures_history`，
提供「查詢期貨大額交易人未沖銷部位歷史資料（可回溯查詢，非僅最新一日）。」之查詢能力。工具名稱**沿用遠端命名**以利對照。

## 遠端參考實作（twstockmcpserver）

### 工具描述
```
查詢期貨大額交易人未沖銷部位歷史資料（可回溯查詢，非僅最新一日）。
與 get_large_traders_futures_oi（openapi 版，僅能查最新一個交易日）不同，此工具可
查詢任意過去起訖日期。來源端點本身不支援依契約篩選（一次回傳全部約340種商品），
故 contract 為必填參數，由本工具在取得資料後於本地端篩選。

Args:
    start_date: 起始日期，格式 YYYYMMDD，例如 "20260601"
    end_date: 結束日期，格式 YYYYMMDD。與 start_date 區間不可超過一個月
    contract: 期貨契約代碼（必填），例如 "TX"（臺股期貨）、"MTX"（小型臺指）、
        "TE"（電子期貨）、"TF"（金融期貨）

Returns:
    區間內每個交易日，該契約各到期月份的前五大／前十大交易人買方、賣方部位數與全市場未沖銷部位數
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
      "title": "Contract",
      "type": "string"
    }
  },
  "required": [
    "start_date",
    "end_date",
    "contract"
  ],
  "type": "object"
}
```

### 參數摘要
`start_date`(string), `end_date`(string), `contract`(string)

## 實作要求
- 資料源：TAIFEX-DL 官方端點（100% 官方來源政策，§2 Source Registry）
- 登錄位置：`pkg/mcp/registry_fg.go`
- 遵循專案既有規範：Envelope 回傳結構、`_lineage` 標註、L1/L2 快取、
  Per-source Rate Limit（§4.4/§5.3）、`_chart_meta`（若適合繪圖）
- 上櫃相關資料如官方端點缺漏，回傳明確錯誤訊息（參考 `get_etf_nav` 先例）

## 驗收標準
- [ ] `tools/list` 可見 `get_large_traders_futures_history`，inputSchema 與本任務附帶者語意一致
- [ ] 以真實參數呼叫至少一次成功，回傳符合 Envelope 結構且含 `_lineage`
- [ ] 快取生效：重複呼叫第二次零上游 HTTP（檢查 log 或 lineage）
- [ ] 單元測試（fixtures 對照遠端回傳樣本）；`make test` / `go vet ./...` 通過
- [ ] README 工具清單章節更新

## 備註
- 遠端對照：TWSEMCPServer 同名工具（Python/FastMCP 實作），行為以官方 API 為準而非複製其程式碼
- 缺口分析文件：`docs/TOOL_COVERAGE_BY_SOURCE.md`
