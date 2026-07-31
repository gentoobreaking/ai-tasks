這是一份升級後的 **`tw-quant-mcp` 專案開發規格書 v2.0**。

在此版本中，我們已正式將 **「盤中 1 分 K 即時線型引擎（Intraday Real-time Kline Engine）」** 納入系統核心，並設計了 **15 檔動態熱門股觀察清單（Watchlist）機制**、**記憶體環形緩衝區（RingBuffer）** 與 **MIS 請求優化模組**，確保在不觸發 IP 封鎖的前提下，提供包含真實上下影線的高精準度 1 分 K 線與 `_chart_meta` 圖表資料。

---

# `tw-quant-mcp` 專案開發規格書 (v2.0)

### System Architecture & Development Specification with Real-time Intraday Engine

本文件定義以 Go 語言實作之量化、盤後籌碼與**盤中即時 1 分 K 線 MCP Server**——**`tw-quant-mcp`**。本專案結合 **Data Lineage（資料新鮮度與血統）** 理念，自 TWSE、TPEx、MOPS、TAIFEX 與 MIS 官方免費來源獲取資料，經由快取、記憶體重採樣（Resampling）、欄位歸一化與模組化架構，提供 AI Agent 與自動化程式強健、高效能且可圖表化的數據介面。

---

## 1. 專案願景與架構設計目標

1. **官方權威 (Authority)**：100% 直連 TWSE、TPEx、MOPS、TAIFEX 與 TWSE MIS 官方開放來源。
2. **血統透明 (Data Lineage)**：所有回傳資料皆附帶來源機構、抓取時間、資料日期、採樣頻率與快取狀態。
3. **盤中即時 1 分 K (Intraday Kline Engine)**：針對最多 **15 檔動態觀察清單** 進行每 8 秒的高頻 Snapshot 輪詢，於記憶體內動態聚合（Aggregate）出含精準 OHLC (Open, High, Low, Close) 上下影線與成交量的 1 分 K 線。
4. **防封鎖安全機制 (Anti-Throttling)**：內建 Cookie 預熱、Session Pool、Batch Chunking 與隨機擾動 (Jitter) 機制，確保請求不被 MIS 封鎖。
5. **圖表親和 (Chart Readiness)**：回傳之 JSON 結構進行正規化，且預留高階圖表渲染所需的時序陣列（Series）與軸線設定。

---

## 2. 系統總體架構 (System Architecture)

採用 **三層模組化分層架構 (Layered Architecture)**，新增盤中背景採樣與記憶體聚合層：

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        MCP Clients / External Program                   │
│                    (Claude Desktop, Cursor, Custom Go Client)          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ JSON-RPC (Stdio / Streamable HTTP)
┌───────────────────────────────────▼────────────────────────────────────┐
│                             MCP Engine Layer                           │
│ - SDK: modelcontextprotocol/go-sdk                                     │
│ - Handler Routers, Schema Definition & Validation                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Normalized Query
┌───────────────────────────────────▼────────────────────────────────────┐
│                         Core Domain & Engine Services                  │
│                                                                        │
│  ┌──────────────────────────────┐    ┌──────────────────────────────┐  │
│  │ Rate Limiter & Concurrency   │    │ Multi-Tier Cache Engine      │  │
│  │ (golang.org/x/time/rate)     │    │ (Ristretto + Local SQLite)   │  │
│  └──────────────────────────────┘    └──────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Intraday Real-time Kline Engine (09:00 - 13:30)                  │  │
│  │ - Active Watchlist Manager (Max 15 Stocks)                        │  │
│  │ - 8s Poller & In-Memory RingBuffer (Resample to 1m/5m K-Line)    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Fetch Raw Data / Batch Requests
┌───────────────────────────────────▼────────────────────────────────────┐
│                         Official Provider Adapters                     │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐ │
│ │ TWSE Adapter │ │ TPEx Adapter │ │ MOPS Adapter │ │ TWSE MIS Worker │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └─────────────────┘ │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Resilient HTTP Client (Session, Header Injection)
                     [ TWSE / TPEx / MOPS / TAIFEX / MIS ]

```

---

## 3. 模組與目錄結構 (Module Layout)

```text
tw-quant-mcp/
├── cmd/
│   └── mcp-server/          # 入口點 (Main Entry Point)
│       └── main.go
├── pkg/
│   ├── mcp/                 # MCP Server 初始化與 Tool 註冊
│   ├── provider/            # 各官方數據源 Adapters
│   │   ├── client.go        # 帶 Session 維持與 Rate Limit 的 Resilience HTTP Client
│   │   ├── twse.go          # TWSE OpenAPI (盤後)
│   │   ├── tpex.go          # TPEx OpenAPI (盤後)
│   │   ├── mops.go          # 公開資訊觀測站 (財報/營收)
│   │   └── mis_worker.go    # [NEW] MIS 盤中 8 秒 Poller 與 Session 維持模組
│   ├── engine/              # [NEW] 盤中即時計算引擎
│   │   ├── watchlist.go     # 動態觀察清單管理器 (Max 15 檔)
│   │   └── aggregator.go    # 記憶體 RingBuffer & 1 分 K 重採樣 (Resampler)
│   ├── model/               # 統一資料結構 (Normalized Models) & Lineage
│   ├── cache/               # 高效能 Cache Engine (Ristretto + Local Tier)
│   └── chart/               # 圖表轉換器 (Chart Ready Transformer)
├── go.mod
└── go.sum

