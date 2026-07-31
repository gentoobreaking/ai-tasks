# `tw-quant-mcp` 專案開發規格書 (v1.3.0)

**System Architecture & Development Specification with Real-time Intraday Engine**

本文件定義以 Go 語言實作之量化、盤後籌碼與**盤中即時 1 分 K 線 MCP Server**——**`tw-quant-mcp`**。

---

## 0. 版本變更記錄

| 版本 | 變更重點 |
|---|---|
| v1.2 | 首版：引入盤中 1 分 K 引擎、15 檔 Watchlist、RingBuffer、MIS Worker 雛形 |
| **v1.3** | ① 統一版本編號與章節結構；② 新增「資料來源登錄（Source Registry）」僅限官方免費來源；③ 貫徹 Data Lineage（`_lineage` 標準化、來源角色 canonical/helper、處理管線定義）；④ 三層快取策略與 TTL 政策表（防 Rate Limit）；⑤ Schema 歸一化規則（時間、單位、欄位命名、Response Envelope）；⑥ 修正 MIS Jitter 時序錯誤（延遲置於請求**前**）並加入請求級 rate limiter；⑦ 新增 TAIFEX 官方網站下載頁歷史回溯模組（openapi 僅供最新交易日）；⑧ 補齊 10 大投資情境之完整 MCP Tool 目錄；⑨ 圖表化設計標準化（`_chart_meta`）；⑩ 效能最佳化原則（Single-flight、連線池、批次化、增量計算）。 |

---

## 1. 專案願景與設計原則

本專案遵守以下七項設計原則：

1. **官方唯一（Official-only）**：資料來源鎖定免費、可信任的官方來源——TWSE（含 OpenAPI / Web API / MIS）、TPEx OpenAPI、MOPS 公開資訊觀測站、TAIFEX（含 OpenAPI 與官方網站下載頁）。**禁止**第三方網站抓取作為 production 資料來源；第三方僅可作為人工比對參考（不進入程式路徑）。
2. **血統透明（Data Lineage）**：每筆回傳資料皆附 `_lineage`——來源機構、來源角色、抓取時間、資料日期、新鮮度分級、採樣頻率、快取狀態與延遲。
3. **防封鎖（Anti-Throttling）**：內建請求級 Rate Limiter、Cookie 預熱、Session Pool、Batch Chunking、Jitter（置於請求**前**）與 Circuit Breaker，確保不觸發官方 IP 封鎖。
4. **欄位歸一化（Schema Normalization）**：所有對外欄位經統一 Envelope 與單位/時間/命名規則歸一化，對外永不直接回傳 raw payload。
5. **模組化（Modularity）**：Provider / Cache / Engine / Model / Chart / MCP 六層職責分離，可獨立測試與替換。
6. **效能最佳化（Performance）**：快取優先、Single-flight 去重、連線池、批次請求、記憶體增量計算。
7. **圖表親和（Chart Readiness）**：所有時間序列資料皆輸出標準化 Series 與 `_chart_meta` 描述，供日後前端/AI Agent 直接渲染。

---

## 2. 資料來源登錄（Source Registry）

> 唯一允許進入程式碼的資料來源清單。新增任何來源前必須更新本表並通過 review。

| ID | 來源 | 存取方式 | 內容範圍 | 新鮮度 | 角色 |
|---|---|---|---|---|---|
| TWSE-API | `openapi.twse.com.tw` | HTTP GET / JSON | 公司治理、ESG、個股日收盤、外資持股、權證、ETF、指數 | 盤後（約 16:30 起） | canonical |
| TWSE-WEB | `www.twse.com.tw/exchangeReport/*` | HTTP GET / JSON | 個股日 K、月均價、融資融券、三大法人買賣超（上市）、全市場收盤行情、加權指數歷史、鉅額交易、當日/異常成交量統計 | 盤後（約 16:30 起）/ 盤中部分即時 | canonical |
| TWSE-MIS | `mis.twse.com.tw/stock/api/getStockInfo.jsp` | HTTP GET / JSON（需 Session Cookie） | 盤中即時多股 Snapshot（價量、五檔、累積量） | 即時（8 秒採樣） | canonical |
| TPEx-API | `www.tpex.org.tw/openapi` | HTTP GET / JSON | 上櫃日收盤、上櫃三大法人、本益比、融資融券、注意/處置股、除權息、零股、指數 | 盤後 | canonical |
| MOPS | `mops.twse.com.tw` | HTTP GET / JSON | 月營收、財報三表、重大訊息、公司基本資料 | 盤後（申報後） | canonical |
| TAIFEX-API | `openapi.taifex.com.tw` | HTTP GET / JSON | 三大法人期貨/選擇權部位、大額交易人未沖銷部位、每日行情、Put/Call Ratio、保證金 | **僅最新一個交易日** | canonical（hot tier） |
| TAIFEX-DL | `www.taifex.com.tw/cht/3/*DateDown*` | HTTP GET / CSV 下載 | 期貨每日 OHLC 歷史、三大法人期貨部位歷史、Put/Call Ratio 歷史、大額交易人部位歷史、選擇權每日 OHLC | 歷史回溯（T-1 起） | canonical（cold tier） |

