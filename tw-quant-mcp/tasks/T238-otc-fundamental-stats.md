---
github_issue: N/A
title: 新增擴充工具群組「上櫃基本面・營收統計・重大訊息」（9 端點）
type: feature
priority: medium
status: done
depends_on: []
assignee: pi with opencode/x-preview-f-free
created: 2026-08-26
updated: 2026-08-26
---

# T238 - 新增擴充工具群組「上櫃基本面・營收統計・重大訊息」

## 目標
查詢上櫃基本面資料：營益分析彙總、各產業 EPS 統計、財測達成情形、查核差異、股利分派（董事會通過）、二十九大類股營收變化統計、營收創新高一覽、上櫃股票基本資料、每日重大訊息。

出處：官方目錄 swagger 實抓差集後續擴充（2026-08-26），本任務承接其中 9 條端點。
可整併為少數多參數工具或逐一新增工具，實作時自行評估。

## 上游取值 API（TPEx OpenAPI）

| 端點 | 說明 |
| --- | --- |
| `mopsfin_187ap17_O` | (無描述) |
| `mopsfin_t187ap03_O` | (無描述) |
| `mopsfin_t187ap04_O` | (無描述) |
| `mopsfin_t187ap05_OA` | (無描述) |
| `mopsfin_t187ap05_OB` | (無描述) |
| `mopsfin_t187ap14_O` | (無描述) |
| `mopsfin_t187ap15_O` | (無描述) |
| `mopsfin_t187ap16_O` | (無描述) |
| `mopsfin_t187ap39_O` | (無描述) |

> Swagger 目錄：https://www.tpex.org.tw/openapi/swagger.json
> 回應格式以官方實測為準（實作第一步先用 curl 取樣存 fixtures）。

## 實作要求
- 資料源：TPEx-API（100% 官方免費來源政策）；dataset 登錄 provider 與
  `pkg/mcp/fetch.go` cacheDataset（TTL 對齊同性質資料）
- Envelope 回傳結構、`_lineage` 標註、L1/L2 快取、Rate Limit（§4.4/§5.3）
- passthrough 或正規化模型擇一；官方缺漏回明確錯誤訊息

## 驗收標準
- [x] 本任務所有端點均有對應工具且 `tools/list` 可見
- [x] 以真實參數呼叫至少一次成功，回傳符合 Envelope 且含 `_lineage`
- [x] 快取生效：重複呼叫第二次零上游 HTTP
- [x] 單元測試（fixtures 對照真實回傳）；`make test` / `go vet ./...` 通過
- [x] `make catalog` 重新彙出 docs/TOOL_CATALOG.md

## 備註
- 同批擴充任務系列；缺口分析文件：`docs/COMPARISON_TWSEMCPServer.md`
