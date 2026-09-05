---
github_issue: N/A
title: MCP Runtime Verifier — initialize + tools/list handshake
assignee: pi
type: feat
priority: high
status: pending
depends_on: ["T065", "T074", "T076"]
created: 2026-09-05
updated: 2026-09-05
---

# T078 - MCP Runtime Verifier — initialize + tools/list handshake

## 目標

實作真正的 MCP runtime 驗證：啟動 server 執行 `initialize` + `tools/list` handshake。對應規格書 §59, §56 Test 4, §61 Phase 7, §64 Definition of Done。

新檔案：`internal/engines/runtime_verifier.go`。

## 驗收標準

- [ ] `internal/engines/runtime_verifier.go` 新建：
  - [ ] `Verify(ctx context.Context, entity *Entity) RuntimeVerificationResult` 核心函數
  - [ ] 僅對 `MCPIdentity.Status == STATIC_VERIFIED` 且 `Endpoint.Type == MCP_RUNTIME_ENDPOINT` 的 entity 執行
  - [ ] 支援 transports：stdio, SSE, streamable-http
  - [ ] 步驟：
    1. [ ] 啟動 server process（根據 entrypoint, transport）
    2. [ ] 發送 `initialize` request（protocol version, capabilities）
    3. [ ] 驗證 `initialize` response（server info, capabilities, protocol version）
    4. [ ] 發送 `tools/list` request
    5. [ ] 驗證 `tools/list` response（tools array, 每個有 name, description, inputSchema）
    6. [ ] 可選：`resources/list`, `prompts/list`
    7. [ ] 關閉 server process
- [ ] `RuntimeVerificationResult`：
  - [ ] `Status`：`PASSED`, `FAILED`, `TIMEOUT`, `ERROR`
  - [ ] `InitializeResult`：success, response, latency_ms, error
  - [ ] `ToolsListResult`：success, tool_count, tools_summary, latency_ms, error
  - [ ] `Timestamp`
  - [ ] `Evidence`：完整 request/response logs (truncated)
- [ ] 超時控制：initialize 10s, tools/list 10s, total 30s
- [ ] Process 隔離：每次驗證獨立 process，避免污染
- [ ] 資源清理：確保 process 結束、port 釋放、temp files 清理
- [ ] 錯誤處理：server crash、protocol error、transport error 分類記錄
- [ ] 單元測試：Mock server、測試各種失敗情況
- [ ] 整合測試：對已知 MCP server（如 reference servers）驗證
- [ ] 接受測試對應規格書 §56 Test 4

## 備註

- 參考現有 `internal/engines/verification.go` (T022) 但需重構適應新架構
- 這是區分 `STATIC_VERIFIED` 和 `RUNTIME_VERIFIED` 的關鍵（T079）
- 規格書 §54：只有 runtime verification passed 才能進 Verified MCP Servers view
- 安全考慮：在 sandbox/container 中執行（T080 整合）

## 執行紀錄

- 待執行