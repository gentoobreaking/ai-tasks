---
github_issue: N/A
title: 新增工具 get_market_turnover_history（交易輔助與全市場清單）
type: feature
priority: high
status: done
depends_on:
- T008
assignee: pi with opencode/x-preview-f-free
created: 2026-08-25
updated: 2026-08-25
---

# T147 - 新增工具 `get_market_turnover_history`（交易輔助與全市場清單）

## 目標
對齊線上遠端 MCP（TWSEMCPServer）的同名工具，於本機 tw-quant-mcp 新增 `get_market_turnover_history`，
提供「查詢台灣上市市場每日成交量值與發行量加權股價指數。」之查詢能力。工具名稱**沿用遠端命名**以利對照。

## 遠端參考實作（twstockmcpserver）

### 工具描述
```
查詢台灣上市市場每日成交量值與發行量加權股價指數。
回傳指定月份每一個交易日的市場成交股數、成交金額、成交筆數、加權指數收盤與漲跌點數。
與 get_daily_market_trading_info（openapi 版）不同：openapi 版只回傳最近約 12 個交易日的
滾動視窗，無法指定過去月份；此工具可查任意過去月份。

Args:
    date: 欲查詢的月份，格式 YYYYMMDD（日期隨意，例如 "20260601" 查 2026 年 6 月整月）

Returns:
    該月份每個交易日的成交股數、成交金額、成交筆數、加權指數、漲跌點數
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
- [x] `tools/list` 可見 `get_market_turnover_history`，inputSchema 與本任務附帶者語意一致
- [x] 以真實參數呼叫至少一次成功，回傳符合 Envelope 結構且含 `_lineage`
- [x] 快取生效：重複呼叫第二次零上游 HTTP（檢查 log 或 lineage）
- [x] 單元測試（fixtures 對照遠端回傳樣本）；`make test` / `go vet ./...` 通過
- [x] README 工具清單章節更新

## 備註
- 遠端對照：TWSEMCPServer 同名工具（Python/FastMCP 實作），行為以官方 API 為準而非複製其程式碼
- 缺口分析文件：`docs/TOOL_COVERAGE_BY_SOURCE.md`

## 執行紀錄（2026-08-25 稽核）
- 驗收標準逐條對照程式碼與測試後勾選。
- 證據：registry 註冊＋TestAllToolsEnvelopeConsistent 全工具 probe、snapshots/raw/get_market_turnover_history.json、TestAllToolsCacheConsistency 全工具覆蓋、go vet/go test 全綠。
- README 更新以 commit ac57a5c 之自動產生附錄形式補齊。