### 2.1 角色定義

- **canonical**：直接來自官方機構之原始資料，為唯一真值來源。
- **helper**：由 canonical 資料派生之計算結果（如 VWAP、指標、篩選），`_lineage.derived_from` 需標明。
- **fallback**：官方 A 來源缺資料時改用官方 B 來源（如上市用 TWSE、上櫃用 TPEx），需標註實際使用來源。

### 2.2 來源契約（每個 Adapter 需實作）

```go
type SourceContract interface {
    ID() string                       // 對應上表 ID
    Fetch(ctx context.Context, req RawRequest) (*RawResponse, error)
    Validate(raw *RawResponse) error  // schema 檢查（欄位存在性、數值範圍、日期一致性）
    Normalize(raw *RawResponse) ([]byte, error) // 轉為 Normalized Model
}
```

---

## 3. Data Lineage 標準

### 3.1 處理管線（Processing Pipeline）

```text
source fetch → raw capture（含原文 hash）→ validation / schema check
→ normalize → cache store → response shaping（附 _lineage）→ MCP 回傳
```

- raw payload 僅在內部暫存，**絕不回傳**給 Client。
- `_lineage` 由 response shaping 階段統一注入，任何 Handler 不得自行偽造。

### 3.2 Lineage 資料結構（`pkg/model/lineage.go`）

```go
type Lineage struct {
    Source       string    `json:"source"`          // "TWSE_WEB", "TWSE_MIS", "TPEX_API", "MOPS", "TAIFEX_API", "TAIFEX_DL"
    SourceRole   string    `json:"source_role"`     // "canonical" | "helper" | "fallback"
    DerivedFrom  []string  `json:"derived_from,omitempty"` // helper 資料的父資料集 ID
    FetchedAt    time.Time `json:"fetched_at"`      // RFC3339（Asia/Taipei）
    DataDate     string    `json:"data_date"`       // 資料歸屬日期 YYYY-MM-DD
    Freshness    string    `json:"freshness"`       // REALTIME_INTRADAY | POST_MARKET_TODAY | HISTORICAL
    SamplingSec  int       `json:"sampling_sec"`    // 採樣間隔（秒）；非採樣資料為 0
    IsCached     bool      `json:"is_cached"`       // 是否命中快取
    CacheTTL     int       `json:"cache_ttl"`       // 本次快取 TTL（秒）
    LatencyMS    int64     `json:"latency_ms"`      // 端到端耗時（含 cache 命中時仍計算）
    SourceURL    string    `json:"source_url"`      // 實際請求的官方 URL（debug 用）
}
```

### 3.3 統一 Response Envelope（`pkg/model/envelope.go`）

所有 MCP Tool 回傳一律包裹下列結構：

```go
type Envelope struct {
    Data      interface{} `json:"data"`                 // 業務資料
    Lineage   Lineage     `json:"_lineage"`
    ChartMeta interface{} `json:"_chart_meta,omitempty"` // 見 §11
}
```

---

## 4. 快取策略（Caching）與 Rate Limit 防護

### 4.1 三層快取

| 層級 | 實作 | 用途 | 存取時間 |
|---|---|---|---|
| L1 記憶體 | Ristretto（LFU，TinyLFU） | 熱資料：盤中 Snapshot、當日盤後資料 | < 1ms |
| L2 本地磁碟 | SQLite（WAL mode，prepared statement） | TAIFEX 歷史回溯、日線盤後快照、交易日曆、除權息行事曆、公司代碼表 | ~1ms |
| L3 遠端 | 不實作（本專案一律直連官方，不做第三方代理） | — | — |

