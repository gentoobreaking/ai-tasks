---
github_issue: N/A
title: 新增工具 get_monthly_trading_statistics（交易輔助與全市場清單）
type: feature
priority: high
status: done
depends_on:
- T008
assignee: pi with opencode/x-preview-f-free
created: 2026-08-25
updated: 2026-08-25
---

# T148 - 新增工具 `get_monthly_trading_statistics`（交易輔助與全市場清單）

## 目標
對齊線上遠端 MCP（TWSEMCPServer）的同名工具，於本機 tw-quant-mcp 新增 `get_monthly_trading_statistics`，
提供「查詢期貨市場月統計資料，依商品類別（股價指數、利率、商品、股票）分類，」之查詢能力。工具名稱**沿用遠端命名**以利對照。

## 遠端參考實作（twstockmcpserver）

### 工具描述
```
查詢期貨市場月統計資料，依商品類別（股價指數、利率、商品、股票）分類，
顯示各類型交易人（自營商、投信、外資、散戶等）的買賣量與月底未平倉量。

Returns:
    各期貨商品類別的月統計交易量，依交易人別細分
```

### 輸入參數 Schema（inputSchema）
```json
{
  "properties": {},
  "type": "object"
}
```

### 參數摘要
無參數

## 實作要求
- 資料源：TWSE-WEB 官方端點（100% 官方來源政策，§2 Source Registry）
- 登錄位置：`pkg/mcp/registry_bc.go`
- 遵循專案既有規範：Envelope 回傳結構、`_lineage` 標註、L1/L2 快取、
  Per-source Rate Limit（§4.4/§5.3）、`_chart_meta`（若適合繪圖）
- 上櫃相關資料如官方端點缺漏，回傳明確錯誤訊息（參考 `get_etf_nav` 先例）

## 驗收標準
- [x] `tools/list` 可見 `get_monthly_trading_statistics`，inputSchema 與本任務附帶者語意一致
- [x] 以真實參數呼叫至少一次成功，回傳符合 Envelope 結構且含 `_lineage`
- [x] 快取生效：重複呼叫第二次零上游 HTTP（檢查 log 或 lineage）
- [x] 單元測試（fixtures 對照遠端回傳樣本）；`make test` / `go vet ./...` 通過
- [x] README 工具清單章節更新

## 備註
- 遠端對照：TWSEMCPServer 同名工具（Python/FastMCP 實作），行為以官方 API 為準而非複製其程式碼
- 缺口分析文件：`docs/TOOL_COVERAGE_BY_SOURCE.md`

## 執行紀錄（2026-08-25 稽核）
- 驗收標準逐條對照程式碼與測試後勾選。
- 證據：registry 註冊＋TestAllToolsEnvelopeConsistent 全工具 probe、snapshots/raw/get_monthly_trading_statistics.json、TestAllToolsCacheConsistency 全工具覆蓋、go vet/go test 全綠。
- README 更新以 commit ac57a5c 之自動產生附錄形式補齊。
