---
github_issue: N/A
title: 新增工具 get_acceptable_collateral（保證金可抵繳標的）
type: feature
priority: low
status: pending
depends_on: []
assignee: pi with opencode/x-preview-f-free
created: 2026-08-26
updated: 2026-08-26
---

# T232 - 新增工具 get_acceptable_collateral（保證金可抵繳標的）

## 目標
查詢有價證券保證金可抵繳標的（kind 參數 stock/bond/international/log）。

出處：`docs/COMPARISON_TWSEMCPServer.md` 後續擴充調查（2026-08-26，
官方目錄 swagger 實抓差集：TWSE OpenAPI 已覆蓋 92%，TPEx 僅 5%、TAIFEX 僅 12%）。
- 屬利基/長尾資料，可延後排程

## 上游取值 API（TAIFEX OpenAPI（openapi.taifex.com.tw））

| 端點 | 說明 |
|---|---|
| `AcceptableCollateralStock` | 可抵繳標的-股票(含ETF) |
| `AcceptableCollateralGovernmentBonds` | 可抵繳標的-公債 |
| `AcceptableCollateralInternationalBonds` | 可抵繳標的-國際債 |
| `AcceptableCollateralLogStock` | 可抵繳標的增刪紀錄 |

> Swagger 目錄：https://openapi.taifex.com.tw/swagger.json
> 回應格式以官方實測為準（實作第一步先用 curl 取樣存 fixtures）。

## 實作要求
- 資料源：TAIFEX-API（100% 官方免費來源政策，§2 Source Registry）
- 登錄位置：依既有 registry 檔案分類慣例；dataset 登錄 provider 與
  `pkg/mcp/fetch.go` cacheDataset（TTL 對齊同性質資料）
- 遵循專案既有規範：Envelope 回傳結構、`_lineage` 標註、L1/L2 快取、
  Per-source Rate Limit（§4.4/§5.3）、`_chart_meta`（若適合繪圖）
- passthrough 或正規化模型擇一：官方欄位穩定者 passthrough；
  tables 型/中文欄位者寫 normalize（fixtures 對照真實回傳）
- 官方端點缺漏或無資料時回明確錯誤訊息（不靜默空值）


## 驗收標準
- [ ] `tools/list` 可見本工具，inputSchema 與上方參數語意一致
- [ ] 以真實參數呼叫至少一次成功（含過濾/分頁參數各一次，若適用），回傳符合 Envelope 且含 `_lineage`
- [ ] 快取生效：重複呼叫第二次零上游 HTTP（檢查 log 或 lineage）
- [ ] 單元測試（fixtures 對照上游真實回傳樣本）；`make test` / `go vet ./...` 通過
- [ ] `make catalog` 重新彙出 docs/TOOL_CATALOG.md（工具數/分組更新）

## 備註
- 同批擴充任務：P4 利基型（詳見各任務書）
- 缺口分析文件：`docs/COMPARISON_TWSEMCPServer.md`
