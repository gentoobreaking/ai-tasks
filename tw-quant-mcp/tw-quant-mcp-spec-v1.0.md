# `tw-quant-mcp` 專案開發規格書 (System Architecture & Development Specification)

本文件定義以 Go 語言實作之量化與盤後數據 MCP Server——**`tw-quant-mcp`**。本專案宗旨在於結合 **Data Lineage（資料新鮮度與血統）** 理念，自 TWSE、TPEx、MOPS、TAIFEX 等官方免費權威來源獲取資料，經由快取、欄位歸一化與模組化架構，提供 AI Agent 與自動化程式強健、高效能且可圖表化的數據介面。

---

## 1. 專案願景與架構設計目標

1. **官方權威 (Authority)**：100% 直連 TWSE、TPEx、MOPS、TAIFEX 官方開放 API 與 Web Data，不依賴不穩定的第三方爬蟲 API。
2. **血統透明 (Data Lineage)**：所有回傳資料皆附帶來源機構、抓取時間、資料日期與快取狀態。
3. **極致效能 (Performance)**：善用 Go 高併發能力，搭配置換率高、記憶體佔用低的快取架構，減少非必要 HTTP 網路請求。
4. **圖表親和 (Chart Readiness)**：回傳之 JSON 結構進行正規化，且預留高階圖表渲染所需的時序陣列（Series）與軸線設定，便利前端與 AI 生成圖表。

---

## 2. 系統總體架構 (System Architecture)

採用 **三層模組化分層架構 (Layered Architecture)**：

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
│                           Core Domain Services                         │
│ - Rate Limiter & Concurrency Manager (golang.org/x/time/rate)         │
│ - Multi-Tier Cache Engine (In-Memory Ristretto + SQLite Backup)        │
│ - Chart Formatter & Aggregator (Timeseries / OHLC Transformer)         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Fetch Raw Data
┌───────────────────────────────────▼────────────────────────────────────┐
│                         Official Provider Adapters                     │
│ ┌─────────────────┐ ┌─────────────────┐ ┌──────────────┐ ┌────────────┐ │
│ │  TWSE Adapter   │ │  TPEx Adapter   │ │ MOPS Adapter │ │TAIFEX Adapt│ │
│ └─────────────────┘ └─────────────────┘ └──────────────┘ └────────────┘ │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Resilient HTTP Client (Header Injection, Fallback)
                         [ TWSE / TPEx / MOPS / TAIFEX ]

```

---

## 3. 模組設計 (Module Design)

專案結構遵循 Go 標準 layout 標準：

```text
tw-quant-mcp/
├── cmd/
│   └── mcp-server/          # 入口點 (Main Entry Point)
│       └── main.go
├── pkg/
│   ├── mcp/                 # MCP Server 初始化與 Tool 註冊
│   ├── provider/            # 各官方數據源 Adapters (TWSE, TPEx, MOPS, TAIFEX)
│   │   ├── client.go        # 統一帶 HTTP Header / Rate Limit 的 Resilience HTTP Client
│   │   ├── twse.go
│   │   ├── tpex.go
│   │   ├── mops.go
│   │   └── taifex.go
│   ├── model/               # 統一資料結構 (Normalized Models) & Lineage
│   ├── cache/               # 高效能 Cache Engine (Ristretto + Local Tier)
│   └── chart/               # 圖表轉換器 (Chart Ready Transformer)
├── go.mod
└── go.sum

```

---

## 4. 核心模組詳細規格與數據設計

### 4.1 Data Lineage 與通用資料結構設計 (`pkg/model/lineage.go`)

所有 MCP 工具回傳的 JSON 根物件，**強制包含 `_lineage` 與 `_chart_meta**` 欄位。

```go
package model

import "time"

// Lineage 描述數據血統與新鮮度
type Lineage struct {
	Source       string    `json:"source"`         // 來源機構，例如 "TWSE_OPENAPI", "TPEx_WEB"
	FetchedAt    time.Time `json:"fetched_at"`     // 數據抓取/快取命中時間
	DataDate     string    `json:"data_date"`      // 數據歸屬日期 (YYYY-MM-DD)
	Freshness    string    `json:"freshness"`       // "REALTIME", "POST_MARKET", "DELAYED"
	IsCached     bool      `json:"is_cached"`      // 是否自快取取得
	LatencyMS    int64     `json:"latency_ms"`     // 上游請求耗時 (毫秒)
}

