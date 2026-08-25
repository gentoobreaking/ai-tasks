---
github_issue: N/A
title: 新增工具 get_etf_performance / get_etf_dividend_detail（e添富績效與配息明細）
type: feature
priority: medium
status: pending
depends_on: []
assignee: pi with opencode/x-preview-f-free
created: 2026-08-26
updated: 2026-08-26
---

# T243 - 新增工具 `get_etf_performance` / `get_etf_dividend_detail`（e添富績效與配息明細）

## 目標
擴充 TWSE ETF 平台（e添富）覆蓋，新增兩支工具：

1. **`get_etf_performance`**：查詢單一 ETF 的報酬率績效序列（`dates` + 兩組
   績效數列）。現行 ETF 工具僅有 NAV/折溢價（get_etf_nav）與配息表
   （get_etf_dividend），報酬率時序為空白。
2. **`get_etf_dividend_detail`**：查詢 ETF 配息明細與**收益分配政策全文**，
   含「尚未發生」之預定除息日/發放日（既有 get_etf_dividend 僅歷史已發放配息）。
   對高股息 ETF 使用者是關鍵差異（例：可提前得知下一期配息日程）。

出處：e添富平台前端 JS 探查（2026-08-26，本機 curl 實測確認回應結構）。

## 上游取值 API（TWSE-ETF：www.twse.com.tw/zh/ETFortune/*）

### 1. `GET|POST /zh/ETFortune/ajaxPerformance?response=json&etfId=<id>`
實測範例（0050，2026-08-26）：
```json
{"state":"ok",
 "range":["2025/07/01","2025/07/08"],
 "dates":["2025/07/01","2025/07/02","2025/07/03","..."],
 "performanceA":[10,21,-31,22,-16,-31,22,-16],
 "performanceB":[8,-17,30,-15,7,30,-15,7]}
```
- `dates`＋`performanceA/B` 為等長數列；A/B 意義需以官網圖表對照確認
  （推測為兩種期間報酬或含/不含配息），於工具 description 如實標註
- 不帶 `etfId` 回傳全 ETF 版本（結構同上），可支援「省略參數回全部」或必填

### 2. `GET|POST /zh/ETFortune/ajaxDividendData?response=json&etfId=<id>`
實測範例（0056，截錄）：
```json
{"status":"ok","data":[["00940","元大台灣價值高息",
  "115年09月08日","115年09月14日","115年10月01日","",
  "本基金可分配收益，除應符合下列規定外…（收益分配政策全文）", "..."]]}
```
- 每列欄位依序：代號、名稱、**預定除息日**、預定發放日、實際發放日、（保留欄）、
  收益分配政策全文、…
- 民國日期字串需正規化（rocToDate 既有 helper 可重用）

### 3. 附帶探查（選配，非本任務必要項）
- `/zh/ETFortune/hotetfList` 頁面存在「熱門 ETF」概念，ajax 端點待深挖；
  若實作時順利找到可一併新增 `get_hot_etf`

## 參數設計建議

| 工具 | 參數 |
|---|---|
| `get_etf_performance` | `symbol`（必填，如 "0050"）；`limit`（回傳最後 N 點，選填） |
| `get_etf_dividend_detail` | `symbol`（必填）；`upcoming_only`（布林，選填——僅回未發放之預定配息） |

## 實作要求
- 資料源：TWSE-ETF（www.twse.com.tw，host 已在 sandbox 白名單）；
  與 `pkg/provider/etf.go` 既有 e添富請求模式一致（ajaxEtfInfoChart 同款 headers）
- 登錄位置：`pkg/provider/etf.go` 擴充 datasets；registry 於 ETF 分組；
  cacheDataset 對映至既有 ETF 政策類別
- 快取語意：performance/dividend detail 屬日級資料 → L1 短 TTL、
  盤後 TTL 至隔日（對齊 daily_kline 政策）
- `get_etf_dividend_detail` 的民國日期轉換重用 `rocToDate`；
  政策全文欄位含換行，Envelope 輸出原樣保留
- 官方缺漏（如 etfId 無效、無配息紀錄）回明確錯誤訊息或空陣列＋note，
  不靜默失敗

## 驗收標準
- [ ] `tools/list` 可見兩工具，inputSchema 與上方參數設計語意一致
- [ ] `get_etf_performance("0050")` 與 `get_etf_dividend_detail("0056")`
      各真實呼叫至少一次成功，回傳符合 Envelope 且含 `_lineage`
- [ ] 快取生效：重複呼叫第二次零上游 HTTP
- [ ] fixtures 對照真實回傳樣本之單元測試；`make test` / `go vet ./...` 通過
- [ ] `make catalog` 重新彙出 docs/TOOL_CATALOG.md

## 備註
- 探查方法留存：抓 `/zh/ETFortune/etfInfo/0050` 頁面 grep `"/zh/ETFortune/ajax*"`
  即可列出該頁使用的 ajax 端點；日後平台改版可用同一手法重新盤點
- 同來源相關任務：T120（定期定額排行，ETFReport/ETFRank）
