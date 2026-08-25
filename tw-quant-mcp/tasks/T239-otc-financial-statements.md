---
github_issue: N/A
title: 新增擴充工具群組「上櫃財報三表（六產業 fallback）」（27 端點）
type: feature
priority: medium
status: pending
depends_on: []
assignee: pi with opencode/x-preview-f-free
created: 2026-08-26
updated: 2026-08-26
---

# T239 - 新增擴充工具群組「上櫃財報三表（六產業 fallback）」

## 目標
查詢上櫃公司綜合損益表與資產負債表（一般業/金融業/金控業/證券期貨業/保險業/異業六格式）。statement 參數 income/balance；產業 fallback 模式同 T092/T158。

出處：官方目錄 swagger 實抓差集後續擴充（2026-08-26），本任務承接其中 27 條端點。
可整併為少數多參數工具或逐一新增工具，實作時自行評估。

## 上游取值 API（TPEx OpenAPI）

| 端點 | 說明 |
| --- | --- |
| `mopsfin_t187ap06_O_basi` | (無描述) |
| `mopsfin_t187ap06_O_basiA` | (無描述) |
| `mopsfin_t187ap06_O_bd` | (無描述) |
| `mopsfin_t187ap06_O_bdA` | (無描述) |
| `mopsfin_t187ap06_O_ci` | (無描述) |
| `mopsfin_t187ap06_O_ciA` | (無描述) |
| `mopsfin_t187ap06_O_fh` | (無描述) |
| `mopsfin_t187ap06_O_fhA` | (無描述) |
| `mopsfin_t187ap06_O_ins` | (無描述) |
| `mopsfin_t187ap06_O_insA` | (無描述) |
| `mopsfin_t187ap06_O_mim` | (無描述) |
| `mopsfin_t187ap06_O_mimA` | (無描述) |
| `mopsfin_t187ap06_U_basi` | (無描述) |
| `mopsfin_t187ap06_U_bd` | (無描述) |
| `mopsfin_t187ap06_U_ins` | (無描述) |
| `mopsfin_t187ap06_U_mim` | (無描述) |
| `mopsfin_t187ap07_O_basi` | (無描述) |
| `mopsfin_t187ap07_O_bd` | (無描述) |
| `mopsfin_t187ap07_O_ci` | (無描述) |
| `mopsfin_t187ap07_O_fh` | (無描述) |
| `mopsfin_t187ap07_O_ins` | (無描述) |
| `mopsfin_t187ap07_O_mim` | (無描述) |
| `mopsfin_t187ap07_U_basi` | (無描述) |
| `mopsfin_t187ap07_U_bd` | (無描述) |
| `mopsfin_t187ap07_U_fh` | (無描述) |
| `mopsfin_t187ap07_U_ins` | (無描述) |
| `mopsfin_t187ap07_U_mim` | (無描述) |

> Swagger 目錄：https://www.tpex.org.tw/openapi/swagger.json
> 回應格式以官方實測為準（實作第一步先用 curl 取樣存 fixtures）。

## 實作要求
- 資料源：TPEx-API（100% 官方免費來源政策）；dataset 登錄 provider 與
  `pkg/mcp/fetch.go` cacheDataset（TTL 對齊同性質資料）
- Envelope 回傳結構、`_lineage` 標註、L1/L2 快取、Rate Limit（§4.4/§5.3）
- passthrough 或正規化模型擇一；官方缺漏回明確錯誤訊息

## 驗收標準
- [ ] 本任務所有端點均有對應工具且 `tools/list` 可見
- [ ] 以真實參數呼叫至少一次成功，回傳符合 Envelope 且含 `_lineage`
- [ ] 快取生效：重複呼叫第二次零上游 HTTP
- [ ] 單元測試（fixtures 對照真實回傳）；`make test` / `go vet ./...` 通過
- [ ] `make catalog` 重新彙出 docs/TOOL_CATALOG.md

## 備註
- 同批擴充任務系列；缺口分析文件：`docs/COMPARISON_TWSEMCPServer.md`
