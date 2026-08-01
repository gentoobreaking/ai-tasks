這是一份針對 **`tw-quant-mcp` 專案開發規格書** 的優化版本（v2.0 → **v2.1**）。

在此版本中，除了保留並強化原有的 **「盤中 1 分 K 即時線型引擎（Intraday Real-time Kline Engine）」**（15 檔動態觀察清單、記憶體 RingBuffer、MIS 防封鎖 Worker），本次優化補齊了原規格書尚未落地的七項橫切需求：**資料來源鎖定與分級**、**Data Lineage 全面化**、**快取與 Rate Limit 防護的具體設計**、**跨資料域的欄位歸一化**、**模組化的領域分層**、**效能最佳化**，以及**通用圖表親和資料設計**。同時將原本僅 4 個 Tool 的涵蓋範圍，擴充到對應**十大投資分析情境**的完整 Tool 目錄。

---

# `tw-quant-mcp` 專案開發規格書 (v2.1)

### System Architecture & Development Specification — Data Lineage / Caching / Normalization / Full Domain Coverage Edition

本文件定義以 Go 語言實作之量化、盤後籌碼與盤中即時 1 分 K 線 MCP Server——**`tw-quant-mcp`**。專案採 **official/public-first** 原則，資料 100% 鎖定於 TWSE、TPEx、MOPS、TAIFEX 官方免費來源，經由 Source Role 分級、Data Lineage 標註、多層快取、欄位歸一化與領域模組化架構，提供 AI Agent「與」一般自動化程式（詳見附註）皆可直接呼叫的強健、高效能、可圖表化數據介面。

> **附註（MCP 與非 AI 呼叫端的相容性）**：MCP 協議底層為 JSON-RPC 2.0，`tools/call` 本身不綁定呼叫端是否為 LLM。本規格書中所有 Tool 皆維持純函式語意（輸入結構化參數、輸出正規化 JSON），因此無論是 AI Agent 動態呼叫，或是排程程式／回測系統以固定參數直接呼叫，行為完全一致。

---

### 目錄

