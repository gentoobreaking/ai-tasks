---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/528
title: T026 - 測試與質量保證代理 (QA Agent)
type: Feature
priority: medium
status: done
assignee: gemini-cli
created: 2026-05-16
updated: 2026-05-16
---

# T026 - 測試與質量保證代理 (QA Agent)

## Description
新增 QA Agent 專職負責代碼的品質驗證、邊界測試案例生成與 Bug 挖掘，確保在提交前的代碼穩定性。

## Acceptance Criteria
- [ ] 在 `agents.yaml` 定義 `qa` 角色，包含品質檢測參數。
- [ ] 升級 `Supervisor` 工作流，允許 PM 指派任務給 QA，並建立 Coding -> QA -> PM 的反饋環。
- [ ] 賦予 QA 專屬測試工具（如單元測試執行、靜態分析器調用）。

## Notes
- QA 產出應包含 Bug 清單或測試覆蓋率報告，供 PM 審核。
