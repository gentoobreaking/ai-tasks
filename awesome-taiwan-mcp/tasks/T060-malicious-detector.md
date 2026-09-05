---
github_issue: N/A
title: 惡意倉庫偵測器
type: feat
priority: high
status: pending
depends_on: [T026]
assignee: pi
created: 2026-09-05
updated: 2026-09-05
---

# T060 - 惡意倉庫偵測器

## 目標

新增 `internal/security/malicious.go`，實作惡意倉庫特徵偵測器，針對供應鏈攻擊向量（如 `clearsdunker-create/ez` 類混淆載體、一次性帳號、Lua/JS 混淆代碼）進行自動化識別。

## 驗收標準

- [ ] `internal/security/malicious.go` 建立，實作 `MaliciousDetector` struct
- [ ] 偵測規則涵蓋：
  - [ ] README 熵值檢測（Shannon entropy > 7.0 且非文檔結構）
  - [ ] README 大小異常（> 100KB 且無標準 Markdown 標題/段落）
  - [ ] 混淆代碼模式匹配：Lua VM 指令 (`while W[`, `0x[0-9A-F]`)、JS `eval(atob`、`base64` 大塊
  - [ ] 帳號異常：建立 < 90 天 + 0 followers + 0 profile + repos < 5
  - [ ] 非文本比例（non-printable chars > 30%）
- [ ] 回傳 `MaliciousResult{RiskLevel, Signals[], Confidence}`，可串接進掃描管線
- [ ] 單元測試覆蓋：正常 README、混淆 Lua、混淆 JS、大型二進位 README
- [ ] `go test ./internal/security -v` 通過

## 備註

- 參考 `clearsdunker-create/ez` 特徵：388KB Lua bytecode、0 followers、新帳號
- 風險等級：LOW/MEDIUM/HIGH/CRITICAL 四級
- 需整合進 `internal/security/scanner.go` 統一入口（T061）
- 依賴 `github.com/shannon` 或自行實作 Shannon entropy