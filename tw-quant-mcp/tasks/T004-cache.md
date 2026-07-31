---
github_issue: N/A
title: 三層快取引擎（L1 Ristretto / L2 SQLite / Single-flight）
type: infrastructure
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31
---

# T004 - 快取引擎

## 目標
實作 `pkg/cache`：L1 記憶體快取（Ristretto）、L2 磁碟快取（SQLite WAL）、TTL 政策表（§4.2）、快取鍵設計（§4.3）與 Single-flight（§12.2）。

## 驗收標準
- [x] L1：Ristretto 實作，set/get/delete；L2：SQLite（WAL mode、prepared statement、`(dataset, date)` 索引）
- [x] 快取鍵：`sha256(source_id|dataset|data_date|symbol|params_hash)[0:16]`（§4.3）
- [x] TTL 政策表 `policy.go` 為唯一真值，對應 §4.2：MIS Snapshot 4s、日線盤中 60s/盤後至隔日 08:00、財報 12h、TAIFEX 歷史永久等
- [x] `GetOrFetch(ctx, key, ttl, fetchFn)` 泛型介面：miss 時經 Single-flight 合流，僅一次上游呼叫
- [x] 快取命中於 `_lineage` 標記 `is_cached=true` + `cache_ttl`（由 model 層注入）
- [x] L2 支援資料目錄可設定（`DATA_DIR`），進程重啟後歷史資料仍在
- [x] 單元測試：命中/未命中、TTL 過期、併發同鍵僅一次上游呼叫（計數器驗證）、L2 持久化重啟可用

## 實作記錄（2026-07-31）

### 產出（`pkg/cache`，5 實作檔 + 4 測試檔）
| 檔案 | 內容 |
|---|---|
| `policy.go` | §4.2 政策表唯一真值：`Policy{Intraday, Post, AllowL2}` × 10 資料類別；`TTLFor(dataset, now)` 盤中/盤後（16:30 分界）判定，盤後「至隔日 08:00」以 `PostUntilNext8AM` 計算，MIS 盤後回傳不可快取；`AllowL2(dataset)` 僅 MIS 不允許入 L2；`ForeverTTL=0` 代表永久 |
| `key.go` | §4.3 快取鍵：`sha256(source_id\|dataset\|data_date\|symbol\|params_hash)[0:16]` 回傳 16 字元 hex；params 排序連綴後再取 sha256 前 16 為 params_hash |
| `l1.go` | Ristretto（NumCounters 1e7 / MaxCost 256MB / BufferItems 64）；`set` 寫入後呼叫 `Wait()` 保證 read-through 可見性（見設計決策 2） |
| `l2.go` | SQLite（modernc.org/sqlite，CGO-free）：WAL + synchronous=NORMAL + busy_timeout、prepared statement × 4（get/set/del/list）、`(dataset, data_date)` 索引、`expires_at` 以 **unix 毫秒** 儲存（見決策 3）、`list` 供 §12.8 預熱/清掃消費 |
| `cache.go` | `New(opts...)`（`WithDataDir` 開啟 L2，未設定則純 L1）；泛型 `GetOrFetch[T](ctx, key, ttl, fetch, opts...)` → `(T, fromCache, error)`：L1 → L2（僅 policy 允許類別）→ singleflight 合流；`WithDataset(dataset, date)` / `SkipL2()` 選項；L2 命中回填 L1（剩餘 TTL）；`MarkCacheHit(env, ttl)` 注入 `_lineage.is_cached/cache_ttl` |

### 設計決策與測試發現
1. **L2 資格雙門檻**：`AllowL2(dataset)`（§4.1 用途欄）+ `l2WriteMinTTL = 10min` 寫入門檻——盤中 4s/30s/60s 資料一律不落盤（§4.2 備註：盤中 K 線路徑不可進入 L2），12h/24h/盤後至隔日 08:00/永久則入 L2；`SkipL2()` 供即時路徑強制略過。
2. **ristretto 非同步寫入陷阱**：`Set` 為 buffered，緊接的 `Get` 可能 miss（read-through 會被誤判為 miss 而重抓上游）；於 `set` 後呼叫 `Wait()` 確保寫入可見。
3. **秒精度陷阱**：L2 `expires_at` 以 `Unix()` 儲存會將 60ms 級 TTL 截斷為當秒即過期（測試抓到）；改為 `UnixMilli()`。
4. **singleflight 語義**：共享結果屬「剛抓取」非快取命中，waiters 之 `fromCache=false`；`fromCache=true` 僅出現於 L1/L2 直接命中。
5. **泛型限制**：Go 不允許 method 帶 type parameter，`l1Get`/`l2Get` 為套件級泛型函式。
6. **錯誤不快取**：fetch 失敗不進快取（singleflight 失敗後自動 Forget），下次呼叫可重試。
7. **L2 best-effort**：回填 L2 序列化/寫入失敗不影響回應（僅 L1 已生效）。
8. **go.mod**：ristretto v0.2.0 / x-sync v0.22.0 / modernc.org/sqlite v1.55.0 手動提升至 direct block（未執行 `go mod tidy`）。

### 驗證結果（全數通過）
- `go build ./...`、`go vet ./...`、`go test ./...`、`make lint` — OK
- 測試涵蓋：§4.2 全 10 類別盤中/盤後 TTL、16:30 分界、週末盤後至週一 08:00、未登錄類別、AllowL2 全表；§4.3 鍵值 golden 比對（shasum 預算）+ 確定性 + 鍵序無關 + 輸入變更區別 + 16 字元 hex；命中/未命中（計數器）、TTL 過期重抓、20 併發同鍵僅 1 次上游、錯誤不進快取、空鍵拒絕；L2 重啟持久化（12h 與永久 TTL）、短 TTL 不落盤、SkipL2、MIS 永不入 L2、L2 命中回填 L1、upsert、過期惰性清除、(dataset,date) 索引 list
- T001/T002/T003 測試不受影響（provider 之 `TestWaitSequentialTiming` 於全套件平行執行時偶發抖動，單獨重跑 5 次全過，為既有測試非本次引入）

### 後續任務銜接
- T005+：Engine 以 `TTLFor(dataset, model.Now())` 取得 TTL，`KeyString` 建鍵，`GetOrFetch` 包裹 fetchFn，命中時 `MarkCacheHit` 注入 lineage
- T018：L2 `list(dataset, date)` 為 16:45 盤後預熱 / 08:00 前預熱之掃描介面

## 備註
- 盤中 K 線查詢路徑不可進入 L2（僅 L1 4s TTL），避免磁碟 I/O 拖慢延遲
- TAIFEX 歷史資料（§9）為 L2 永久 TTL 之主要消費者
