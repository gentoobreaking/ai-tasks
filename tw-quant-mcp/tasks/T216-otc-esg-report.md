---
github_issue: N/A
title: 擴充 get_esg_report／新增 get_otc_esg_report（上櫃 ESG 揭露 t187ap46_O）
type: feature
priority: high
status: pending
depends_on: []
assignee: pi with opencode/x-preview-f-free
created: 2026-08-26
updated: 2026-08-26
---

# T216 - 擴充 get_esg_report／新增 get_otc_esg_report（上櫃 ESG 揭露 t187ap46_O）

## 目標
上櫃公司企業 ESG 資訊揭露彙總（topic 1~21，端點 t187ap46_O_<n>）。方案 A：get_esg_report 增加 market 參數支援 otc；方案 B：獨立 get_otc_esg_report。八主題聚合邏輯沿用 T037。

出處：`docs/COMPARISON_TWSEMCPServer.md` 後續擴充調查（2026-08-26，
官方目錄 swagger 實抓差集：TWSE OpenAPI 已覆蓋 92%，TPEx 僅 5%、TAIFEX 僅 12%）。
- 完成後屬找買點管線直接受益工具，優先排程

## 上游取值 API（TPEx OpenAPI（www.tpex.org.tw/openapi/v1））

| 端點 | 說明 |
|---|---|
| `t187ap46_O_1` | 上櫃ESG揭露-溫室氣體排放 |
| `t187ap46_O_2` | 上櫃ESG揭露-能源管理 |
| `t187ap46_O_6` | 上櫃ESG揭露-董事會 |
| `t187ap46_O_8` | 上櫃ESG揭露-氣候相關議題管理 |
| `t187ap46_O_12` | (無描述) |
| `t187ap46_O_13` | (無描述) |
| `t187ap46_O_14` | (無描述) |
| `t187ap46_O_15` | (無描述) |
| `t187ap46_O_19` | (無描述) |
| `t187ap46_O_20` | (無描述) |
| `t187ap46_O_21` | (無描述) |
| `t187ap46_O_3` | (無描述) |
| `t187ap46_O_4` | (無描述) |
| `t187ap46_O_5` | (無描述) |
| `t187ap46_O_7` | (無描述) |
| `t187ap46_O_9` | (無描述) |

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

### 特別注意
完整 topic 清單見 swagger（_O_1..21）；與上市 L 版欄位可能略有差異，正規化時注意。

## 驗收標準
- [ ] `tools/list` 可見本工具，inputSchema 與上方參數語意一致
- [ ] 以真實參數呼叫至少一次成功（含過濾/分頁參數各一次，若適用），回傳符合 Envelope 且含 `_lineage`
- [ ] 快取生效：重複呼叫第二次零上游 HTTP（檢查 log 或 lineage）
- [ ] 單元測試（fixtures 對照上游真實回傳樣本）；`make test` / `go vet ./...` 通過
- [ ] `make catalog` 重新彙出 docs/TOOL_CATALOG.md（工具數/分組更新）

## 備註
- 同批擴充任務：P3 新板塊：上櫃 ESG（詳見各任務書）
- 缺口分析文件：`docs/COMPARISON_TWSEMCPServer.md`
