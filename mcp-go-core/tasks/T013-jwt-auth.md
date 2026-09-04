---
github_issue: N/A
title: P2 - JWT Security Module
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

# T013 - P2: JWT Security Module

## 目標

建立 `modules/security/jwt/`，實現 JWT 認證。JWT 不得因 package import 自動引入 OAuth/OTel/Kubernetes。

對應 feature_graph_spec F23, architecture §24 Security API, agent_tasks TASK-032。

## 驗收標準

- [ ] `Authenticator` interface: `Authenticate(ctx, req) (Identity, error)`
- [ ] JWT token parse from `Authorization: Bearer <token>` header
- [ ] Valid token → Identity with claims
- [ ] Expired token → Reject
- [ ] Invalid signature → Reject
- [ ] Missing token → Reject
- [ ] JWT module 不得 import OAuth, OTel, Kubernetes packages
- [ ] `go test ./modules/security/jwt/...` 成功

## 備註

JWT → security → core dependency chain。JWT must not import OAuth — forbidden by build_pipeline_spec §13 Module Isolation。

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
