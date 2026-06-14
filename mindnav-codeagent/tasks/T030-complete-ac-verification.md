---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/534
title: T030 - 驗證環境建置與記憶管理 AC 完成
type: Feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash Free
created: 2026-05-16
updated: 2026-05-16
howto: verify
---

# T030 - 驗證環境建置與記憶管理 AC 完成

## 目標
Review 發現 T001、T012、T018、T020、T025、T026、T027 雖然功能已實作，但 Acceptance Criteria 多項未勾選確認。此任務統整驗證已完成項目並關閉欠缺的檢查項。

## 驗收標準
- [x] T001：確認 GGUF 模型文件已就位（`models/qwen2.5-coder-7b-instruct.Q4_K_M.gguf`），推理伺服器配置已存在 `docker-compose.yml`
- [x] T012：確認 `docker-compose.yml` 與 `docs/DEPLOYMENT.md` 已完成，`src/scripts/start_all.sh` 已由 T028 補全
- [x] T018：確認 `engine/tools/rag_sync.py` 已實作 watchdog + debounce，`config/agents.yaml` 的 `rag_config` 正確配置
- [x] T020：確認 `engine/core/memory_mgmt.py` 已完成 `/forget`、`/memory_stats`、Redis checkpointer 功能
- [x] T025/T026/T027：確認 `config/agents.yaml` 與 `engine/graph.py` 中 Researcher/QA/DevOps 節點已定義並接入 Supervisor 工作流

## 備註
- 部分驗證項目（如實際啟動推理伺服器進行併發測試）需手動確認，不在自動化驗證範圍內
- `engine/tests/verify_all.py` 已用於全系統驗證，建議定期執行