### 4.2 快取 TTL 政策表（`pkg/cache/policy.go` 之唯一真值來源）

| 資料類別 | 盤中 | 盤後（16:30 後） | 說明 |
|---|---|---|---|
| MIS Snapshot / 即時 K 線 | 4s（短於採樣週期，純去重） | —（盤後不查） | 快取鍵含 `snapshot_epoch` 10 秒桶 |
| 日線/週線/月線 K 線 | 60s（盤中該日最後一根持續更新） | 至隔日 08:00 永久 | 隔日開盤前由排程預熱 |
| 三大法人買賣超 | 60s | 至隔日 08:00 | 15:00 後即穩定 |
| 融資融券 | 60s | 至隔日 08:00 | |
| 注意/處置股 | 30s | 至隔日 08:00 | |
| 月營收 | 12h | 12h | 申報日 15:00 後更新 |
| 財報三表 | 12h | 12h | |
| 重大訊息 | 5min | 5min | |
| 交易日曆 / 公司代碼表 | 24h | 24h | 啟動時載入 |
| TAIFEX 歷史回溯（download 解析結果） | 永久 | 永久 | 存 L2，以 (dataset, date) 為鍵 |

### 4.3 快取鍵設計

```
cache_key := sha256(source_id | dataset | data_date | symbol | params_hash)[0:16]
```

- 除錯時快取鍵寫入 `_lineage.source_url` 旁之 `cache_key` 欄位（僅 debug mode）。
- 所有可快取 Handler 一律經 Single-flight 包裹（見 §12.3），同鍵併發只觸發一次上游請求。

### 4.4 請求級 Rate Limit（`pkg/provider/ratelimit.go`）

| 目標主機 | 全域限制（預設） | 說明 |
|---|---|---|
| `mis.twse.com.tw` | 1 req / 8s ± jitter(±1s) | 採樣引擎專用；Watchlist 上限 15 檔/請求 |
| `www.twse.com.tw` | 1 req / 2s | 批次介面優先（全市場行情一次一檔 vs 全市場分檔） |
| `openapi.twse.com.tw` | 1 req / 1s | |
| `www.tpex.org.tw` | 1 req / 1s | |
| `mops.twse.com.tw` | 1 req / 2s | 財報/營收為大檔，控制並發度 |
| `openapi.taifex.com.tw` | 1 req / 1s | 僅最新交易日（hot tier） |
| `www.taifex.com.tw` | 1 req / 5s | 下載頁為大 CSV；解析後永久入 L2，重複下載極少 |

- 實作：`golang.org/x/time/rate`（每主機獨立 Limiter）+ `rand ±20%` jitter + 403/429 指數退避（1s→2s→4s，上限 30s）+ 熔斷（連續 5 次失敗，主機暫停 60s）。
- **Jitter 一律置於請求發出之前**（v1.2 的 sleep-after 為已知錯誤，已修正）。

---

## 5. Schema 歸一化（Schema Normalization）

### 5.1 命名與型別規則

| 規則 | 說明 |
|---|---|
| 欄位命名 | `snake_case`、全小寫；布林欄位 `is_` / `can_` 前綴 |
| 時間 | 一律 `RFC3339`（Asia/Taipei）；純日期用 `YYYY-MM-DD`；盤中 K 線用 `HH:MM:00` |
| 價格 | 一律「元」（float64，保留 2 位）；**TWSE Web API 之單位需於 Adapter 內換算** |
| 成交量 | 一律「股」（int64）；TWSE 之「張」於 Adapter 內 ×1000 換算 |
| 成交值 | 一律「元」（int64）；TWSE 之「仟元」於 Adapter 內 ×1000 換算 |
| 百分比 | 一律 %（如 `1.48` = 1.48%），不混用小數比例 |
| 缺值 | 用 `null`；空陣列用 `[]`；禁止空字串代表缺值 |
| 數量 | 一律使用官方最新資料（不自行做現增股數調整）；還原價格僅在 `adjust=true` 時輸出 |

### 5.2 代號系統（`pkg/model/symbol.go`）

