---
github_issue: N/A
title: mcpmarket adapter 預設 disabled（Vercel WAF 永久失敗污染 log）
type: bugfix
priority: low
status: pending
assignee: pi with opencode
created: 2026-09-07
depends_on: [T097]
updated: 2026-09-07
---

# T105 - mcpmarket adapter 預設 disabled

## 目標

把 `internal/sources/mcpmarket/adapter.go` 的 mcpmarket source 改為預設 disabled，解決 Vercel WAF 永久失敗污染 crawler log 的問題。

現況問題：`mcpmarket.com` 部署 Vercel Bot Protection，`adapter.go:41` 每次跑 crawler 都回 `ErrNotAvailable`，log 噴 `WARN source_error source=mcpmarket error="mcpmarket: source not available — Vercel WAF challenge required"`。長期 log 噪音。

阻塞：
- T097 P1-3（不影響 list 產出，但影響 log 可讀性與整體 source 健康度儀表板）

## 問題根因

`internal/sources/mcpmarket/adapter.go:24-41`：

```go
func New() *Adapter {
    return &Adapter{
        BaseURL: "https://mcpmarket.com",
    }
}

func (a *Adapter) Discover(ctx context.Context) ([]models.RawCandidate, error) {
    return nil, ErrNotAvailable
}
```

`ErrNotAvailable` 是設計性 disabled marker，但每次 discover 仍會被呼叫並 log 警告。

## 修法

### A. 結構層 disabled 標記

`mcpmarket/adapter.go` 加 `Enabled bool` 欄位：

```go
type Adapter struct {
    Enabled  bool   // NEW: when false, Discover is a no-op
    BaseURL  string
    HTTPClient HTTPClient
}

// New creates a new mcpmarket adapter. Default disabled because
// the site is currently behind Vercel Bot Protection (T105).
func New() *Adapter {
    return &Adapter{
        Enabled:  false,
        BaseURL:  "https://mcpmarket.com",
    }
}
```

### B. Discover 早退

```go
func (a *Adapter) Discover(ctx context.Context) ([]models.RawCandidate, error) {
    if !a.Enabled {
        return nil, ErrSourceDisabled
    }
    return nil, ErrNotAvailable // 仍記得真實原因
}

var (
    ErrNotAvailable    = errors.New("mcpmarket: source not available — Vercel WAF challenge required, waiting for official API cooperation")
    ErrSourceDisabled  = errors.New("mcpmarket: source disabled (set Adapter.Enabled = true to opt-in)")
)
```

### C. CLI flag 開關

`cmd/crawler/main.go` 加全域 flag：

```go
rootCmd.PersistentFlags().BoolVar(&enableMcpMarket, "enable-mcpmarket", false,
    "opt-in to mcpmarket source (currently behind Vercel WAF, disabled by default)")
```

`setupCrawler` 內 `mcpmarket.New()` 後設：

```go
m := mcpmarket.New()
m.Enabled = enableMcpMarket
adapters = append(adapters, m)
```

### D. coordinator 處理 `ErrSourceDisabled`

`internal/coordinator/coordinator.go:230` 附近的 `runDiscovery`，把 `ErrSourceDisabled` 與一般 error 分流：

```go
if err != nil {
    if errors.Is(err, sources.ErrSourceDisabled) {
        pc.logger.Info(ctx, crawlID, "DISCOVERY", "source_skipped",
            "source", a.Name(), "reason", "disabled")
        return
    }
    pc.logger.Warn(ctx, crawlID, "DISCOVERY", "source_error",
        "source", a.Name(), "error", err.Error())
    return
}
```

需要在 `internal/sources/` 加 `ErrSourceDisabled` 共用變數（各 adapter 都引用同一個），或個別 adapter 自有（須在 coordinator 用 `errors.Is` 比對）。

## 驗收標準

- [ ] `mcpmarket.Adapter.Enabled` 欄位加
- [ ] `mcpmarket.New()` 預設 `Enabled: false`
- [ ] `Discover` 開頭 `if !a.Enabled { return nil, ErrSourceDisabled }`
- [ ] `cmd/crawler --enable-mcpmarket` flag 加，預設 false
- [ ] `setupCrawler` 串接 flag
- [ ] coordinator 對 `ErrSourceDisabled` log INFO 而非 WARN
- [ ] `go build ./...` 通過
- [ ] `go test ./internal/sources/mcpmarket/... ./internal/coordinator/... -v -count=1` 通過
- [ ] 跑 `crawler discover` 不傳 flag，log 顯示 `INFO source_skipped source=mcpmarket reason=disabled`（不是 `WARN source_error`）
- [ ] 跑 `crawler discover --enable-mcpmarket`，log 顯示 `WARN source_error source=mcpmarket error="...Vercel WAF..."`（顯式 opt-in 仍 log 警告）

## 執行紀錄

_(待執行後填寫)_

## 備註

- 依賴 T097（差距分析）
- 對應 spec §5 Discovery Sources（mcpmarket 列在名單但實際不可用）
- 風險：低。變更為「預設 disabled + 顯式 opt-in」是更安全的設計
- T103（registry adapter）也會用到 `ErrSourceDisabled` 模式，建議兩個任務同步引入 `sources.ErrSourceDisabled` 共用變數
- 與 T103 連動：兩個 source 都預設 disabled 是合理的（placeholder URL + WAF）— 讓使用者顯式 opt-in
- 相關任務：T097、T103
