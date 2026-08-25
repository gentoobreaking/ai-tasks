---
github_issue: N/A
title: 新增工具 get_daily_futures_market_report（期貨與選擇權）
type: feature
priority: medium
status: done
depends_on:
- T013
assignee: pi with opencode/x-preview-f-free
created: 2026-08-25
updated: 2026-08-25
---

# T117 - 新增工具 `get_daily_futures_market_report`（期貨與選擇權）

## 目標
對齊線上遠端 MCP（TWSEMCPServer）的同名工具，於本機 tw-quant-mcp 新增 `get_daily_futures_market_report`，
提供「查詢期貨每日交易行情，包含開高低收、成交量、未平倉量等資訊。」之查詢能力。工具名稱**沿用遠端命名**以利對照。

## 遠端參考實作（twstockmcpserver）

### 工具描述
```
查詢期貨每日交易行情，包含開高低收、成交量、未平倉量等資訊。
常用契約代碼：TX（臺指期貨）、MTX（小型臺指）、ZEF（電子期貨）、ZTF（金融期貨）。
留空 contract 可列出所有可用契約代碼。

Args:
    contract: 期貨契約代碼，例如 TX、MTX。留空則列出所有可用契約代碼。

Returns:
    指定契約的每日交易行情，包含各到期月份及一般／盤後交易時段資料
```

### 輸入參數 Schema（inputSchema）
```json
{
  "properties": {
    "contract": {
      "default": "TX",
      "title": "Contract",
      "type": "string"
    }
  },
  "type": "object"
}
```

### 參數摘要
`contract`(string，預設 TX)

## 實作要求
- 資料源：TAIFEX-API 官方端點（100% 官方來源政策，§2 Source Registry）
- 登錄位置：`pkg/mcp/registry_fg.go`
- 遵循專案既有規範：Envelope 回傳結構、`_lineage` 標註、L1/L2 快取、
  Per-source Rate Limit（§4.4/§5.3）、`_chart_meta`（若適合繪圖）
- 上櫃相關資料如官方端點缺漏，回傳明確錯誤訊息（參考 `get_etf_nav` 先例）

## 驗收標準
- [x] `tools/list` 可見 `get_daily_futures_market_report`，inputSchema 與本任務附帶者語意一致
- [x] 以真實參數呼叫至少一次成功，回傳符合 Envelope 結構且含 `_lineage`
- [x] 快取生效：重複呼叫第二次零上游 HTTP（檢查 log 或 lineage）
- [x] 單元測試（fixtures 對照遠端回傳樣本）；`make test` / `go vet ./...` 通過
- [x] README 工具清單章節更新

## 備註
- 遠端對照：TWSEMCPServer 同名工具（Python/FastMCP 實作），行為以官方 API 為準而非複製其程式碼
- 缺口分析文件：`docs/TOOL_COVERAGE_BY_SOURCE.md`

## 執行紀錄（2026-08-25 稽核）
- 驗收標準逐條對照程式碼與測試後勾選。
- 證據：registry 註冊＋TestAllToolsEnvelopeConsistent 全工具 probe、snapshots/raw/get_daily_futures_market_report.json、TestAllToolsCacheConsistency 全工具覆蓋、go vet/go test 全綠。
- README 更新以 commit ac57a5c 之自動產生附錄形式補齊。
