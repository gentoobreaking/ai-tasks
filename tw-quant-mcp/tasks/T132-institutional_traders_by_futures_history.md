---
github_issue: N/A
title: 新增工具 get_institutional_traders_by_futures_history（期貨與選擇權）
type: feature
priority: medium
status: pending
depends_on: ["T013"]
assignee: pi with opencode/x-preview-f-free
created: 2026-08-25
updated: 2026-08-25
---

# T132 - 新增工具 `get_institutional_traders_by_futures_history`（期貨與選擇權）

## 目標
對齊線上遠端 MCP（TWSEMCPServer）的同名工具，於本機 tw-quant-mcp 新增 `get_institutional_traders_by_futures_history`，
提供「查詢三大法人期貨部位歷史資料（可回溯查詢，非僅最新一日）。」之查詢能力。工具名稱**沿用遠端命名**以利對照。

## 遠端參考實作（twstockmcpserver）

### 工具描述
```
查詢三大法人期貨部位歷史資料（可回溯查詢，非僅最新一日）。
資料來源為期交所網站下載頁面（www.taifex.com.tw），非 openapi.taifex.com.tw
（openapi 版的 get_institutional_traders_by_futures 僅能查最新一個交易日，無法回溯）。
實測資料約可回溯至 2023 年下半年（更早日期會查詢失敗），區間不可超過 3 個月。

Args:
    start_date: 起始日期，格式 YYYYMMDD，例如 "20260601"
    end_date: 結束日期，格式 YYYYMMDD。與 start_date 區間不可超過 92 天
    contract: 期貨契約代碼，預設 TXF（臺股期貨）。留空則查詢全部契約（資料量較大）。
        其他常用：MXF（小型臺指）、EXF（電子期貨）、FXF（金融期貨）、TMF（微型臺指）。
        與 get_futures_daily_history 的契約代碼（TX/MTX/TE/TF...）為不同代碼系統，不可混用

Returns:
    區間內每個交易日、自營商/投信/外資及陸資的多空交易口數、契約金額、未平倉資訊
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
      "default": "TXF",
      "title": "Contract",
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
`start_date`(string), `end_date`(string), `contract`(string，預設 TXF)

## 實作要求
- 資料源：TAIFEX-DL 官方端點（100% 官方來源政策，§2 Source Registry）
- 登錄位置：`pkg/mcp/registry_fg.go`
- 遵循專案既有規範：Envelope 回傳結構、`_lineage` 標註、L1/L2 快取、
  Per-source Rate Limit（§4.4/§5.3）、`_chart_meta`（若適合繪圖）
- 上櫃相關資料如官方端點缺漏，回傳明確錯誤訊息（參考 `get_etf_nav` 先例）

## 驗收標準
- [ ] `tools/list` 可見 `get_institutional_traders_by_futures_history`，inputSchema 與本任務附帶者語意一致
- [ ] 以真實參數呼叫至少一次成功，回傳符合 Envelope 結構且含 `_lineage`
- [ ] 快取生效：重複呼叫第二次零上游 HTTP（檢查 log 或 lineage）
- [ ] 單元測試（fixtures 對照遠端回傳樣本）；`make test` / `go vet ./...` 通過
- [ ] README 工具清單章節更新

## 備註
- 遠端對照：TWSEMCPServer 同名工具（Python/FastMCP 實作），行為以官方 API 為準而非複製其程式碼
- 缺口分析文件：`docs/TOOL_COVERAGE_BY_SOURCE.md`
