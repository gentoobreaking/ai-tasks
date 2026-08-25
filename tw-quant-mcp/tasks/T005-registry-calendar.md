---
github_issue: N/A
title: Symbol Registry 與交易日曆
type: feature
priority: medium
status: done
assignee: pi with opencode/x-preview-f-free
created: 2026-07-31
updated: 2026-07-31
depends_on: []
---

# T005 - Symbol Registry 與交易日曆

## 目標
實作 `pkg/model.Symbol` 之 Registry（§5.2）與 `pkg/calendar` 交易日曆：從 TWSE/TPEx 官方清單載入並預熱至 L2，提供 market 判定與交易日判定（附錄 A）。

## 驗收標準
- [x] Registry 資料源：TWSE 上市清單 + TPEx 上櫃清單官方 OpenAPI，每日預熱入 L2（24h TTL）
- [x] `Lookup(code) (Symbol, ok)`：上市/上櫃判定正確（含 `ex_ch` 前綴 `tse_`/`otc_`）
- [x] 未知代碼回傳明確錯誤，供各 Tool handler 回覆
- [x] 交易日曆：支援當年休市日（官方行事曆來源），`IsTradingDay(date)` 正確處理週末與假日
- [x] 盤中引擎與預熱排程（T018）皆依賴此模組判定是否執行
- [x] 單元測試：節日（如元旦、春節）、週末、補班日案例；Registry 載入/更新

## 備註
- MIS `ex_ch` 組裝**一律**經 Registry，禁止猜測市場別（v1.2 已知缺失）
- 行事曆資料若官方未提供遠端來源，允許內嵌靜態表並標註版本

## 實作記錄（2026-07-31）
### 產出
- `pkg/model/registry.go`（+registry_test.go）：`Registry` 型別，`Set` 全量覆寫（任一記錄不合法整批拒絕）、`Lookup(code)`（依 `Exch()` 拆解 `tse_`/`otc_` 前綴）、`Market(code)`、`List`、`Len`；RWMutex 併發安全
- `pkg/registry/loader.go`（+loader_test.go）：`Loader{client, cache}` 自官方清單載入，`cache.GetOrFetch`（24h TTL，§4.2）單飛合流、落 L2；TWSE/TPEx 兩市場任一失敗即整體失敗；個別無效記錄略過、全滅才錯誤
- `pkg/calendar/calendar.go`（+calendar_test.go）：`Calendar` 含內嵌 2026 官方開休市表（24 筆休市日）並標註版本 `TWSE-holidaySchedule-2026-01-01`；`IsTradingDay/IsTradingDate/Holidays(year)/Version/Merge`
- `pkg/calendar/fetch.go`（+fetch_test.go）：`LoadFromOfficial(ctx, client, cache)` 自 TWSE 官方開休市表 JSON API 抓取並合併；解析排除名稱含「交易日」之標記行（開始/最後交易日）
- 官方 fixture 實測：TWSE 上市清單 `t187ap05_L`（1082 筆）、TPEx `tpex_mainboard_daily_close_quotes`（10218 筆）、TWSE holidaySchedule JSON（2026 休市日 24 筆）

### 官方來源查證（curl 實測）
- TWSE 上市清單：`https://openapi.twse.com.tw/v1/opendata/t187ap05_L`（公司代號/公司名稱/產業別）
- TPEx OpenAPI swagger 全表掃描**無公司主清單端點** → 改用官方每日收盤行情 `tpex_mainboard_daily_close_quotes` 為上櫃清單來源（category 無機器可讀欄位，留空）
- TWSE 開休市表：`https://www.twse.com.tw/holidaySchedule/holidaySchedule?response=json`（`stat/date/data`；僅提供當年；名稱含「交易日」者為交易標記非休市日）
- 2026 補班日為 2/21（週六），股市休市（週末規則）

### 驗證
- `go build ./... && go vet ./... && go test ./... -count=1` 全過（7 套件，含既有 T001–T004）
- `make lint`（vet + gofmt）通過
- 既有 T001–T004 測試不受影響

### 決策
- 行事曆：官方 API 僅提供當年 → 內嵌 2026 官方表為離線 fallback 並標註版本；`LoadFromOfficial` 以官方資料合併更新（同日期覆寫）
- Registry 市場清單任一市場載入失敗即 `Load` 整體失敗（缺市場別恐致 `ex_ch` 路由錯誤，寧可快速失敗）
- 快取資料類別採用 `cache.DatasetCalendar`（§4.2 24h）
- 測試端點以套件級變數供 httptest 注入（`holidayScheduleURL`/`twseListURL`/`tpexListURL`）

## 執行紀錄（2026-08-25 稽核）
- 驗收條目全數已有勾選；本次稽核以全域門檻複核：`go vet ./...` 通過、`go test ./...` 16 套件全綠（含契約測試/Envelope 一致性/快取一致性/壓力腳本存在性）。
- 本任務產出之模組為現行 155 註冊工具之作用中路徑（非死代碼），接線由 `cmd/mcp-server` 入口經 `App` 組裝達成；真實程序煙霧測試見 snapshots/raw/。
