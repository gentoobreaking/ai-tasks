---
github_issue: N/A
title: 修復 GitHub Rate Limit — 遷移至 go-github-ratelimit
type: fix
priority: high
status: done
depends_on: [T007]
assignee: pi
created: 2026-09-05
updated: 2026-09-05
---

# T055 - 修復 GitHub Rate Limit — 遷移至 go-github-ratelimit

## 目標

修復 `internal/retry` 對 GitHub secondary rate limit 識別失效、10s cap 空轉、jitter 缺失及 `MaxConcurrency` 未 enforce 等缺陷；將 `gofri/go-github-ratelimit/v2` 以 `RoundTripper` Middleware 整合，解決 `./crawler crawl --source github --max-per-source 100` 觸發 abuse detection 的不穩定問題。

對應審計報告 `local://audit-ratelimit.md` R1-R15；涵蓋 `internal/retry/retry.go`、`internal/sources/github/adapter.go`、`internal/sources/githubrepo/adapter.go`。

## 驗收標準

- [x] `go get github.com/gofri/go-github-ratelimit/v2@v2.0.2` 已加入 `go.mod`，`go 1.25` 相容且無額外依賴
- [x] `internal/retry/retry.go` 以 `github_ratelimit.New(http.DefaultTransport, ...)` 包裝 Transport：Primary 阻擋同類別至 Reset（`RateLimitReachedError`），Secondary blocking sleep + 自動重試
- [x] `Secondary` 配置 `WithSingleSleepLimit 60s` / `WithTotalSleepLimit 5m` 並附 `slog.Warn` callbacks；`Primary` 附 `WithLimitDetected/RequestPrevented` callbacks
- [x] 移除 `getRateLimitDelay` 的 10s cap，改回真實 `time.Until(Reset)`；`Do` 以 `errors.As` 檢查 `RateLimitReachedError` 直接回錯不空轉
- [x] `calculateBackoff` 增加 jitter `0.8–1.2`（`math/rand/v2`）避免同步重試
- [x] `isRetryableStatus` 簡化為 `429 / 5xx / 403+Remaining==0`，secondary 判定委派給 Transport
- [x] `internal/sources/github/adapter.go` 與 `githubrepo/adapter.go` 改用 `retry.NewClientWithRateLimit`，`WithHTTPClient` 正確 wrap 注入的 Transport
- [x] `go test ./internal/retry ./internal/sources/github` 與 `go test ./...` 通過，`go vet` 0 警告

## 備註

- 風險：Primary 不 sleep 而回錯，需上游 `coordinator` 正確處理 `RateLimitReachedError`（已在 `Do` 層直接回錯讓上游決策）
- 來源放大係數：39 keywords × 30 items 最壞 1209 req，已由 Transport 的 per-resource 桶限流緩解
- `Authorization: Bearer` 保持不變，沿用 fine-grained PAT