所有工具輸入之 `symbol` 統一為 6 碼數字字串（`"2330"`），市場別由 Symbol Registry 判定：

```go
type Symbol struct {
    Code     string `json:"code"`      // "2330"
    Market   string `json:"market"`    // "tse" | "otc"
    Name     string `json:"name"`
    Category string `json:"category"`  // 產業別（來自 TWSE/TPEx 官方分類）
}
```

- Registry 來源：TWSE/TPEx 官方上市上櫃公司清單 openapi，每日預熱入 L2。
- MIS `ex_ch` 組裝一律由此 Registry 產出（`tse_2330.tw` / `otc_6547.tw`），禁止簡易猜測（v1.2 已知缺失）。

### 5.3 共通 K 線模型（盤中/日線/期貨共用，`pkg/model/candle.go`）

```go
type Candle struct {
    Timestamp string  `json:"timestamp"` // 盤中 "HH:MM:00"；盤後/期貨 "YYYY-MM-DD"
    Open      float64 `json:"open"`
    High      float64 `json:"high"`
    Low       float64 `json:"low"`
    Close     float64 `json:"close"`
    Volume    int64   `json:"volume"`
    Amount    int64   `json:"amount,omitempty"`
}
```

---

## 6. 系統總體架構（System Architecture）

```text
┌────────────────────────────────────────────────────────────────────────┐
│                  MCP Clients (Claude Desktop / Cursor / 自訂 Client)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ JSON-RPC (Stdio / Streamable HTTP)
┌───────────────────────────────────▼────────────────────────────────────┐
│                         MCP Engine Layer (pkg/mcp)                     │
│      Tool Registry / Schema Validation / Response Envelope 注入         │
└───────────────────────────────────┬────────────────────────────────────┘
┌───────────────────────────────────▼────────────────────────────────────┐
│                  Core Domain & Engine Services (pkg/engine)            │
│  ┌──────────────────────────┐  ┌────────────────────────────────────┐  │
│  │ Intraday Kline Engine    │  │ Composite Analysis Engines         │  │
│  │ - Watchlist (≤15)        │  │ - 財報體檢 / 篩選 / 熱點 / 風險掃描   │  │
│  │ - 8s Poller + RingBuffer │  │   （純記憶體+快取，不重複抓上游）      │  │
│  └──────────────────────────┘  └────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Cache Engine (L1 Ristretto / L2 SQLite / Single-flight / TTL)    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Request Rate Limiter（每主機）+ Jitter + Circuit Breaker          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
┌───────────────────────────────────▼────────────────────────────────────┐
│                 Official Provider Adapters (pkg/provider)              │
│ ┌───────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌─────────────┐  │
│ │ TWSE      │ │ TPEx     │ │ MOPS     │ │ TAIFEX    │ │ MIS Worker  │  │
│ │ (OpenAPI+ │ │ Adapter  │ │ Adapter  │ │ Adapter   │ │ (Session+   │  │
│ │  WebAPI)  │ │          │ │          │ │ (API+DL)  │ │ 8s Poller)  │  │
│ └───────────┘ └──────────┘ └──────────┘ └───────────┘ └─────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Resilient HTTP Client（keep-alive / gzip）
              [ openapi.twse.com.tw | www.twse.com.tw | mis.twse.com.tw |
                www.tpex.org.tw | mops.twse.com.tw | openapi.taifex.com.tw |
                www.taifex.com.tw ]
```

---

## 7. 模組化目錄結構（Module Layout）

