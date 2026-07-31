---
github_issue: N/A
title: MIS Worker、Watchlist、RingBuffer 與重採樣引擎
type: feature
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31
---

# T006 - 盤中即時 1 分 K 引擎（MIS Worker + Aggregator）

## 目標
實作 `pkg/provider/mis_worker.go` 與 `pkg/engine/{watchlist,ringbuffer,aggregator}.go`（規格書 §8）：8s±1s 採樣、15 檔上限、記憶體重採樣出含完整影線之 1m/5m K 線。

## 驗收標準
- [ ] Watchlist 管理器（§8.2）：容量硬上限 15，覆寫式更新；狀態機 `IDLE→WARMUP→SAMPLING→FLUSH→IDLE`；非交易日不啟動（依 T005 行事曆）
- [ ] MIS Worker（§8.3）：Session 預熱（開盤前 GET index.jsp 取 Cookie）；單一請求 `ex_ch=tse_2330.tw|otc_6547.tw|...`（ex_ch 由 T005 Registry 組裝）；Jitter 置於請求前；403/429 指數退避；連續 5 tick 失敗 → `DEGRADED` 狀態 30s 重試
- [ ] MIS 原生欄位轉換（`z/v/tv/tlong/o/h/l/y/c` → 標準欄位與單位）
- [ ] RingBuffer（§8.4）：固定容量 2025、O(1) append/overwrite、per-symbol（sharded map）
- [ ] 重採樣（§8.4 規則表）：Open=桶首 z、High=max、Low=min、Close=桶末 z、Volume=桶末 tv−桶初 tv；5m 由 1m 二次聚合
- [ ] 單元測試：使用錄製之 MIS Snapshot fixtures，驗證 OHLC 影線正確（含單桶多 snapshot、跨分鐘桶、重啟日清零）
- [ ] `get_intraday_kline` 讀取路徑為純記憶體（RWMutex per symbol），零 HTTP

## 備註
- 13:30–13:35 FLUSH 需將最後一根 K 線補齊（收盤競價時段資料不遺失）
- 不可放大 Watchlist 上限，超過 15 檔直接錯誤（§8.2 硬限制）
