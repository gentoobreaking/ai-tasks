---
github_issue: N/A
title: 新增工具 get_public_company_balance_sheet（財務與基本面）
type: feature
priority: medium
status: pending
depends_on: ["T008", "T012"]
assignee: pi with opencode/x-preview-f-free
created: 2026-08-25
updated: 2026-08-25
---

# T158 - 新增工具 `get_public_company_balance_sheet`（財務與基本面）

## 目標
對齊線上遠端 MCP（TWSEMCPServer）的同名工具，於本機 tw-quant-mcp 新增 `get_public_company_balance_sheet`，
提供「根據股票代號查詢公開發行公司資產負債表。」之查詢能力。工具名稱**沿用遠端命名**以利對照。

## 遠端參考實作（twstockmcpserver）

### 工具描述
```
根據股票代號查詢公開發行公司資產負債表。
自動偵測公司所屬產業並使用對應的財務報表格式。
```

### 輸入參數 Schema（inputSchema）
```json
{
  "properties": {
    "code": {
      "title": "Code",
      "type": "string"
    }
  },
  "required": [
    "code"
  ],
  "type": "object"
}
```

### 參數摘要
`code`(string)

## 實作要求
- 資料源：TWSE-API 官方端點（100% 官方來源政策，§2 Source Registry）
- 登錄位置：`pkg/mcp/registry_de.go`
- 遵循專案既有規範：Envelope 回傳結構、`_lineage` 標註、L1/L2 快取、
  Per-source Rate Limit（§4.4/§5.3）、`_chart_meta`（若適合繪圖）
- 上櫃相關資料如官方端點缺漏，回傳明確錯誤訊息（參考 `get_etf_nav` 先例）

## 驗收標準
- [ ] `tools/list` 可見 `get_public_company_balance_sheet`，inputSchema 與本任務附帶者語意一致
- [ ] 以真實參數呼叫至少一次成功，回傳符合 Envelope 結構且含 `_lineage`
- [ ] 快取生效：重複呼叫第二次零上游 HTTP（檢查 log 或 lineage）
- [ ] 單元測試（fixtures 對照遠端回傳樣本）；`make test` / `go vet ./...` 通過
- [ ] README 工具清單章節更新

## 備註
- 遠端對照：TWSEMCPServer 同名工具（Python/FastMCP 實作），行為以官方 API 為準而非複製其程式碼
- 缺口分析文件：`docs/TOOL_COVERAGE_BY_SOURCE.md`