```text
tw-quant-mcp/
├── cmd/
│   └── mcp-server/              # 入口點
│       └── main.go
├── pkg/
│   ├── mcp/                     # MCP Server 初始化、Tool 註冊、Envelope 注入
│   ├── model/                   # 統一資料結構（Envelope / Lineage / Symbol / Candle）
│   ├── provider/
│   │   ├── client.go            # Resilient HTTP Client（Session / gzip / keep-alive）
│   │   ├── ratelimit.go         # 每主機 Rate Limiter + Jitter + Circuit Breaker
│   │   ├── twse.go              # TWSE OpenAPI + Web API（盤後）
│   │   ├── tpex.go              # TPEx OpenAPI
│   │   ├── mops.go              # MOPS 財報/營收/重大訊息
│   │   ├── taifex_api.go        # TAIFEX OpenAPI（最新交易日）
│   │   ├── taifex_dl.go         # TAIFEX 下載頁歷史回溯（CSV → L2）
│   │   └── mis_worker.go        # MIS 盤中 Poller + Session 維持 + Watchlist 批次
│   ├── engine/
│   │   ├── watchlist.go         # 動態觀察清單管理器（≤15 檔）
│   │   ├── ringbuffer.go        # 固定容量 2025 之 RingBuffer
│   │   ├── aggregator.go        # Snapshot → 1m/5m Candle 重採樣
│   │   ├── vwap.go              # 增量 VWAP / 支撐壓力位
│   │   ├── surge.go             # 急拉爆量偵測（滑動窗口）
│   │   └── composite/           # 財報體檢、篩選、熱點、風險掃描
│   ├── cache/                   # L1 Ristretto / L2 SQLite / Single-flight / TTL policy
│   ├── chart/                   # ChartMeta 產生器（見 §11）
│   └── calendar/                # 交易日曆（官方休市資料）
├── go.mod
└── go.sum
```

---

## 8. 盤中即時 1 分 K 引擎（核心）

### 8.1 設計目標

MIS 每 1 分鐘單次抓取會遺失 High/Low 影線，故以 **8 秒 ± 1 秒 Jitter** 高頻採樣 + 記憶體重採樣，產出含真實上下影線的 1 分/5 分 K 線，全程不觸發 MIS 封鎖。

### 8.2 Watchlist 管理器（`pkg/engine/watchlist.go`）

- 容量硬性上限 **15 檔**；`set_active_watchlist` 可覆寫。
- 單檔維度：`symbol`、名稱、市場別（來自 Symbol Registry）。
- 狀態機：`IDLE → WARMUP(9:00±30s) → SAMPLING(9:00–13:30) → FLUSH(13:30–13:35) → IDLE`；非交易日由交易日曆判定，不啟動 Poller。

### 8.3 Poller（`pkg/provider/mis_worker.go`）

- 每 tick（8s ± 1s jitter，**置於請求前**）：單一 GET 請求
  `ex_ch=tse_2330.tw|tse_2317.tw|otc_6547.tw|...`（單次 QPS ≈ 0.12，安全值）。
- Session 預熱：啟動與每日開盤前先 GET `mis.twse.com.tw/stock/index.jsp` 取 Cookie；User-Agent 維持瀏覽器樣式。
- 回應欄位取用（MIS 原生欄位，Adapter 內轉換）：`z`（成交價）、`v`（當分鐘量）、`tv`（累積量）、`tlong`（毫秒時間戳）、`o/h/l/y`（開/高/低/昨收）、`c`（漲跌）。
- 403/429 → 指數退避 + 熔斷（見 §4.4）；連續 5 tick 失敗則狀態機轉 `DEGRADED`，改為 30s 重試並以事件記錄進 Log。

### 8.4 RingBuffer 與重採樣（`pkg/engine/ringbuffer.go` / `aggregator.go`）

```go
const (
    SamplingInterval = 8 * time.Second
    RingCapacity     = 2025   // 4.5h × 450 samples/h
    WatchlistMax     = 15
)

// RingBuffer：固定容量、O(1) append/overwrite，不可擴張
type RingBuffer struct {
    buf  []Snapshot
    head int
    n    int
}
```

重採樣規則（依 Snapshot 的 `tlong` 分桶到 `HH:MM:00`）：

| Candle 欄位 | 計算 |
|---|---|
| Open | 桶內第一個 Snapshot 的 `z` |
| High | `max(桶內所有 z)` |
| Low | `min(桶內所有 z)` |
| Close | 桶內最後一個 Snapshot 的 `z` |
| Volume | 桶末 `tv` − 桶初 `tv` |

- 5m K 線由 1m 桶二次聚合（不重複計算）。
- `get_intraday_kline` **純記憶體讀取**（絕不打 HTTP），O(bars) 組裝即時回傳。

### 8.5 盤中衍生計算（增量、不掃全量）

- VWAP：`Σ(p×v) / Σv` 增量累計（`pkg/engine/vwap.go`）。
- 爆量偵測：維護前 20 分鐘量之滑動窗口均值，`volume_ratio = 近 N 分鐘量 / 窗口均值`（`pkg/engine/surge.go`）。
- 支撐/壓力：當日高低點 + Fibonacci（0.382/0.5/0.618）。

