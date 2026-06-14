---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/581
title: T058 - 技能安全門禁與版本管理
type: Feature
priority: medium
status: done
assignee: gemini-3-flash-preview
created: 2026-05-18
updated: 2026-05-18
howto: implement
---

# T058 - 技能安全門禁與版本管理

## 目標
auto-extracted skills 可能包含不安全的操作模式或敏感資訊。需在技能被使用前進行靜態安全掃描，並建立技能版本管理機制（類似 Hermes `tools/skills_guard.py`）。

## 驗收標準
- [x] 新增 `engine/skills/skills_guard.py`：
  - 靜態掃描技能 `.md` 檔案內容，檢查以下危險模式：
    - 包含 destructive shell commands（rm、dd、mkfs 等 — 復用 `engine/security.py` 的 `SafeShell` 邏輯）
    - 包含 API key / token / password 明文
    - 包含 `sudo`、`chmod`、`chown` 等高危操作
    - 包含外部網路下載腳本 (`curl | sh`、`wget -O`)
  - 輸出掃描報告：`pass` / `warn` / `block`
- [x] 信任分級制度：
  - `trusted`：手寫技能（放在 `engine/skills/` 的 `.py`），跳過掃描
  - `auto`：自動提煉技能（`engine/skills/auto/`），每次載入時掃描
  - `external`：外部匯入技能，掃描 + 需人工確認
- [x] 版本管理：
  - 技能檔案 frontmatter 新增 `version` 欄位（語意化版本，`1.0.0`）
  - 修改時 version bump（minor 或 patch）
  - 保留舊版本在 `engine/skills/auto/_archive/` 目錄
- [x] `SkillManager._load_skill()` 整合 `skills_guard`：
  - auto 技能載入前先掃描，`block` 等級拒絕載入並 log 警告
- [x] `config/agents.yaml` 新增 `skills_guard.enabled`、`skills_guard.action_on_block（skip / raise）`
- [x] 單元測試：
  - 安全掃描正常案例（安全技能 → pass）
  - 安全掃描危險案例（含 rm 指令 → block）
  - 信任分級正確運作

## 備註
- 可復用 `engine/security.py` 的 `SafeShell.is_safe_command()` 邏輯
- 相依於 T055（auto skills 的存在）
- Hermes 參考：`tools/skills_guard.py`
