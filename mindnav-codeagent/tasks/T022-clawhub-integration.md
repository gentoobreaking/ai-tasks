---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/524
title: T022 - ClawHub 擴展性技能整合 (ClawHub Integration)
type: Feature
priority: high
status: done
assignee: gemini-cli
created: 2026-05-15
updated: 2026-05-15
---

# T022 - ClawHub 擴展性技能整合 (ClawHub Integration)

## Description
實現系統對 ClawHub 標準技能格式 (`skill.md` + 腳本) 的兼容，透過動態解析 MD 元數據，將外部技能自動註冊並注入 Agent 工作流。

## Acceptance Criteria
- [x] 實作 `ClawHubParser` (內含於 `ClawhubAdapterSkill`)，能解析 `skill.md` 中的 YAML Header 與腳本路徑資訊。
- [x] 建立 `ClawhubAdapterSkill`，自動將 MD 中的定義轉譯為 Agent 可理解的 LangChain Tool。
- [x] 實現 `SkillManager` 的動態掃描機制，監控 `clawhub/` 目錄並自動掛載技能。
- [x] 確保執行過程符合沙盒安全限制 (`SafeShell`)。

## Notes
- 系統現在支援「內置技能」與「外部 ClawHub 技能」雙軌載入。
- `SkillManager` 會自動偵測 `clawhub/` 下的 `skill.md` 並進行註冊，達成熱插拔 (Hot-plug) 能力。

