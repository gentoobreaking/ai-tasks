# digital-twin

## 已實作功能

| 功能 |
|------|
| 任務 T001-add-config-validation |
| 任務 T002-gitignore-and-hooks |
| 任務 T003-pyproject-ruff-config |
| 任務 T004-dockerfile-ci |
| 任務 T005-structlog-otel |
| 任務 T006-telegram-bot-webhook |
| 任務 T007-multi-ai-discuss-resilience |
| 任務 T008-agent-registry |
| 任務 T009-lancedb-rag |
| 統一模型與路徑設定模組 (config.py) |
| auto_develop 品質閘門分層（只檢查 diff 檔案） |
| auto_develop 失敗路徑還原工作目錄 |
| 測試失敗自動修復迴圈（錯誤回饋給模型） |
| 文件與現況對齊（README/twin/currect_status 修正） |
| spec_auto_merge 移除假資料對照表 |
| pyproject 修正（pyright 路徑、structlog 依賴、tests 目錄） |
| twin CLI 智慧選擇 Python 直譯器（解決無 Key 假象） |
| 專案 .venv（Python 3.14 + 全部依賴） |

## Skip 項目

| Task | 說明 |
|------|------|
| | |

## 開發中

| Task | 名稱 | 說明 |
|------|------|------|
| | | |

## 待實作

| Task | 名稱 | 說明 |
|------|------|------|
| [T10-agent-versioning](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T010-agent-versioning.md) | 任務 T010-agent-versioning | |
| [T18-task-dependencies](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T018-task-dependencies.md) | 任務 frontmatter 增加 depends_on 依賴欄位 | |
| [T19-pr-summary-gate](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T019-pr-summary-gate.md) | auto_develop 完成後輸出 PR 摘要 + 大 diff 人工確認閘門 | |
| [T20-feedback-noop-fix](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T020-feedback-noop-fix.md) | apply_feedback mark_as_done no-op bug 修復 | |
| [T21-mermaid-consensus-fix](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T021-mermaid-consensus-fix.md) | gen_mermaid 真實掃描化 + consensus 中文分詞改善 | |
| [T22-daemon-db-path](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T022-daemon-db-path.md) | setup_daemon 路徑驗證 + extract_feedback DB 路徑可設定 | |
| [T23-blocked-review](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T023-blocked-review.md) | blocked 任務自動產出 review 紀錄與拆分建議 | |
| [T25-ruff-debt-cleanup](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T025-ruff-debt-cleanup.md) | ruff 舊債清理（100 errors → 0） | |
| [T27-pyright-venv-config](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T027-pyright-venv-config.md) | pyright 指向 .venv，消除 reportMissingImports 誤報 | |
| [T28-discuss-regression-test](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T028-discuss-regression-test.md) | DiscussionOrchestrator 回歸測試（T017 P0 防護） | |
| [T29-embedding-model-integration](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T029-embedding-model-integration.md) | RAG Embedding Model 整合 (LanceDB 向量搜尋) | |
| [T30-lancedb-metadata-filtering](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T030-lancedb-metadata-filtering.md) | LanceDB Metadata Filtering (標籤、專案、作者過濾) | |
| [T31-gitignore-lancedb](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T031-gitignore-lancedb.md) | .gitignore 新增 .lancedb/ 目錄忽略 | |
| [T32-telegram-bot-deployment](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T032-telegram-bot-deployment.md) | Telegram Bot 生產部署文件與啟動腳本 | |
| [T33-spec-auto-merge-state-machine](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T033-spec-auto-merge-state-machine.md) | spec_auto_merge.py 整合 DiscussionOrchestrator 狀態機推進 | |
| [T34-routing-rules-tuning](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T034-routing-rules-tuning.md) | Routing Rules Keywords 微調與其他分身同步引用 Registry | |
| [T35-twin-route-cli-extensions](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T035-twin-route-cli-extensions.md) | twin route CLI 擴充 (--list-agents, --show-rules, --dry-run) | |

## Task 列表

