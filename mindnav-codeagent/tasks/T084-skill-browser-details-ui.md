---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/574
title: Skill Browser + Details UI
type: Feature
priority: medium
assignee: OpenCode DeepSeek V4 Flash
status: done
created: 2026-05-18
updated: 2026-05-21
howto: null
---

# T084 - Skill Browser + Details UI

## 目標
在 Dashboard 中實現 Skill 管理和詳情查看介面。

## 驗收標準
- [x] Skill 列表頁面
- [x] Category filter（Core / MCP / Analytics / Utility / Infra / Writing 等）
- [x] 搜尋（name / description）
- [x] Toggle enable/disable 開關
- [x] Skill 詳情頁：
  - Name / description / category
  - Applicable roles
  - Version
  - Content preview
- [x] Per-profile authorized_skills 編輯
  - Profile 清單展開式編輯
  - 添加/移除 authorized skill
  - Save 到 `config/agents.yaml`
- [x] Skill promote 功能（跨 role 共享，modal 中選角色）

## 備註
- 利用現有的 `SkillManager` / `SkillLibrary`
- 依賴 T080 Frontend React 基礎
- 與 Hermes 的 Skills tab UI 類似

## T084 complete. Here's what was built:

**Backend** (7 new endpoints in `skills_router.py`):
- `GET /api/v1/skills` — list all skills from both `~/.opencode/skills/*/SKILL.md` and `engine/skills/auto/*.md`, with `?category=` & `?search=` filters
- `GET /api/v1/skills/categories` — unique categories
- `GET /api/v1/skills/profiles` — profiles + authorized_skills from `agents.yaml`
- `PUT /api/v1/skills/profiles/{role}/authorized-skills` — update per-role skills
- `POST /api/v1/skills/{name}/toggle` — toggle enabled/disabled (modifies frontmatter `status`)
- `POST /api/v1/skills/{name}/promote` — add skill to a role's authorized_skills
- `GET /api/v1/skills/detail?name=xxx` — full detail with body content

**Frontend** (`SkillsPage.tsx`):
- Skill Browser: search + category pills + toggle switch per skill
- Detail modal: name, description, category, version, triggers, roles, usage stats, full body preview, promote dropdown
- Profile Manager: expandable per-role editors to add/remove authorized_skills with save

**Route & Nav**: `/skills` route + "🛠 Skills" nav tab added.

