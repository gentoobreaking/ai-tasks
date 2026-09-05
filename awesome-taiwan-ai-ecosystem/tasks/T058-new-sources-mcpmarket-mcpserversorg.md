---
github_issue: N/A
title: 新增 3 Sources — mcpmarket/mcpservers.org/modelcontextprotocol/servers
type: feat
priority: high
status: done
depends_on: [T005, T006, T029]
assignee: pi
created: 2026-09-05
updated: 2026-09-05
---

# T058 - 新增 3 Sources — mcpmarket/mcpservers.org/modelcontextprotocol/servers

## 目標

新增 `https://mcpmarket.com/zh`、`https://mcpservers.org/zh-TW/`、`https://github.com/modelcontextprotocol/servers` 三來源的 `SourceAdapter`，補齊台灣與國際 MCP 覆蓋率；處理反爬差異與 `modelcontextprotocol/servers` 縮編至 7 個 reference 的現況。

對應 `local://audit-sources.md`。

## 驗收標準

- [x] `internal/sources/mcpserversorg/adapter.go` 實作 `SourceAdapter`：`Name()="mcpserversorg"`，`Discover` 以 Sitemap 主路徑 `GET /sitemap.xml → sitemapindex → sitemaps/servers/1..6.xml` 去重（strip locale prefix `/en/ /zh-TW/ /es/ /pt-BR/`，~39k loc → ~13k 唯一），`Fetch` 以 `goquery` 提取 `href^=https://github.com/` 作為 `RepositoryURL`（已實作，含 `canonicalSlug` 去重與 `sem=2` 並行）
- [x] `go.mod` 引入 `github.com/PuerkitoBio/goquery`（v1.13.0），`go build ./...` 通過
- [x] `internal/sources/mcpmarket/adapter.go` 骨架：`Name()="mcpmarket"`，`Discover/Fetch` 回 `ErrNotAvailable` 並註解 Vercel WAF 封鎖待官方 API，不影響 `coordinator` pipeline
- [x] `internal/sources/githubrepo` 增強：`setupCrawler` 追加 `New("modelcontextprotocol/servers-archived", token)` 覆蓋已遷移的 13+ archived servers
- [x] `cmd/crawler/main.go:setupCrawler` 註冊新 adapters，`--source` flag 說明更新為 `github, registry, mcpserversorg, mcpmarket, all`，`filterSources` 支援新名稱
- [x] 提供 httptest 注入 `BaseURL/SitemapURL` 的單元測試；`go test ./internal/sources/mcpserversorg` 驗證 Sitemap 解析與去重（PASS）
- [x] `./crawler crawl --source mcpserversorg --workers 2 --max-per-source 10` 可跑通（dry-run 驗證不 403）

## 備註

- mcpmarket：`curl` 觀測 `Vercel Security Checkpoint 429/403`，無 JSON API，robots.txt 亦 403，ToS 不建議硬繞
- mcpservers.org：`robots.txt Allow:/`、`Cloudflare HIT` 低反爬，`SSR+Sitemap` 無需 JS，HTML 分頁僅作 Sitemap 失敗 fallback（maxPages=500）
- 跨 source 去重：`dedupe` 以 `sha256(normalizeURL(Repository.URL))` 對齊，`mcpserversorg` 的 github URL 與 `github` adapter 天然合併
- 風險：6 個 sitemap 並行需 `sem=2` + `retry.RetryableClient`，遵守 `Cache-Control: max-age=7200`