---

## 9. TAIFEX 歷史回溯模組（`pkg/provider/taifex_dl.go`）

### 9.1 背景

`openapi.taifex.com.tw` 僅提供**最新一個交易日**。為支援歷史回溯查詢，本模組串接期交所官方下載頁（`www.taifex.com.tw/cht/3/*DateDown*`）之每日 CSV。

### 9.2 資料集對應

| Dataset | 下載頁 | 輸出工具 |
|---|---|---|
| 期貨每日 OHLC（台指期等） | 期貨每日交易行情 | `get_futures_daily_ohlc` / `get_futures_history` |
| 三大法人期貨部位歷史 | 三大法人期貨及選擇權交易量 | `get_institutional_futures_history` |
| Put/Call Ratio 歷史 | 選擇權 Put/Call 比 | `get_put_call_ratio`（支援歷史） |
| 大額交易人未沖銷部位歷史 | 大額交易人未沖銷部位 | `get_large_trader_positions`（支援歷史） |
| 選擇權每日 OHLC | 選擇權每日交易行情 | `get_options_daily_ohlc` |

### 9.3 流程與快取

```text
查詢 (dataset, date)
  → 檢查 L2（命中→回傳）
  → 檢查 openapi（僅當 date == 最新交易日）
  → 否則下載對應 CSV（rate limit 1 req/5s）
  → 解析 → 驗證（欄位數、數值、日期）→ Normalize → 寫入 L2（永久 TTL）
  → 回傳（_lineage.source = "TAIFEX_DL", freshness = "HISTORICAL"）
```

- CSV 解析結果之單位（契約數/口/元）依資料集寫死於 Adapter 對應表，並於 Normalize 階段統一為「口」與「元」。
- 單日下載失敗：可退而求其次由鄰近交易日補檔（標註 `derived_from`），或以 `null` 回傳並註明缺口。

---

## 10. MCP Tool 目錄（對應 10 大投資情境）

所有工具皆回傳 §3.3 Envelope。`(盤)` = 盤中即時，`(後)` = 盤後。

### A. 盤中即時引擎
| Tool | 情境 | 輸入 | 輸出 |
|---|---|---|---|
| `set_active_watchlist` (盤) | 引擎控制 | `symbols[1..15]` | 觀察清單確認 |
| `get_intraday_kline` (盤) | 個股趨勢研判 | `symbol, timeframe("1m"/"5m"), limit` | `Candle[]` + `_chart_meta` |
| `get_intraday_quote` (盤) | 個股趨勢研判 | `symbol` | 即時報價 + 五檔 |
| `get_intraday_vwap` (盤) | 當沖風控 | `symbol` | VWAP / 高低點 / 支撐壓力 |
| `detect_volume_surge` (盤) | 市場熱點捕捉 | `symbol, minutes` | 爆量/急拉訊號 |
| `scan_daytrade_eligibility` (盤) | 買前風險掃描 | `symbol` | 當沖資格/處置/注意/停資停券 |

### B. 盤後行情與籌碼
| Tool | 情境 | 輸入 | 輸出 |
|---|---|---|---|
| `get_stock_daily_quote` (後) | 個股趨勢研判 | `symbol, date` | 日報價 + 技術指標（MA20/60、RSI、MACD，helper） |
| `get_stock_daily_kline` (後) | 個股趨勢研判 | `symbol, period(day/week/month), adjust` | `Candle[]` |
| `get_market_summary` (後) | 市場熱點捕捉 | `date` | 全市場漲跌家數/成交量/漲跌停 |
| `get_institutional_investors` (後) | 三大法人籌碼流向 | `market(tse/otc), date` | 三大法人買賣超（個股+彙總） |
| `get_foreign_industry_holdings` (後) | 外資投資解讀 | `date` | 外資產業配置 |
| `get_foreign_shareholding_history` (後) | 外資投資解讀 | `symbol, range` | 外資持股歷史 |
| `get_margin_trading` (後) | 籌碼面 | `symbol, date` | 融資融券 |
| `get_abnormal_trading` (後) | 市場熱點捕捉 | `market, date, top_n` | 異常成交量放大排名 |
| `get_warrant_activity` (後) | 市場熱點捕捉 | `date` | 權證活躍度（成交金額/漲幅排名） |

