---
github_issue: N/A
title: P1 - Resource API
type: feat
priority: high
status: done
updated: 2026-09-04
depends_on:
- T004
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T006 - P1: Resource API

## 目標

建立 `core/resource/` 套件，提供 Resource interface。

對應 spec §4.2 Core Interfaces (Resource), agent_tasks TASK-012。

## 驗收標準

- [ ] `Resource` interface 包含: `URI() string`, `Name() string`, `Description() string`, `Read(ctx, req) (ResourceResponse, error)`
- [ ] `ResourceRequest` struct with URI 和 optional params
- [ ] Resource URI 驗證: 支援 `mcp://` scheme
- [ ] `go test ./core/resource/...` 成功

## 備註

Resource URI 應支援 template (e.g., `mcp://static/{name}`)。對應 architecture §26 Storage API。
