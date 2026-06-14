---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/619
type: Feature
priority: P0
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-21
updated: 2026-05-21
howto: 
---

  1. 在 config/agents.yaml 擴充每個 agent 的定義，新增 mode (primary/subagent)、description、permissions 等欄位
  2. 建立 engine/agent_registry.py — AgentRegistry 類別，載入 agent 設定並提供查詢介面
  3. Supervisor 的 route() 改為讀取 agent description 讓 LLM 根據描述選擇下一步，取代硬編碼 allowed_next
  4. 改造 ProjectState 新增 agent_mode 欄位追蹤當前模式
  5. 保留向後相容：無 description 的 agent 仍使用傳統 allowed_next 路由
  6. 更新測試驗證 description-driven 路由正確運作

# T104 - Agent Registry + Description-driven Routing

## 目標
將 supervisor 的硬編碼 allowed_next transitions 改造為 agent registry + description-driven 路由，讓 LLM 可依據 agent 的描述動態選擇下一步，更接近 OpenCode 的 Agent Behavior。

## 驗收標準
- [x] config/agents.yaml 每個 agent 擴充 mode/description/permissions 欄位
- [x] AgentRegistry 類別可載入、查詢、過濾 agent 設定
- [x] Supervisor route() 支援 description-driven 路由（LLM 讀描述選 agent）
- [x] 向後相容：無 description 的 agent 仍使用傳統 transitions
- [x] ProjectState 新增 agent_mode 欄位

## 備註
- description 應簡潔，讓 LLM 能判斷何時使用此 agent
- mode: primary（可 spawn 其他 agent）/ subagent（被呼叫執行）
- 這是後續 4 個 Phase 的基礎
