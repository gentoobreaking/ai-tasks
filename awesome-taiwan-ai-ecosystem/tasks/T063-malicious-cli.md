---
github_issue: N/A
title: CLI 整合惡意報表旗標
type: feat
priority: medium
status: done
depends_on:

assignee: pi with opencode
created: 2026-09-05
updated: 2026-09-05
---

# T063 - CLI 整合惡意報表旗標

## 目標

在 `cmd/crawler/main.go` 新增 `--malicious-report` 旗標控制惡意報表輸出，並整合進 `crawl` / `export` 指令。

## 驗收標準

- [x] `cmd/crawler/main.go` 新增：
  - `--malicious-report` (bool, default true) — 輸出 MALICIOUS_REPORT.md
  - `--malicious-dir` (string, default "registry/malicious") — 輸出目錄
  - `--malicious-threshold` (string, default "MEDIUM") — 最低風險等級輸出
- [x] `crawl` 指令結束時自動生成報表 — 自動生成 MALICIOUS_REPORT.md 和 INJECTION_REPORT.md
- [x] `export` 指令新增 `--malicious` 旗標單獨輸出惡意報表
- [x] 旗標說明更新於 `--help`
- [x] 整合測試：`./crawler crawl --malicious-report=false` 不生成報表
- [x] `go build ./cmd/crawler` 通過

## 備註

- 預設開啟，配合 `--malicious-threshold=HIGH` 可僅輸出高風險
- 輸出目錄結構：`registry/malicious/{MALICIOUS_REPORT.md, blocklist.txt}`


## 執行紀錄

- 2026-09-06: 完成實作成果。
  - `--malicious-report`, `--malicious-dir`, `--malicious-threshold` 旗標已新增至 persistent flags
  - `--injection-report`, `--injection-dir` 旗標也一併新增
  - `crawl` 命令結束後自動生成 MALICIOUS_REPORT.md、blocklist.txt 和 INJECTION_REPORT.md、patterns.json
  - `export` 子命令新增 `--malicious` 和 `--injection` 旗標
  - `runExport` now uses `MaliciousExporter` and `InjectionExporter` to generate reports
  - `go build ./cmd/crawler` — PASS
  - `go test ./... -count=1` — PASS (26 packages ok, 6 no tests)