---
github_issue: N/A
title: ETF（0050）與加權指數資料支援（A+B 合併）
type: feature
priority: medium
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-12
updated: 2026-08-15
---

# T032 - ETF（0050）與加權指數資料支援（A+B 合併）

## 目標
補齊 MCP 目前無法提供的兩類資料：
1. **上市 ETF（0050 等）**：目前 Symbol Registry 僅以 `t187ap05_L`（上市公司清單，不含 ETF）＋ TPEx 收盤清單建置，導致 `symbolOf("0050")` 回「非法代號」，所有個股工具（日 K / 即時報價 / 三大法人 / 融資融券 / 估值等）無法查詢 ETF。
2. **加權指數**：`pkg/provider/twse.go` 已有 `normalizeIndexHistory`（TWSEWDIndexHistory，MI_5MINS_HIST）與 `normalizeIndices`（TWSEAPIIndices，MI_INDEX），但**完全未接到 MCP 層**（無 handler / 無 tool / 未登錄快取政策），為死碼。

A+B 合併：一次補齊兩塊缺口。ETF 掛進現有個股工具（資料源沿用 TWSE-WEB/API），加權指數走新增 `get_twse_index` 工具（每日指數收盤 + 歷史日 K）。

## 資料源實測結果（2026-08-12）

| 項目 | 端點 | 實測結果 |
|---|---|---|
| ETF 0050 日 K | `https://www.twse.com.tw/rwd/afterTrading/STOCK_DAY?date=20260811&stockNo=0050` | ✅ OK（含 115/08 各日 OHLC，`stat=OK`） |
| 全市場收盤（含 ETF） | `https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL` | ✅ OK（1378 列，含 141 檔 6 碼 0 開頭 ETF/ETN；0050 元大台灣50 在列） |
| 加權指數歷史 | `https://www.twse.com.tw/indicesReport/MI_5MINS_HIST?response=json&date=20260811` | ✅ OK（發行量加權股價指數每日 OHLC） |
| 指數收盤行情 | `https://openapi.twse.com.tw/v1/exchangeReport/MI_INDEX` | ✅ OK（寶島/加權/公司治理/臺灣50… 收盤指數+漲跌點數+百分比） |
| 上市清單 t187ap05_L | `https://openapi.twse.com.tw/v1/opendata/t187ap05_L` | ❌ 不含 0050（僅 1082 家上市公司）→ 現行 Registry 缺 ETF |
| TPEx 清單 | `https://www.tpex.org.tw/openapi/v1/tpex_mainboard_daily_close_quotes` | ✅ OK（10337 列，上櫃含 ETF；但 0050 為上市，不在列） |

**關鍵結論**：官方資料源完整可用；缺口純在於「Registry 未納入上市 ETF」＋「指數 normalize 未接線」。`STOCK_DAY_ALL` 為上市 ETF 之最佳 Registry 來源（含名稱；上市 ETF 代碼為 6 碼 0 開頭，與股票 4 碼可區分）。

## 改動檔案清單

### 1. Symbol Registry 納入上市 ETF（A 部分）
- `pkg/model/symbol.go`：`Symbol.Validate()` 放寬代碼長度 4~6 碼（現行已為 4~6，確認可容 6 碼 ETF）；新增 `Symbol.IsETF()`（代碼 6 碼且 `00` 前綴，與 `pkg/engine/composite/screen.go isETF` 一致）。
- `pkg/registry/loader.go`：
  - 新增 `twseETFListURL = "https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL"`（變數，供測試注入）。
  - 新增 `parseTWSEETFList(body)`：解析 `STOCK_DAY_ALL` 回傳之 6 碼 0 開頭列（Code/Name），過濾非 ETF（排除 6 碼非 0 開頭、4 碼股票、2 碼認購權證等），產業別留空。
  - `Load()` 於 TWSE 上市清單後合併 ETF 清單（`append(tse, etfs...)`）；ETF 清單載入失敗**不阻擋**整體 Registry（記 warning，log 輸出）——避免 ETF 端點異常時影響既有股票工具。
  - `sourceIDFor()` 增加 ETF URL → `model.SourceTWSEAPI`（與 STOCK_DAY_ALL 同源）。
- 快取：沿用 `DatasetCalendar`（24h TTL，§4.2「公司代碼表」），與現行清單同一 TTL 政策。

### 2. 加權指數工具（B 部分）
- `pkg/mcp/tools_bc.go`（或新增 `pkg/mcp/tools_index.go`）：
  - `handlerGetTWSEIndex(a, args)`：參數 `symbol`（指數名稱，省略＝加權指數「發行量加權股價指數」，enum 提供：發行量加權股價指數／寶島股價指數／臺灣50指數／臺灣中型100指數／臺灣資訊科技指數／臺灣發達指數…，來源 `normalizeIndices` 之 `IndexQuoteRow.IndexName`）＋ `date`（省略＝最近交易日）。
  - 資料路徑 1（單日指數收盤）：`fetchNormalize[[]provider.IndexQuoteRow]`，dataset `provider.TWSEAPIIndices`（`/exchangeReport/MI_INDEX`，openapi 恆 T-1，日期以列內 `Date` 為準），過濾 `IndexName == symbol`。
  - 資料路徑 2（歷史日 K）：`fetchNormalize[[]provider.IndexRow]`，dataset `provider.TWSEWDIndexHistory`（`/indicesReport/MI_5MINS_HIST?date=YYYYMMDD`，月級資料，同 `index_history` 整月請求），回傳月份每日 OHLC。
  - 輸出模型：新增 `pkg/model/domain/index.go`（或沿用 provider 型別包 Envelope）定義 `IndexView{Name, Date, Close, Change, ChangePercent, History []IndexDay}`，含 `_chart_meta`（line 型別，history 序列）。
