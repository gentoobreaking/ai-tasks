---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/578
title: T055 - 任務完成後技能自動提煉 Pipeline
type: Feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-18
updated: 2026-05-18
howto: implement
---

# T055 - 任務完成後技能自動提煉 Pipeline

## 目標
目前 skills 都是預先寫死在 `engine/skills/` 的 Python 程式碼，無「任務完成後自動提煉成可重用技能」機制。需新增 post-task pipeline：graph 流程結束時，LLM 自動總結執行過程，寫入結構化技能文件，供後續任務匹配調用。

參考 Hermes `tools/skill_manager_tool.py` + `tools/skills_guard.py`。

## 驗收標準
- [x] 新增 `engine/skills/auto_skill_extractor.py`：
  - `AutoSkillExtractor` class，在 Supervisor 回傳 END 且 outcome 為 success 時觸發
  - 將 messages 餵給 LLM，產出結構化技能文件（YAML frontmatter + Markdown 正文）
  - 自動提取 trigger_pattern（LLM 總結關鍵詞）
  - 技能檔案格式：
    ```yaml
    ---
    name: <kebab-case>
    trigger_pattern: <逗號分隔關鍵詞>
    type: auto_extracted
    source_task: T0XX
    source_role: coder
    applicable_roles: ["coder"]
    created: YYYY-MM-DD
    usage_count: 0
    success_rate: 1.0
    version: 1.0.0
    ---
    ## 目標
    ## 步驟
    ## 關鍵決策
    ## 輸出格式
    ## 注意事項
    ```
- [x] 技能存放位置：`engine/skills/auto/<skill-name>.md`
- [x] `SkillManager` 擴充支援 `.md` 技能載入（`AutoMdSkill` class + `list_auto_skills()` / `get_auto_skill()`）
- [x] `config/agents.yaml` 新增 `auto_skill_extraction.enabled / min_iterations_for_extraction / max_skills_per_task`
- [x] 避免重複提煉：`_already_extracted()` 檢查 `source_task` frontmatter
- [x] 串接至 `supervisor_node.py`：END 流程結束後呼叫 `skill_extractor.extract()`
- [x] 單元測試 11 項（AutoMdSkill 解析/觸發匹配/角色過濾 + SkillManager 列舉 + Extractor disabled/重複/outcome 過濾/trigger_pattern）

## 備註
- 相依於 T054（需要 session memory 來提供 context）
- Hermes 參考路徑：`tools/skill_manager_tool.py`
- 技能格式建議與 `agentskills.io` 開放標準相容
