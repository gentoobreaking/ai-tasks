---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/527
title: T025 - 數據調研代理 (Research Agent)
type: Feature
priority: medium
status: done
assignee: gemini-cli
created: 2026-05-16
updated: 2026-05-16
---

# T025 - 數據調研代理 (Research Agent)

## Description
新增 Research Agent 專職負責聯網資訊蒐集、競品分析與技術調研，減輕 Coder 的調研壓力，並提升資訊蒐集的結構化水準。

## Acceptance Criteria
- [ ] 在 `agents.yaml` 定義 `researcher` 角色，包含調研參數（如搜尋廣度、資訊源權重）。
- [ ] 升級 `Supervisor` 工作流，允許 PM 指派任務給 Researcher。
- [ ] 賦予 Researcher 調研專屬技能（如深度網頁抓取、Markdown 格式總結）。

## Notes
- Researcher 產出應符合 Markdown 標準，便於 Doc Agent 接手後續文檔化。
