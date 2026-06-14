---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/584
title: T061 - 跨 Agent 技能共用機制
type: Feature
priority: high
status: done
assignee: gemini-3-flash-preview
created: 2026-05-18
updated: 2026-05-18
howto: implement
---

# T061 - 跨 Agent 技能共用機制

## 目標
目前 T055 提煉的技能是任務層級的，沒有區分「這個技能適合哪個 agent 角色」。Coder 學到的技能應該也能被 Security 或 Architect 參考（如果相關），但需要角色標記與權限控制。

需在技能 frontmatter 加入 `applicable_roles`，並讓 T056 的 `skill_matcher` 在比對時考慮 agent 角色。

## 驗收標準
- [x] T055 技能 frontmatter 擴充角色欄位：
  ```yaml
  applicable_roles: ["coder", "architect", "security"]  # 誰可以用
  source_role: "coder"  # 由哪個角色提煉的
  ```
  - `applicable_roles` 預設值 = `[source_role]`（僅自己可用）
  - 提煉時 LLM 需判斷該技能是否通用，自動填入
- [x] `engine/skills/skill_matcher.py`（T056）擴充：
  - `match(task_query, role)` — 除了比對 query，還過濾 `applicable_roles`
  - 若 role 不在 `applicable_roles` 中，跳過該技能
- [x] 技能分享機制：
  - `applicable_roles: ["*"]` 表示所有角色可用
  - 新增 `SkillLibrary.promote(skill_name, role)` — 將技能分享給指定角色
  - promote 後自動更新 frontmatter 的 `applicable_roles`
- [x] 在 `config/agents.yaml` 中新增 `skill_sharing.default_policy`：
  - `source_only`（預設，僅提煉者可用）
  - `auto_share`（自動分享給所有角色）
  - `manual`（需人工 promote）
- [x] 新增 `engine/skills/skill_library.py`：
  - 統一的技能查詢介面，封裝 `skill_matcher` + `skill_tracker`
  - `list_skills(role=None, applicable=True)` — 列出角色可用的技能
  - `get_skill(name)` — 取得單一技能內容
  - `promote(skill_name, role)` — 分享給某角色
- [x] 單元測試：
  - Coder 提煉的技能預設只被 Coder 匹配到
  - Promote 後 Architect 也能匹配
  - `applicable_roles: ["*"]` 全角色可用
  - `list_skills(role)` 正確過濾

## 備註
- 相依於 T055（技能存在）、T056（匹配引擎）
- `SkillLibrary` 應設計為單例，集中管理所有 auto skills
- 這個機制也影響 T059 的優化迴路（跨角色技能可能需要不同角度的優化）
