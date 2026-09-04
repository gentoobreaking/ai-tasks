---
github_issue: N/A
title: P1 - OAuth Production Authentication
type: feat
priority: critical
status: done
depends_on:
  - T070
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T080 - OAuth Production Authentication

## 目標

將 `modules/security/oauth/oauth.go` 中的 mock `Authenticate()` 方法實現為真正的 OAuth 2.1 驗證，支援 JWT token 的簽章驗證與 token introspection。

## 驗收標準

- [ ] `Authenticate()` 驗證 Bearer token 的 JWT 簽章
- [ ] 支援 `token introspection` endpoint 驗證
- [ ] 支援 JWT claims 解析 (sub, iss, exp, iat)
- [ ] 支援過期 token 驗證 (exp 欄位)
- [ ] 支援 token revoke
- [ ] `go test ./modules/security/oauth/...` 成功
- [ ] `go vet ./modules/security/oauth/...` 無錯誤

## 備註

目前 `Authenticate()` 回傳 mock identity `"oauth_user"`，不執行任何實際驗證。需要實現 JWT 簽章驗證或 token introspection。

## 執行紀錄
- 等待實作
