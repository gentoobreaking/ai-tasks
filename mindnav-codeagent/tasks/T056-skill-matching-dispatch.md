---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/579
title: T056 - 技能相似度匹配與動態注入引擎
type: Feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-18
updated: 2026-05-18
howto: implement
---

# T056 - 技能相似度匹配與動態注入引擎

## 目標
目前每個 agent 的 `authorized_skills` 是 YAML 靜態寫死，無「新任務進來 → 比對技能庫 → 自動注入相關技能」的機制。需實作技能匹配引擎，在 task 啟動時自動找出最相關的技能並注入 agent context。

## 驗收標準
- [x] 新增 `engine/skills/skill_matcher.py`：
  - `SkillMatcher` class，輸入 task query，比對 `engine/skills/auto/` 下的 `.md` 技能
  - 支援兩種模式：**keyword**（比對 `trigger_pattern` frontmatter，輕量無需 embedding）
  - **vector**（使用現有 `HuggingFaceEmbeddings` BGE，`_skill_embeddings` dict 快取）
- [x] 匹配結果排序，返回 top-k（k 可配置，預設 3）
- [x] 在 `engine/nodes/base.py` 的 `agent_node` 中注入：
  - 比對結果以 `<skill-context>` 圍欄格式插入 system prompt
  - 注入位置：stable prompt 之後、memory-context 之前、messages 之前
  - 同時更新 `state["skills_used"]` 供 T060 outcome signal 使用
- [x] `config/agents.yaml` 新增 `skill_matching.enabled / top_k / method`
- [x] 技能 embedding 快取：`_skill_embeddings` dict cache，vector mode 時惰性計算
- [x] 未命中時回退到現有 `authorized_skills` 靜態設定（無技能就只發 stable prompt）
- [x] 單元測試 9 項（keyword match by role / exclude other role / no results / disabled / empty query / format_context / ranking / all roles）

## 備註
- 相依於 T055（技能檔案需先存在）
- 向量匹配可復用 `engine/knowledge_base/local_kb.py` 的 `HuggingFaceEmbeddings`（BGE）
- 圍欄格式參考 T054 的 `<memory-context>` 設計，保持一致
