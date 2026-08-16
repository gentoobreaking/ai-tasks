---
github_issue: null
title: 模型備援鏈 YAML 配置（impl_providers.yaml）＋順位重排（opencode CLI 第一）
type: feature
priority: medium
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-09'
updated: '2026-08-17'
spec_version: v3
---
# T039 - 模型備援鏈 YAML 配置＋順位重排

## 目標
`twin auto` 的模型呼叫原本硬編備援順位（OpenRouter → ollama → opencode CLI → relay）。
本次（2026-08-09 當日）以 ad-hoc 完成後補登任務書：
1. 每 tier 的 model 可由 YAML 配置
2. 順位改為 opencode CLI headless 第一優先（固定 opencode/deepseek-v4-flash-free）

## 驗收標準
- [x] 新增 `.opencode/impl_providers.yaml`：4 個 tier（opencode/openrouter/ollama/local），
      各含 `enabled`/`model`；順序即優先序
- [x] 新順位：① opencode CLI headless（deepseek-v4-flash-free）→ ② OpenRouter（nemotron-3-ultra）
      → ③ 本地 ollama → ④ 本地 relay
- [x] YAML 不存在時退回內建順位（向後相容）；`--model` CLI 覆蓋 OpenRouter tier（原語意不變）
- [x] `_do_call_opencode`/`_do_call_local` 增加 model 參數
- [x] 新增 `tests/test_impl_providers.py` 4 測試（全離線 mock）通過
- [x] 全量 pytest 128 passed + 1 skipped；ruff check/format 全過

## 實作摘要
- `auto_develop.py`：`load_impl_providers()`（yaml 讀取＋`_provider_cache`＋fallback）
  `call_model_for_implementation` 重寫為依 YAML 順位迭代；`_tier_model()` 處理各 tier 預設與覆蓋
- README §6 與 docs/development-workflow.md 情境 B：補備援鏈配置說明

## 驗證結果（2026-08-09）
- `tests/test_impl_providers.py` 4 passed：
  ① 內建順位 fallback（YAML 缺失）
  ② YAML 順位＋disabled tier 跳過
  ③ opencode 第一優先、--model 不影響 opencode tier
  ④ opencode 失敗後 openrouter 接手且接受 --model 覆蓋
- 全量 `pytest tests/ -q`：128 passed + 1 skipped（124 → 128）
- `ruff check` / `ruff format --check`：全過
- 程式碼 commit：`abcbdc8`（含變更摘要）