| # | 名稱 | 狀態 |
|---|------|------|
| [T1-add-config-validation](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T001-add-config-validation.md) | 任務 T001-add-config-validation | ✅ done |
| [T2-gitignore-and-hooks](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T002-gitignore-and-hooks.md) | 任務 T002-gitignore-and-hooks | ✅ done |
| [T3-pyproject-ruff-config](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T003-pyproject-ruff-config.md) | 任務 T003-pyproject-ruff-config | ✅ done |
| [T4-dockerfile-ci](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T004-dockerfile-ci.md) | 任務 T004-dockerfile-ci | ✅ done |
| [T5-structlog-otel](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T005-structlog-otel.md) | 任務 T005-structlog-otel | ✅ done |
| [T6-telegram-bot-webhook](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T006-telegram-bot-webhook.md) | 任務 T006-telegram-bot-webhook | ✅ done |
| [T7-multi-ai-discuss-resilience](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T007-multi-ai-discuss-resilience.md) | 任務 T007-multi-ai-discuss-resilience | ✅ done |
| [T8-agent-registry](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T008-agent-registry.md) | 任務 T008-agent-registry | ✅ done |
| [T9-lancedb-rag](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T009-lancedb-rag.md) | 任務 T009-lancedb-rag | ✅ done |
| [T10-agent-versioning](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T010-agent-versioning.md) | 任務 T010-agent-versioning | 📋 pending |
| [T11-unified-config](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T011-unified-config.md) | 建立統一模型與路徑設定模組 (config.py) | ✅ done |
| [T12-quality-gate-layering](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T012-quality-gate-layering.md) | auto_develop 品質閘門分層（只檢查 diff 檔案） | ✅ done |
| [T13-revert-on-failure](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T013-revert-on-failure.md) | auto_develop 失敗路徑還原工作目錄 | ✅ done |
| [T14-auto-repair-loop](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T014-auto-repair-loop.md) | 測試失敗自動修復迴圈（錯誤回饋給模型） | ✅ done |
| [T15-docs-align-reality](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T015-docs-align-reality.md) | 文件與現況對齊（README/twin/currect_status 修正） | ✅ done |
| [T16-spec-merge-no-fake-data](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T016-spec-merge-no-fake-data.md) | spec_auto_merge 移除假資料對照表 | ✅ done |
| [T17-pyproject-fixes](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T017-pyproject-fixes.md) | pyproject 修正（pyright 路徑、structlog 依賴、tests 目錄） | ✅ done |
| [T18-task-dependencies](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T018-task-dependencies.md) | 任務 frontmatter 增加 depends_on 依賴欄位 | 📋 pending |
| [T19-pr-summary-gate](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T019-pr-summary-gate.md) | auto_develop 完成後輸出 PR 摘要 + 大 diff 人工確認閘門 | 📋 pending |
| [T20-feedback-noop-fix](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T020-feedback-noop-fix.md) | apply_feedback mark_as_done no-op bug 修復 | 📋 pending |
| [T21-mermaid-consensus-fix](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T021-mermaid-consensus-fix.md) | gen_mermaid 真實掃描化 + consensus 中文分詞改善 | 📋 pending |
| [T22-daemon-db-path](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T022-daemon-db-path.md) | setup_daemon 路徑驗證 + extract_feedback DB 路徑可設定 | 📋 pending |
| [T23-blocked-review](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T023-blocked-review.md) | blocked 任務自動產出 review 紀錄與拆分建議 | 📋 pending |
| [T24-twin-python-resolver](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T024-twin-python-resolver.md) | twin CLI 智慧選擇 Python 直譯器（解決無 Key 假象） | ✅ done |
| [T25-ruff-debt-cleanup](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T025-ruff-debt-cleanup.md) | ruff 舊債清理（100 errors → 0） | 📋 pending |
| [T26-project-venv-setup](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T026-project-venv-setup.md) | 建立專案 .venv（Python 3.14 + 全部依賴） | ✅ done |
| [T27-pyright-venv-config](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T027-pyright-venv-config.md) | pyright 指向 .venv，消除 reportMissingImports 誤報 | 📋 pending |
| [T28-discuss-regression-test](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T028-discuss-regression-test.md) | DiscussionOrchestrator 回歸測試（T017 P0 防護） | 📋 pending |
| [T29-embedding-model-integration](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T029-embedding-model-integration.md) | RAG Embedding Model 整合 (LanceDB 向量搜尋) | 📋 pending |
| [T30-lancedb-metadata-filtering](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T030-lancedb-metadata-filtering.md) | LanceDB Metadata Filtering (標籤、專案、作者過濾) | 📋 pending |
| [T31-gitignore-lancedb](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T031-gitignore-lancedb.md) | .gitignore 新增 .lancedb/ 目錄忽略 | 📋 pending |
| [T32-telegram-bot-deployment](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T032-telegram-bot-deployment.md) | Telegram Bot 生產部署文件與啟動腳本 | 📋 pending |
| [T33-spec-auto-merge-state-machine](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T033-spec-auto-merge-state-machine.md) | spec_auto_merge.py 整合 DiscussionOrchestrator 狀態機推進 | 📋 pending |
| [T34-routing-rules-tuning](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T034-routing-rules-tuning.md) | Routing Rules Keywords 微調與其他分身同步引用 Registry | 📋 pending |
| [T35-twin-route-cli-extensions](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T035-twin-route-cli-extensions.md) | twin route CLI 擴充 (--list-agents, --show-rules, --dry-run) | 📋 pending |

**✅ done: 18 | 🔧 in-progress: 0 | ⏭️ skip: 0 | 📋 pending: 17**

> 自動生成於 2026-08-07 16:55
