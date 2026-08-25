---
github_issue: N/A
title: 效能最佳化與預熱排程
type: optimization
priority: medium
status: done
assignee: pi with opencode/x-preview-f-free
created: 2026-07-31
updated: 2026-08-01
depends_on: []
---

# T018 - 效能最佳化與預熱排程

## 目標
落實 §12 效能原則之系統性檢視與預熱排程（§12.9）：08:00 行事曆/代碼表、16:45 盤後資料、開盤前 MIS Session。

## 驗收標準
- [x] 盤中 K 線查詢零 HTTP 之 instrumentation 驗證（每查詢記錄 `http_calls` 計數，須為 0）
- [x] Single-flight 覆蓋所有可快取 Handler（§12.2）；gzip 與連線池參數生效（§12.3）
- [x] 批次化確認：MIS 15 檔/請求、法人/全市場用彙總介面（§12.4）；無逐股迴圈呼叫上游之程式碼路徑
- [x] JSON 最小化：`omitempty` 全面、`chart=false` 省略 meta、無中間 map 序列化（§12.7）
- [x] 預熱排程：08:00（行事曆+代碼表入 L2）、16:45（當日盤後）、開盤前（MIS Session 重取）；非交易日不執行（T005 行事曆）；預熱失敗不阻塞服務啟動
- [x] L2 最佳化：WAL、prepared statement、`(dataset,date)` 索引（§12.8）
- [x] 基準測試：`go test -bench` 記錄盤中 K 線組裝 P50/P95 延遲（目標 < 10ms）

## 備註
- 預熱需遵守各主機 Rate Limit（T003），預熱佇列間距 ≥ 對應 limiter 間隔
- 預熱排程為長駐 goroutine，啟動/停止需隨 Server lifecycle 管理（ctx cancel）

## 實作紀錄

### http_calls instrumentation（§12.9）
- `Envelope.HTTPCalls int64 json:"http_calls"`（無 omitempty：為驗收基準欄位，0 亦輸出）
- `App.httpCalls atomic.Int64`：`Core.Call` 開頭歸零，結束注入 Envelope；僅實際上游請求計數
- 計數點：`fetchNormalize`/`fetchRaw` miss 路徑之 fetch closure；TAIFEX `loadAPI`/DL/`discoverLatest`（PutCallRatio）
- 驗證：`TestCallGetIntradayKline/Quote` 斷言 http_calls=0（純記憶體路徑）；預熱測試含控制組（未預熱資料集 http_calls>0）

### 預熱排程（§12.9）
- `pkg/mcp/prewarm.go`：`PrewarmScheduler`（`Run(ctx)` 長駐 tick + `TickOnce` 可測）
- 三階段：08:00 行事曆+代碼表入 L2 並載入 `app.symbols`；08:45 開盤前 MIS Session（index.jsp Cookie）；16:45 當日盤後 7 任務（market_summary、institutional tse/otc、foreign_industry_holdings、abnormal tse/otc、attention_disposition）
- 跨日旗標重置；非交易日（T005 行事曆）跳過；失敗僅 `slog.Warn` 不阻塞
- Rate Limit：預熱透過各主機 `BaseClient` HostLimiter 自然節流
- lifecycle：`cmd/mcp-server/main.go` signal.NotifyContext(SIGINT/SIGTERM) → 預熱 goroutine 同 ctx；HTTP server graceful shutdown（5s）
- 測試：`prewarm_test.go` 7 測試（三階段、非交易日、失敗不阻塞、跨日重置、取消），以 httptest + `SetScheduleURL/SetListURLs/SetMISIndexURL` 鉤子隔離

### L2 最佳化驗證（§12.8，既有實作補測試）
- `TestL2Optimizations`：`PRAGMA journal_mode`=wal、索引 `idx_cache_entries_dataset_date` 存在、4 組 prepared statement 建置、EXPLAIN QUERY PLAN 確認 list 走索引

### Single-flight / gzip / 連線池驗證（§12.2/§12.3，既有實作補測試）
- `TestGetOrFetchConcurrentDedup`（既有）：20 併發同鍵 → 1 次上游
- `TestTransportConnectionPoolParams`：每主機獨立 Transport、MaxIdleConnsPerHost=8、Keep-Alive、HTTP/2、gzip 未停用
- `TestKeepAliveConnectionReuse`：連續 3 請求復用同一 TCP 連線

### JSON 最小化驗證（§12.7）
- `TestEnvelopeJSONMinimal`：chart=false 無 `_chart_meta`；`derived_from`/`source_url` 空值省略；Meta 空子欄位省略；輸出為 Normalized Model 直接序列化（無中間 map）

### 基準測試（§12.9 目標 < 10ms）
`go test ./pkg/engine/ -bench BenchmarkKlinesAssembly`（Apple M2, arm64）：
| 情境 | P50 | P95 |
|---|---|---|
| 1m 組裝（單日 270 桶） | 7µs | 11µs |
| 5m 組裝 | 38µs | 51µs |
| 15 檔 watchlist 1m（§12.4 批次上限） | 240µs | 429µs |

全部遠低於 10ms 目標；`TestKlinesAssemblyP95Below10ms` 為常駐閘門測試。

## 執行紀錄（2026-08-25 稽核）
- 驗收條目全數已有勾選；本次稽核以全域門檻複核：`go vet ./...` 通過、`go test ./...` 16 套件全綠（含契約測試/Envelope 一致性/快取一致性/壓力腳本存在性）。
- 本任務產出之模組為現行 155 註冊工具之作用中路徑（非死代碼），接線由 `cmd/mcp-server` 入口經 `App` 組裝達成；真實程序煙霧測試見 snapshots/raw/。