```

---

## 4. 核心模組詳細規格與數據設計

### 4.1 Data Lineage 與即時 K 線資料結構 (`pkg/model/lineage.go`)

在即時 K 線場景中，`_lineage` 會標註 **採樣間隔** 與 **當前觀察清單容量**，確保血統透明。

```go
package model

import "time"

type Lineage struct {
	Source       string    `json:"source"`         // "TWSE_OPENAPI", "TWSE_MIS_REALTIME"
	FetchedAt    time.Time `json:"fetched_at"`     // 數據抓取/計算時間
	DataDate     string    `json:"data_date"`      // 歸屬日期 (YYYY-MM-DD)
	Freshness    string    `json:"freshness"`       // "REALTIME_INTRADAY", "POST_MARKET"
	SamplingSec  int       `json:"sampling_sec"`   // [NEW] 採樣間隔 (例如 8 秒)
	IsCached     bool      `json:"is_cached"`
	LatencyMS    int64     `json:"latency_ms"`
}

// KlineBar 代表單根 1 分 K 線
type KlineBar struct {
	Timestamp string  `json:"timestamp"` // HH:MM:00
	Open      float64 `json:"open"`      // 第一筆採樣價
	High      float64 `json:"high"`      // 區間內最高採樣價
	Low       float64 `json:"low"`       // 區間內最低採樣價
	Close     float64 `json:"close"`     // 最後一筆採樣價
	Volume    int64   `json:"volume"`    // 該 1 分鐘內成交股數 (Δv_total)
}

// IntradayKlineResponse 即時 K 線工具回傳格式
type IntradayKlineResponse struct {
	Symbol      string     `json:"symbol"`
	Name        string     `json:"name"`
	Timeframe   string     `json:"timeframe"` // "1m", "5m"
	Bars        []KlineBar `json:"bars"`
	LineageInfo Lineage    `json:"_lineage"`
	ChartData   interface{} `json:"_chart_meta,omitempty"`
}

```

---

### 4.2 盤中 1 分 K 線採樣引擎規格 (`pkg/engine/aggregator.go`)

為了解決「每 1 分鐘才抓一次會丟失 High/Low 影線」的問題，引擎設計如下：

1. **採樣頻率 (Sampling Rate)**：設定為 **每 8 秒 $\pm$ 1 秒隨機擾動 (Jitter)** 抓取一次 Snapshot。
2. **觀察清單容量 (Watchlist Capacity)**：硬性限制 **上限 15 檔**。
3. **單次 Batch 請求**：將 15 檔股票拼裝為單一 MIS URL 參數：
`ex_ch=tse_2330.tw|tse_2317.tw|otc_6547.tw...`（單次 Request QPS $\approx 0.12$，極安全）。
4. **記憶體重採樣 (In-Memory Resampling)**：
* 引擎維護長度為 2025（約 4.5 小時 $\times$ 7.5 次/分）的 `RingBuffer` 儲存 Snapshots。
* 當用戶呼叫 `get_intraday_kline` 時，引擎取出該區間內的 Snapshots，按時間窗口（例如 `09:05:00 ~ 09:05:59`）進行歸併：
* **Open** = 區間內第一個 Snapshot 的 `z`
* **High** = $\max(\text{所有 Snapshots 的 } z)$
* **Low** = $\min(\text{所有 Snapshots 的 } z)$
* **Close** = 區間內最後一個 Snapshot 的 `z`
* **Volume** = $\text{區間末 } v_{total} - \text{區間初 } v_{total}$





---

### 4.3 防封鎖 MIS Worker 設計 (`pkg/provider/mis_worker.go`)

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

	// 注入 8 秒 $\pm$ 1 秒隨機延遲 (Jitter) 避免機械特徵
	jitter := time.Duration(7000+rand.Intn(2000)) * time.Millisecond
	time.Sleep(jitter)

	// 此處回傳 Raw JSON 供 Engine 解析 z, v_total, tlong
	return "", nil
}

```

---

## 5. MCP Tool 註冊與新增介面 (`pkg/mcp/server.go`)

除原有的盤後工具外，新增盤中動態管理與即時 K 線工具：

### 5.1 新增/更新 MCP Tools 清單：

1. **`set_active_watchlist` (NEW)**
* **描述**：設定盤中即時監控的股票觀察清單（最多 15 檔）。呼叫後 background worker 會開始每 8 秒進行 Snapshot 輪詢。
* **參數**：`symbols` (array of string, 必填, 長度 1~15)


