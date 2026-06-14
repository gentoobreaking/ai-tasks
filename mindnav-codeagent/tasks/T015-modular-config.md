---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/486
title: T015 - 模組化配置系統與主管代理設計 (Modular Config & Supervisor)
type: Feature
priority: medium
status: done
assignee: gemini-cli
created: 2026-05-15
updated: 2026-05-15
---

# T015 - 模組化配置系統與主管代理設計

## Description
將 Agent 的設定（System Prompts、模型選擇、技能授權）從程式碼移至外部 YAML 檔案；並引入 Supervisor Agent 架構，實現團隊規模化調度。

## Acceptance Criteria
- [ ] 建立 `config/agents.yaml` 定義 PM、Coder、Doc 等 Agent 的配置。
- [ ] 實作配置載入器，支援動態讀取 YAML 並注入 Agent 初始化流程。
- [ ] 導入 Supervisor Agent 節點，負責接收用戶指令並進行任務拆解與任務派發。
- [ ] 支援新增 Agent 時僅需修改 YAML 配置，無需修改 `engine/graph.py` 核心邏輯。

## Notes
- 設定檔應包含：`model` (對應 LLMFactory), `system_prompt`, `authorized_skills` (清單)。
- Supervisor Agent 將位於 LangGraph 最頂層，PM 將降級為執行層的成員。
