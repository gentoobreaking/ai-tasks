---
github_issue: N/A
title: 新增工具 get_abnormal_accumulated_notice_stocks（注意累計次數異常）
type: feature
priority: medium
status: pending
depends_on: []
assignee: pi with opencode/x-preview-f-free
created: 2026-08-26
updated: 2026-08-26
---

# T193 - 新增工具 `get_abnormal_accumulated_notice_stocks`（注意累計次數異常）

## 目標
對齊線上遠端 MCP（TWSEMCPServer）的同名工具，於本機 tw-quant-mcp 新增
`get_abnormal_accumulated_notice_stocks`，提供「集中市場公布注意累計次數異常資訊」之查詢。
與既有 `get_attention_disposition_stocks`（當日注意/處置清單）互補：本工具揭露
各證券「近期符合注意處理標準」的累計紀錄，適合風險掃描與短線避雷。
工具名稱**沿用遠端命名**以利對照。

出處：`docs/COMPARISON_TWSEMCPServer.md` §三之一 A——遠端獨有清單實測（2026-08-26）。

## 遠端參考實作（twstockmcpserver）

### 工具描述與參數（tools/list 實抓 2026-08-26）
```
查詢集中市場公布注意累計次數異常資訊。

Args:
    name: 股票名稱關鍵字（選填）
    limit: 回傳筆數上限（預設 50）
    offset: 跳過前 N 筆（預設 0，搭配 limit 分頁）
```

### 輸入參數 Schema（inputSchema）
```json
{
  "properties": {
    "name":   { "default": "", "title": "Name", "type": "string" },
    "limit":  { "default": 50, "title": "Limit", "type": "integer" },
    "offset": { "default": 0, "title": "Offset", "type": "integer" }
  },
  "type": "object"
}
```

### 上游取值 API（遠端原始碼驗證：tools/trading/market.py；端點已實測可達）
- 端點：`GET https://openapi.twse.com.tw/v1/announcement/notetrans`（TWSE OpenAPI，無參數）
- 回應範例：
```json
[
  {"Code": "052176", "Name": "聯電統一61購01",
   "RecentlyMetAttentionSecuritiesCriteria": "115年8月21日至115年8月24日連續二次"},
  {"Code": "2615", "Name": "萬海",
   "RecentlyMetAttentionSecuritiesCriteria": "115年8月21日至115年8月24日連續二次"}
]
```
- 欄位：`Code`（證券代號）、`Name`（名稱）、`RecentlyMetAttentionSecuritiesCriteria`（符合注意標準描述）
- 注意：清單**含權證**（Code 為 6 碼者），可原樣回傳或加 `kind` 參數區分，
  但不得靜默丟棄；`Code == ""` 之列需過濾（遠端同款防禦）

## 實作要求
- 資料源：TWSE-API 官方 OpenAPI（host 已在 sandbox 白名單）
- 登錄位置：依既有 registry 風控/注意處置類分組（參考 `get_attention_disposition_stocks` 所在檔案）
- 與 `get_attention_disposition_stocks` 的關係：**不注入**當日清單（資料性質不同，
  本工具是「近期累計達標」而非「今日公布」），於工具 description 說明差異即可
- `name` 為本地端過濾；遵循 Envelope、`_lineage`、快取（TTL 對齊注意股系列）、Rate Limit

## 驗收標準
- [ ] `tools/list` 可見 `get_abnormal_accumulated_notice_stocks`，inputSchema 與本任務附帶者語意一致
- [ ] 以真實參數呼叫至少一次成功（含 name 過濾一次），回傳符合 Envelope 且含 `_lineage`
- [ ] 快取生效：重複呼叫第二次零上游 HTTP
- [ ] 單元測試（fixtures 對照上游回傳樣本，含權證列與空 Code 列案例）；`make test` / `go vet ./...` 通過
- [ ] README 附錄（自動產生）重新彙出

## 備註
- 遠端對照：TWSEMCPServer 同名工具，行為以官方 API 為準而非複製其程式碼
- 缺口分析文件：`docs/COMPARISON_TWSEMCPServer.md` §三之一