### C. 重大訊息與風險
| Tool | 情境 | 輸入 | 輸出 |
|---|---|---|---|
| `get_major_announcements` (後) | 市場熱點捕捉 | `date, symbol?, keyword?` | MOPS 重大訊息 |
| `get_attention_disposition_stocks` (後) | 買前風險掃描 | `market, date` | 注意股/處置股清單 |

### D. 基本面與篩選
| Tool | 情境 | 輸入 | 輸出 |
|---|---|---|---|
| `get_financial_statements` (後) | 個股財報體檢 | `symbol, period, statement(income/balance/cashflow)` | 財報三表 |
| `get_monthly_revenue` (後) | 個股財報體檢 | `symbol, years` | 月營收 + 成長率 |
| `get_financial_health_check` (後) | 個股財報體檢 | `symbol` | 五面向評分（獲利/成長/結構/配息/治理） |
| `get_valuation_ratios` (後) | 投資標的篩選 | `symbol` | PE/PB/ROE/殖利率 |
| `get_esg_report` (後) | 投資標的篩選 | `symbol` | ESG/公司治理指標（TWSE OpenAPI） |
| `get_company_profile` (後) | 個股財報體檢 | `symbol` | 公司基本資料 |
| `screen_stocks` (後) | 投資標的篩選 | `criteria(value/growth/esg), filters` | 符合條件股票清單 |

### E. 股利
| Tool | 情境 | 輸入 | 輸出 |
|---|---|---|---|
| `get_dividend_history` (後) | 股利投資規劃 | `symbol` | 配息歷史 + 穩定性分析 |
| `get_exdividend_calendar` (後) | 股利投資規劃 | `start, end` | 除權息行事曆 |
| `screen_high_yield` (後) | 股利投資規劃 | `min_yield, market` | 高殖利率排行 |

### F. 期貨與選擇權
| Tool | 情境 | 輸入 | 輸出 |
|---|---|---|---|
| `get_futures_daily_ohlc` (盤+後) | 期貨籌碼與選擇權分析 | `contract` | 期貨每日 OHLC（openapi 最新日） |
| `get_futures_history` (後) | 歷史回溯 | `contract, start, end` | 期貨 OHLC 歷史（TAIFEX-DL） |
| `get_put_call_ratio` (後) | 期貨籌碼與選擇權分析 | `date?, range?` | Put/Call Ratio（支援歷史） |
| `get_large_trader_positions` (後) | 期貨籌碼與選擇權分析 | `date?, range?` | 大額交易人未沖銷部位 |
| `get_institutional_futures_positions` (後) | 期貨籌碼與選擇權分析 | `date` | 三大法人期貨部位 |
| `get_institutional_options_positions` (後) | 期貨籌碼與選擇權分析 | `date` | 三大法人選擇權部位 |
| `get_institutional_futures_history` (後) | 歷史回溯 | `start, end` | 三大法人期貨部位歷史（TAIFEX-DL） |

### G. 基礎設施
| Tool | 輸入 | 輸出 |
|---|---|---|
| `get_symbol_list` | `market?` | 上市/上櫃代碼表（Symbol Registry） |
| `get_trading_calendar` | `year, month?` | 交易日曆 |

---

## 11. 圖表化設計（Chart Readiness，`pkg/chart`）

### 11.1 原則

- 所有時間序列工具之 `data` 本身即為可直接繪圖的 Series（`Candle[]` 等），`_chart_meta` 僅為渲染描述，不重複編碼資料。
- 所有 Series 時間欄位格式一致（`timestamp`），圖表層無需另行解析。

### 11.2 `_chart_meta` 標準

```json
{
  "recommended_type": "candlestick",
  "x_axis":  { "key": "timestamp", "type": "datetime", "format": "HH:mm" },
  "y_axis":  { "keys": ["open", "high", "low", "close"], "title": "價格 (元)", "right_axis": ["volume"] },
  "series":  [{ "key": "volume", "type": "bar", "style": "volume" }],
  "annotations": [],
  "note": "MA20/60 等 helper 指標另列於 data.indicators"
}
```

### 11.3 圖表類型對應

