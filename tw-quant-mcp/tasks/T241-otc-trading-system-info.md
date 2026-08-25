---
github_issue: N/A
title: 新增擴充工具群組「上櫃交易制度與市場資訊」（10 端點）
type: feature
priority: low
status: pending
depends_on: []
assignee: pi with opencode/x-preview-f-free
created: 2026-08-26
updated: 2026-08-26
---

# T241 - 新增擴充工具群組「上櫃交易制度與市場資訊」

## 目標
查詢上櫃交易制度面資訊：成交分價表、暫緩開盤/收盤股票、漲跌停未成交、變更交易/分盤/管理股票/停止交易、公布暫停恢復交易（當日/歷史）、上櫃市場現況。

出處：官方目錄 swagger 實抓差集後續擴充（2026-08-26），本任務承接其中 10 條端點。
可整併為少數多參數工具或逐一新增工具，實作時自行評估。

## 上游取值 API（TPEx OpenAPI）

| 端點 | 說明 |
| --- | --- |
| `tpex_ceil_non_trading` | (無描述) |
| `tpex_cmode` | (無描述) |
| `tpex_daily_trading_index` | (無描述) |
| `tpex_delayed_stock_close` | (無描述) |
| `tpex_delayed_stock_open` | (無描述) |
| `tpex_ipo_no_limit` | (無描述) |
| `tpex_mainborad_highlight` | (無描述) |
| `tpex_prvol` | (無描述) |
| `tpex_spendi_history` | (無描述) |
| `tpex_spendi_today` | (無描述) |

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
