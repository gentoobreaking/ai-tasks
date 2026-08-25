---
github_issue: N/A
title: 新增工具 get_options_institutional_by_contract_history（期貨與選擇權）
type: feature
priority: medium
status: done
depends_on:
- T013
assignee: pi with opencode/x-preview-f-free
created: 2026-08-25
updated: 2026-08-25
---

# T152 - 新增工具 `get_options_institutional_by_contract_history`（期貨與選擇權）

## 目標
對齊線上遠端 MCP（TWSEMCPServer）的同名工具，於本機 tw-quant-mcp 新增 `get_options_institutional_by_contract_history`，
提供「查詢三大法人各選擇權契約交易歷史（CALL+PUT合計，可回溯查詢，非僅最新一日）。」之查詢能力。工具名稱**沿用遠端命名**以利對照。

## 遠端參考實作（twstockmcpserver）

### 工具描述
```
查詢三大法人各選擇權契約交易歷史（CALL+PUT合計，可回溯查詢，非僅最新一日）。
與 get_options_institutional_calls_puts_history（同樣可回溯，但拆分 CALL/PUT）不同，
此工具回傳的是該選擇權契約 CALL 與 PUT 合計後的總數。
與 get_institutional_traders_by_options（openapi 版，僅能查最新一個交易日）不同，
此工具可查詢任意過去起訖日期。

Args:
    start_date: 起始日期，格式 YYYYMMDD，例如 "20260401"
    end_date: 結束日期，格式 YYYYMMDD。與 start_date 區間不可超過 92 天
    contract: 選擇權契約代碼，預設 TXO（臺指選擇權）。其他常用：TEO（電子選擇權）、
        TFO（金融選擇權）

Returns:
    區間內每個交易日、每個身份別（自營商/投信/外資）在該契約的CALL+PUT合計多空交易口數、
    契約金額、未平倉資訊
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
`start_date`(string), `end_date`(string), `contract`(string，預設 TXO)

## 實作要求
- 資料源：TAIFEX-DL 官方端點（100% 官方來源政策，§2 Source Registry）
- 登錄位置：`pkg/mcp/registry_fg.go`
- 遵循專案既有規範：Envelope 回傳結構、`_lineage` 標註、L1/L2 快取、
  Per-source Rate Limit（§4.4/§5.3）、`_chart_meta`（若適合繪圖）
- 上櫃相關資料如官方端點缺漏，回傳明確錯誤訊息（參考 `get_etf_nav` 先例）

## 驗收標準
- [x] `tools/list` 可見 `get_options_institutional_by_contract_history`，inputSchema 與本任務附帶者語意一致
- [x] 以真實參數呼叫至少一次成功，回傳符合 Envelope 結構且含 `_lineage`
- [x] 快取生效：重複呼叫第二次零上游 HTTP（檢查 log 或 lineage）
- [x] 單元測試（fixtures 對照遠端回傳樣本）；`make test` / `go vet ./...` 通過
- [x] README 工具清單章節更新

## 備註
- 遠端對照：TWSEMCPServer 同名工具（Python/FastMCP 實作），行為以官方 API 為準而非複製其程式碼
- 缺口分析文件：`docs/TOOL_COVERAGE_BY_SOURCE.md`

## 執行紀錄（2026-08-25 稽核）
- 驗收標準逐條對照程式碼與測試後勾選。
- 證據：registry 註冊＋TestAllToolsEnvelopeConsistent 全工具 probe、snapshots/raw/get_options_institutional_by_contract_history.json、TestAllToolsCacheConsistency 全工具覆蓋、go vet/go test 全綠。
- README 更新以 commit ac57a5c 之自動產生附錄形式補齊。
