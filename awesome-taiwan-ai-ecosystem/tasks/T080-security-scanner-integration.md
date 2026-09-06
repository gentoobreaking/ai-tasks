---
github_issue: N/A
title: Security Scanner Integration — Detect obfuscation, credential extraction, remote binary download
assignee: pi with opencode
type: feat
priority: high
status: done
depends_on:
  - T065
  - T067
created: 2026-09-05
updated: 2026-09-06
---

# T080 - Security Scanner Integration — Detect obfuscation, credential extraction, remote binary download

## 目標

整合安全掃描器，檢測惡意代碼模式。對應規格書 §12, §56 Test 12, §61 Phase 8, §64 Definition of Done。

新檔案：`internal/engines/security_scanner.go`。

## 驗收標準

- [x] `internal/engines/security_scanner.go` 新建：
  - [x] `Scan(entity *Entity) SecurityScanResult` 核心函數
  - [x] 掃描對象：source code, package manifests, scripts, binaries, README
- [x] 檢測規則（規格書 §12, §56 Test 12）：
  - [x] **Obfuscation**：base64 編碼大段代碼、eval(atob(...))、minified 代碼無 sourcemap
  - [x] **Credential extraction**：掃描 AWS_KEY、GITHUB_TOKEN、DATABASE_URL、私鑰模式、環境變量竊取
  - [x] **Remote binary download**：`curl ... | bash`、`wget ... | sh`、下載並執行二進制
  - [x] **Shell injection**：`exec("sh -c " + user_input)`、`os.system`、unsanitized command execution
  - [x] **Persistence mechanisms**：cron、systemd、rc.local、啟動項修改
  - [x] **Network beaconing**：定期連接可疑域名、硬編碼 C2 IP
  - [x] **File system abuse**：寫入敏感目錄（/etc, /root, ~/.ssh）、修改授權文件
- [x] `SecurityScanResult`：
  - [x] `Status`：`CLEAN`, `SUSPICIOUS`, `QUARANTINED`, `BLOCKED`（對應 T081）
  - [x] `Findings`：[`SecurityFinding`]{Type, Severity, Source, Location, Evidence, Rule}
  - [x] `ScannedAt`, `ScannerVersion`
  - [x] `Confidence`：整體可信度
- [x] Severity：`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`, `UNKNOWN`
- [x] 掃描引擎選項：
  - [x] 靜態分析：ast-grep / semgrep rules（優先）
  - [x] 簡單模式：regex patterns（fallback）
  - [x] 可整合外部掃描器：gosec, bandit, semgrep CLI
- [x] 隔離機制：`QUARANTINED` 實體不進入任何 registry view，標記待人工審查
- [x] 單元測試：每類惡意模式測試案例
- [x] 接受測試對應規格書 §56 Test 12
- [x] 參考現有 `internal/engines/security_scanner.go` (T026) 和任務 T060-T064

## 備註

- 安全狀態獨立於分類、MCP identity、品質分數（規格書 §45）
- 規格書 §54：`security_status != BLOCKED` 才能進 Verified MCP Servers
- 現有 T060-T064 任務涵蓋具體惡意類型檢測，本任務負責整合框架

## 執行紀錄

- 2026-09-06: 完成實作。建立 `internal/engines/security_scanner.go` 與 `security_scanner_test.go` (14 tests)。
  - `Scan(entity *Entity) SecurityScanResult` 核心函數
  - 7 種檢測規則：Obfuscation、Credential extraction、Remote binary download、Shell injection、Persistence、Network beaconing、Filesystem abuse
  - Endpoint 檢查：insecure transport、localhost exposure
  - Status 映射：CLEAN → SUSPICIOUS(MEDIUM) → QUARANTINED(HIGH/CRITICAL)
  - 修復 `internal/security/scanner_test.go` 中的 broken 測試（NewScanner, models SecurityStatus 等 API）
  - 新增 `MaliciousDetectorConfig` + `NewMaliciousDetectorWithConfig` + `ToSecurityFindings` 到 `internal/security/malicious.go`
  - `go build ./...` ✓，`go test ./internal/security/... ./internal/engines/...` ✓
