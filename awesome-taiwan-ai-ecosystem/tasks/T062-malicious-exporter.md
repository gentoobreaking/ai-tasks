---
github_issue: N/A
title: 惡意報表獨立輸出
type: feat
priority: high
status: pending
depends_on: [T061]
assignee: pi
created: 2026-09-05
updated: 2026-09-05
---

# T062 - 惡意報表獨立輸出

## 目標

新增 `internal/export/malicious_exporter.go`，掃描完成後自動生成獨立的 `MALICIOUS_REPORT.md`，供安全團隊審核、GitHub 回報、封鎖清單產出。

## 驗收標準

- [ ] `internal/export/malicious_exporter.go` 建立，實作 `MaliciousExporter`
- [ ] 輸出 `MALICIOUS_REPORT.md` 包含：
  - [ ] 摘要：掃描總數、偵測數、各風險等級分布
  - [ ] 詳細列表：Repo、風險等級、信號列表、信心度、建議動作
  - [ ] GitHub 回報連結模板（預填理由）
  - [ ] 封鎖清單（`blocklist.txt`：owner/repo 每行一筆）
- [ ] CLI 旗標 `--malicious-report` 控制輸出（預設開啟）
- [ ] `ExportMarkdown` 風格一致（rune-safe truncate、UTF-8 sanitize）
- [ ] 測試：含 CRITICAL/MEDIUM/正常三類 fixture 驗證輸出格式
- [ ] `go test ./internal/export -v` 通過

## 備註

- 參考 `internal/export/exporter.go` 的 `ExportMarkdown` 風格
- `blocklist.txt` 格式：`owner/repo # RISK: CRITICAL - Lua bytecode in README`
- 可被 CI/CD 直接用於 GitHub API 批次回報或封鎖
- 輸出目錄：`registry/malicious/` (獨立於主 registry)