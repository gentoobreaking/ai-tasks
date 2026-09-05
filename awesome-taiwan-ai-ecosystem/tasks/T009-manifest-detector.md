---
github_issue: N/A
title: Manifest Detector — 偵測 package.json, pyproject.toml, go.mod, Cargo.toml, mcp.json 等
assignee: pi with opencode
type: feat
priority: high
status: done
depends_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T009 - Manifest Detector — 偵測 package.json, pyproject.toml, go.mod, Cargo.toml, mcp.json 等

## 目標

建立 manifest 檔案偵測與解析 logic。對應 CRAWLER_AGENT_TASKS.md §11 TASK-009, §7 GitHub Candidate Extraction。

## 驗收標準

- [x] 支援偵測 manifest 檔案類型: package.json, pyproject.toml, go.mod, Cargo.toml, server.json, mcp.json, manifest.json
- [x] `package.json` 解析: mcp.servers 區段, transport 類型, command
- [x] `pyproject.toml` 解析: [project.entry-points."mcp"] 或 [tool.mcp] 區段
- [x] `go.mod` 解析: module 名稱當作 identifier
- [x] `Cargo.toml` 解析: [package.metadata.mcp] 區段
- [x] `server.json`/`mcp.json`/`manifest.json` 解析: MCP server 配置 (transport, command, env, args)
- [x] 每種 manifest 解析都產生標準化 MCP manifest 結構 (transport, command, env, args, tools)
- [x] Invalid manifest files 被拒絕或標記 INVALID (§TST-025: 100% correctly parsed for valid, 100% rejected for invalid)
- [x] 解析過程中執行 commands = 0 (§TST-025: executed commands = 0)
- [x] `parseManifest(content string, fileType string) (*ManifestInfo, error)` interface
- [x] Manifest info 包含: server_name, transport, command, args, env, tools, resources, prompts, mcp_version
- [x] 單元測試: 至少 5 種 manifest 格式的 fixture (package.json, pyproject.toml, go.mod, Cargo.toml, server.json)
- [x] 單元測試: invalid JSON / TOML 回傳錯誤但不 panic (§TST-031)

## 備註

- 只做 static parsing, 不得執行 package manager (§TASK-009 Acceptance: 不得執行 package manager)
- 不得 npm install / pip install / docker run (§59 Supply Chain Security)
- Manifest parsing 錯誤不應影響整體 crawl

## 執行紀錄（2026-09-05 稽核）
- 已達成: 依據最終驗證 (T045) 通過 build+test+vet+mod verify, 代碼在對應 internal/ 套件中實現, 測試覆蓋率達標
