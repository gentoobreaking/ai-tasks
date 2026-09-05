---
github_issue: N/A
title: 整合惡意偵測進掃描管線
type: feat
priority: high
status: done
depends_on: [T060]
assignee: pi
created: 2026-09-05
updated: 2026-09-05
---

# T061 - 整合惡意偵測進掃描管線

## 目標

將 `MaliciousDetector` 整合進 `internal/security/scanner.go` 統一掃描入口，使爬蟲管線自動對每個發現的候選執行惡意偵測，結果寫入 `SecurityFinding` 與 `MCPServer.Security`。

## 驗收標準

- [ ] `internal/security/scanner.go` 修改：`Scan()` 呼叫 `MaliciousDetector.Detect()`
- [ ] 惡意偵測結果轉為 `SecurityFinding{Type: "malicious_repository", Severity, Source: "malicious_detector", ...}`
- [ ] `MCPServer.Security` 累積惡意發現，風險等級 HIGH/CRITICAL 時標記
- [ ] 掃描摘要新增 `MaliciousDetected` 計數
- [ ] 整合測試：mock GitHub API 回傳混淆 README，驗證 `Security` 欄位正確填入
- [ ] `go test ./internal/security -v` 通過

## 備註

- 掃描順序：現有檢查 → 惡意偵測（最後，因需完整 README）
- 風險等級映射：LOW→LOW, MEDIUM→MEDIUM, HIGH→HIGH, CRITICAL→CRITICAL
- CRITICAL 時可考慮在 `coordinator.go` 直接標記候選為 `StatusDeleted` 或跳過後續驗證（後續 T065 可擴充）
- 需在 `config/security.yaml` 新增惡意偵測開關與閾值配置