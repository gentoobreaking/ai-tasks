---
github_issue: N/A
title: 修復 REGISTRY.md charset=unknown-8bit 編碼混亂
type: fix
priority: high
status: done
depends_on: [T028]
assignee: pi
created: 2026-09-05
updated: 2026-09-05
---

# T056 - 修復 REGISTRY.md charset=unknown-8bit 編碼混亂

## 目標

修復 `REGISTRY.md` 被 `file --mime` 判為 `text/plain; charset=unknown-8bit` 的三疊加根因：`sanitizeUTF8` 靜默丟字、位元組截斷 `desc[:150]` 產生 invalid UTF-8、所有 `fetchFile` 假設 UTF-8 無 Big5/GBK 轉碼。

對應 `local://audit-encoding.md` R1-R3；涵蓋 `internal/export/exporter.go`、`internal/sources/**/adapter.go`、`internal/normalize/normalizer.go`。

## 驗收標準

- [x] `go.mod` 已加入 `golang.org/x/text v0.41.0`
- [x] `internal/export/exporter.go:sanitizeUTF8` 改為 `ToValidUTF8(..., "�")`，並在 `!utf8.Valid` 時嘗試 `traditionalchinese.Big5.NewDecoder().Bytes` 與 `simplifiedchinese.GBK.NewDecoder().Bytes` 轉碼，成功且 `utf8.Valid` 則採用，否則 `ToValidUTF8` 兜底
- [x] `serverMarkdown` 與 `serverMarkdownIntl` 的 `desc[:150]` 改為 rune 安全截斷：`runes:=[]rune(desc); if len(runes)>150 {desc=string(runes[:150])+"..."}`，並在 `stripHTMLTags` 後確保 `utf8.Valid`
- [x] `internal/sources/github/adapter.go:fetchFile` 與 `githubrepo/adapter.go:fetchFile` 增加 Big5/GBK 轉碼邏輯（或至少 charset 註解與共用 helper），避免污染寫入 DB
- [x] 合成多字節 `Description` 測試：`ExportMarkdown` 產生檔案 `file --mime` 為 `charset=utf-8` 且 `utf8.Valid==true`（已驗證 `/tmp/test_export_audit/REGISTRY.md`）
- [x] `go test ./internal/export -v` 10 tests 通過，`go vet ./...` 與 `go build ./...` 0 錯誤

## 備註

- `file-5.41` macOS 與 `5.45` Linux 對截斷高位元組判定不同，已以 `raw.md` 重現 `unknown-8bit`
- 舊版 `REGISTRY.md` 若未經 `sanitizeUTF8` 即為 `unknown-8bit`，新版以 `writeFile→sanitizeUTF8` 全路徑淨化
- 後續可引入 `saintfish/chardet` 通用偵測，但本次僅針對台灣場景 Big5/GBK 已足夠