- `pkg/mcp/registry_bc.go`：註冊 `get_twse_index` ToolDef（Schema：symbol enum + date）。
- `pkg/mcp/fetch.go` `cacheDataset`：登錄 `TWSEAPIIndices → cache.DatasetDailyKLine`（日級盤後 TTL 至隔日 08:00）、`TWSEWDIndexHistory → cache.DatasetDailyKLine`（同 daily_kline 政策，AllowL2）。
- `pkg/mcp/prewarm.go`：`taskMarketSummary` 旁新增 `taskTWSEIndex`（盤後預熱加權指數單日收盤，減少首次查詢延遲）。

### 3. 既有工具對 ETF 之相容性（A 部分延伸）
- `pkg/engine/composite/screen.go`：篩選引擎既有 `isETF` 排除邏輯保留（screen 工具不列 ETF 為設計決定）；如需開放，另加 `AllowETFs` 參數（已有欄位，確認 handler 未暴露即維持現狀）。
- 檢查 `pkg/mcp` 各 handler 對 6 碼代號之假設（如 `marketStatsTSE` 以 `MarketCloseRow` 過濾、`quoteTSE` 以 STOCK_DAY 查詢）：ETF 掛進 Registry 後，日 K / 即時報價（MIS ex_ch `tse_0050.tw`）應自然可用；需跑全量測試確認無 4 碼假設破綻。

### 4. 文件
- `docs/TRACEABILITY-v2.1.md`（或新增段落）：補登 T032 工具與 ETF 支援。
- `~/tasks/tw-quant-mcp/README.md`：Task 列表新增 T032。

## 契約測試範圍
- `pkg/registry/loader_test.go`：
  - `parseTWSEETFList` golden fixture（`pkg/provider/testdata/twse/stock_day_all.json`，擷取 0050/0056/006208 + 非 ETF 列）：僅 6 碼 0 開頭入列、4 碼股票/權證排除、名稱正確。
  - `Load()` 合併後 Registry 含 0050（Market=TSE, Name=元大台灣50）；ETF 端點 500 時整體 Registry 仍成功（僅缺 ETF）。
- `pkg/provider/contract_test.go`：`normalizeIndexHistory`（MI_5MINS_HIST fixture）與 `normalizeIndices`（MI_INDEX fixture）契約測試（欄位型別/單位/日期，既有 fixture 補齊或新增）。
- `pkg/mcp/app_bc_test.go`（或新增 `app_index_test.go`）：
  - `get_twse_index`：單日收盤（過濾 IndexName）、歷史日 K（月份請求）、`_chart_meta` line 型別、lineage（Source TWSEWeb/API、freshness POST_MARKET、dataDate）。
  - 二次呼叫快取命中（is_cached=true）與 stale-if-error 回退。
  - 未知指數名稱 → 錯誤訊息；ETF 0050 經 `get_stock_daily_kline` / `get_stock_daily_quote` 查詢成功（fake Registry 注入）。
- 全量回歸：`go test ./...`、`make check`、`go vet ./...`、`make test-race` 全綠；`cmd/loadtest` PASS（工具數 37→38）。

## 驗收標準
- [x] `get_twse_index` 可查加權指數單日收盤與歷史日 K，lineage/cache/chart 符合既有規範
- [x] Symbol Registry 含上市 ETF（0050/0056/006208 等），`get_stock_daily_kline("0050")`、`get_stock_daily_quote("0050")` 回傳正確資料
- [x] 篩選工具（screen_*）行為不變（ETF 仍排除）
- [x] 契約測試＋全量回歸通過；`cmd/loadtest` 工具數 38
- [x] 文件（TRACEABILITY / README Task 列表）更新

## 備註
- 風險：`STOCK_DAY_ALL` 含主動型 ETF（00400A 等）與 ETN，`parseTWSEETFList` 需明確過濾規則（6 碼 0 開頭全納，或另以 TWSE ETF 清單精確過濾——`t187ap14L` 實測 302 未通，暫以代碼前綴規則為主，於 task 執行時再驗證官方 ETF 清單端點）。
- 加權指數名稱對映：TWSE-WEB MI_INDEX（type=IND）與 openapi MI_INDEX 名稱一致（發行量加權股價指數等），`get_twse_index` 以名稱過濾即可；歷史日 K 端點僅回「發行量加權股價指數」單一指數。
- 上櫃 ETF（如 00679B 反一）部分未在 `STOCK_DAY_ALL`（實測缺），如需完整上櫃 ETF 清單另以 TPEx 來源補（本次範圍僅上市 ETF）。
- 前置：無（獨立於既有 31 tasks）。
