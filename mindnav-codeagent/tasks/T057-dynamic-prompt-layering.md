---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/580
title: T057 - 動態 System Prompt 分層組裝
type: Feature
priority: high
status: done
assignee: gemini-3-flash-preview
created: 2026-05-18
updated: 2026-05-18
howto: implement
---

# T057 - 動態 System Prompt 分層組裝

## 目標
目前 `engine/nodes/base.py` 的 `agent_node` 只有一行 `config.get("system_prompt")`，所有內容寫死在 `agents.yaml`。需改為分層組裝架構：穩定層（人格/規則）+ 技能層（匹配到的技能）+ 記憶層（跨 session 摘要）+ 會話層（即時），每層有各自的快取策略與更新條件。

參考 Hermes `run_agent.py` `AIAgent._build_system_prompt()`。

## 驗收標準
- [x] 新增 `engine/prompt_assembly.py`：
  - `PromptAssembler` 類別，負責分層組裝 system messages
  - 層級定義（由穩定 → 動態）：
    1. **Stable Layer**：`AGENTS.md` / `SOUL.md` / `IDENTITY.md` 等固定規則（快取，幾乎不變）
    2. **Skill Layer**：T056 匹配到的技能內容（依 task 而變）
    3. **Memory Layer**：T054 搜尋到的跨 session 摘要（依 context 而變）
    4. **Session Layer**：當前對話 messages（即時，不經此組裝器）
  - 每層輸出為 `SystemMessage` 或 `List[SystemMessage]`
- [x] 改寫 `engine/nodes/base.py` 的 `agent_node`：
  - 將 `config.get("system_prompt")` 改為呼叫 `PromptAssembler.assemble(role, task_description, state)`
  - 組裝結果傳給 `ChatPromptTemplate.from_messages()` 作為 system messages 陣列
- [x] 支援 Stable Layer 檔案讀取（目前不存在，但預留路徑）：
  - `engine/conventions/AGENTS.md`（若存在則讀取）
  - 不存在時回退到 `agents.yaml` 的 `system_prompt`
  - 提供 `load_convention_file(path)` 工具函式
- [x] 快取策略：
  - Stable Layer：process 生命週期內快取（`functools.lru_cache`）
  - Skill/Memory Layer：每次請求重新組裝
- [x] 可配置：`config/agents.yaml` 新增 `prompt_layering.enabled`、`prompt_layering.cache_ttl`
- [x] 向後相容：`prompt_layering.enabled: false` 時完全回到現有行為
- [x] 單元測試：
  - 各層獨立單元測試
  - 整合測試：mock 各層輸出，驗證最終 messages 陣列順序與內容正確
  - 效能測試：快取命中 vs 未命中

## 備註
- 相依於 T054 + T056（記憶層和技能層的資料來源）
- 但 Stable Layer 可獨立先行實作
- Hermes 參考：`run_agent.py` `_build_system_prompt()` 的分層邏輯
- 此改動是心臟手術等級，需確保向後相容
