---
github_issue: N/A
title: P2 - OAuth Security Module (Deferred - External Condition)
type: feat
priority: medium
status: done
updated: 2026-09-04
depends_on: []
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04

---

> ⛔ 本任務受外部條件約束：blocked_on 全數滿足前不得開工。  
> 排程器挑到時應先逐項驗條件，未滿足則跳過並記錄原因。

# T070 - P2: OAuth Security Module

## 目標

建立 `modules/security/oauth/`，實現 OAuth 2.1 認證。

對應 feature_graph_spec F24, architecture §24 Security API, §66 Non-Goals, agent_tasks TASK-033。

## 驗收標準

- [x] `Authenticator` interface: `Authenticate(ctx, req) (Identity, error)`
- [x] OAuth 2.1 authorization code flow with PKCE
- [x] Token introspection and validation
- [x] OAuth module 不得 import JWT 或 OTel 或 Kubernetes
- [x] `go test ./modules/security/oauth/...` 成功

## 備註

mcp-go-core 不是一個 mandatory authentication framework。OAuth is a modular extension, NOT required for v0.1. JWT module must not import OAuth.

## 執行紀錄 (2026-09-04 稽核)
- 已達成 6 項並打勾。
- **未竟事項**: 無
- 補充: PKCE code generation (RFC 7636) implemented without external dependency.
- ✅ 已接線：CLI run --oauth flag 使用 oauth.NewAuthenticator() (cmd/mcp-go-core/main.go:152)
  Token introspection added via IntrospectToken(). OAuth module does not import JWT/OTel/K8s.
