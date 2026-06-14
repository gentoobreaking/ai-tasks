---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/757
title: SKILL.md 動態掃描載入系統
type: Feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-13
updated: 2026-05-13
depends: T024
---

# T025 - SKILL.md 動態掃描載入系統

## 目標
建立 Plug & Play 的技能系統：在 skills/ 下建立資料夾 + SKILL.md + execute.py 即可自動載入為 LangChain Tool。

## 實作內容
- `auto_scan_and_load_skills()` — 掃描 skills/ 目錄，尋找 SKILL.md + execute.py
- 使用 importlib 動態載入 execute.py 中的 execute() 函數
- SKILL.md 內容作為 tool.description 餵給模型
- 同時保留 JSON config 的 handler_module/handler_func 載入方式

## 驗收標準
- [x] 新增 skills/xxx/ 目錄 + SKILL.md + execute.py 即可自動註冊為工具
- [x] SKILL.md 描述正確傳遞給模型作為工具說明
- [x] JSON config 與目錄掃描兩種方式共存
