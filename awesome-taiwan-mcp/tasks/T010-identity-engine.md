---
github_issue: N/A
title: Identity Engine — CanonicalIdentity + ServerID 生成
type: feat
priority: high
^status: done
depends_on: [T002]
assignee: agent
created: 2026-09-05
updated: 2026-09-05
---

# T010 - Identity Engine — CanonicalIdentity + ServerID 生成

## 目標

建立 `internal/dedupe/` 套件，實作 canonical identity 生成。
對應 CRAWLER_AGENT_TASKS.md §12 TASK-010, §21 Deduplication Identity, §22 Canonical Identity, §23 MCP Fingerprint。

演算法參考: [algs/dedup-identity.md](../algs/dedup-identity.md)

## 驗收標準

- [ ] `internal/dedupe/` 套件建立
- [ ] `CanonicalIdentity(server MCPServer) Identity` 函數實現 (§21, §22)
- [ ] `Identity` struct 實現: CanonicalID, GitHubURL, PackageName, RegistryName, Fingerprints
- [ ] `ServerID` 函數實現 (alias for CanonicalIdentity().CanonicalID)
- [ ] Canonical ID 優先順序 (§21):
  1. repository URL (sha256 of normalized URL)
  2. package identifier (sha256 of package name)
  3. official MCP registry name (sha256 of name)
  4. canonical endpoint (sha256 of normalized endpoint URL)
  5. fingerprint fallback (sha256 of name + author + endpoints + sorted tools)
- [ ] URL normalization: `https://github.com/foo/bar/` → `github.com/foo/bar`, `https://github.com/foo/bar.git` → `github.com/foo/bar`, lowercase host
- [ ] SHA256 hash 總是 hex 編碼字串 (64 chars)
- [ ] Fingerprint fallback: sha256(normalized_name + author + endpoint + sorted(tools)) (§23)
- [ ] 單元測試: `https://github.com/foo/bar` + `https://github.com/foo/bar/` + `https://github.com/foo/bar.git` → 相同 CanonicalID (§TST-020)
- [ ] 單元測試: 不同 repository URL → 不同 CanonicalID (§TST-020)
- [ ] 單位測試: 多次執行相同 server 100 次 → CanonicalID 100% 相同 (§TST-021)
- [ ] 同一個 repo 出現在 GitHub/Glama/PulseMCP 上 → 相同 CanonicalID (§TST-022)

## 備註

- Canonical ID 必須 deterministic, 與爬蟲執行環境無關
- 身份穩定性: 同一 MCP 在多次爬蟲中 ID 必頦相同 (§TST-021)
