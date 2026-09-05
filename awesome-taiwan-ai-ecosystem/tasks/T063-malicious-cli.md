---
github_issue: N/A
title: CLI 整合惡意報表旗標
type: feat
priority: medium
status: done
depends_on: [T062]
assignee: pi
created: 2026-09-05
updated: 2026-09-05
---

# T063 - CLI 整合惡意報表旗標

## 目標

在 `cmd/crawler/main.go` 新增 `--malicious-report` 旗標控制惡意報表輸出，並整合進 `crawl` / `export` 指令。

## 驗收標準

- [ ] `cmd/crawler/main.go` 新增：
  - `--malicious-report` (bool, default true) — 輸出 MALICIOUS_REPORT.md
  - `--malicious-dir` (string, default "registry/malicious") — 輸出目錄
  - `--malicious-threshold` (string, default "MEDIUM") — 最低風險等級輸出
- [ ] `crawl` 指令結束時自動生成報表
- [ ] `export` 指令新增 `--malicious` 旗標單獨輸出惡意報表
- [ ] 旗標說明更新於 `--help`
- [ ] 整合測試：`./crawler crawl --malicious-report=false` 不生成報表
- [ ] `go build ./cmd/crawler` 通過

## 備註

- 預設開啟，配合 `--malicious-threshold=HIGH` 可僅輸出高風險
- 輸出目錄結構：`registry/malicious/{MALICIOUS_REPORT.md, blocklist.txt}`
- 需在 `crawler.CrawlOptions` 傳遞選項