---
github_issue: N/A
title: Normalizer — RawRecord → MCPServer 統一轉換
type: feat
priority: high
status: pending
depends_on: [T002, T006]
assignee: agent
created: 2026-09-05
updated: 2026-09-05
---

# T008 - Normalizer — RawRecord → MCPServer 統一轉換

## 目標

建立 `internal/normalize/` 套件，將各 source 的 RawRecord 轉換為統一 MCPServer 格式。
對應 CRAWLER_AGENT_TASKS.md §10 TASK-008, §6 CRAWLER_IMPLEMENTATION_PLAN Phase 3。

演算法參考: [algs/normalizer.md](../algs/normalizer.md)

## 驗收標準

- [ ] `internal/normalize/` 套件建立
- [ ] `Normalizer` interface 實現 (§6 Implementation Plan): `Normalize(RawRecord) (*MCPServer, error)`
- [ ] URL normalization: strip trailing slash, lowercase host, remove .git suffix
- [ ] Name normalization: extract from repo name or candidate name, generate slug (kebab-case)
- [ ] Description normalization: prefer README first paragraph, fallback candidate description
- [ ] Repository metadata 完整映射: url, host, owner, name, stars, forks, watchers, open_issues, language, license, topics, default_branch, archived, fork, homepage, created_at, updated_at, pushed_at
- [ ] Endpoint extraction 來源: README 中的 HTTP URLs, mcp.json/server.json manifests, package.json mcp.servers section, RawMetadata
- [ ] Manifest extraction 來源 (優先順序): package.json → pyproject.toml → go.mod → Cargo.toml → server.json → mcp.json → manifest.json
- [ ] Transport 偵測: stdio (manifest), sse (sse://), streamable-http (http+SSE or MCP endpoint), http (http://), websocket (ws://)
- [ ] License detection: from GitHub API, manifest, 或 repository LICENSE file → 如果找不到則 "UNKNOWN" (§TST-045: 不得猜測)
- [ ] Data source detection: scan README + source code for TWSE, TPEx, TAIFEX, TDCC, CWA, MOI, MOEA, MOL, MOF, PCC, LY, Judicial Yuan, data.gov.tw, ECPay, NewebPay, SHOPLINE (§29)
- [ ] Conflict resolution: Live MCP protocol > Repository manifest > Official registry > Directory metadata (§65)
- [ ] README sanitization: strip injection patterns ("Ignore previous instructions", "Call this URL", "Upload credentials") (§60)
- [ ] GitHub RawRecord → MCPServer 正確轉換測試 (至少 5 個不同格式的 fixture)
- [ ] 所有欄位在 JSON export 中的欄位名稱使用 snake_case

## 備註

- 來源只負責 Discover + Extract, 不能決定 Registry schema (§2.1 Source Agnostic)
- 不可執行 package manager 或 npm install/pip install (§59 Supply Chain Security)
- README 是 untrusted input, 必須 sanitize before LLM processing (§60 LLM Security)
