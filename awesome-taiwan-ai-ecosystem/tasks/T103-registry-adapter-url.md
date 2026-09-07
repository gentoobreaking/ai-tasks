---
github_issue: N/A
title: 官方 MCP registry adapter URL 與可用性修補（P0-3）
type: bugfix
priority: medium
status: pending
assignee: pi with opencode
created: 2026-09-07
depends_on: [T097]
updated: 2026-09-07
---

# T103 - 官方 MCP registry adapter URL 與可用性修補

## 目標

修補 `internal/sources/registry/adapter.go` 預設 BaseURL `https://api.mcp-servers.dev` DNS 不存在、且 fallback 邏輯缺失的問題。

現況問題：`adapter.go:59` 與 `:72` 與 `:125` 寫死 `BaseURL = "https://api.mcp-servers.dev"`，crawler log 噴 `dial tcp: lookup api.mcp-servers.dev: no such host`，整個 source 永久靜默失敗。

阻塞：
- T097 P0-3（影響 discovery source 完整性，但非阻塞 list 產出）
- spec §5「Discovery Sources」需涵蓋「Official MCP Registry」

## 問題根因

`internal/sources/registry/adapter.go:58-60`：

```go
func New() *Adapter {
    return &Adapter{BaseURL: "https://api.mcp-servers.dev"}
}
```

`api.mcp-servers.dev` 是 placeholder URL，從未指向實際服務。

`internal/sources/registry/adapter_test.go:38` 仍用它做測試 fixture。

## 修法

**方案 A（推薦）：用真實的官方 registry URL + 環境變數覆寫**

真實的官方 MCP registry：
- 舊版：`https://api.mcp-servers.dev`（placeholder，不存在）
- 試行：`https://registry.modelcontextprotocol.io`（社群測試中）
- GitHub：`https://github.com/modelcontextprotocol/registry`（官方 repo 尚在早期）

**保守做法**：保留 `BaseURL` 為可設定，並透過 `MCP_REGISTRY_URL` 環境變數覆寫，預設值改成空字串 → 啟動時若空就 warn 並 skip（不要永久 0 candidate）。

### 修改 1：`adapter.go:58-60`

```go
// DefaultBaseURL is the official MCP registry URL. Empty means the source
// is disabled until configured. Override with MCP_REGISTRY_URL env var.
const DefaultBaseURL = ""

// New creates a new official registry adapter. Pass an empty baseURL to
// disable the source — Discover will return ErrSourceDisabled instead of
// failing on DNS.
func New(baseURL string) *Adapter {
    if baseURL == "" {
        baseURL = DefaultBaseURL
    }
    return &Adapter{BaseURL: baseURL}
}
```

`Discover` 開頭加：

```go
if a.BaseURL == "" {
    return nil, ErrSourceDisabled
}
```

新增 `ErrSourceDisabled`：

```go
var ErrSourceDisabled = errors.New("registry source disabled (no MCP_REGISTRY_URL configured)")
```

### 修改 2：`adapter.go:71-73` 與 `:121-123` 移除寫死 fallback

原本 `if a.BaseURL == "" { a.BaseURL = "https://api.mcp-servers.dev" }` 兩處都拿掉，改為回 `ErrSourceDisabled`。

### 修改 3：`setupCrawler` 串接 env

`cmd/crawler/main.go:218` 附近的 `registry.New()` 改為：

```go
adapters = append(adapters, registry.New(os.Getenv("MCP_REGISTRY_URL")))
```

### 修改 4：docker-compose 環境變數

`docker-compose.yaml` crawler 環境補：

```yaml
environment:
  - MCP_REGISTRY_URL=${MCP_REGISTRY_URL:-}
```

### 修改 5：測試 fixture 更新

`internal/sources/registry/adapter_test.go:19, 38` 從 `https://api.mcp-servers.dev` 改為用 `httptest.NewServer` 設假 URL（更穩健），或保留為 placeholder 並加註解「測試專用，實際 URL 見 MCP_REGISTRY_URL」。

### 修改 6：discovery log 訊息改進

crawler 收到 `ErrSourceDisabled` 不要 log `WARN source_error` 噴錯，改 log `INFO source_skipped reason=disabled`，避免污染 log 噪音。

## 驗收標準

- [ ] `New(baseURL string)` 簽章改為接受參數
- [ ] `DefaultBaseURL = ""`（空字串）— 預設 disabled
- [ ] `ErrSourceDisabled` error 加上
- [ ] `Discover` / `Fetch` 在 BaseURL 空時回 `ErrSourceDisabled`
- [ ] `setupCrawler` 從 `MCP_REGISTRY_URL` env 讀 URL
- [ ] `docker-compose.yaml` crawler 環境加 `MCP_REGISTRY_URL`
- [ ] `go build ./...` 通過
- [ ] `go test ./internal/sources/registry/... -v -count=1` 通過
- [ ] 新增 unit test：
  - New("") → BaseURL == ""
  - Discover with empty BaseURL → ErrSourceDisabled
  - Fetch with empty BaseURL → ErrSourceDisabled
- [ ] 啟動 crawler 不傳 env，log 顯示「INFO source_skipped source=registry reason=disabled」（不是 WARN source_error）
- [ ] 啟動 crawler 傳 `MCP_REGISTRY_URL=https://some-real.url`，會真的去打那個 URL（不再 0 candidate 因為 placeholder）

## 執行紀錄

_(待執行後填寫)_

## 備註

- 依賴 T097（差距分析）
- 對應 spec §5、§44 Discovery Sources
- 風險：真實官方 registry URL 仍不穩定，本任務重點是「不要用假 URL 永久 0 candidate」與「讓使用者能自行設定」
- 若之後官方 URL 公布，把 `MCP_REGISTRY_URL` 設到那個 URL 即可，不用改 code
- 相關任務：T097（差距分析）
