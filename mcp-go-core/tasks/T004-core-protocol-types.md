---
github_issue: N/A
title: P1 - Core Protocol Types (Request/Response/Error)
type: feat
priority: high
status: done
updated: 2026-09-04
depends_on:
- T001
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T004 - P1: Core Protocol Types (Request/Response/Error)

## 目標

建立 `core/protocol/`, `core/request/`, `core/response/`, `core/error/` 套件，提供 MCP 協定基礎型別。

對應 spec §4.2 Core Interfaces，agent_tasks TASK-010。Core 不得依賴 JWT/OAuth/OTel/Kubernetes/Filesystem/HTTP framework/Cloud SDK。

## 驗收標準

- [ ] `core/protocol/` 套件建立，包含 `Request`, `Response`, `Message` 型別
- [ ] `core/request/` 套件建立，包含 `ToolRequest`, `ResourceRequest`, `PromptRequest`
- [ ] `core/response/` 套件建立，包含 `ToolResponse`, `ResourceResponse`, `PromptResponse`
- [ ] `core/error/` 套件建立，包含 `Error` struct with Code, Message, Cause
- [ ] Error codes: Protocol, Validation, Authentication, Authorization, Transport, Tool, Internal, Timeout, Cancellation
- [ ] `go test ./core/protocol/... ./core/request/... ./core/response/... ./core/error/...` 成功

## 備註

對應 architecture §40 Error Model。Error type:
```go
type Error struct {
    Code    string
    Message string
    Cause   error
}
```

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
