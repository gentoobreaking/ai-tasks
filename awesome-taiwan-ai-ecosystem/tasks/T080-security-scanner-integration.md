---
github_issue: N/A
title: Security Scanner Integration — Detect obfuscation, credential extraction, remote binary download
assignee: pi
type: feat
priority: high
status: pending
depends_on: ["T065", "T067"]
created: 2026-09-05
updated: 2026-09-05
---

# T080 - Security Scanner Integration — Detect obfuscation, credential extraction, remote binary download

## 目標

整合安全掃描器，檢測惡意代碼模式。對應規格書 §12, §56 Test 12, §61 Phase 8, §64 Definition of Done。

新檔案：`internal/engines/security_scanner.go`。

## 驗收標準

- [ ] `internal/engines/security_scanner.go` 新建：
  - [ ] `Scan(entity *Entity) SecurityScanResult` 核心函數
  - [ ] 掃描對象：source code, package manifests, scripts, binaries, README
- [ ] 檢測規則（規格書 §12, §56 Test 12）：
  - [ ] **Obfuscation**：base64 編碼大段代碼、eval(atob(...))、minified 代碼無 sourcemap
  - [ ] **Credential extraction**：掃描 AWS_KEY、GITHUB_TOKEN、DATABASE_URL、私鑰模式、環境變量竊取
  - [ ] **Remote binary download**：`curl ... | bash`、`wget ... | sh`、下載並執行二進制
  - [ ] **Shell injection**：`exec("sh -c " + user_input)`、`os.system`、unsanitized command execution
  - [ ] **Persistence mechanisms**：cron、systemd、rc.local、啟動項修改
  - [ ] **Network beaconing**：定期連接可疑域名、硬編碼 C2 IP
  - [ ] **File system abuse**：寫入敏感目錄（/etc, /root, ~/.ssh）、修改授權文件
- [ ] `SecurityScanResult`：
  - [ ] `Status`：`CLEAN`, `SUSPICIOUS`, `QUARANTINED`, `BLOCKED`（對應 T081）
  - [ ] `Findings`：[]`SecurityFinding`{Type, Severity, Source, Location, Evidence, Rule}
  - [ ] `ScannedAt`, `ScannerVersion`
  - [ ] `Confidence`：整體可信度
- [ ] Severity：`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`, `UNKNOWN`
- [ ] 掃描引擎選項：
  - [ ] 靜態分析：ast-grep / semgrep rules（優先）
  - [ ] 簡單模式：regex patterns（fallback）
  - [ ] 可整合外部掃描器：gosec, bandit, semgrep CLI
- [ ] 隔離機制：`QUARANTINED` 實體不進入任何 registry view，標記待人工審查
- [ ] 單元測試：每類惡意模式測試案例
- [ ] 接受測試對應規格書 §56 Test 12
- [ ] 參考現有 `internal/engines/security_scanner.go` (T026) 和任務 T060-T064

## 備註

- 安全狀態獨立於分類、MCP identity、品質分數（規格書 §45）
- 規格書 §54：`security_status != BLOCKED` 才能進 Verified MCP Servers
- 現有 T060-T064 任務涵蓋具體惡意類型檢測，本任務負責整合框架

## 執行紀錄

- 待執行