// NormalizedStockQuote 歸一化股票行情結構
type NormalizedStockQuote struct {
	Symbol        string   `json:"symbol"`         // 股票代號 (例如 "2330")
	Name          string   `json:"name"`           // 股票名稱
	Market        string   `json:"market"`         // "TWSE" 或 "TPEx"
	Open          float64  `json:"open"`
	High          float64  `json:"high"`
	Low           float64  `json:"low"`
	Close         float64  `json:"close"`
	Volume        int64    `json:"volume"`         // 成交股數
	Change        float64  `json:"change"`         // 漲跌金額
	ChangePercent float64  `json:"change_percent"` // 漲跌幅 (%)
	LineageInfo   Lineage  `json:"_lineage"`
	ChartData     *ChartMeta `json:"_chart_meta,omitempty"`
}

```

### 4.2 圖表繪製親和介面 (`pkg/chart/transformer.go`)

為了讓前段 UI (如 Recharts、ECharts) 或 LLM 能夠直接將回傳結果渲染成圖表，統一產出 `_chart_meta`。

```go
package chart

type ChartType string

const (
	ChartTypeKline  ChartType = "KLINE"
	ChartTypeLine   ChartType = "LINE"
	ChartTypeBar    ChartType = "BAR"
)

type ChartMeta struct {
	RecommendedType ChartType   `json:"recommended_type"`
	XAxisKey        string      `json:"x_axis_key"`
	YAxisKeys       []string    `json:"y_axis_keys"`
	Series          []SeriesData `json:"series"`
}

type SeriesData struct {
	Timestamp string    `json:"timestamp"` // ISO8601 或 YYYY-MM-DD
	Values    map[string]interface{} `json:"values"` // {"open": 980, "close": 985, "volume": 15000}
}

```

### 4.3 高效能雙層快取與防封鎖機制 (`pkg/cache/cache.go`)

為了防止頻繁請求官方 API 導致被鎖 IP，實作 **兩層快取 (In-Memory + File/SQLite Key-Value Backup)** 與 **Leaky Bucket Rate Limiter**：

1. **In-Memory Cache**：採用 `dgraph-io/ristretto`（支援記憶體上限控制、高 Hit Ratio）。
2. **Rate Limiting**：對每個官方域名限制 `qps` (例如：TWSE 不超過 3 次/秒)。
3. **HTTP Resiliency**：統一注入主流瀏覽器 `User-Agent`，並對民國年（ROC Year）進行自動轉換解析。

```go
package provider

import (
	"net/http"
	"time"
	"golang.org/x/time/rate"
)

type ResilientClient struct {
	httpClient *http.Client
	limiters   map[string]*rate.Limiter // 依照 Domain 隔離 Rate Limiter
}

func NewResilientClient() *ResilientClient {
	return &ResilientClient{
		httpClient: &http.Client{Timeout: 10 * time.Second},
		limiters: map[string]*rate.Limiter{
			"twse":   rate.NewLimiter(rate.Every(350*time.Millisecond), 1),
			"tpex":   rate.NewLimiter(rate.Every(350*time.Millisecond), 1),
			"taifex": rate.NewLimiter(rate.Every(500*time.Millisecond), 1),
		},
	}
}

