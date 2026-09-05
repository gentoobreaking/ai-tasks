---
github_issue: N/A
title: Endpoint Type Classifier — REPOSITORY_URL, DOCUMENTATION_URL, INSTALLER_URL, MCP_RUNTIME_ENDPOINT
assignee: pi
type: feat
priority: high
status: pending
depends_on: ["T065", "T066", "T072"]
created: 2026-09-05
updated: 2026-09-05
---

# T076 - Endpoint Type Classifier — REPOSITORY_URL, DOCUMENTATION_URL, INSTALLER_URL, MCP_RUNTIME_ENDPOINT

## 目標

建立端點類型分類器，徹底修正現有爬蟲將 GitHub repo URL、文檔 URL、安裝腳本 URL 誤判為 MCP runtime endpoint 的問題。對應規格書 §3 非目標 #4-6, §50, §56 Test 5-7, §61 Phase 6, §64 Definition of Done。

新檔案：`internal/engines/endpoint_classifier.go`。

## 驗收標準

- [ ] `internal/engines/endpoint_classifier.go` 新建：
  - [ ] `ClassifyEndpoints(entity *Entity) []EndpointWithType` 核心函數
  - [ ] 輸入：Entity.Endpoints + RepositoryInfo + 發現的所有 URLs
  - [ ] 輸出：`EndpointWithType{Endpoint, Type, Evidence, Confidence}`
- [ ] `EndpointType` enum：
  - [ ] `MCP_RUNTIME_ENDPOINT` — 真正的 MCP server 連接點（stdio, SSE, streamable-http）
  - [ ] `REPOSITORY_URL` — GitHub/GitLab 等 repo URL（規格書 §50, §56 Test 5）
  - [ ] `DOCUMENTATION_URL` — 文檔站點 URL（規格書 §56 Test 6）
  - [ ] `INSTALLER_URL` — 安裝腳本 URL（raw.githubusercontent.com/.../install.sh 等，規格書 §56 Test 7）
  - [ ] `HOMEPAGE_URL` — 專案官網
  - [ ] `UNKNOWN` — 無法判斷
- [ ] 分類規則：
  - [ ] **REPOSITORY_URL**：匹配 `github.com/owner/repo`、`gitlab.com/owner/repo` 等 pattern
  - [ ] **DOCUMENTATION_URL**：匹配 `docs.`、`readthedocs`、`gitbook`、`notion.site`、`.md` 結尾、包含 `/docs/`、`/documentation/`
  - [ ] **INSTALLER_URL**：匹配 `install.sh`、`install.ps1`、`setup.sh`、raw.githubusercontent.com、get.*\.sh、install.*\.sh
  - [ ] **MCP_RUNTIME_ENDPOINT**：
    - [ ] 僅在 runtime verification (T078) 通過後標記
    - [ ] 或靜態分析發現：代碼中硬編碼的 server 監聽地址（localhost:port、unix socket）
    - [ ] **絕不**從 registry listing、README、文檔中推斷
  - [ ] **HOMEPAGE_URL**：RepositoryInfo.Homepage 或 package.json homepage
- [ ] Evidence 記錄：pattern matched, source location, matched text
- [ ] 現有 `Endpoint` struct 擴展：新增 `Type EndpointType` 欄位
- [ ] 單元測試：各類型 URL 測試（含 edge cases）
- [ ] 接受測試對應規格書 §56 Test 5-7

## 備註

- **關鍵修正**：現有代碼將 `https://github.com/user/repo` 直接存為 endpoint，這是錯誤的（規格書 §50）
- 規格書 §3 非目標 #4-6 明確禁止這類推斷
- Endpoint 分類獨立於 MCP identity（規格書 §45）
- Registry export 時只輸出 `MCP_RUNTIME_ENDPOINT` 類型的端點

## 執行紀錄

- 待執行