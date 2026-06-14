---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/555
title: T051 - 全面清查 Import 路徑
type: Bug
priority: critical
status: done
assignee: OpenCode DeepSeek V4 Flash Free
created: 2026-05-16
updated: 2026-05-16
howto: fix
---

# T051 - 全面清查 Import 路徑

## 目標
Review 發現多處 import 路徑與實際檔案位置不一致，可能導致執行期錯誤：

- `interface/tg_bot.py:6` → `from engine.core.graph import build_project_graph`（應為 `engine.graph`）
- `engine/core/supervisor.py`（舊版 import `engine.core.llm_factory`，已在 T029 修復，但需確認其他檔案無殘留）

## 驗收標準
- [x] 對整個 `engine/`、`interface/`、`tests/` 進行 import 路徑地毯式檢查
- [x] 修正所有不一致的 import 路徑
- [x] 額外修復的 import 路徑：`engine/graph.py`（web_search/tool_adapter）、`engine/tool_adapter.py`、`engine/directory_standardization.py`、`engine/manager.py`、`engine/router.py`
- [x] 確認 `python -c "from engine.graph import build_project_graph"` 可正常執行
- [x] 確認所有測試檔案 import 正確
- [x] 可考慮加入 `isort` 或 `autoflake` 作為 pre-commit hook

## 備註
- T029 已修復 graph.py 與 git_review_api.py 的 import，但需確認無漏網之魚
- 特別注意 `engine.core.*` vs `engine.*` 的混淆