```

---

## 5. MCP Tool 註冊與介面規格 (`pkg/mcp/server.go`)

本服務將使用官方 `[github.com/modelcontextprotocol/go-sdk](https://github.com/modelcontextprotocol/go-sdk)`，並註冊以下標準工具：

### MCP Tools 清單：

1. **`get_stock_daily_quote`**
* **描述**：獲取指定上市/上櫃股票的每日盤後收盤價、成交量與漲跌幅。
* **參數**：`symbol` (string, 必填), `date` (string, 選填, YYYYMMDD)


2. **`get_institutional_investors`**
* **描述**：獲取全市場或個別股票之三大法人（外資、投信、自營商）買賣超金額與股數。
* **參數**：`date` (string, 必填), `symbol` (string, 選填)


3. **`get_mops_monthly_revenue`**
* **描述**：獲取公開資訊觀測站（MOPS）上市櫃公司單月合併營收與 YoY / MoM。
* **參數**：`symbol` (string, 必填), `year` (int), `month` (int)


4. **`get_taifex_futures_summary`**
* **描述**：獲取期交所每日台指期/選擇權三大法人大戶未平倉部位。
* **參數**：`date` (string, 必填)



---

## 6. 核心實作範例：`main.go`

完整進入點實現範例：

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
	// 初始化 MCP Server
	s := server.NewServer("tw-quant-mcp", "1.0.0")

	// 註冊 get_stock_daily_quote 工具
	s.RegisterTool(
		mcp.Tool{
			Name:        "get_stock_daily_quote",
			Description: "查詢指定上市/上櫃個股的盤後收盤行情，附帶 Data Lineage 與圖表格式",
			InputSchema: mcp.ToolInputSchema{
				Type: "object",
				Properties: map[string]interface{}{
					"symbol": map[string]interface{}{
						"type":        "string",
						"description": "股票代號 (例如: 2330)",
					},
					"date": map[string]interface{}{
						"type":        "string",
						"description": "日期 YYYYMMDD (例如: 20260731)，不填預設為最新交易日",
					},
				},
				Required: []string{"symbol"},
			},
		},
		handleGetStockDailyQuote,
	)

	log.Println("Starting tw-quant-mcp Go Server on Stdio transport...")
	if err := server.ServeStdio(s); err != nil {
		log.Fatalf("MCP Server terminated with error: %v", err)
	}
}

func handleGetStockDailyQuote(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	symbol, _ := req.Arguments["symbol"].(string)
	dateStr, _ := req.Arguments["date"].(string)

	if dateStr == "" {
		dateStr = time.Now().Format("20060102")
	}

	start := time.Now()

	// 模擬自 Provider / Cache 取得數據 (實際調用 twse/tpex adapter)
	data := model.NormalizedStockQuote{
		Symbol:        symbol,
		Name:          "台積電",
		Market:        "TWSE",
		Open:          975.0,
		High:          985.0,
		Low:           970.0,
		Close:         980.0,
		Volume:        28500000,
		Change:        5.0,
		ChangePercent: 0.51,
		LineageInfo: model.Lineage{
			Source:    "TWSE_OPENAPI",
			FetchedAt: time.Now(),
			DataDate:  fmt.Sprintf("%s-%s-%s", dateStr[0:4], dateStr[4:6], dateStr[6:8]),
			Freshness: "POST_MARKET",
			IsCached:  false,
			LatencyMS: time.Since(start).Milliseconds(),
		},
		ChartData: &chart.ChartMeta{
			RecommendedType: chart.ChartTypeKline,
			XAxisKey:        "timestamp",
			YAxisKeys:       []string{"open", "high", "low", "close"},
			Series: []chart.SeriesData{
				{
					Timestamp: fmt.Sprintf("%s-%s-%s", dateStr[0:4], dateStr[4:6], dateStr[6:8]),
					Values: map[string]interface{}{
						"open":  975.0,
						"high":  985.0,
						"low":   970.0,
						"close": 980.0,
						"vol":   28500000,
					},
				},
			},
		},
	}

	jsonBytes, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return nil, fmt.Errorf("failed to marshal output: %w", err)
	}

	return mcp.NewToolResultText(string(jsonBytes)), nil
}

```

---

## 7. 開發時程與測試策略 (Roadmap & Testing)

1. **Phase 1: Domain Models & Resilience Client**
* 完成 `model.Lineage` 與 `chart.ChartMeta` 結構。
* 完成支援 Rate Limiter 與 User-Agent 偽裝的 HTTP Client。


2. **Phase 2: Adapters & Data Normalization**
* 實現 TWSE、TPEx、MOPS、TAIFEX Adapters，並將民國年統一轉為 ISO8601 西元年。


3. **Phase 3: Cache & MCP Integration**
* 整合 `dgraph-io/ristretto` 快取機制。
* 呼叫 `modelcontextprotocol/go-sdk` 註冊 Tools 並處理 Stdio 通訊。


4. **Phase 4: Single Binary Compilation**
* 執行 `go build -o tw-quant-mcp ./cmd/mcp-server` 進行無依賴單一可執行檔發行。
