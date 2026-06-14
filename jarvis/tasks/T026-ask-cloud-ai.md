---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/758
title: 雲端 AI 外包技能（ask_cloud_ai）
type: Feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-13
updated: 2026-05-13
depends: T025
---

# T026 - 雲端 AI 外包技能（ask_cloud_ai）

## 目標
當本地 Qwen2.5-7B 遇到複雜問題時，可將問題外包給雲端 AI（NVIDIA DeepSeek V4 Flash / Pro）。

## 實作內容
- `skills/ask_cloud_ai/SKILL.md` — 工具說明
- `skills/ask_cloud_ai/execute.py` — 實際發送 API 請求
- 支援從輸入中指定模型（`使用 model_name: query`）
- Fallback 機制：主模型失敗 → 備援 deepseek-v4-pro（各重試 3/2 次）
- api_base / api_key 自動從 `~/.jarvis_config.json` 的 models.backends 匹配
- 預設模型與 api_base 可透過 `~/.jarvis_config.json.ask_cloud_ai` 設定

## 驗收標準
- [x] 本地模型可將任務外包給 NVIDIA DeepSeek V4 Flash
- [x] 輸入中可用「使用 xxx: query」指定雲端模型
- [x] 主模型失敗自動 fallback 到備援模型
- [x] 各模型有 retry 機制（固定 2 秒間隔）
- [x] api_key/api_base 自動從 models.backends 匹配
