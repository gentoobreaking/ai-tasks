---
github_issue: N/A
title: Manifest Detector — 偵測 package.json, pyproject.toml, go.mod, Cargo.toml, mcp.json 等
type: feat
priority: high
^status: done
depends_on: [T006]
assignee: agent
created: 2026-09-05
updated: 2026-09-05
---

# T009 - Manifest Detector — 偵測 package.json, pyproject.toml, go.mod, Cargo.toml, mcp.json 等

## 目標

建立 manifest 檔案偵測與解析 logic。對應 CRAWLER_AGENT_TASKS.md §11 TASK-009, §7 GitHub Candidate Extraction。

## 驗收標準

- [ ] 支援偵測 manifest 檔案類型: package.json, pyproject.toml, go.mod, Cargo.toml, server.json, mcp.json, manifest.json
- [ ] `package.json` 解析: mcp.servers 區段, transport 類型, command
- [ ] `pyproject.toml` 解析: [project.entry-points."mcp"] 或 [tool.mcp] 區段
- [ ] `go.mod` 解析: module 名稱當作 identifier
- [ ] `Cargo.toml` 解析: [package.metadata.mcp] 區段
- [ ] `server.json`/`mcp.json`/`manifest.json` 解析: MCP server 配置 (transport, command, env, args)
- [ ] 每種 manifest 解析都產生標準化 MCP manifest 結構 (transport, command, env, args, tools)
- [ ] Invalid manifest files 被拒絕或標記 INVALID (§TST-025: 100% correctly parsed for valid, 100% rejected for invalid)
- [ ] 解析過程中執行 commands = 0 (§TST-025: executed commands = 0)
- [ ] `parseManifest(content string, fileType string) (*ManifestInfo, error)` interface
- [ ] Manifest info 包含: server_name, transport, command, args, env, tools, resources, prompts, mcp_version
- [ ] 單元測試: 至少 5 種 manifest 格式的 fixture (package.json, pyproject.toml, go.mod, Cargo.toml, server.json)
- [ ] 單元測試: invalid JSON / TOML 回傳錯誤但不 panic (§TST-031)

## 備註

- 只做 static parsing, 不得執行 package manager (§TASK-009 Acceptance: 不得執行 package manager)
- 不得 npm install / pip install / docker run (§59 Supply Chain Security)
- Manifest parsing 錯誤不應影響整體 crawl
