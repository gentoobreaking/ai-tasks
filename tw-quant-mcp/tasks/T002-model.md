---
github_issue: N/A
title: 資料模型層（Envelope / Lineage / Symbol / Candle）
type: feature
priority: high
status: done
assignee: pi with opencode/x-preview-f-free
created: 2026-07-31
updated: 2026-07-31
depends_on: []
---

# T002 - 資料模型層

## 目標
實作 `pkg/model` 統一資料結構與歸一化規則（規格書 §3、§5），含 `Lineage`、`Envelope`、`Symbol`、`Candle` 及盤後/籌碼/財報/期權之 Normalized Models。

## 驗收標準
- [x] `Lineage`（§3.2）欄位齊全：source / source_role / derived_from / fetched_at / data_date / freshness / sampling_sec / is_cached / cache_ttl / latency_ms / source_url（omitempty）
- [x] `Envelope`（§3.3）：`data` / `_lineage` / `_chart_meta,omitempty`；所有 Tool 回傳皆由此結構輸出
- [x] `Symbol`（§5.2）：code / market(tse|otc) / name / category；含 `ex_ch` 組裝函式（`tse_2330.tw` / `otc_6547.tw`）
- [x] `Candle`（§5.3）：timestamp / open / high / low / close / volume / amount(omitempty)，盤中與日線/期貨共用
- [x] 單位換算工具函式：仟元→元、張→股、百分比統一為 %（TWSE 原生單位於 Adapter 換算，含測試）
- [x] 時間格式工具：RFC3339（Asia/Taipei）、`YYYY-MM-DD`、`HH:MM:00` 三種格式之序列化/解析
- [x] 單元測試：JSON marshal/unmarshal、omitempty 行為、時間/單位換算正確性

## 實作記錄（2026-07-31）

### 產出（`pkg/model`，5 實作檔 + 3 測試檔）
| 檔案 | 內容 |
|---|---|
| `lineage.go` | `Lineage`（§3.2 全 11 欄位，`source_url`/`derived_from` omitempty）+ 常數：7 個資料來源 ID（§2）、3 個角色（§2.1）、3 個 freshness（§3.2）+ `ValidFreshness` |
| `envelope.go` | `Envelope{Data, _lineage, _chart_meta,omitempty}`（§3.3） |
| `symbol.go` | `Symbol`（§5.2）+ `MarketTSE/OTC` 常數 + `Exch()`（`tse_2330.tw`/`otc_6547.tw`）+ `Validate()` + `ValidMarket` |
| `candle.go` | `Candle`（§5.3，`amount,omitempty`） |
| `units.go` | `ThousandToYuan`（仟元→元）、`LotsToShares`（張→股）、`RoundPrice`（2 位小數）、`RatioToPercent` / `PercentToRatio`（§5.1） |
| `timeutil.go` | `TaipeiTime`（RFC3339 JSON 固定 +08:00，含 Marshal/Unmarshal）、`Taipei()` / `TaipeiNow()` / `Now()`、`FormatDate` / `ParseDate`（YYYY-MM-DD）、`FormatHM` / `ParseHM`（HH:MM:00）、`FormatRFC3339` |

### 設計決策與規格書偏離說明
1. **代碼長度**：§5.2 正文寫「6 碼」但範例 `"2330"` 為 4 碼。TWSE 上市代碼實為 4 碼，故 `Validate` 採 4~6 碼數字字串（規格書矛盾處已於程式碼註解註明，建議 v1.4 修正規格書）。
2. **`TaipeiTime` 型別**：`FetchedAt` 使用自訂 `TaipeiTime`（嵌入 `time.Time`），JSON 輸出保證 RFC3339 + `+08:00`，符合 §3.2「RFC3339（Asia/Taipei）」。
3. **時區資料**：`Asia/Taipei` 載入失敗時 fallback 固定 `+08:00`（台灣自 1979 年無 DST），確保單一執行檔可攜。
4. **`ParseHM` 歷史時區陷阱**：`time.ParseInLocation` 對無日期之 HH:MM:SS 回傳「年 0」時間，tzdata 對 1945 年前台灣套用舊偏移（+08:06），故回傳值正規化至 2000-01-01 再轉換；另 Go 解析器對時欄位前導零寬容（`"9:05:00"` 可解析），以 round-trip 嚴格校驗 + 秒數須為 00。
5. **浮點四捨五入**：`RoundPrice` 採 `math.Round(v*100)/100`（half away from zero）；測試避免使用無法精確表示之邊界值（如 1.005）。
6. **盤後/籌碼/財報/期權之 Normalized Models**：T002 驗收清單未定義具體欄位（對應工具在 T008~T015 才定義輸入輸出），本任務僅實作四核心共用契約，其餘模型於各 Adapter 任務內補齊，避免先行猜測欄位造成契約漂移。

### 驗證結果（全數通過）
- `go build ./...`、`go vet ./...`、`go test ./...`、`make lint` — OK
- `pkg/model` 測試覆蓋率 92.7%；既有 `pkg/config`、`cmd/mcp-server` 測試不受影響
- 測試涵蓋：Lineage 全欄位 marshal（含 `+08:00` 偏移字面比對）、omitempty（derived_from/source_url/_chart_meta/amount 空值不輸出）、JSON round trip、Symbol ex_ch 組裝與驗證、單位換算（含 ×1000 邊界）、三種時間格式序列化/解析、UTC↔台北跨日（23:00 UTC → 次日日期）、非法輸入錯誤

### 後續任務銜接
- T003：`pkg/provider` 引用 `model.Symbol.Exch()` 組裝 MIS ex_ch
- T004：快取命中時由 `model.Lineage` 注入 `is_cached`/`cache_ttl`
- T005：Symbol Registry 每日預熱以 `Symbol.Validate()` 檢查官方清單

## 備註
- 此為全專案共用契約，欄位一經定義不可隨意變更（§5.1 命名規則為唯一真值）
- `freshness` 僅允許：REALTIME_INTRADAY / POST_MARKET_TODAY / HISTORICAL

## 執行紀錄（2026-08-25 稽核）
- 驗收條目全數已有勾選；本次稽核以全域門檻複核：`go vet ./...` 通過、`go test ./...` 16 套件全綠（含契約測試/Envelope 一致性/快取一致性/壓力腳本存在性）。
- 本任務產出之模組為現行 155 註冊工具之作用中路徑（非死代碼），接線由 `cmd/mcp-server` 入口經 `App` 組裝達成；真實程序煙霧測試見 snapshots/raw/。
