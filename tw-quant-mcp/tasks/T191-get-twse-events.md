---
github_issue: N/A
title: 新增工具 get_twse_events（證交所活動訊息）
type: feature
priority: medium
status: pending
depends_on: []
assignee: pi with opencode/x-preview-f-free
created: 2026-08-26
updated: 2026-08-26
---

# T191 - 新增工具 `get_twse_events`（證交所活動訊息）

## 目標
對齊線上遠端 MCP（TWSEMCPServer）的同名工具，於本機 tw-quant-mcp 新增 `get_twse_events`，
提供「查詢證交所活動訊息」之查詢能力（業績發表會、產業講座等活動公告）。
工具名稱**沿用遠端命名**以利對照。

出處：`docs/COMPARISON_TWSEMCPServer.md` §三之一 A——遠端獨有清單實測（2026-08-26）。

## 遠端參考實作（twstockmcpserver）

### 工具描述與參數（tools/list 實抓 2026-08-26）
```
查詢證交所活動訊息。

Args:
    top: 回傳筆數上限（預設10），填0則回傳全部。
```

### 輸入參數 Schema（inputSchema）
```json
{
  "properties": {
    "top": { "default": 10, "title": "Top", "type": "integer" }
  },
  "type": "object"
}
```

### 上游取值 API（遠端原始碼驗證：tools/company/news.py）
- 端點：`GET https://openapi.twse.com.tw/v1/news/eventList`（TWSE OpenAPI，無參數）
- 回應範例（已實測可達）：
```json
[
  {"No": "1",
   "Title": "115年「SEMICON Taiwan」主題式業績發表會及產業講座（9月3日）",
   "Details": "https://www.twse.com.tw/zh/about/news/event/content.html?8a8216d69fc76da0019ff9c1bba600fd"}
]
```
- 欄位：`No`（序號）、`Title`（活動標題）、`Details`（詳情連結）

## 實作要求
- 資料源：TWSE-API 官方 OpenAPI（100% 官方來源政策，§2 Source Registry；host 已在 sandbox 白名單）
- 登錄位置：依既有 registry 檔案分類慣例（news/company 類，參考 `get_twse_news` 所在檔案）
- `top=0` 表全部；`top>0` 取前 N 筆；省略時預設 10
- 遵循專案既有規範：Envelope 回傳結構、`_lineage` 標註、L1/L2 快取、
  Per-source Rate Limit（§4.4/§5.3）；活動訊息屬低頻更新，TTL 可較長（如 1h）

## 驗收標準
- [ ] `tools/list` 可見 `get_twse_events`，inputSchema 與本任務附帶者語意一致
- [ ] 以真實參數呼叫至少一次成功，回傳符合 Envelope 結構且含 `_lineage`
- [ ] 快取生效：重複呼叫第二次零上游 HTTP（檢查 log 或 lineage）
- [ ] 單元測試（fixtures 對照上游回傳樣本）；`make test` / `go vet ./...` 通過
- [ ] README 附錄（自動產生）重新彙出

## 備註
- 遠端對照：TWSEMCPServer 同名工具（Python/FastMCP），行為以官方 API 為準而非複製其程式碼
- 缺口分析文件：`docs/COMPARISON_TWSEMCPServer.md` §三之一
