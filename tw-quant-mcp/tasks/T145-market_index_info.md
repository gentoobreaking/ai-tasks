---
github_issue: N/A
title: 新增工具 get_market_index_info（行情歷史與指數）
type: feature
priority: medium
status: done
depends_on:
- T008
assignee: pi with opencode/x-preview-f-free
created: 2026-08-25
updated: 2026-08-25
---

# T145 - 新增工具 `get_market_index_info`（行情歷史與指數）

## 目標
對齊線上遠端 MCP（TWSEMCPServer）的同名工具，於本機 tw-quant-mcp 新增 `get_market_index_info`，
提供「查詢每日收盤行情-大盤統計資訊。」之查詢能力。工具名稱**沿用遠端命名**以利對照。

## 遠端參考實作（twstockmcpserver）

### 工具描述
```
查詢每日收盤行情-大盤統計資訊。

Args:
    category: 指數分類篩選：
        - "major": 主要市場指數（加權、台50、中型100等）
        - "sector": 產業類指數（電子類、金融類等）
        - "esg": ESG永續相關指數
        - "leverage": 槓桿及反向指數
        - "return": 報酬指數（含股息再投資）
        - "thematic": 主題指數（AI、5G、電動車等）
        - "dividend": 高股息相關指數
        - "all": 所有指數
    count: 回傳筆數上限（預設20，非all分類最大50）
    output_format: 輸出格式：
        - "detailed": 詳細格式（所有欄位）
        - "summary": 摘要格式（指數名稱、收盤價、漲跌%）
        - "simple": 簡單格式（僅名稱和漲跌%）
```

### 輸入參數 Schema（inputSchema）
```json
{
  "properties": {
    "category": {
      "default": "major",
      "title": "Category",
      "type": "string"
    },
    "count": {
      "default": 20,
      "title": "Count",
      "type": "integer"
    },
    "output_format": {
      "default": "detailed",
      "title": "Output Format",
      "type": "string"
    }
  },
  "type": "object"
}
```

### 參數摘要
`category`(string，預設 major), `count`(integer，預設 20), `output_format`(string，預設 detailed)

## 實作要求
- 資料源：TWSE-WEB 官方端點（100% 官方來源政策，§2 Source Registry）
- 登錄位置：`pkg/mcp/registry_bc.go`
- 遵循專案既有規範：Envelope 回傳結構、`_lineage` 標註、L1/L2 快取、
  Per-source Rate Limit（§4.4/§5.3）、`_chart_meta`（若適合繪圖）
- 上櫃相關資料如官方端點缺漏，回傳明確錯誤訊息（參考 `get_etf_nav` 先例）

## 驗收標準
- [x] `tools/list` 可見 `get_market_index_info`，inputSchema 與本任務附帶者語意一致
- [x] 以真實參數呼叫至少一次成功，回傳符合 Envelope 結構且含 `_lineage`
- [x] 快取生效：重複呼叫第二次零上游 HTTP（檢查 log 或 lineage）
- [x] 單元測試（fixtures 對照遠端回傳樣本）；`make test` / `go vet ./...` 通過
- [x] README 工具清單章節更新

## 備註
- 遠端對照：TWSEMCPServer 同名工具（Python/FastMCP 實作），行為以官方 API 為準而非複製其程式碼
- 缺口分析文件：`docs/TOOL_COVERAGE_BY_SOURCE.md`

## 執行紀錄（2026-08-25 稽核）
- 驗收標準逐條對照程式碼與測試後勾選。
- 證據：registry 註冊＋TestAllToolsEnvelopeConsistent 全工具 probe、snapshots/raw/get_market_index_info.json、TestAllToolsCacheConsistency 全工具覆蓋、go vet/go test 全綠。
- README 更新以 commit ac57a5c 之自動產生附錄形式補齊。
