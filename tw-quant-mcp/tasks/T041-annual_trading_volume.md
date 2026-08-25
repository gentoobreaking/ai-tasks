---
github_issue: N/A
title: 新增工具 get_annual_trading_volume（交易輔助與全市場清單）
type: feature
priority: high
status: done
depends_on: ["T008"]
assignee: pi with opencode/x-preview-f-free
created: 2026-08-25
updated: 2026-08-25
---

# T041 - 新增工具 `get_annual_trading_volume`（交易輔助與全市場清單）

## 目標
對齊線上遠端 MCP（TWSEMCPServer）的同名工具，於本機 tw-quant-mcp 新增 `get_annual_trading_volume`，
提供「查詢各期貨商品年成交量統計，包含年度總成交量、交易日數及平均日成交量。」之查詢能力。工具名稱**沿用遠端命名**以利對照。

## 遠端參考實作（twstockmcpserver）

### 工具描述
```
查詢各期貨商品年成交量統計，包含年度總成交量、交易日數及平均日成交量。
可用於長期趨勢分析與商品流動性比較。
留空 contract 則顯示全部商品。

Args:
    contract: 期貨契約代碼，例如 TX、MTX。留空則顯示全部。

Returns:
    各商品年度成交量、交易日數、平均每日成交量
```

### 輸入參數 Schema（inputSchema）
```json
{
  "properties": {
    "contract": {
      "default": "",
      "title": "Contract",
      "type": "string"
    }
  },
  "type": "object"
}
```

### 參數摘要
`contract`(string，預設 )

## 實作要求
- 資料源：TAIFEX-API（/AnnualTradingVolume；原任務分類誤植為 TWSE-WEB，實作時修正）（100% 官方來源政策，§2 Source Registry）
- 登錄位置：`pkg/mcp/registry_bc.go`
- 遵循專案既有規範：Envelope 回傳結構、`_lineage` 標註、L1/L2 快取、
  Per-source Rate Limit（§4.4/§5.3）、`_chart_meta`（若適合繪圖）
- 上櫃相關資料如官方端點缺漏，回傳明確錯誤訊息（參考 `get_etf_nav` 先例）

## 驗收標準
- [x] `tools/list` 可見 `get_annual_trading_volume`，inputSchema 與本任務附帶者語意一致
- [x] 以真實參數呼叫至少一次成功，回傳符合 Envelope 結構且含 `_lineage`
- [x] 快取生效：重複呼叫第二次零上游 HTTP（檢查 log 或 lineage）
- [x] 單元測試（fixtures 對照遠端回傳樣本）；`make test` / `go vet ./...` 通過
- [x] README 工具清單章節更新

## 備註
- 遠端對照：TWSEMCPServer 同名工具（Python/FastMCP 實作），行為以官方 API 為準而非複製其程式碼
- 缺口分析文件：`docs/TOOL_COVERAGE_BY_SOURCE.md`

## 實作記錄（2026-08-25）

- model.TAFAnnualVolume、taifexAPIPaths /AnnualTradingVolume、normalizeTAIAnnualVolume（contract 過濾）
- handlerGetAnnualTradingVolume（registry_fg.go 登錄）；envelope probe＋fake stub 已加
