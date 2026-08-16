---
github_issue: N/A
title: MCP / ACP 協議層實作（Phase 6+ 預留）
type: feature
priority: medium
status: done
depends_on:
- T032
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-15
updated: '2026-08-17'
spec_version: v3
---
# T034 - MCP / ACP 協議層實作（Phase 6+ 預留）

## 目標

實作 Spec §18、§19 定義的 MCP（Model Context Protocol）與 ACP（Agent Control Protocol）協議層，為 Phase 6+ Cloud Escalation、Multi-Worker、Protocol 標準化奠基。

目前僅有型別定義（`types.ts`），需實作完整協議層。

## 驗收標準

### MCP Layer（§18） - Model Context Protocol
- [x] 實作 `apps/control-plane/src/mcp/`：
  - `server.ts`：MCP Server（stdio / HTTP+SSE 雙模式）
  - `client.ts`：MCP Client（連接外部 MCP Server）
  - `tools.ts`：標準工具定義（filesystem、git、shell、network、search）
  - `resources.ts`：Resource 模板（file://、git://、http://、memory://）
  - `prompts.ts`：Prompt 模板（code_review、debug、refactor 等）

- [x] 實作 MCP 工具註冊機制：Control Plane 內部工具（filesystem、git、shell）以 MCP Tool 形式暴露
- [x] 實作 MCP Resource 掛載：workspace、git history、project_memory 以 Resource 暴露
- [x] 單元測試：MCP initialize、tools/list、tools/call、resources/read 流程

### ACP-Protocol Layer（§19） - Agent Control Protocol
- [x] 實作 `apps/control-plane/src/acp/`：
  - `protocol.ts`：ACP 訊息定義（TaskRequest、TaskResponse、Event、Control）
  - `server.ts`：ACP Server（WebSocket / HTTP 長輪詢）
  - `client.ts`：ACP Client（連接外部 ACP Agent）
  - `session.ts`：Session 管理（create、resume、terminate、heartbeat）

- [x] 實作 ACP 事件流：TaskCreated、StageChanged、EvidenceCollected、PatchGenerated、VerificationCompleted、ReflectionTriggered、TaskCompleted
- [x] 實作 ACP 控制指令：Approve、Cancel、Retry、Escalate、InjectFeedback
- [x] 整合 `runner.ts` 的 event bus 直接轉發為 ACP Event
- [x] 單元測試：ACP handshake、event streaming、control 指令

### 整合與部署
- [x] 修改 `server.ts` 掛載 MCP（/mcp）與 ACP（/acp）路由
- [x] 新增 `config.ts` 協議啟用開關：`mcp.enabled`、`acp.enabled`
- [x] 新增 CLI 指令：`cp protocol start [--mcp] [--acp] [--port]`
- [x] 文件：`docs/protocol/mcp.md`、`docs/protocol/acp.md`

## 備註

- Phase 6+ 才啟用，Phase 1–5 保持關閉（預設 `enabled: false`）
- MCP 標準參考：Anthropic MCP Spec（2024）
- ACP 參考：OpenCode / Goose 現有協議
- 雙協議共存：MCP 面向工具/資源存取，ACP 面向任務控制/事件流
- 預估開發時間：2-3 週（MCP 1 週、ACP 1 週、整合 3-5 天）

## 相關 Spec 章節

- §18 MCP Layer
- §19 ACP-Protocol Layer
- §25 Execution Strategy Phase 9（Hybrid Execution 需 ACP）
- §38 MVP Roadmap Phase 6–11