---
github_issue: null
title: Dockerfile 依賴補 tenacity（container import discussion_orchestrator 崩潰）
type: fix
priority: high
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-12'
updated: '2026-08-17'
spec_version: v3
---
# T067 - Dockerfile 補上 tenacity

## 目標
`discussion_orchestrator/resilience.py:20` 需要 `tenacity`，但 `Dockerfile:17` 未安裝 →
容器 `HEALTHCHECK` 的 `import multi_ai_discuss`/`consensus_eval` 即崩潰，container unhealthy。

## 驗收標準
- [x] Dockerfile 依賴清單補上 `tenacity>=8.2`（與 pyproject `[prod]`/`dev` 一致）
- [x] 同步 tighten `pybreaker>=1.0` → `>=1.4,<2`（T077 配合，避免 2.x API 變更）
- [x] 在乾淨 venv（僅 Dockerfile dep list）驗證 `import config, auto_develop,
  multi_ai_discess, consensus_eval, spec_auto_merge, common.observability` 成功印 "healthy"
- [x] README/deployment 註記依賴來源與 pyproject 未 pip-installable wheel 的限制
- [x] CI 映像 build 檔案無變更（workflow 仍用 ghcr build）

## 備註
- 選擇「補到手工清單」而非 `pip install ".[prod]"`：hatchling 無 `[tool.hatch.build]` 設定，
  `pip install .` 會失敗（驗證過）；專案目前以 source-on-PATH 執行，未做 wheel。
- RAG deps（lancedb/sentence-transformers）故意不加進 prod image（含 torch 太大）；
  容器 RAG 路徑為 graceful degradation，另可由 `rag` extra 啟用。
- docker daemon 未於本環境啟動，故未執行真正 `docker build`；改以等效乾淨 venv + HEALTHCHECK import 驗證。