2. **`get_intraday_kline` (NEW)**
* **描述**：獲取指定股票當天盤中的即時 1 分 K / 5 分 K 線圖（包含 Open, High, Low, Close, Volume 與圖表格式）。
* **參數**：
* `symbol` (string, 必填)
* `timeframe` (string, 選填, 預設 "1m", 可選 "5m")




3. **`get_stock_daily_quote` (盤後)**
* **描述**：獲取上市/上櫃個股每日盤後歷史日 K 線與籌碼。


4. **`get_institutional_investors` (盤後)**
* **描述**：獲取三大法人買賣超數據。



---

## 6. 核心實作範例：`main.go`

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
)

func main() {
	s := server.NewServer("tw-quant-mcp", "2.0.0")

	// 1. 註冊設定觀察清單 Tool
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

	// 2. 註冊獲取即時 1 分 K 線 Tool
	s.RegisterTool(
		mcp.Tool{
			Name:        "get_intraday_kline",
			Description: "查詢指定股票當日盤中即時 1 分 K / 5 分 K 線（含完整影線 OHLC 與圖表格式）",
			InputSchema: mcp.ToolInputSchema{
				Type: "object",
				Properties: map[string]interface{}{
					"symbol": map[string]interface{}{
						"type":        "string",
						"description": "股票代號 (例如: 2330)",
					},
					"timeframe": map[string]interface{}{
						"type":        "string",
						"description": "K線週期: '1m' 或 '5m'，預設 '1m'",
					},
				},
				Required: []string{"symbol"},
			},
		},
		handleGetIntradayKline,
	)

	log.Println("Starting tw-quant-mcp v2.0 Go Server on Stdio transport...")
	if err := server.ServeStdio(s); err != nil {
		log.Fatalf("MCP Server error: %v", err)
	}
}

func handleSetWatchlist(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	// 解析並檢查 symbols 數量
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

	// 呼叫 Engine 更新 Watchlist...
	msg := fmt.Sprintf("成功更新盤中即時監控清單，共 %d 檔股票。背景 Engine 已啟動 8s 採樣。", len(symbols))
	return mcp.NewToolResultText(msg), nil
}

func handleGetIntradayKline(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	symbol, _ := req.Arguments["symbol"].(string)
	timeframe, _ := req.Arguments["timeframe"].(string)
	if timeframe == "" {
		timeframe = "1m"
	}

	// 模擬自 Aggregator 記憶體取出的 1 分 K 線資料
	resp := model.IntradayKlineResponse{
		Symbol:    symbol,
		Name:      "台積電",
		Timeframe: timeframe,
		Bars: []model.KlineBar{
			{Timestamp: "09:05:00", Open: 980, High: 990, Low: 975, Close: 982, Volume: 1200},
			{Timestamp: "09:06:00", Open: 982, High: 985, Low: 980, Close: 984, Volume: 850},
		},
		LineageInfo: model.Lineage{
			Source:      "TWSE_MIS_REALTIME",
			FetchedAt:   time.Now(),
			DataDate:    time.Now().Format("2006-01-02"),
			Freshness:   "REALTIME_INTRADAY",
			SamplingSec: 8,
			IsCached:    false,
		},
		ChartData: &chart.ChartMeta{
			RecommendedType: chart.ChartTypeKline,
			XAxisKey:        "timestamp",
			YAxisKeys:       []string{"open", "high", "low", "close"},
			Series: []chart.SeriesData{
				{
					Timestamp: "09:05:00",
					Values:    map[string]interface{}{"open": 980, "high": 990, "low": 975, "close": 982, "vol": 1200},
				},
				{
					Timestamp: "09:06:00",
					Values:    map[string]interface{}{"open": 982, "high": 985, "low": 980, "close": 984, "vol": 850},
				},
			},
		},
	}

	jsonBytes, _ := json.MarshalIndent(resp, "", "  ")
	return mcp.NewToolResultText(string(jsonBytes)), nil
}

```

---

## 7. 開發時程與測試策略 (v2.0 Roadmap)

1. **Phase 1: MIS Worker & Session Pool (Week 1)**
* 實現帶 Cookie 預熱與隨機 Jitter (7~9s) 的 MIS HTTP Worker。
* 測試單一 Request 包含 15 檔股票之 Response 延遲與穩定度。


2. **Phase 2: In-Memory Resampler Engine (Week 2)**
* 開發 Go 記憶體 `RingBuffer`，實現將 Snapshots 聚合成 1m/5m OHLC 影線之演算法。


3. **Phase 3: Watchlist Manager & MCP Tools (Week 3)**
* 整合 `set_active_watchlist` 與 `get_intraday_kline`MCP 工具。
* 驗證 AI Agent 呼叫時產出的 `_chart_meta` 格式。


4. **Phase 4: Single Binary & Edge Load Testing (Week 4)**
* 在開盤時間（09:00~13:30）進行 4.5 小時連續運行測試，確保記憶體無 Memory Leak 且 IP 無被 Ban 紀錄。
* 進行 `go build` 單一可執行檔發布。
