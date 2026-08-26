---
github_issue: N/A
title: 新增工具 get_gisa_board（創櫃板）
type: feature
priority: low
status: done
depends_on: []
assignee: pi with opencode/x-preview-f-free
created: 2026-08-26
updated: 2026-08-26
---

# T229 - 新增工具 get_gisa_board（創櫃板）

## 目標
查詢創櫃板公司資訊/市場現況/籌資資訊。kind 參數 company/highlight/financing。

出處：`docs/COMPARISON_TWSEMCPServer.md` 後續擴充調查（2026-08-26，
官方目錄 swagger 實抓差集：TWSE OpenAPI 已覆蓋 92%，TPEx 僅 5%、TAIFEX 僅 12%）。
- 屬利基/長尾資料，可延後排程

## 上游取值 API（TPEx OpenAPI（www.tpex.org.tw/openapi/v1））

| 端點 | 說明 |
|---|---|
| `tpex_gisa_company` | 創櫃板公司資訊 |
| `tpex_gisa_highlight` | 創櫃板公司市場現況 |
| `tpex_gisa_financing_in_process` | 創櫃板辦理中籌資資訊 |
| `tpex_gisa_financing_before` | (無描述) |
| `tpex_gisa_financing_history` | (無描述) |

> Swagger 目錄：https://www.tpex.org.tw/openapi/swagger.json
> 回應格式以官方實測為準（實作第一步先用 curl 取樣存 fixtures）。

## 實作要求
- 資料源：TPEx-API（100% 官方免費來源政策，§2 Source Registry）
- 登錄位置：依既有 registry 檔案分類慣例；dataset 登錄 provider 與
  `pkg/mcp/fetch.go` cacheDataset（TTL 對齊同性質資料）
- 遵循專案既有規範：Envelope 回傳結構、`_lineage` 標註、L1/L2 快取、
  Per-source Rate Limit（§4.4/§5.3）、`_chart_meta`（若適合繪圖）
- passthrough 或正規化模型擇一：官方欄位穩定者 passthrough；
  tables 型/中文欄位者寫 normalize（fixtures 對照真實回傳）
- 官方端點缺漏或無資料時回明確錯誤訊息（不靜默空值）


## 驗收標準
- [x] `tools/list` 可見本工具，inputSchema 與上方參數語意一致
- [x] 以真實參數呼叫至少一次成功（含過濾/分頁參數各一次，若適用），回傳符合 Envelope 且含 `_lineage`
- [x] 快取生效：重複呼叫第二次零上游 HTTP（檢查 log 或 lineage）
- [x] 單元測試（fixtures 對照上游真實回傳樣本）；`make test` / `go vet ./...` 通過
- [x] `make catalog` 重新彙出 docs/TOOL_CATALOG.md（工具數/分組更新）

## 備註
- 同批擴充任務：P4 利基型（詳見各任務書）
- 缺口分析文件：`docs/COMPARISON_TWSEMCPServer.md`
