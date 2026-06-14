---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/628
type: Feature
priority: P2
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-21
updated: 2026-05-21
howto: 
---

  1. 建立 engine/tools/registry.py — ToolRegistry 類別
     - 支援動態註冊/反註冊工具
     - 支援依 agent 角色過濾工具（不同 agent 看到不同工具集）
     - replace 表驅動工具分發
  2. 建立 engine/tools/mcp_client.py — MCPClient 類別
     - 支援外部 MCP 伺服器連線（HTTP/SSE）
     - 將 MCP tool 定義轉換為 @tool 格式
     - 支援工具列表同步與呼叫轉發
  3. 整合到 graph.py：tools 清單改為從 registry 動態載入
  4. 在 config/agents.yaml 新增 tools 設定區塊
     - 每個 agent 可指定可用工具清單
     - 支援 external MCP server 連線設定
  5. 更新 PermissionChecker（T105）可對 MCP 工具設權限
  6. 更新測試驗證動態註冊與 MCP 呼叫

# T113 - Custom tools framework + MCP server 支援

## 目標
實作動態工具註冊框架與 MCP 伺服器支援，讓 mindnav-codeagent 可動態載入外部工具，對齊 OpenCode 的 Custom Tools 與 MCP Servers 架構。

## 驗收標準
- [x] ToolRegistry 支援動態註冊/反註冊工具
- [x] ToolRegistry 支援依 agent 角色過濾工具集（結合 PermissionChecker）
- [x] MCPClient 支援連線外部 MCP 伺服器（HTTP API）
- [x] MCP tool 轉換為 @tool 格式並註冊到 registry
- [x] graph.py 的 tools 清單從 registry 動態載入
- [x] config/agents.yaml 支援 per-agent tools 設定（permissions 區塊）
- [x] MCP 工具可受 PermissionChecker 控管

## 備註
- 依賴 T104（AgentRegistry）與 T105（PermissionChecker）
- MCP 協定支援 HTTP/SSE 傳輸，參考 MCP spec
- 若無外部 MCP 伺服器，不影響現有功能
