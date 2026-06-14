---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/520
title: T014 - 擴展性技能系統架構 (Skill System Architecture)
type: Feature
priority: low
status: done
assignee: gemini-cli
created: 2026-05-15
updated: 2026-05-15
---

# T014 - 擴展性技能系統架構 (Skill System Architecture)

## Description
建立 `engine/skills/` 模組，將複雜的自動化流程從單純的 Tool 中剝離，形成可獨立執行、易於擴展的「技能系統」。

## Acceptance Criteria
- [x] 建立 `engine/skills/base.py` 定義統一技能介面。
- [x] 實作技能管理器 (`engine/skills/manager.py`) 支援動態載入。
- [x] 將目錄標準化等複雜操作遷移至 `engine/skills/` 中。
- [x] 整合至 LangGraph，使 Coder/PM 節點可通過 `trigger_skill` 工具調用。

## Notes
- 實作了雙路徑載入機制：`engine.skills` (內置) 與 `clawhub/` (外部擴展)。
- 支援動態加載，無需重啟服務即可註冊新技能。

