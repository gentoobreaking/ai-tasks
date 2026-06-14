---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/557
title: 配置系統提示注入階層與 role-specific 目錄
type: Feature
priority: medium
status: done
assignee: gemini-3-flash-preview
created: 2026-05-18
updated: 2026-05-18
howto: 使用 config/{role}/ 和 config/global/ 目錄結構，實現系統提示詞的層級化注入。
---

# T065 - 配置系統提示注入階層與 role-specific 目錄

## 目標
實作基於 `config/` 目錄的系統提示詞（System Prompt）層級化注入機制，使 Agent 能夠根據角色讀取專屬配置，並支援全域預設配置。

   - 更新 engine/prompt_assembly.py:
       - 在讀取其他 8 個核心配置檔案前，優先從 config/global/global-policy.md 讀取內容並注入。
       - 確保 global-policy.md 作為 Agent 行為的基礎準則，最先載入至系統提示詞中，隨後再依序載入角色專屬或全域的其它設定檔。

## 驗收標準
- [x] 修改 `engine/prompt_assembly.py`，搜尋邏輯改為先找 `config/{role}/`，再找 `config/global/`。
- [x] 注入 8 個核心 Markdown 文件 (AGENTS.md, SOUL.md, USER.md, TOOLS.md, IDENTITY.md, HEARTBEAT.md, MEMORY.md, BOOTSTRAP.md)。
- [x] 確保當配置檔案缺失時，系統能自動回退至 `agents.yaml` 定義的 `system_prompt`。

## 備註
此機制優化了 Agent 行為控制的細膩度，建議在 `config/` 目錄下建立對應的 `global` 或 `role` 資料夾來存放 MD 檔案。