0. [版本異動摘要（v2.0 → v2.1）](#0-版本異動摘要v20--v21)
1. [專案願景與七大設計原則](#1-專案願景與七大設計原則)
2. [系統總體架構](#2-系統總體架構-system-architecture)
3. [資料來源盤點與 Source Role 分級](#3-資料來源盤點與-source-role-分級)
4. [Data Lineage 通用設計](#4-data-lineage-通用設計-pkgmodellineagego)
5. [快取策略與 Rate Limit 防護](#5-快取策略與-rate-limit-防護-pkgcache-pkgratelimit)
6. [欄位歸一化：核心正規化 Schema](#6-欄位歸一化核心正規化-schema-pkgmodeldomain)
7. [模組與目錄結構](#7-模組與目錄結構-module-layout)
8. [盤中 1 分 K 線即時引擎](#8-盤中-1-分-k-線即時引擎維持-v20-設計lineagecache-欄位升級為-v21-通用-schema)
9. [MCP Tool 目錄：對應十大投資分析情境](#9-mcp-tool-目錄對應十大投資分析情境)
10. [效能最佳化設計](#10-效能最佳化設計-pkgdomainscreener)
11. [圖表親和資料設計](#11-圖表親和資料設計-pkgchart)
12. [核心實作範例](#12-核心實作範例)
13. [開發時程與測試策略](#13-開發時程與測試策略-v21-roadmap)
14. [需求對照表](#14-需求對照表-requirements-traceability)

---

## 0. 版本異動摘要（v2.0 → v2.1）

| # | 異動項目 | 說明 |
|---|---|---|
| 1 | 資料來源盤點與 Source Role 分級 | 新增 §3，明確列出 TWSE OpenAPI / TWSE Web API / MIS / TPEx OpenAPI / MOPS / TAIFEX OpenAPI / TAIFEX 網站下載 七個實體來源，並標註 `CANONICAL` / `SEMI_OFFICIAL_REALTIME` / `FALLBACK` 角色 |
| 2 | Data Lineage 全面化 | §4：`Lineage` 從「僅 Kline 適用」擴展為所有回傳資料共用的 envelope，新增 `source_role`、`grade`、`cache_age_sec` 欄位 |
| 3 | 快取與 Rate Limit 防護具體化 | §5：分資料類型 TTL 矩陣、雙層快取（Ristretto + SQLite）配置、per-source token bucket 設計 |
| 4 | 欄位歸一化 Schema | §6：新增六大資料域正規化 Schema（趨勢綜合／籌碼流向／股利／財報體檢／風險旗標／期貨選擇權），取代原本僅有 `KlineBar` 一種正規化模型 |
| 5 | 模組化：領域分層 | §7：目錄結構新增 `pkg/domain/` 六大分析模組，取代原本僅 `pkg/engine/`（盤中）一個業務模組 |
| 6 | MCP Tool 目錄擴充 | §9：從 4 個 Tool 擴充為 25 個，對應十大投資分析情境，並標註每個 Tool 的 Data Grade |
| 7 | 效能最佳化章節 | §10：批次端點優先、bounded worker pool（`errgroup.SetLimit`）、materialized screener index |
| 8 | 圖表親和資料設計通用化 | §11：`_chart_meta` 從 Kline 專用擴展為 line / bar / candlestick / heatmap / table 五種型別 |
| 9 | Roadmap 重整 | §13：從 4 週（僅涵蓋即時 K 線）擴展為 6 個 Phase，每階段標註交付的 Data Grade |
| 10 | 需求對照表 | §14：逐條核對 7 項優化需求、10 項投資情境與章節對應關係 |

> 原有的盤中 1 分 K 引擎設計（採樣頻率、RingBuffer 聚合演算法、MIS 防封鎖 Worker）在 v2.1 中**完整保留**，僅將其 Lineage／Cache／Chart 欄位改為套用本版本的通用 Schema，細節見 §8。

---

## 1. 專案願景與七大設計原則

`tw-quant-mcp` 的設計目標，是讓「一個資料點」從官方來源被抓取的那一刻起，到最終回傳給呼叫端（不論是 AI Agent 或一般程式）為止，全程保持**可追溯、可信任、可重現**。以下七項原則直接對應本次優化的七項需求：

1. **官方權威資料來源（Authority / Source Restriction）**
   100% 資料鎖定於 **TWSE、TPEx、MOPS、TAIFEX** 四個官方網域（含其 OpenAPI、Web API 與網站下載頁面）。不串接任何第三方財經網站（如 Goodinfo、CMoney、Yahoo 股市等）作為 production 資料源——僅可作為開發期間的人工比對材料，不進入正式資料管線。

2. **血統透明（Data Lineage）**
   所有回傳資料皆附帶 `source`、`source_role`、`fetched_at`、`data_date`、`freshness`、`is_cached`、`grade` 等欄位，讓呼叫端（與人類審閱者）可以在不追加查詢的情況下，判斷這筆資料「有多新、來自哪裡、可信任到什麼程度」。

3. **快取與 Rate Limit 防護（Caching & Anti-Throttling）**
   依資料更新頻率設計差異化 TTL；依來源網域設計獨立的 token bucket，避免單一來源被高頻請求觸發封鎖，也避免因請求失敗而拖慢整體回應。

4. **欄位歸一化（Schema Normalization）**
   七個實體來源（OpenAPI JSON、Web API JSON、MIS JSON、MOPS AJAX HTML Table、TAIFEX 下載 CSV/Excel 等）欄位命名、單位、日期格式互不相同；所有 Adapter 輸出必須先經過正規化層，呼叫端只會看到統一的 Schema，不會感知上游差異。

5. **模組化（Modularity）**
   十大投資分析情境對應獨立的 domain 模組，彼此透過正規化 Schema 溝通、不互相依賴實作細節；新增一個分析情境不需修改既有模組。

6. **效能最佳化（Performance）**
   優先使用官方提供的「全市場批次端點」而非逐檔查詢；跨 2,000+ 檔的篩選類操作採 bounded worker pool + materialized index，避免即時全量運算拖垮回應時間。

7. **圖表親和（Chart Readiness）**
   所有可視覺化的回傳資料皆可選擇性附帶 `_chart_meta`，內含建議圖表型別與正規化的 X/Y 軸資料陣列，讓下游不論是 AI Agent 產生圖表，或是自製 dashboard 前端，都不需要重新解析資料結構。

### 旗艦能力：盤中 1 分 K 即時線型引擎

在七大原則之上，本專案將 **「盤中 1 分 K 即時線型引擎（Intraday Real-time Kline Engine）」** 納入系統核心：設計 **15 檔動態熱門股觀察清單（Watchlist）機制**、**記憶體環形緩衝區（RingBuffer）** 與 **MIS 請求優化模組**，確保在不觸發 IP 封鎖的前提下，提供包含真實上下影線的高精準度 1 分 K 線與 `_chart_meta` 圖表資料。此引擎的完整設計維持 v2.0 規格，詳見 §8。

---

## 2. 系統總體架構 (System Architecture)

在原有三層架構基礎上，新增 **Domain Analysis Layer**（承載十大投資分析情境的業務邏輯）與明確的 **Normalization Layer**，使「盤中即時」與「盤後／基本面／籌碼面」兩種資料節奏在同一套架構下並存：

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        MCP Clients / External Program                   │
│         (Claude Desktop, Cursor, 排程程式, 回測系統, Custom Go Client)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ JSON-RPC (Stdio / Streamable HTTP)
┌───────────────────────────────────▼────────────────────────────────────┐
│                             MCP Engine Layer                           │
│ - SDK: modelcontextprotocol/go-sdk                                     │
│ - Handler Routers, Schema Definition & Validation（25 個 Tool）         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Normalized Query
┌───────────────────────────────────▼────────────────────────────────────┐
│                     Domain Analysis Layer（§7 pkg/domain/）             │
│  趨勢綜合 │ 外資解讀 │ 熱點捕捉 │ 股利規劃 │ 標的篩選                    │
│  期貨籌碼 │ 法人流向 │ 財報體檢 │ 風險掃描 │ 期貨歷史回溯                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Normalized Read
┌───────────────────────────────────▼────────────────────────────────────┐
│                Core Infra Services（Rate Limit / Cache / Lineage）      │
│  ┌──────────────────────────────┐    ┌──────────────────────────────┐  │
│  │ Per-Source Rate Limiter      │    │ Multi-Tier Cache Engine      │  │
│  │ (golang.org/x/time/rate ×7)  │    │ (Ristretto L1 + SQLite L2)   │  │
│  └──────────────────────────────┘    └──────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Intraday Real-time Kline Engine (09:00 - 13:30)  §8               │  │
│  │ - Active Watchlist Manager (Max 15 Stocks)                        │  │
│  │ - 8s Poller & In-Memory RingBuffer (Resample to 1m/5m K-Line)    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Fetch Raw Data / Batch Requests
┌───────────────────────────────────▼────────────────────────────────────┐
│                 Normalization Layer（pkg/model/normalize/）             │
│         將 7 種上游格式統一轉換為 §6 正規化 Schema，附加 Lineage         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Source-Specific Parsing
┌───────────────────────────────────▼────────────────────────────────────┐
│                         Official Provider Adapters                     │
│ ┌───────────┐┌───────────┐┌───────────┐┌───────────┐┌─────────────────┐│
│ │TWSE OpenAPI││TWSE WebAPI││MIS Worker ││TPEx OpenAPI││MOPS Adapter    ││
│ └───────────┘└───────────┘└───────────┘└───────────┘└─────────────────┘│
│ ┌───────────────────────┐┌────────────────────────────────────────┐   │
│ │ TAIFEX OpenAPI Adapter ││ TAIFEX 網站下載 Adapter（歷史回溯 Fallback）│   │
│ └───────────────────────┘└────────────────────────────────────────┘   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Resilient HTTP Client (Session, Header Injection)
        [ TWSE / TWSE MIS / TPEx / MOPS / TAIFEX OpenAPI / TAIFEX 網站 ]
```

---

## 3. 資料來源盤點與 Source Role 分級

> 本節設計原則參考 [TW Market Data — 資料血緣文件](https://twmarketdata.com/zh-TW/docs/data-freshness-lineage) 的 official/public-first 與 canonical / helper / fallback 分級精神，並依據 [twjackysu/TWSEMCPServer](https://github.com/twjackysu/TWSEMCPServer) 實際盤點過的官方端點家族整理。

「官方來源」不代表所有端點都同等穩固——TWSE OpenAPI 是正式公開、有文件的 JSON API；MIS 即時報價則是 TWSE 官網前端自用、未列入正式 OpenAPI 目錄的 JSON 端點；TAIFEX 網站下載頁面多為 CSV/Excel 檔案，用來補足 OpenAPI 「僅提供最新一日」的歷史缺口。為了讓 Data Lineage 誠實反映這種差異，本規格書將每個實體來源標註以下三種 `source_role` 之一：

- **`CANONICAL`**：正式公開、有文件、JSON 結構化的官方 API，可視為 production 主路徑。
- **`SEMI_OFFICIAL_REALTIME`**：官方網域提供，但未正式列入 OpenAPI 文件目錄的即時端點；資料仍屬官方，但無公開的穩定性/速率承諾，需額外的防封鎖與容錯設計。
- **`FALLBACK`**：CANONICAL 端點在特定維度（通常是歷史深度）不足時，改用的官方替代管道，優先度低於 CANONICAL。

| 來源 | Domain | 涵蓋資料 | `source_role` | 對應 Adapter |
|---|---|---|---|---|
| TWSE OpenAPI | `openapi.twse.com.tw` | 公司治理、ESG、財報、交易、指數等結構化 JSON | `CANONICAL` | `pkg/provider/twse_openapi.go` |
| TWSE Web API | `www.twse.com.tw` | 個股日K、月均價、估值、融資融券、上市三大法人買賣超、全市場收盤行情、加權指數歷史、外資持股歷史、鉅額交易明細、融券借券餘額 | `CANONICAL` | `pkg/provider/twse_web.go` |
| TWSE MIS | `mis.twse.com.tw` | 盤中即時多股報價（上市＋上櫃），供 §8 引擎採樣 | `SEMI_OFFICIAL_REALTIME` | `pkg/provider/mis_worker.go` |
| TPEx OpenAPI | `www.tpex.org.tw/openapi` | 上櫃日收盤、三大法人（個股/彙總）、本益比、融資融券、注意/處置股、除權息、零股、指數 | `CANONICAL` | `pkg/provider/tpex.go` |
| MOPS 公開資訊觀測站 | `mops.twse.com.tw` | 財報三表、月營收、董監持股、公司治理；多為 AJAX Form-Post 回傳 HTML Table，非 JSON | `CANONICAL`（結構為半結構化，需 HTML Table 解析） | `pkg/provider/mops.go` |
| TAIFEX OpenAPI | `openapi.taifex.com.tw` | 三大法人期貨/選擇權部位、大額交易人未沖銷部位、每日行情、選擇權分析、保證金、年月統計 — 僅提供最新一個交易日 | `CANONICAL` | `pkg/provider/taifex_openapi.go` |
| TAIFEX 網站下載 | `www.taifex.com.tw` | 期貨/選擇權每日 OHLC 歷史、三大法人期貨部位歷史、Put/Call Ratio 歷史、大額交易人未沖銷部位歷史等——用於補足 OpenAPI 無歷史查詢的缺口 | `FALLBACK` | `pkg/provider/taifex_download.go` |

**設計規則**：Domain 模組（§7）呼叫 Adapter 時，一律優先嘗試 `CANONICAL`；只有在 `CANONICAL` 無法滿足需求（例如歷史區間查詢）時才降級至 `FALLBACK`，且此次降級必須反映在回傳的 `_lineage.source_role` 中，讓呼叫端明確知道這筆資料經過了 fallback 路徑。`SEMI_OFFICIAL_REALTIME` 僅用於 §8 的盤中引擎，不作為其他 domain 模組的資料來源。

---

## 4. Data Lineage 通用設計 (`pkg/model/lineage.go`)

v2.0 的 `Lineage` struct 僅在盤中 K 線情境使用。v2.1 將其提升為**所有** Tool 回傳值共用的 envelope，並新增 `source_role`、`grade`、`cache_age_sec` 三個欄位：

```go
package model

import "time"

// SourceRole 對應 §3 的三種資料來源角色
type SourceRole string

const (
	SourceRoleCanonical SourceRole = "CANONICAL"              // 正式 OpenAPI／Web API，JSON 結構化
	SourceRoleRealtime  SourceRole = "SEMI_OFFICIAL_REALTIME" // MIS 等官方網域但未列入 OpenAPI 文件
	SourceRoleFallback  SourceRole = "FALLBACK"                // 官方網站下載頁，補足歷史深度
)

// DataGrade 對應 twmarketdata.com 的 available-now / preview / not-yet-available 分級精神，
// 用於標註該筆資料背後的 Tool 目前的成熟度（見 §9、§13）
type DataGrade string

const (
	GradeAvailable   DataGrade = "AVAILABLE"        // 已上線，可直接依賴
	GradePreview     DataGrade = "PREVIEW"          // 已可查詢，但欄位/準確度仍可能調整
	GradeUnavailable DataGrade = "NOT_YET_AVAILABLE" // Roadmap 中，尚未實作
)

// Lineage 為所有 MCP Tool 回傳值共用的血統資訊，統一掛載於 `_lineage` 欄位
type Lineage struct {
	Source      string     `json:"source"`                // 例如 "TWSE_OPENAPI", "TAIFEX_WEB_DOWNLOAD"
	SourceRole  SourceRole `json:"source_role"`
	FetchedAt   time.Time  `json:"fetched_at"`             // 實際發出請求／計算的時間
	DataDate    string     `json:"data_date"`              // 資料所屬日期 (YYYY-MM-DD)
	Freshness   string     `json:"freshness"`              // "REALTIME_INTRADAY" | "POST_MARKET" | "MONTHLY" | "QUARTERLY"
	SamplingSec int        `json:"sampling_sec,omitempty"` // 僅盤中引擎使用
	IsCached    bool       `json:"is_cached"`
	CacheAgeSec int64      `json:"cache_age_sec,omitempty"` // 若命中快取，資料已存活多久
	LatencyMS   int64      `json:"latency_ms"`
	Grade       DataGrade  `json:"grade"`
}

// KlineBar 代表單根 1 分 K 線（維持 v2.0 設計，見 §8）
type KlineBar struct {
	Timestamp string  `json:"timestamp"`
	Open      float64 `json:"open"`
	High      float64 `json:"high"`
	Low       float64 `json:"low"`
	Close     float64 `json:"close"`
	Volume    int64   `json:"volume"`
}
```

**設計規則（呼應 twmarketdata.com 的「response 不回傳 raw payload」與「schema 與欄位穩定性優先」原則）**：

1. 任何 Adapter 的原始回應（無論是 TWSE OpenAPI 的 JSON、MOPS 的 HTML Table，或 TAIFEX 下載的 CSV）皆不得原樣穿透到 Tool 回傳值——一律先經過 §6 的正規化 Schema 轉換。
2. 若單一 Tool 回應聚合了多個來源（例如 §9 的 `get_stock_trend_composite` 同時用到 TWSE Web API 與 MOPS），`_lineage` 改為陣列 `[]Lineage`，逐一標註每個子資料的來源與新鮮度，而非合併成單一、模糊的血統紀錄。
3. `grade` 欄位讓呼叫端（與人類審閱者）在 Roadmap 尚未全部完工的情況下，也能安全地漸進式串接——`PREVIEW` 等級的 Tool 仍可呼叫，但回應中會誠實標註其成熟度，對應 twmarketdata.com「controlled rollout，避免過度承諾」的精神。

---

## 5. 快取策略與 Rate Limit 防護 (`pkg/cache/`, `pkg/ratelimit/`)

v2.0 僅在架構圖中標示「Multi-Tier Cache Engine」方塊，未定義實際的 TTL 與限流策略。v2.1 補上具體設計：

### 5.1 雙層快取

- **L1（Ristretto，記憶體）**：高頻讀取的熱資料，如當日已快取的個股日K、篩選結果索引。容量與命中率可調（參考下方環境變數）。
- **L2（SQLite，本機持久化）**：跨重啟仍需保留的資料，如財報、歷史 K 線、TAIFEX 回溯資料。L1 未命中時查 L2，L2 未命中才觸發實際 Adapter 請求。

盤中 K 線引擎的 RingBuffer（§8）屬於獨立的第三種記憶體結構，其新鮮度由 8 秒採樣週期本身保證，**不經過 L1/L2**，避免快取過期邏輯與即時聚合邏輯互相干擾。

### 5.2 依資料類型的 TTL 矩陣

TTL 依「該資料在官方端實際更新的頻率」設計，而非統一給一個保守值——這是效能與新鮮度的核心取捨點：

| 資料類型 | 官方更新頻率 | 建議 TTL | 快取層 |
|---|---|---|---|
| 盤中即時報價（MIS snapshot） | 8 秒（引擎輪詢） | 不進 L1/L2，RingBuffer 自行管理 | RingBuffer only |
| 個股日K／全市場收盤行情 | 每日收盤後一次 | 至下一交易日開盤前（約 18hr） | L1 + L2 |
| 三大法人買賣超（上市/上櫃） | 每日約 14:30 後公布 | 至下一交易日相同時間 | L1 + L2 |
| 融資融券 | 每日一次 | 至下一交易日 | L1 + L2 |
| 月營收 | 每月 10 日前公布 | 30 天，或偵測到新公告即失效 | L2 |
| 財報三表（季） | 每季公告窗口 | 90 天，或偵測到新公告即失效 | L2 |
| 除權息行事曆 | 不定期公告 | 6 小時（定期輪詢更新） | L1 + L2 |
| 注意／處置股、當沖限制名單 | 每日公告 | 至下一交易日開盤前 | L1 |
| 期貨/選擇權每日行情、Put/Call Ratio | 每日一次 | 至下一交易日 | L1 + L2 |
| TAIFEX 歷史回溯（網站下載） | 靜態歷史資料 | 7 天（僅新增區間需重抓） | L2 |
| ESG／公司治理／董監持股 | 不定期 | 24 小時 | L2 |

### 5.3 Per-Source Rate Limiter

依 §3 的七個實體來源，各自設定獨立的 `golang.org/x/time/rate.Limiter`，避免單一來源的高頻請求（例如篩選 2,000+ 檔個股）拖累其他來源的請求配額，也避免觸發官方端的異常流量偵測：

```go
package ratelimit

import "golang.org/x/time/rate"

// 依 §3 source_role 差異化設定：CANONICAL 端點官方通常較寬容，
// SEMI_OFFICIAL_REALTIME（MIS）維持 v2.0 既有的 8s±1s jitter 設計，
// FALLBACK（TAIFEX 網站下載）保守處理，避免被誤判為爬蟲。
var defaultLimiters = map[string]*rate.Limiter{
	"TWSE_OPENAPI":    rate.NewLimiter(rate.Every(200*1e6), 5), // 5 QPS burst 5
	"TWSE_WEB_API":    rate.NewLimiter(rate.Every(300*1e6), 3),
	"TWSE_MIS":        rate.NewLimiter(rate.Every(8*1e9), 1),   // 見 §8，另有 jitter 疊加
	"TPEX_OPENAPI":    rate.NewLimiter(rate.Every(300*1e6), 3),
	"MOPS":            rate.NewLimiter(rate.Every(1*1e9), 2),   // AJAX 端點較脆弱，保守限流
	"TAIFEX_OPENAPI":  rate.NewLimiter(rate.Every(300*1e6), 3),
	"TAIFEX_DOWNLOAD": rate.NewLimiter(rate.Every(2*1e9), 1),   // 檔案下載，避免高頻觸發
}
```

**可調參數（環境變數）**：關鍵參數對外暴露為環境變數而非寫死，方便依部署情境調整：

| 變數 | 說明 | 預設值 |
|---|---|---|
| `CACHE_L1_MAX_ENTRIES` | Ristretto 最大條目數 | `10000` |
| `CACHE_L1_MAX_MEMORY_MB` | Ristretto 最大記憶體 | `256` |
| `CACHE_L2_SQLITE_PATH` | SQLite 檔案路徑 | `./data/cache.db` |
| `CACHE_HIT_RATE_TARGET` | 監控用目標命中率（見 §10） | `0.8` |
| `RATE_LIMIT_ENABLED` | 是否啟用限流 | `true` |
| `RATE_LIMIT_BULK_CONCURRENCY` | 篩選類操作的最大併發數（見 §10） | `8` |
| `MIS_JITTER_MIN_MS` / `MIS_JITTER_MAX_MS` | 盤中引擎抖動區間 | `7000` / `9000` |

**失敗處理**：任一 Adapter 請求失敗時，優先回退到「已過期但仍存在」的 L2 快取值（stale-if-error），並在 `_lineage.freshness` 標註為 `STALE_FALLBACK`，而非直接對呼叫端回傳錯誤——對排程程式與回測系統而言，「稍舊但可用」通常優於「無回應」。

---

## 6. 欄位歸一化：核心正規化 Schema (`pkg/model/domain/`)

v2.0 僅定義了 Kline 專用的正規化模型。v2.1 依十大投資分析情境，新增六組共用的正規化 Schema，取代各 Adapter 各自為政的欄位命名。所有 Schema 共用 §4 的 `StockIdentity` 與 `Lineage`：

```go
package domain

import "tw-quant-mcp/pkg/model"

// StockIdentity 為所有個股相關 Schema 共用的識別資訊
type StockIdentity struct {
	Symbol   string `json:"symbol"`   // "2330"
	Name     string `json:"name"`     // "台積電"
	Market   string `json:"market"`   // "TSE" | "OTC"
	Industry string `json:"industry,omitempty"`
}

// ---------- 個股趨勢研判 ----------
type TrendComposite struct {
	Stock       StockIdentity   `json:"stock"`
	Technical   TechnicalView   `json:"technical"`
	Fundamental FundamentalView `json:"fundamental"`
	Chip        ChipView        `json:"chip"`
	Horizon     string          `json:"horizon"` // "short" | "mid" | "long"
	Lineage     []model.Lineage `json:"_lineage"`
	ChartData   interface{}     `json:"_chart_meta,omitempty"`
}
type TechnicalView struct {
	MA5         float64 `json:"ma5"`
	MA20        float64 `json:"ma20"`
	MA60        float64 `json:"ma60"`
	RSI14       float64 `json:"rsi_14"`
	TrendSignal string  `json:"trend_signal"` // "BULLISH" | "BEARISH" | "NEUTRAL"
}
type FundamentalView struct {
	PE               float64 `json:"pe"`
	PB               float64 `json:"pb"`
	DividendYieldPct float64 `json:"dividend_yield_pct"`
	EPSGrowthYoYPct  float64 `json:"eps_growth_yoy_pct"`
}
type ChipView struct {
	ForeignNetShares5D  int64 `json:"foreign_net_shares_5d"`
	TrustNetShares5D    int64 `json:"trust_net_shares_5d"`
}

// ---------- 三大法人籌碼流向 / 外資投資解讀 ----------
type InstitutionalFlow struct {
	Stock              StockIdentity `json:"stock"`
	Date               string        `json:"date"`
	Market             string        `json:"market"` // "TSE" | "OTC"
	ForeignNetShares   int64         `json:"foreign_net_shares"`
	TrustNetShares     int64         `json:"investment_trust_net_shares"`
	DealerNetShares    int64         `json:"dealer_net_shares"`
	ForeignHoldingPct  float64       `json:"foreign_holding_pct,omitempty"`
	Lineage            model.Lineage `json:"_lineage"`
}

// ---------- 股利投資規劃 ----------
type DividendRecord struct {
	Stock                StockIdentity `json:"stock"`
	FiscalYear           string        `json:"fiscal_year"`
	CashDividend         float64       `json:"cash_dividend"`
	StockDividend        float64       `json:"stock_dividend"`
	ExDividendDate       string        `json:"ex_dividend_date,omitempty"`
	ExRightDate          string        `json:"ex_right_date,omitempty"`
	DividendYieldPct     float64       `json:"dividend_yield_pct"`
	PayoutStabilityScore float64       `json:"payout_stability_score,omitempty"` // 0-100，近 5 年配息穩定度
	Lineage              model.Lineage `json:"_lineage"`
}

// ---------- 個股財報體檢（五面向）----------
type FinancialHealthReport struct {
	Stock              StockIdentity   `json:"stock"`
	Profitability      DimensionScore  `json:"profitability"`
	Growth             DimensionScore  `json:"growth"`
	FinancialStructure DimensionScore  `json:"financial_structure"`
	DividendPolicy     DimensionScore  `json:"dividend_policy"`
	Governance         DimensionScore  `json:"governance"`
	OverallScore       float64         `json:"overall_score"` // 五面向加權平均
	Lineage            []model.Lineage `json:"_lineage"`
}
type DimensionScore struct {
	Score   float64            `json:"score"` // 0-100
	Metrics map[string]float64 `json:"metrics"`
}

// ---------- 買前風險掃描 ----------
type RiskFlags struct {
	Stock                  StockIdentity `json:"stock"`
	IsDisposition          bool          `json:"is_disposition"`           // 處置股
	IsAttention            bool          `json:"is_attention"`             // 注意股
	DayTradingRestricted   bool          `json:"day_trading_restricted"`   // 當沖限制
	MarginTradingSuspended bool          `json:"margin_trading_suspended"` // 停資
	ShortSellingSuspended  bool          `json:"short_selling_suspended"`  // 停券
	Lineage                model.Lineage `json:"_lineage"`
}

// ---------- 期貨籌碼與選擇權分析 ----------
type DerivativesSnapshot struct {
	Product              string          `json:"product"` // "TX"（台指期）等
	Date                 string          `json:"date"`
	PutCallRatio         float64         `json:"put_call_ratio"`
	LargeTraderNetOI     map[string]int64 `json:"large_trader_net_oi"` // key: 特定/一般法人分類
	InstitutionalFutures InstitutionalFlow `json:"institutional_futures"`
	Lineage              model.Lineage   `json:"_lineage"`
}
```

**正規化層的落地方式**：每個 Adapter（§3 七個來源）對應一組 `normalize.From<Source>()` 函式，負責把上游原始格式（JSON / HTML Table / CSV）轉換為以上 Schema。這一層是唯一允許「知道」上游欄位長什麼樣子的地方——Domain 模組（§7）與 MCP Tool Handler（§9）只操作正規化後的型別，永遠不直接解析 Adapter 的原始回應。這也是 Schema Normalization 與 Modularity 兩項需求彼此支撐的地方：欄位一旦統一，新增/替換資料來源就不會波及下游模組。

---

## 7. 模組與目錄結構 (Module Layout)

在 v2.0 的三層目錄基礎上，新增 `pkg/domain/`（十大投資分析情境）、`pkg/model/normalize/`（正規化層）與 `pkg/ratelimit/`：

```text
tw-quant-mcp/
├── cmd/
│   └── mcp-server/              # 入口點 (Main Entry Point)
│       └── main.go
├── pkg/
│   ├── mcp/                     # MCP Server 初始化與 25 個 Tool 註冊
│   ├── provider/                # §3 七個官方來源 Adapters
│   │   ├── client.go            # 帶 Session 維持與 Rate Limit 的 Resilience HTTP Client
│   │   ├── twse_openapi.go      # TWSE OpenAPI（CANONICAL）
│   │   ├── twse_web.go          # TWSE Web API（CANONICAL）
│   │   ├── mis_worker.go        # TWSE MIS 盤中 8 秒 Poller（SEMI_OFFICIAL_REALTIME）
│   │   ├── tpex.go               # TPEx OpenAPI（CANONICAL）
│   │   ├── mops.go               # MOPS AJAX/HTML Table 解析（CANONICAL，半結構化）
│   │   ├── taifex_openapi.go     # TAIFEX OpenAPI（CANONICAL，僅最新一日）
│   │   └── taifex_download.go    # TAIFEX 網站下載（FALLBACK，歷史回溯）
│   ├── model/
│   │   ├── lineage.go            # §4 通用 Lineage / SourceRole / DataGrade
│   │   ├── domain/               # §6 六大正規化 Schema
│   │   └── normalize/            # 各 Adapter → 正規化 Schema 的轉換函式
│   ├── engine/                   # §8 盤中即時計算引擎
│   │   ├── watchlist.go          # 動態觀察清單管理器 (Max 15 檔)
│   │   └── aggregator.go         # 記憶體 RingBuffer & 1 分 K 重採樣
│   ├── domain/                   # [NEW] 十大投資分析情境業務邏輯
│   │   ├── trend/                # 個股趨勢研判
│   │   ├── foreign/              # 外資投資解讀
│   │   ├── hotspot/              # 市場熱點捕捉
│   │   ├── dividend/             # 股利投資規劃
│   │   ├── screener/             # 投資標的篩選（含 ESG）
│   │   ├── derivatives/          # 期貨籌碼與選擇權分析
│   │   ├── institutional/        # 三大法人籌碼流向
│   │   ├── fundamental/          # 個股財報體檢
│   │   └── risk/                 # 買前風險掃描
│   ├── cache/                     # §5 雙層 Cache Engine (Ristretto + SQLite)
│   ├── ratelimit/                 # §5 Per-Source Token Bucket
│   └── chart/                     # §11 通用圖表轉換器
├── go.mod
└── go.sum
```

**模組化邊界規則**：`pkg/domain/*` 之間彼此不互相 import；共用邏輯一律下沉到 `pkg/model`、`pkg/provider` 或 `pkg/cache`。這確保新增第 11 種投資情境時，只需新增一個 domain 子模組並在 `pkg/mcp` 註冊對應 Tool，不需改動既有模組——對應 §1 原則 5。

---

## 8. 盤中 1 分 K 線即時引擎（維持 v2.0 設計，Lineage/Cache 欄位升級為 v2.1 通用 Schema）

### 8.1 採樣與聚合演算法 (`pkg/engine/aggregator.go`)

為了解決「每 1 分鐘才抓一次會丟失 High/Low 影線」的問題，引擎設計如下（與 v2.0 相同）：

1. **採樣頻率 (Sampling Rate)**：設定為**每 8 秒 ± 1 秒隨機擾動 (Jitter)** 抓取一次 Snapshot（區間可調，見 §5.3 `MIS_JITTER_MIN_MS`/`MIS_JITTER_MAX_MS`）。
2. **觀察清單容量 (Watchlist Capacity)**：硬性限制**上限 15 檔**。
3. **單次 Batch 請求**：將 15 檔股票拼裝為單一 MIS URL 參數：
   `ex_ch=tse_2330.tw|tse_2317.tw|otc_6547.tw...`（單次 Request QPS ≈ 0.12，極安全）。
4. **記憶體重採樣 (In-Memory Resampling)**：
   - 引擎維護長度為 2025（約 4.5 小時 × 7.5 次/分）的 `RingBuffer` 儲存 Snapshots。
   - 當用戶呼叫 `get_intraday_kline` 時，引擎取出該區間內的 Snapshots，按時間窗口（例如 `09:05:00 ~ 09:05:59`）進行歸併：
     - **Open** = 區間內第一個 Snapshot 的 `z`
     - **High** = 所有 Snapshots 的 `z` 最大值
     - **Low** = 所有 Snapshots 的 `z` 最小值
     - **Close** = 區間內最後一個 Snapshot 的 `z`
     - **Volume** = 區間末 `v_total` − 區間初 `v_total`

### 8.2 防封鎖 MIS Worker 設計 (`pkg/provider/mis_worker.go`)

```go
package provider

import (
	"fmt"
	"math/rand"
	"net/http"
	"net/http/cookiejar"
	"strings"
	"time"
)

type MISWorker struct {
	client *http.Client
}

func NewMISWorker() *MISWorker {
	jar, _ := cookiejar.New(nil)
	client := &http.Client{
		Timeout: 5 * time.Second,
		Jar:     jar,
	}
	worker := &MISWorker{client: client}
	worker.warmupSession() // 初始化取得 MIS 官方 Session Cookie
	return worker
}

// Session 預熱：先存取首頁拿到 Cookie，避免被當成非法 Scraper
func (m *MISWorker) warmupSession() {
	req, _ := http.NewRequest("GET", "https://mis.twse.com.tw/stock/index.jsp", nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")
	resp, err := m.client.Do(req)
	if err == nil {
		resp.Body.Close()
	}
}

// FetchBatchSnapshots 批量抓取 (上限 15 檔)
func (m *MISWorker) FetchBatchSnapshots(symbols []string) (string, error) {
	if len(symbols) > 15 {
		return "", fmt.Errorf("watchlist exceeds safety limit of 15 stocks")
	}

	var exChs []string
	for _, s := range symbols {
		// 簡易判斷上市(tse)或上櫃(otc)，預設 tse
		exChs = append(exChs, fmt.Sprintf("tse_%s.tw", s))
	}

	url := fmt.Sprintf("https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=%s&_=%d",
		strings.Join(exChs, "|"), time.Now().UnixMilli())

	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")

	resp, err := m.client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// 注入 8 秒 ± 1 秒隨機延遲 (Jitter) 避免機械特徵
	jitter := time.Duration(7000+rand.Intn(2000)) * time.Millisecond
	time.Sleep(jitter)

	// 此處回傳 Raw JSON 供 Engine 解析 z, v_total, tlong；
	// 解析後立即經過 normalize.FromMIS() 轉為 §4 Lineage + KlineBar，不穿透原始欄位
	return "", nil
}
```

> v2.1 變更僅在於：Worker 抓取到的原始 Snapshot，經 `normalize.FromMIS()` 轉換後，`_lineage.source_role` 固定標註為 `SEMI_OFFICIAL_REALTIME`、`grade` 標註為 `AVAILABLE`（此引擎為既有已驗證功能），其餘採樣/聚合邏輯與 v2.0 完全相同。

---

## 9. MCP Tool 目錄：對應十大投資分析情境

v2.0 僅有 4 個 Tool（`set_active_watchlist`、`get_intraday_kline`、`get_stock_daily_quote`、`get_institutional_investors`）。v2.1 擴充為 **25 個 Tool**，逐一對應原規格書列出的十大投資分析情境。每個 Tool 皆標註 `grade`（見 §4），作為 §13 Roadmap 分階段交付的依據；`AVAILABLE` 代表資料來源已明確、可直接進入 Phase 1-2 實作，`PREVIEW` 代表邏輯需額外運算/聚合、`NOT_YET_AVAILABLE` 代表需進一步確認來源可行性。

### 9.1 個股趨勢研判

> *"分析台積電(2330)最近的走勢" / "鴻海(2317)適合長期投資嗎？"*

| Tool | 說明 | 主要參數 | 資料來源 | Grade |
|---|---|---|---|---|
| `get_stock_trend_composite` | 短中長期技術面、基本面、籌碼面綜合分析 | `symbol`, `horizon`(short/mid/long) | TWSE Web API + MOPS（聚合計算） | `PREVIEW` |

### 9.2 外資投資解讀

> *"外資最近在買什麼股票？" / "半導體業外資投資趨勢如何？"*

| Tool | 說明 | 主要參數 | 資料來源 | Grade |
|---|---|---|---|---|
| `get_foreign_holdings` | 個股外資持股 | `symbol` | TWSE Web API | `AVAILABLE` |
| `get_foreign_industry_flow` | 產業別外資流向 | `industry` | TWSE OpenAPI | `PREVIEW` |
| `get_foreign_flow_history` | 個股外資進出追蹤 | `symbol`, `date_range` | TWSE Web API | `AVAILABLE` |

### 9.3 市場熱點捕捉

> *"今天有什麼重大消息？" / "哪些股票交易量異常活躍？"*

| Tool | 說明 | 主要參數 | 資料來源 | Grade |
|---|---|---|---|---|
| `get_material_announcements` | 重大訊息公告 | `date` | MOPS | `PREVIEW` |
| `get_abnormal_volume_stocks` | 異常成交量偵測 | `date` | TWSE OpenAPI / TPEx OpenAPI | `PREVIEW` |
| `get_warrant_activity` | 權證活躍度監控 | `underlying_symbol` | TWSE OpenAPI | `NOT_YET_AVAILABLE` |

### 9.4 股利投資規劃

> *"推薦一些高殖利率股票" / "下個月有哪些公司要除權息？"*

| Tool | 說明 | 主要參數 | 資料來源 | Grade |
|---|---|---|---|---|
| `screen_high_dividend_yield` | 高殖利率篩選（全市場） | `min_yield_pct`, `top_n` | TWSE Web API + TPEx OpenAPI | `PREVIEW` |
| `get_ex_dividend_calendar` | 除權息行事曆 | `date_range` | TWSE Web API + TPEx OpenAPI | `AVAILABLE` |
| `get_dividend_stability` | 配息穩定性分析（近5年） | `symbol` | TWSE Web API + MOPS | `PREVIEW` |

### 9.5 投資標的篩選

> *"幫我找一些被低估的價值股" / "ESG表現好的公司有哪些？"*

| Tool | 說明 | 主要參數 | 資料來源 | Grade |
|---|---|---|---|---|
| `screen_value_growth_stocks` | 價值股/成長股篩選 | `style`(value/growth), `criteria` | TWSE OpenAPI + MOPS | `NOT_YET_AVAILABLE` |
| `get_valuation_ratios` | PE/PB/ROE 等估值比率 | `symbol` | TWSE Web API | `AVAILABLE` |
| `get_esg_risk_assessment` | ESG 風險評估 | `symbol` | TWSE OpenAPI（公司治理/ESG專區） | `PREVIEW` |

### 9.6 期貨籌碼與選擇權分析

> *"台指期籌碼現在偏多還是偏空？" / "選擇權大額交易人在哪個價位布局？"*

| Tool | 說明 | 主要參數 | 資料來源 | Grade |
|---|---|---|---|---|
| `get_put_call_ratio` | Put/Call Ratio | `date_range` | TAIFEX OpenAPI(最新) / TAIFEX 網站下載(歷史) | `AVAILABLE` |
| `get_large_trader_positions` | 大額交易人未沖銷部位 | `product`, `date` | TAIFEX OpenAPI | `AVAILABLE` |
| `get_institutional_derivatives_positions` | 三大法人期貨/選擇權部位 | `product`, `date_range` | TAIFEX OpenAPI / TAIFEX 網站下載 | `AVAILABLE` |

### 9.7 三大法人籌碼流向

> *"三大法人今天買超哪些股票？" / "外資在哪個產業加碼？"*

| Tool | 說明 | 主要參數 | 資料來源 | Grade |
|---|---|---|---|---|
| `get_institutional_investors`（既有） | 上市/上櫃三大法人買賣超 | `symbol_or_market`, `date` | TWSE Web API / TPEx OpenAPI | `AVAILABLE` |
| `get_foreign_industry_allocation` | 外資產業配置總覽 | — | TWSE OpenAPI | `PREVIEW` |

### 9.8 個股財報體檢

> *"幫我做台積電的財報體檢" / "這家公司的財務體質健不健康？"*

| Tool | 說明 | 主要參數 | 資料來源 | Grade |
|---|---|---|---|---|
| `get_financial_health_report` | 獲利/成長/財務結構/配息/公司治理五面向 | `symbol` | MOPS + TWSE OpenAPI | `PREVIEW` |

### 9.9 買前風險掃描

> *"這檔股票買進前有沒有被列處置或注意？"*

| Tool | 說明 | 主要參數 | 資料來源 | Grade |
|---|---|---|---|---|
| `get_risk_flags` | 處置股/注意股/當沖限制/停資停券比對 | `symbol` | TWSE OpenAPI / TPEx OpenAPI | `AVAILABLE` |

### 9.10 期貨/三大法人歷史回溯查詢

> *"幫我拉台指期最近一個月的每日OHLC" / "外資期貨部位過去三個月怎麼變化？"*

| Tool | 說明 | 主要參數 | 資料來源 | Grade |
|---|---|---|---|---|
| `get_futures_ohlc_history` | 期貨每日 OHLC 歷史 | `product`, `date_range` | TAIFEX 網站下載（`FALLBACK`） | `AVAILABLE` |
| `get_institutional_derivatives_history` | 三大法人期貨部位歷史 | `product`, `date_range` | TAIFEX 網站下載（`FALLBACK`） | `AVAILABLE` |

### 9.11 盤中即時／盤後基礎（既有 Tool，維持）

| Tool | 說明 | 主要參數 | 資料來源 | Grade |
|---|---|---|---|---|
| `set_active_watchlist` | 設定盤中即時監控清單（≤15檔） | `symbols` | TWSE MIS | `AVAILABLE` |
| `get_intraday_kline` | 盤中即時 1分K/5分K（含影線與 `_chart_meta`） | `symbol`, `timeframe` | TWSE MIS | `AVAILABLE` |
| `get_stock_daily_quote` | 個股每日盤後歷史日K線與籌碼 | `symbol`, `date_range` | TWSE Web API / TPEx OpenAPI | `AVAILABLE` |

> 25 個 Tool 中，**14 個標註 `AVAILABLE`**（資料來源明確、可直接實作）、**9 個標註 `PREVIEW`**（需額外聚合/計算邏輯）、**2 個標註 `NOT_YET_AVAILABLE`**（`get_warrant_activity`、`screen_value_growth_stocks`，需先確認 TWSE OpenAPI 是否有對應成長/價值因子端點，否則需以既有財報+估值資料自行派生）。此分級直接對應 §13 的分階段 Roadmap。

---

## 10. 效能最佳化設計 (`pkg/domain/screener/`)

盤中引擎的效能設計（8s 輪詢、RingBuffer）已在 §8 涵蓋。本節聚焦 §9 中**跨全市場（2,000+ 檔）的批次類 Tool**（如 `screen_high_dividend_yield`、`screen_value_growth_stocks`、`get_abnormal_volume_stocks`），這類操作若逐檔即時查詢，回應時間會遠超合理範圍。

### 10.1 批次端點優先於逐檔查詢

§3 資料源中，TWSE Web API 提供「全市場收盤行情」等批次端點——這類端點應永遠優先於「逐檔呼叫 2,000 次個股 API」。Adapter 設計規則：**任何 domain 模組在實作篩選類邏輯前，必須先確認是否存在對應的全市場批次端點**，只有在不存在時才退回逐檔查詢＋併發控制。

### 10.2 Bounded Worker Pool（僅用於無批次端點可用的情境）

當必須逐檔查詢時（例如 §9.8 財報體檢需逐檔解析 MOPS 個別公司頁面），採 `errgroup.SetLimit` 限制併發數，併發數與 §5.3 的 `RATE_LIMIT_BULK_CONCURRENCY` 一致，避免瞬間洪水式請求觸發官方端防護：

```go
package screener

import (
	"context"

	"golang.org/x/sync/errgroup"
)

// ScanUniverse 以 bounded concurrency 掃描全市場個股，
// concurrency 對應 RATE_LIMIT_BULK_CONCURRENCY（預設 8）
func ScanUniverse(ctx context.Context, symbols []string, concurrency int, fn func(string) error) error {
	g, ctx := errgroup.WithContext(ctx)
	g.SetLimit(concurrency)

	for _, sym := range symbols {
		sym := sym
		g.Go(func() error {
			return fn(sym) // fn 內部已套用 §5 的 per-source rate limiter 與快取
		})
	}
	return g.Wait()
}
```

### 10.3 Materialized Screener Index

篩選類 Tool（殖利率、價值/成長股）若每次呼叫都即時運算全市場，即使有快取也仍需彙總 2,000+ 筆快取資料，延遲仍偏高。改採**每日排程（收盤後）預先計算一份 materialized index，寫入 SQLite（§5 L2）**，查詢時直接讀取索引並依條件過濾/排序，不做即時聚合：

- 排程時機：每交易日 15:00（三大法人、融資融券皆已公布後）觸發一次全市場重新計算。
- 索引內容：每檔個股的 `DividendRecord`、`FinancialHealthReport.OverallScore`、`ValuationRatios` 等正規化欄位快照。
- 查詢路徑：`screen_high_dividend_yield` 等 Tool 直接 `SELECT ... ORDER BY dividend_yield_pct DESC LIMIT ?`，不觸發任何即時 Adapter 請求；`_lineage.freshness` 標註為索引建立時間，而非查詢當下時間，誠實反映資料實際新鮮度。

### 10.4 連線重用

所有 Adapter 共用 `pkg/provider/client.go` 的單一 `http.Client`（含 connection pool），避免每次請求重新建立 TLS handshake；§8 的 MIS Worker 額外維持獨立 `cookiejar`，因其 Session 需要跨請求保留。

---

## 11. 圖表親和資料設計 (`pkg/chart/`)

v2.0 的 `_chart_meta` 僅為 Kline 設計。v2.1 將其擴展為通用結構，涵蓋五種圖表型別，讓 §9 的 25 個 Tool 都能視需要附帶圖表資料：

```go
package chart

type ChartType string

const (
	ChartTypeCandlestick ChartType = "candlestick" // 盤中/日K
	ChartTypeLine        ChartType = "line"        // 歷史趨勢（法人流向、PC Ratio）
	ChartTypeBar         ChartType = "bar"          // 排名/篩選結果（殖利率排行）
	ChartTypeHeatmap     ChartType = "heatmap"      // 財報體檢五面向、產業熱力圖
	ChartTypeTable       ChartType = "table"        // 除權息行事曆、風險旗標比對
)

type ChartMeta struct {
	RecommendedType ChartType    `json:"recommended_type"`
	XAxisKey        string       `json:"x_axis_key"`
	YAxisKeys       []string     `json:"y_axis_keys"`
	Series          []SeriesData `json:"series"`
}

type SeriesData struct {
	Timestamp string                 `json:"timestamp"`
	Values    map[string]interface{} `json:"values"`
}
```

**各投資情境的建議圖表型別對照**：

| 投資情境 | 建議 `recommended_type` |
|---|---|
| 盤中/日K線 | `candlestick` |
| 三大法人買賣超歷史、外資持股歷史、Put/Call Ratio 歷史 | `line` |
| 高殖利率篩選結果、價值/成長股篩選結果 | `bar`（依指標排序） |
| 財報體檢五面向 | `heatmap`（或雷達圖，前端自行決定渲染方式，本欄位僅提供資料結構建議） |
| 除權息行事曆、風險旗標比對 | `table` |

`recommended_type` 僅為建議值，供 AI Agent 或前端 dashboard 決定渲染方式；`series` 陣列本身已是正規化的 X/Y 資料，即使呼叫端忽略 `recommended_type` 直接自行決定圖表型別，也不需要重新解析資料結構——這是 Chart Readiness 與 Schema Normalization 兩項需求彼此呼應之處。

---

## 12. 核心實作範例

### 12.1 `main.go`（Tool 註冊，含既有盤中 Tool 與新增篩選 Tool）

```go
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/modelcontextprotocol/go-sdk/mcp"
	"github.com/modelcontextprotocol/go-sdk/server"
	"tw-quant-mcp/pkg/chart"
	"tw-quant-mcp/pkg/model"
	"tw-quant-mcp/pkg/model/domain"
)

func main() {
	s := server.NewServer("tw-quant-mcp", "2.1.0")

	// 1. 註冊設定觀察清單 Tool（維持 v2.0）
	s.RegisterTool(
		mcp.Tool{
			Name:        "set_active_watchlist",
			Description: "設定盤中即時監控清單 (硬性限制上限 15 檔，防止 MIS 防護 Ban IP)",
			InputSchema: mcp.ToolInputSchema{
				Type: "object",
				Properties: map[string]interface{}{
					"symbols": map[string]interface{}{
						"type":        "array",
						"items":       map[string]interface{}{"type": "string"},
						"description": "股票代號陣列，例如 [\"2330\", \"2317\"]，上限 15 檔",
					},
				},
				Required: []string{"symbols"},
			},
		},
		handleSetWatchlist,
	)

	// 2. 註冊獲取即時 1 分 K 線 Tool（維持 v2.0）
	s.RegisterTool(
		mcp.Tool{
			Name:        "get_intraday_kline",
			Description: "查詢指定股票當日盤中即時 1 分 K / 5 分 K 線（含完整影線 OHLC 與圖表格式）",
			InputSchema: mcp.ToolInputSchema{
				Type: "object",
				Properties: map[string]interface{}{
					"symbol":    map[string]interface{}{"type": "string", "description": "股票代號 (例如: 2330)"},
					"timeframe": map[string]interface{}{"type": "string", "description": "K線週期: '1m' 或 '5m'，預設 '1m'"},
				},
				Required: []string{"symbol"},
			},
		},
		handleGetIntradayKline,
	)

	// 3. [NEW] 註冊高殖利率篩選 Tool（對應 §9.4，示範 materialized index 查詢模式）
	s.RegisterTool(
		mcp.Tool{
			Name:        "screen_high_dividend_yield",
			Description: "全市場高殖利率個股篩選（讀取每日收盤後預先計算之 materialized index，非即時運算）",
			InputSchema: mcp.ToolInputSchema{
				Type: "object",
				Properties: map[string]interface{}{
					"min_yield_pct": map[string]interface{}{"type": "number", "description": "最低殖利率門檻，例如 5.0"},
					"top_n":         map[string]interface{}{"type": "integer", "description": "回傳筆數上限，預設 20"},
				},
				Required: []string{"min_yield_pct"},
			},
		},
		handleScreenHighDividendYield,
	)

	log.Println("Starting tw-quant-mcp v2.1 Go Server on Stdio transport...")
	if err := server.ServeStdio(s); err != nil {
		log.Fatalf("MCP Server error: %v", err)
	}
}

func handleSetWatchlist(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	var symbols []string
	if raw, ok := req.Arguments["symbols"].([]interface{}); ok {
		for _, item := range raw {
			if s, ok := item.(string); ok {
				symbols = append(symbols, s)
			}
		}
	}
	if len(symbols) > 15 {
		return mcp.NewToolResultText("錯誤: 為維護系統穩定度與防範 MIS 封鎖，即時監控清單一次最多不可超過 15 檔。"), nil
	}
	msg := fmt.Sprintf("成功更新盤中即時監控清單，共 %d 檔股票。背景 Engine 已啟動 8s 採樣。", len(symbols))
	return mcp.NewToolResultText(msg), nil
}

func handleGetIntradayKline(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	symbol, _ := req.Arguments["symbol"].(string)
	timeframe, _ := req.Arguments["timeframe"].(string)
	if timeframe == "" {
		timeframe = "1m"
	}

	resp := struct {
		Symbol      string           `json:"symbol"`
		Name        string           `json:"name"`
		Timeframe   string           `json:"timeframe"`
		Bars        []model.KlineBar `json:"bars"`
		LineageInfo model.Lineage    `json:"_lineage"`
		ChartData   interface{}      `json:"_chart_meta,omitempty"`
	}{
		Symbol:    symbol,
		Name:      "台積電",
		Timeframe: timeframe,
		Bars: []model.KlineBar{
			{Timestamp: "09:05:00", Open: 980, High: 990, Low: 975, Close: 982, Volume: 1200},
			{Timestamp: "09:06:00", Open: 982, High: 985, Low: 980, Close: 984, Volume: 850},
		},
		LineageInfo: model.Lineage{
			Source:      "TWSE_MIS_REALTIME",
			SourceRole:  model.SourceRoleRealtime,
			FetchedAt:   time.Now(),
			DataDate:    time.Now().Format("2006-01-02"),
			Freshness:   "REALTIME_INTRADAY",
			SamplingSec: 8,
			IsCached:    false,
			Grade:       model.GradeAvailable,
		},
		ChartData: &chart.ChartMeta{
			RecommendedType: chart.ChartTypeCandlestick,
			XAxisKey:        "timestamp",
			YAxisKeys:       []string{"open", "high", "low", "close"},
			Series: []chart.SeriesData{
				{Timestamp: "09:05:00", Values: map[string]interface{}{"open": 980, "high": 990, "low": 975, "close": 982, "vol": 1200}},
				{Timestamp: "09:06:00", Values: map[string]interface{}{"open": 982, "high": 985, "low": 980, "close": 984, "vol": 850}},
			},
		},
	}

	jsonBytes, _ := json.MarshalIndent(resp, "", "  ")
	return mcp.NewToolResultText(string(jsonBytes)), nil
}

// handleScreenHighDividendYield 示範 §10.3 materialized index 查詢模式：
// 不即時呼叫任何 Adapter，直接讀取每日收盤後預先計算好的 SQLite 索引。
func handleScreenHighDividendYield(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	minYield, _ := req.Arguments["min_yield_pct"].(float64)
	topN := 20
	if v, ok := req.Arguments["top_n"].(float64); ok {
		topN = int(v)
	}

	// 模擬自 materialized index 讀出的結果（實作應為 SQLite 查詢）
	results := []domain.DividendRecord{
		{
			Stock:                domain.StockIdentity{Symbol: "2882", Name: "國泰金", Market: "TSE", Industry: "金融保險"},
			FiscalYear:           "2025",
			CashDividend:         2.5,
			DividendYieldPct:     6.8,
			PayoutStabilityScore: 88.0,
			Lineage: model.Lineage{
				Source:      "TWSE_WEB_API",
				SourceRole:  model.SourceRoleCanonical,
				FetchedAt:   time.Now().Add(-3 * time.Hour), // 索引建立時間，如實反映非即時
				DataDate:    time.Now().Format("2006-01-02"),
				Freshness:   "POST_MARKET",
				IsCached:    true,
				CacheAgeSec: 10800,
				Grade:       model.GradePreview,
			},
		},
	}
	_ = minYield
	_ = topN

	respBody := struct {
		Results   []domain.DividendRecord `json:"results"`
		ChartData interface{}              `json:"_chart_meta,omitempty"`
	}{
		Results: results,
		ChartData: &chart.ChartMeta{
			RecommendedType: chart.ChartTypeBar,
			XAxisKey:        "symbol",
			YAxisKeys:       []string{"dividend_yield_pct"},
		},
	}

	jsonBytes, _ := json.MarshalIndent(respBody, "", "  ")
	return mcp.NewToolResultText(string(jsonBytes)), nil
}
```

**兩個範例的對比意義**：`get_intraday_kline` 展示「即時、不快取、`SEMI_OFFICIAL_REALTIME`」的資料路徑；`screen_high_dividend_yield` 展示「批次、重度快取、`CANONICAL` 但經過 materialized index 二次加工」的資料路徑。兩者共用同一套 `Lineage`／`ChartMeta` Schema，呼叫端不需要因為「這是即時還是批次資料」而改變解析邏輯——這正是 §1 七大原則在實作層的具體體現。

---

## 13. 開發時程與測試策略 (v2.1 Roadmap)

Roadmap 依 §9 各 Tool 的 `grade` 分階段交付，而非一次性承諾全部 25 個 Tool——呼應 twmarketdata.com「controlled rollout，避免過度承諾」的精神。

1. **Phase 1：基礎設施層（Week 1-2）**
   - 實作 §5 雙層快取（Ristretto + SQLite）與 §5.3 Per-Source Rate Limiter。
   - 實作 §4 通用 `Lineage`／`SourceRole`／`DataGrade`，作為所有後續 Adapter 的共同輸出介面。
   - 延續 v2.0 進度：帶 Cookie 預熱與隨機 Jitter (7~9s) 的 MIS HTTP Worker；測試單一 Request 包含 15 檔股票之 Response 延遲與穩定度。

2. **Phase 2：盤中引擎收尾（Week 3）**
   - 開發 Go 記憶體 `RingBuffer`，實現 §8 的 Snapshot 聚合為 1m/5m OHLC 影線演算法。
   - 整合 `set_active_watchlist` 與 `get_intraday_kline`，驗證 `_chart_meta` 格式（延續 v2.0 Phase 2-3）。

3. **Phase 3：`AVAILABLE` 級 Tool（Week 4-6，共 14 個）**
   - 依 §3 實作 TWSE Web API / TPEx OpenAPI / TAIFEX OpenAPI / TAIFEX 網站下載 四類 Adapter，優先完成 §9 中標註 `AVAILABLE` 的 14 個 Tool（含 `get_stock_daily_quote`、`get_institutional_investors`、`get_ex_dividend_calendar`、期貨籌碼三個 Tool、歷史回溯兩個 Tool、風險掃描等）。
   - 每個 Tool 均需通過 §6 正規化 Schema 的單元測試，確認 Adapter 輸出不含任何未轉換的原始欄位。

4. **Phase 4：`PREVIEW` 級 Tool 與 MOPS Adapter（Week 7-9，共 9 個）**
   - 開發 MOPS AJAX/HTML Table 解析 Adapter（需比 JSON Adapter 更高的容錯設計）。
   - 實作趨勢綜合、財報體檢、股利穩定性等需跨來源聚合計算的 Tool。

5. **Phase 5：效能層與篩選類 Tool（Week 10-11）**
   - 實作 §10.3 Materialized Screener Index 與每日排程重算機制。
   - 實作 `screen_high_dividend_yield`；`screen_value_growth_stocks`／`get_warrant_activity` 待來源可行性確認後再排入（目前標註 `NOT_YET_AVAILABLE`）。

6. **Phase 6：整合測試與上線（Week 12）**
   - 在開盤時間（09:00~13:30）進行 4.5 小時連續運行測試，確保 RingBuffer 無 Memory Leak 且 IP 無被 Ban 紀錄（延續 v2.0 測試項目）。
   - 全量 25 個 Tool 的 Lineage／Cache／Chart 欄位一致性測試。
   - `go build` 單一可執行檔發布。

---

## 14. 需求對照表 (Requirements Traceability)

| # | 原始優化需求 | 對應章節 |
|---|---|---|
| 1 | 資料來源鎖定在免費、可信任的 TWSE、TPEx、MOPS、TAIFEX 官方資料 | §3（Source Role 分級表）、§1 原則 1 |
| 2 | 貫徹 Data Lineage | §4（通用 Lineage Schema）、§8 尾註（既有引擎的 Lineage 升級） |
| 3 | 適度快取（Caching）防範 Rate Limit | §5（雙層快取 + Per-Source Rate Limiter + TTL 矩陣） |
| 4 | 欄位歸一化 (Schema Normalization) | §6（六大正規化 Schema）、§2 架構圖 Normalization Layer |
| 5 | 模組化 | §7（`pkg/domain/` 領域分層） |
| 6 | 效能最佳化 | §10（批次端點優先、Bounded Worker Pool、Materialized Index） |
| 7 | 資料設計需日後簡易圖表化 | §11（通用 `_chart_meta`，五種圖表型別） |
| — | 十大投資分析情境（個股趨勢研判 ～ 期貨/三大法人歷史回溯查詢） | §9（25 個 Tool 逐一對應） |
| — | 盤中 1 分 K 即時線型引擎（15檔 Watchlist、RingBuffer、MIS 防封鎖） | §8（完整保留 v2.0 設計） |

---

## 參考資料

- [TW Market Data — 資料血緣](https://twmarketdata.com/zh-TW/docs/data-freshness-lineage)：official/public-first 與 canonical/helper/fallback 分級精神之依據。
- [twjackysu/TWSEMCPServer](https://github.com/twjackysu/TWSEMCPServer)：§3 官方來源盤點表格與 §9 十大投資分析情境之依據。
- [sacahan/CasualMarket](https://github.com/sacahan/CasualMarket)：§5 快取／Rate Limit 可調參數設計之參考。

> 本規格書為架構與介面設計層級之文件，實作前建議針對 §9 標註 `NOT_YET_AVAILABLE` 的 2 個 Tool、以及 MOPS AJAX 端點的長期穩定性，另行進行技術可行性 Spike。
