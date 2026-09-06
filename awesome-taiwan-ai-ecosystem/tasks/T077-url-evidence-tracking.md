---
github_issue: N/A
title: URL Evidence Tracking — Record why each URL was classified
assignee: pi
type: feat
priority: high
status: done
depends_on: ["T076"]
created: 2026-09-05
updated: 2026-09-06
---

# T077 - URL Evidence Tracking — Record why each URL was classified

## 目標

為每個端點分類決策記錄完整證據，支援審計與除錯。對應規格書 §4.4, §45, §61 Phase 6。

整合在 `internal/engines/endpoint_classifier.go` (T076) 中。

## 驗收標準

- [x] `EndpointWithType` 結構體擴展：
  ```go
  type EndpointWithType struct {
      Endpoint  Endpoint
      Type      EndpointType
      Evidence  []EndpointEvidence
      Confidence float64
  }
  type EndpointEvidence struct {
      Rule         string  // "github_repo_pattern", "docs_subdomain", "install_script_name", "runtime_verified"
      Source       string  // "repository_metadata", "readme", "source_code", "runtime_handshake"
      Location     string  // URL or file path
      MatchedText  string
      Pattern      string  // regex pattern used
      Timestamp    time.Time
  }
  ```
- [x] 每個分類規則產生對應 Evidence
- [x] Confidence 基於 pattern 可靠度：runtime_verified=1.0, github_repo_pattern=0.95, docs_subdomain=0.9, install_script_name=0.85
- [x] 多證據聚合：取最高 confidence，或加權平均
- [x] 整合到 Entity.Endpoints
- [x] 單元測試：驗證 evidence 完整性
- [x] 導出 JSON 時包含 evidence（供審計）

## 備註

- 這對規格書 §45 獨立維度原則很重要：endpoint 分類有自己的 evidence，不混淆於 classification evidence
- 有助於事後分析為什麼某 URL 被誤判

## 執行紀錄

- 2026-09-06: 完成實作
  - 增強 `internal/engines/endpoint_classifier.go` 中的證據生成邏輯
  - 實現詳細的 rule 名稱：github_repo_pattern, gitlab_repo_pattern, docs_subdomain, readthedocs_domain, github_wiki, wiki_path, docs_path, documentation_path, readme_anchor, markdown_file, install_script_name, raw_github_install, install_domain, pipe_install, homepage_match, potential_mcp_runtime_static, runtime_verified
  - 實現多證據聚合邏輯：按 endpoint type 分組，選擇總 confidence 最高的類型，聚合 confidence（上限 1.0）
  - 修正 GitHub repo pattern 以正確排除帶有 # 或 ? 的 URL（使用 [^/#?]+ 而非 [^/]+）
  - 添加具體的 pattern rule 名稱和對應的 confidence 值
  - 修正 GitHub repo pattern 以排除帶有 # 或 ? 的 URL（使用 [^/#?]+ 而非 [^/]+）
  - 添加具體的 confidence 映射：runtime_verified=1.0, github_repo_pattern=0.95, docs_subdomain=0.9, github_wiki=0.85 等
  - 通過 `go build ./...` 和相關套件測試