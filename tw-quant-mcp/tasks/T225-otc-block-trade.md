---
github_issue: N/A
title: 新增工具 get_otc_block_trade（上櫃鉅額交易系列）
type: feature
priority: medium
status: pending
depends_on: []
assignee: pi with opencode/x-preview-f-free
created: 2026-08-26
updated: 2026-08-26
---

# T225 - 新增工具 get_otc_block_trade（上櫃鉅額交易系列）

## 目標
查詢上櫃鉅額交易日/月/年統計與逐筆明細（kind 參數 day/stock/summary_day/monthly/yearly/history）。對稱 TWSE T042–T045。

出處：`docs/COMPARISON_TWSEMCPServer.md` 後續擴充調查（2026-08-26，
官方目錄 swagger 實抓差集：TWSE OpenAPI 已覆蓋 92%，TPEx 僅 5%、TAIFEX 僅 12%）。


## 上游取值 API（TPEx OpenAPI（www.tpex.org.tw/openapi/v1））

| 端點 | 說明 |
|---|---|
| `tpex_daily_qutoes_block` | 上櫃鉅額交易日成交資訊 |
| `tpex_daily_trading_block` | 上櫃個股單一證券鉅額交易日成交資訊 |
| `tpex_daily_trading_summary_odd` | 上櫃鉅額交易日成交量值統計 |
| `tpex_monthly_trading_summary_block` | 上櫃鉅額交易月成交量值統計 |
| `tpex_yearly_trading_summary_block` | 上櫃鉅額交易年成交量值統計 |
| `tpex_daily_trade_block_day` | 鉅額交易歷史成交資訊 |

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
- [ ] `tools/list` 可見本工具，inputSchema 與上方參數語意一致
- [ ] 以真實參數呼叫至少一次成功（含過濾/分頁參數各一次，若適用），回傳符合 Envelope 且含 `_lineage`
- [ ] 快取生效：重複呼叫第二次零上游 HTTP（檢查 log 或 lineage）
- [ ] 單元測試（fixtures 對照上游真實回傳樣本）；`make test` / `go vet ./...` 通過
- [ ] `make catalog` 重新彙出 docs/TOOL_CATALOG.md（工具數/分組更新）

## 備註
- 同批擴充任務：P3 新板塊：上櫃鉅額（詳見各任務書）
- 缺口分析文件：`docs/COMPARISON_TWSEMCPServer.md`
