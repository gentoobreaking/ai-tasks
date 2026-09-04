---
github_issue: N/A
title: P2 - API Key Security Module
type: feat
priority: medium
status: done
updated: 2026-09-04
depends_on:
- T015
- T009
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T012 - P2: API Key Security Module

## 目標

建立 `modules/security/api_key/`，實現 API Key 認證。

對應 feature_graph_spec F22, architecture §24 Security API, agent_tasks TASK-031。

## 驗收標準

- [ ] `Authenticator` interface: `Authenticate(ctx, req) (Identity, error)`
- [ ] API Key transport: header `Authorization: Bearer <key>` 或 `X-API-Key`
- [ ] Valid key → Identity with principal
- [ ] Invalid key → Reject with error
- [ ] Missing key → Reject with error
- [ ] API Key module 不得 import core 或其他 security module
- [ ] `go test ./modules/security/api_key/...` 成功

## 備註

Core 不得依賴 concrete auth implementation。Security implementation must not be coupled to Core。
