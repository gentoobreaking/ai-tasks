---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/529
title: T027 - DevOps 自動化代理 (DevOps Agent)
type: Feature
priority: medium
status: done
assignee: gemini-cli
created: 2026-05-16
updated: 2026-05-16
---

# T027 - DevOps 自動化代理 (DevOps Agent)

## Description
新增 DevOps Agent 專職負責基礎設施管理、CI/CD 流程自動化、部署監控與資源調度優化，確保系統的高可用性與運行效率。

## Acceptance Criteria
- [ ] 在 `agents.yaml` 定義 `devops` 角色，包含基礎設施監控參數。
- [ ] 升級 `Supervisor` 工作流，將 DevOps 納入系統架構管理（支援部署狀態彙報、資源負載告警）。
- [ ] 賦予 DevOps 專屬管理工具（如 Docker 控制、資源負載查詢、CI/CD 觸發器）。

## Notes
- DevOps Agent 應能監控 `inference-server` 負載，並在必要時通知 Supervisor 調整請求路由或請求資源擴容。