| 資料 | recommended_type | 圖表工具 |
|---|---|---|
| 任何 K 線（盤中/日線/期貨） | `candlestick` | `*_kline`, `get_futures_*` |
| 指數/股價趨勢 | `line` | `get_stock_daily_quote`（indicator 區） |
| 法人買賣超/融資融券/營收 | `bar`（正負分色） | `get_institutional_investors`, `get_margin_trading`, `get_monthly_revenue` |
| 產業配置/權重 | `heatmap` 或 `pie` | `get_foreign_industry_holdings` |
| 篩選結果（PE/PB/殖利率） | `scatter` | `screen_stocks`, `screen_high_yield` |
| Put/Call Ratio 歷史 | `line`（多空分界線 1.0） | `get_put_call_ratio` |
| 個股財報五面向 | `radar` | `get_financial_health_check` |

---

## 12. 效能最佳化原則

1. **快取優先**：上游請求前必經 L1→L2 檢查與 Single-flight 合流。
2. **Single-flight**：同快取鍵之併發請求僅一個真正打上游（`golang.org/x/sync/singleflight`）。
3. **連線池**：每主機獨立 `http.Transport`（Keep-Alive、MaxIdleConnsPerHost=8、HTTP/2 自動啟用、gzip）。
4. **批次化**：MIS 15 檔/請求；法人買賣超用彙總介面而非逐股查詢；代碼表/行事曆全日預熱。
5. **記憶體增量計算**：VWAP、爆量窗口、指標一律增量更新，禁止全量重掃。
6. **盤中 K 線零 HTTP**：查詢路徑僅讀 RingBuffer，Poller 為唯一寫入者（`sync.RWMutex` per symbol 或 sharded map）。
7. **JSON 最小化**：響應直接由 `model` 序列化，不做中間 map；啟用 `omitempty`；ChartMeta 僅在請求含 `chart=true`（預設 true）時輸出。
8. **L2 優化**：SQLite WAL、prepared statement、`(dataset,date)` 索引。
9. **預熱排程**：每日 08:00 前預熱交易日曆與代碼表；16:45 預熱當日盤後資料；開盤前重取 MIS Session。

---

## 13. 開發時程與測試策略（v1.3 Roadmap）

### Phase 1（W1–2）：核心骨架 + 即時引擎
- Resilient Client、Rate Limiter、Cache（L1/L2/Single-flight）、Envelope/Lineage/Symbol Registry、交易日曆。
- MIS Worker + Watchlist + RingBuffer + Aggregator，及 A 組 6 個盤中工具。

### Phase 2（W3–4）：盤後行情與籌碼
- TWSE/TPEx Adapter：日 K、法人買賣超、融資融券、全市場行情、注意/處置股、權證、異常成交量。
- B/C 組工具 + 三大法人/外資情境。

### Phase 3（W5–6）：基本面、股利與 TAIFEX
- MOPS Adapter（財報/營收/重大訊息/公司資料）、股利三工具、ESG、篩選。
- TAIFEX API + Download 回溯模組（9.2 全資料集）與 F 組工具。

### Phase 4（W7–8）：複合分析、圖表與壓測
- `get_financial_health_check`、`screen_stocks` 等 composite engine。
- ChartMeta 驗證（§11 全類型）、開盤時間連續 4.5h 運行測試（Memory Leak / 無 Ban 紀錄 / 延遲 P95 < 200ms）、`go build` 單一執行檔發布。

### 測試策略
- **錄製回放**：以官方 raw response 存 golden fixtures 做 unit/integration 測試（離線、無 Rate 壓力）。
- **契約測試**：每 Adapter 驗證 Normalize 後欄位型別/單位/日期符合 §5。
- **Live smoke**（僅在 CI 指定時段）：開盤時間少量真實請求驗證 MIS 路徑。
- **壓力測試**：模擬 20 個併發 Client 對同一熱門股查詢，驗證 Single-flight 命中率與快取命中率（目標 ≥ 80%）。

---

## 附錄 A：操作與法遵約束

- 伺服器僅於台灣交易所交易日運作採樣（交易日曆判定）。
- 對外聲明：本專案僅使用官方公開免費資料，合理使用為原則；任何使用者不得以本專案進行高頻抓取。
- 回傳資料附加免責欄位（`disclaimer`）：僅供研究參考，不構成投資建議。
- 所有 `_lineage.source_url` 僅在 debug/log 模式輸出，正式 Response 省略（減少 token 成本）。
