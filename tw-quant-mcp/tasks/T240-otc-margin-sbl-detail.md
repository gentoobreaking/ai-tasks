---
github_issue: N/A
title: 新增擴充工具群組「上櫃融資融券・借券細項」（11 端點）
type: feature
priority: medium
status: done
depends_on: []
assignee: pi with opencode/x-preview-f-free
created: 2026-08-26
updated: 2026-08-26
---

# T240 - 新增擴充工具群組「上櫃融資融券・借券細項」

## 目標
查詢上櫃信用交易細項：融券借券賣出餘額、標借、調整成數、信用餘額概況表、增減排行、暫停融券賣出預告、平盤下得融(借)券名單、使用率報表、當沖券差借券費率、當日融券賣出成交量值。——供券源回補壓力與軋空分析。

出處：官方目錄 swagger 實抓差集後續擴充（2026-08-26），本任務承接其中 11 條端點。
可整併為少數多參數工具或逐一新增工具，實作時自行評估。

## 上游取值 API（TPEx OpenAPI）

| 端點 | 說明 |
| --- | --- |
| `tpex_dpsp_monthly_CBmcs007` | (無描述) |
| `tpex_intraday_fee` | (無描述) |
| `tpex_margin_sbl` | (無描述) |
| `tpex_margin_trading_adjust` | (無描述) |
| `tpex_margin_trading_lend` | (無描述) |
| `tpex_margin_trading_margin_mark` | (無描述) |
| `tpex_margin_trading_margin_used` | (無描述) |
| `tpex_margin_trading_marginspot` | (無描述) |
| `tpex_margin_trading_short_sell` | (無描述) |
| `tpex_margin_trading_term` | (無描述) |
| `tpex_short_sell` | (無描述) |

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
