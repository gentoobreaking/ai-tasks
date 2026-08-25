---
github_issue: N/A
title: 新增工具 get_institutional_traders_calls_puts（期貨與選擇權）
type: feature
priority: medium
status: done
depends_on:
- T013
assignee: pi with opencode/x-preview-f-free
created: 2026-08-25
updated: 2026-08-25
---

# T134 - 新增工具 `get_institutional_traders_calls_puts`（期貨與選擇權）

## 目標
對齊線上遠端 MCP（TWSEMCPServer）的同名工具，於本機 tw-quant-mcp 新增 `get_institutional_traders_calls_puts`，
提供「查詢三大法人選擇權買賣權分計交易資料，分別顯示 CALL 與 PUT 的法人持倉情況。」之查詢能力。工具名稱**沿用遠端命名**以利對照。

## 遠端參考實作（twstockmcpserver）

### 工具描述
```
查詢三大法人選擇權買賣權分計交易資料，分別顯示 CALL 與 PUT 的法人持倉情況。
此為觀察法人對後市看法的重要指標，外資偏多時 CALL 淨多單會大幅增加。

Args:
    contract_code: 選擇權契約名稱（中文），例如「臺指選擇權」。留空則顯示全部。
    call_put: 篩選 CALL 或 PUT，留空則顯示全部。

Returns:
    三大法人在各選擇權 CALL/PUT 的交易量、金額（千元）及未平倉資訊
```

### 輸入參數 Schema（inputSchema）
```json
{
  "properties": {
    "contract_code": {
      "default": "",
      "title": "Contract Code",
      "type": "string"
    },
    "call_put": {
      "default": "",
      "title": "Call Put",
      "type": "string"
    }
  },
  "type": "object"
}
```

### 參數摘要
`contract_code`(string，預設 ), `call_put`(string，預設 )

## 實作要求
- 資料源：TAIFEX-API 官方端點（100% 官方來源政策，§2 Source Registry）
- 登錄位置：`pkg/mcp/registry_fg.go`
- 遵循專案既有規範：Envelope 回傳結構、`_lineage` 標註、L1/L2 快取、
  Per-source Rate Limit（§4.4/§5.3）、`_chart_meta`（若適合繪圖）
- 上櫃相關資料如官方端點缺漏，回傳明確錯誤訊息（參考 `get_etf_nav` 先例）

## 驗收標準
- [x] `tools/list` 可見 `get_institutional_traders_calls_puts`，inputSchema 與本任務附帶者語意一致
- [x] 以真實參數呼叫至少一次成功，回傳符合 Envelope 結構且含 `_lineage`
- [x] 快取生效：重複呼叫第二次零上游 HTTP（檢查 log 或 lineage）
- [x] 單元測試（fixtures 對照遠端回傳樣本）；`make test` / `go vet ./...` 通過
- [x] README 工具清單章節更新

## 備註
- 遠端對照：TWSEMCPServer 同名工具（Python/FastMCP 實作），行為以官方 API 為準而非複製其程式碼
- 缺口分析文件：`docs/TOOL_COVERAGE_BY_SOURCE.md`

## 執行紀錄（2026-08-25 稽核）
- 驗收標準逐條對照程式碼與測試後勾選。
- 證據：registry 註冊＋TestAllToolsEnvelopeConsistent 全工具 probe、snapshots/raw/get_institutional_traders_calls_puts.json、TestAllToolsCacheConsistency 全工具覆蓋、go vet/go test 全綠。
- README 更新以 commit ac57a5c 之自動產生附錄形式補齊。
