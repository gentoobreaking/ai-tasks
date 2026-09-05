---
github_issue: N/A
title: Injection 偵測獨立報表輸出
type: feat
priority: medium
status: pending
depends_on: [T026]
assignee: pi
created: 2026-09-05
updated: 2026-09-05
---

# T064 - Injection 偵測獨立報表輸出

## 目標

現有 `internal/security/scanner.go` 的 `injectionPatterns` 偵測結果僅內嵌於 `SecurityFinding`，新增獨立 `INJECTION_REPORT.md` 輸出，供安全審計、Prompt Injection 風險追蹤。

## 驗收標準

- [ ] `internal/export/injection_exporter.go` 建立（或擴充 `malicious_exporter` 共用架構）
- [ ] 輸出 `INJECTION_REPORT.md` 包含：
  - [ ] 摘要：掃描總數、命中數、模式分布
  - [ ] 詳細列表：Server、匹配模式、匹配文本位置、風險等級
  - [ ] 統計表：各模式命中次數、Top 10 高風險 Server
- [ ] CLI 旗標 `--injection-report` (bool, default true)
- [ ] 輸出目錄：`registry/security/injection/`
- [ ] 測試：含已知 injection fixture 驗證輸出
- [ ] `go test ./internal/export -v` 通過

## 備註

- 現有 `injectionPatterns` 定義於 `internal/normalize/normalizer.go:29-33`
- 掃描於 `normalize.SanitizeReadme` 時執行，需將匹配結果透傳至 `RawRecord` → `MCPServer`
- 可共用 `malicious_exporter` 的基礎架構（同輸出格式、UTF-8 sanitize、rune truncate）
- 輸出目錄：`registry/security/injection/{INJECTION_REPORT.md, patterns.json}`
- `patterns.json` 供 CI/CD 自動化分析（模式、次數、受影響 repo）