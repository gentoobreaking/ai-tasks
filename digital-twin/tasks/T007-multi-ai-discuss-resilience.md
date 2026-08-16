---
status: done
depends_on: []
priority: high
assignee: OpenCode
created: 2026-08-03
updated: '2026-08-17'
spec_version: v3
---
# T007: multi_ai_discuss.py 重構為 DiscussionOrchestrator 狀態機 + 韌性層

## 背景
現有 `multi_ai_discuss.py` 批次同步呼叫 4 模型，**無 timeout、無 retry、無 circuit breaker**（DeepSeek 第 1 輪建議 2, SPEC-03, DEC-03）。

## 需求
1. 拆分為 `discussion_orchestrator/` 套件：
   - `DiscussionOrchestrator` 狀態機：INIT → ROUND_N → HUMAN_REVIEW → MERGE → ARCHIVED
   - `ModelAdapter` 介面：`complete(prompt, system, **kwargs)`, `count_tokens(text)`
   - 現有 4 家模型各自實作 Adapter
2. 韌性層（每個 Adapter 內建）：
   - `tenacity` retry: 3次、exp backoff (min=2, max=30)
   - `pybreaker` circuit breaker: 50% 失敗率、60s 熔斷
   - `timeout=60s` (Gemini 較慢)
   - `token_budget` 於 `manifest.json`，超支即停止並告警
3. `manifest.json` 包含：project, version, token_budget, models[], status

## 驗收標準
- [x] 單一模型掛點不導致整體流程卡死（`test_single_model_failure_does_not_block` + 真實 402 端到端）
- [x] 超過 token budget 即停止並發 Telegram 警報（`test_token_budget_stops_and_alerts` + token-budget-alert.md）
- [x] 可換裝 `ollama` / `vllm` 本地模型（`create_adapter(provider="openai", api_base=本地)`，`test_create_adapter_swaps_ollama_vllm`）

## 參考
- v3 討論 DEC-03, DEC-10 / SPEC-03 / DeepSeek 第 1 輪建議 2, 第 2 輪建議 2.2
- 摘要：`2026-08-06-T007-summary.md`

## 執行記錄
- repoSplit `discussion_orchestrator/{orchestrator,adapters,resilience,__init__}.py`
- `multi_ai_discuss.py` 薄 CLI，保留 `AIClient` 相容（consensus_eval）
- pyproject 補 `tenacity>=8.2`
- `pytest: 32 passed`、ruff 新檔案 0 error