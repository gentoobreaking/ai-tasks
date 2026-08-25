---
github_issue: N/A
title: 新增擴充工具群組「上櫃公司治理・監理・股務系列」（24 端點）
type: feature
priority: high
status: pending
depends_on: []
assignee: pi with opencode/x-preview-f-free
created: 2026-08-26
updated: 2026-08-26
---

# T237 - 新增擴充工具群組「上櫃公司治理・監理・股務系列」

## 目標
查詢上櫃公司治理/監理/股務類官方資料：董監持股不足與質押、內部人轉讓申報、證期局裁罰、資訊揭露違規、經營權異動四態、董監酬金四表、獨立董監兼任、財報監察人承認、治理規程、董事長兼任總經理、累積投票制、提案權行使、持股逾10%大股東、股東會日期與電子投票。

出處：官方目錄 swagger 實抓差集後續擴充（2026-08-26），本任務承接其中 24 條端點。
可整併為少數多參數工具或逐一新增工具，實作時自行評估。

## 上游取值 API（TPEx OpenAPI）

| 端點 | 說明 |
| --- | --- |
| `mopsfin_t187ap02_O` | (無描述) |
| `mopsfin_t187ap08_O` | (無描述) |
| `mopsfin_t187ap09_O` | (無描述) |
| `mopsfin_t187ap10_O` | (無描述) |
| `mopsfin_t187ap11_O` | (無描述) |
| `mopsfin_t187ap12_O` | (無描述) |
| `mopsfin_t187ap13_O` | (無描述) |
| `mopsfin_t187ap22_O` | (無描述) |
| `mopsfin_t187ap23_O` | (無描述) |
| `mopsfin_t187ap24_O` | (無描述) |
| `mopsfin_t187ap25_O` | (無描述) |
| `mopsfin_t187ap26_O` | (無描述) |
| `mopsfin_t187ap27_O` | (無描述) |
| `mopsfin_t187ap29_A_O` | (無描述) |
| `mopsfin_t187ap29_B_O` | (無描述) |
| `mopsfin_t187ap29_C_O` | (無描述) |
| `mopsfin_t187ap29_D_O` | (無描述) |
| `mopsfin_t187ap30_O` | (無描述) |
| `mopsfin_t187ap31_O` | (無描述) |
| `mopsfin_t187ap32_O` | (無描述) |
| `mopsfin_t187ap33_O` | (無描述) |
| `mopsfin_t187ap34_O` | (無描述) |
| `mopsfin_t187ap35_O` | (無描述) |
| `t187ap41_O` | (無描述) |

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
