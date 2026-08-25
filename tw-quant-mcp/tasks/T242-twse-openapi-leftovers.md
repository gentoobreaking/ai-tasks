---
github_issue: N/A
title: 新增擴充工具群組「TWSE OpenAPI 餘量端點對齊」（12 端點）
type: feature
priority: low
status: pending
depends_on: []
assignee: pi with opencode/x-preview-f-free
created: 2026-08-26
updated: 2026-08-26
---

# T242 - 新增擴充工具群組「TWSE OpenAPI 餘量端點對齊」

## 目標
TWSE OpenAPI 目錄中尚未接線的 7 條端點，功能多已由既有工具等價覆蓋（BWIBBU_d↔BWIBBU_ALL、FMSRFK_ALL↔FMSRFK、t187ap03/04/05_L/P↔MOPS 版工具）：passthrough 補齊或於文件標註等價覆蓋聲明，確保目錄全覆蓋。

出處：官方目錄 swagger 實抓差集後續擴充（2026-08-26），本任務承接其中 12 條端點。
可整併為少數多參數工具或逐一新增工具，實作時自行評估。

## 上游取值 API（TWSE OpenAPI）

| 端點 | 說明 |
| --- | --- |
| `announcement/notice` | (無描述) |
| `block/BFIAUU_d` | (無描述) |
| `block/BFIAUU_m` | (無描述) |
| `block/BFIAUU_y` | (無描述) |
| `exchangeReport/BWIBBU_d` | (無描述) |
| `exchangeReport/FMSRFK_ALL` | (無描述) |
| `exchangeReport/FMTQIK` | (無描述) |
| `opendata/t187ap03_L` | (無描述) |
| `opendata/t187ap03_P` | (無描述) |
| `opendata/t187ap04_L` | (無描述) |
| `opendata/t187ap05_L` | (無描述) |
| `opendata/t187ap05_P` | (無描述) |

> Swagger 目錄：https://openapi.twse.com.tw/v1/swagger.json
> 回應格式以官方實測為準（實作第一步先用 curl 取樣存 fixtures）。

## 實作要求
- 資料源：TWSE-API（100% 官方免費來源政策）；dataset 登錄 provider 與
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
