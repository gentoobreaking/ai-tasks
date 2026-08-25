---
github_issue: N/A
title: MIS Worker、Watchlist、RingBuffer 與重採樣引擎
type: feature
priority: high
status: done
assignee: pi with opencode/x-preview-f-free
created: 2026-07-31
updated: 2026-07-31
depends_on: []
---

# T006 - 盤中即時 1 分 K 引擎（MIS Worker + Aggregator）

## 目標
實作 `pkg/provider/mis_worker.go` 與 `pkg/engine/{watchlist,ringbuffer,aggregator}.go`（規格書 §8）：8s±1s 採樣、15 檔上限、記憶體重採樣出含完整影線之 1m/5m K 線。

## 驗收標準
- [x] Watchlist 管理器（§8.2）：容量硬上限 15，覆寫式更新；狀態機 `IDLE→WARMUP→SAMPLING→FLUSH→IDLE`；非交易日不啟動（依 T005 行事曆）
- [x] MIS Worker（§8.3）：Session 預熱（開盤前 GET index.jsp 取 Cookie）；單一請求 `ex_ch=tse_2330.tw|otc_6547.tw|...`（ex_ch 由 T005 Registry 組裝）；Jitter 置於請求前；403/429 指數退避；連續 5 tick 失敗 → `DEGRADED` 狀態 30s 重試
- [x] MIS 原生欄位轉換（`z/v/tv/tlong/o/h/l/y/c` → 標準欄位與單位）
- [x] RingBuffer（§8.4）：固定容量 2025、O(1) append/overwrite、per-symbol（sharded map）
- [x] 重採樣（§8.4 規則表）：Open=桶首 z、High=max、Low=min、Close=桶末 z、Volume=桶末 tv−桶初 tv；5m 由 1m 二次聚合
- [x] 單元測試：使用錄製之 MIS Snapshot fixtures，驗證 OHLC 影線正確（含單桶多 snapshot、跨分鐘桶、重啟日清零）
- [x] `get_intraday_kline` 讀取路徑為純記憶體（RWMutex per symbol），零 HTTP

## 實作記錄
- 官方 MIS 實測（2026-07-31 18:51）：`mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_2330.tw|otc_6547.tw` → 200（1732B，fixture 來源）。欄位語意實證：
  - `v`=56896 張為**當日累積**成交量、`tv`=4512 張為**當分鐘累積**量（=ps 4411+fv 156=4567 收盤競價分鐘）→ 與規格 §8.3 標籤相反，依實地資料對映：v→CumulativeVol、tv→MinuteVol
  - `c`=股票代號（非漲跌）；漲跌 = z−y（2330: +220）
  - tlong=1785479400000 = 2026-07-31 14:30:00+08:00；t=13:30:00
  - 單位：價格 4 位小數→2 位（元）、量 張→股（×1000）
- 交叉驗證：TWSE STOCK_DAY 2026-07-31（收 2425/高 2425/低 2345/昨收 2205）與 MIS o/h/l/y（2350/2425/2345/2205）全對上；MIS v=56.9M 股 < 官方日量 69.5M（收盤競價時段差異）
- Session 預熱：`/stock/index.jsp` 現況 404 且不設 cookie（官方改版），API 無 cookie 仍 200 → warmup 404 容錯（僅 Warn 不阻斷），同頁面另測 `/stock/` 200
- 狀態機時點：WARMUP 08:59:30–09:00:00、SAMPLING 09:00–13:30、FLUSH 13:30–13:35、其餘 IDLE；DEGRADED 為正交旗標（僅盤中時段 Advance 回傳）
- RingBuffer：RingCapacity=2025（4.5h×450 筆）、per-symbol map + RWMutex；重採樣 1m 桶（HH:MM:00，Volume=末 tv−初 tv、單筆桶用該筆 tv）、5m 由 1m 二次聚合（自 09:00 對齊）
- 測試教訓：熔斷（§4.4 連續 5 失敗→主機暫停 60s）會封鎖 DEGRADED 恢復測試 → 注入熔斷時鐘（`WithBreakerNow`）；日清零測試原為時序 race（重置與重填同一迭代）→ 改採樣失敗情境使空窗可確定觀測；RingBuffer 覆寫測試斷言筆誤（4 容量 7 追加存活為 4..7）；Watchlist 上限測試同代碼被去重
- 驗證：`go build ./... && go vet ./... && go test ./... -count=1 -race` 全 8 套件通過、gofmt 乾淨

## 備註
- 13:30–13:35 FLUSH 需將最後一根 K 線補齊（收盤競價時段資料不遺失）
- 不可放大 Watchlist 上限，超過 15 檔直接錯誤（§8.2 硬限制）

## 執行紀錄（2026-08-25 稽核）
- 驗收條目全數已有勾選；本次稽核以全域門檻複核：`go vet ./...` 通過、`go test ./...` 16 套件全綠（含契約測試/Envelope 一致性/快取一致性/壓力腳本存在性）。
- 本任務產出之模組為現行 155 註冊工具之作用中路徑（非死代碼），接線由 `cmd/mcp-server` 入口經 `App` 組裝達成；真實程序煙霧測試見 snapshots/raw/。
