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
| 任務 T010-agent-versioning |
| 統一模型與路徑設定模組 (config.py) |
| auto_develop 品質閘門分層（只檢查 diff 檔案） |
| auto_develop 失敗路徑還原工作目錄 |
| 測試失敗自動修復迴圈（錯誤回饋給模型） |
| 文件與現況對齊（README/twin/currect_status 修正） |
| spec_auto_merge 移除假資料對照表 |
| pyproject 修正（pyright 路徑、structlog 依賴、tests 目錄） |
| 任務 frontmatter 增加 depends_on 依賴欄位 |
| auto_develop 完成後輸出 PR 摘要 + 大 diff 人工確認閘門 |
| apply_feedback mark_as_done no-op bug 修復 |
| gen_mermaid 真實掃描化 + consensus 中文分詞改善 |
| setup_daemon 路徑驗證 + extract_feedback DB 路徑可設定 |
| blocked 任務自動產出 review 紀錄與拆分建議 |
| twin CLI 智慧選擇 Python 直譯器（解決無 Key 假象） |
| ruff 舊債清理（100 errors → 0） |
| 專案 .venv（Python 3.14 + 全部依賴） |
| pyright 指向 .venv，消除 reportMissingImports 誤報 |
| DiscussionOrchestrator 回歸測試（T017 P0 防護） |
| RAG Embedding Model 整合 (LanceDB 向量搜尋) |
| LanceDB Metadata Filtering (標籤、專案、作者過濾) |
| .gitignore 新增 .lancedb/ 目錄忽略 |
| Telegram Bot 生產部署文件與啟動腳本 |
| spec_auto_merge.py 整合 DiscussionOrchestrator 狀態機推進 |
| Routing Rules Keywords 微調與其他分身同步引用 Registry |
| twin route CLI 擴充 (--list-agents, --show-rules, --dry-run) |
| common/tasks.py 任務存取層（消除 auto_develop 與 agent_registry 重複解析） |
| twin doctor 全端自檢命令 |
| tasks repo 產物清潔（.gitignore 與 routing.json 清理） |
| 模型備援鏈 YAML 配置（impl_providers.yaml）＋順位重排（opencode CLI 第一） |
| MODELS 模型清單改由 YAML 配置（.opencode/models.yaml） |
| --model/Scheduler 預設不再硬編，整條鏈由 impl_providers.yaml 決定 |
| PROJECT_PATHS 動態化：依 ~/tasks 未完成任務動態篩選專案＋.projects_ignore 排除 |
| 任務檔 frontmatter 解析全面收斂至 TaskStore（消除 agent_versioning/doctor/incremental_index 平行實作） |
| TaskStore 重寫積木統一（update_fields/force）——retry/supersede/blocked_review/_record_failure 遷移 |
| 完成流程單軌化＋一致性檢查（/complete-task 同步 README；doctor 增 spec↔任務↔README validator） |
| git 操作收斂 common/git.py——auto_develop 五處 subprocess 改用單一模組 |
| auto_develop 拆分模組（scheduler/providers/diff）——消除 1925 行單一檔案 |
| auto_develop 接入 common/observability（structlog）——107 個 print 收斂 |
| twin auto --list 自動從 $PWD 判斷當前專案 |
| twin auto --list 顯示專案皆完成訊息 |
| 測試與驗證 T060/T061 |

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
| [T53-remove-config-validate](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T053-remove-config-validate.md) | 移除/重寫 config/validate.py 死碼（Pydantic 層無人引用、key 必填與離線測衝突、模型名過時） | |
| [T54-config-env-constants](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T054-config-env-constants.md) | URL/環境變數常數收斂至 config（embedding/telegram/REDIS──消除硬編碼與重複） | |
| [T55-twin-cli-help](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T055-twin-cli-help.md) | twin CLI 子命令 --help 可達（argparse 化或 --help 直通檢核） | |
| [T56-telegram-notify-events](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T056-telegram-notify-events.md) | Telegram 自動推播（auto 完成 / blocked / doctor 異常） | |
| [T57-breaker-timewindow-fix](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T057-breaker-timewindow-fix.md) | worker AIBreaker 熔斷時間窗語意修正（或改用 pybreaker 官方 async 語意） | |
| [T58-dotenv-single-load](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T058-dotenv-single-load.md) | dotenv 選用載入收斂（9 處重複 → config 單次） | |
| [T59-test-gap-fill](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T059-test-gap-fill.md) | 測試涵蓋缺口補齊（common/tasks、multi_ai_discuss、task_advisor、index_knowledge、auto_guardrail） | |

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
| [T10-agent-versioning](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T010-agent-versioning.md) | 任務 T010-agent-versioning | ✅ done |
| [T11-unified-config](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T011-unified-config.md) | 建立統一模型與路徑設定模組 (config.py) | ✅ done |
| [T12-quality-gate-layering](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T012-quality-gate-layering.md) | auto_develop 品質閘門分層（只檢查 diff 檔案） | ✅ done |
| [T13-revert-on-failure](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T013-revert-on-failure.md) | auto_develop 失敗路徑還原工作目錄 | ✅ done |
| [T14-auto-repair-loop](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T014-auto-repair-loop.md) | 測試失敗自動修復迴圈（錯誤回饋給模型） | ✅ done |
| [T15-docs-align-reality](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T015-docs-align-reality.md) | 文件與現況對齊（README/twin/currect_status 修正） | ✅ done |
| [T16-spec-merge-no-fake-data](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T016-spec-merge-no-fake-data.md) | spec_auto_merge 移除假資料對照表 | ✅ done |
| [T17-pyproject-fixes](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T017-pyproject-fixes.md) | pyproject 修正（pyright 路徑、structlog 依賴、tests 目錄） | ✅ done |
| [T18-task-dependencies](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T018-task-dependencies.md) | 任務 frontmatter 增加 depends_on 依賴欄位 | ✅ done |
| [T19-pr-summary-gate](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T019-pr-summary-gate.md) | auto_develop 完成後輸出 PR 摘要 + 大 diff 人工確認閘門 | ✅ done |
| [T20-feedback-noop-fix](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T020-feedback-noop-fix.md) | apply_feedback mark_as_done no-op bug 修復 | ✅ done |
| [T21-mermaid-consensus-fix](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T021-mermaid-consensus-fix.md) | gen_mermaid 真實掃描化 + consensus 中文分詞改善 | ✅ done |
| [T22-daemon-db-path](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T022-daemon-db-path.md) | setup_daemon 路徑驗證 + extract_feedback DB 路徑可設定 | ✅ done |
| [T23-blocked-review](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T023-blocked-review.md) | blocked 任務自動產出 review 紀錄與拆分建議 | ✅ done |
| [T24-twin-python-resolver](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T024-twin-python-resolver.md) | twin CLI 智慧選擇 Python 直譯器（解決無 Key 假象） | ✅ done |
| [T25-ruff-debt-cleanup](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T025-ruff-debt-cleanup.md) | ruff 舊債清理（100 errors → 0） | ✅ done |
| [T26-project-venv-setup](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T026-project-venv-setup.md) | 建立專案 .venv（Python 3.14 + 全部依賴） | ✅ done |
| [T27-pyright-venv-config](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T027-pyright-venv-config.md) | pyright 指向 .venv，消除 reportMissingImports 誤報 | ✅ done |
| [T28-discuss-regression-test](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T028-discuss-regression-test.md) | DiscussionOrchestrator 回歸測試（T017 P0 防護） | ✅ done |
| [T29-embedding-model-integration](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T029-embedding-model-integration.md) | RAG Embedding Model 整合 (LanceDB 向量搜尋) | ✅ done |
| [T30-lancedb-metadata-filtering](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T030-lancedb-metadata-filtering.md) | LanceDB Metadata Filtering (標籤、專案、作者過濾) | ✅ done |
| [T31-gitignore-lancedb](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T031-gitignore-lancedb.md) | .gitignore 新增 .lancedb/ 目錄忽略 | ✅ done |
| [T32-telegram-bot-deployment](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T032-telegram-bot-deployment.md) | Telegram Bot 生產部署文件與啟動腳本 | ✅ done |
| [T33-spec-auto-merge-state-machine](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T033-spec-auto-merge-state-machine.md) | spec_auto_merge.py 整合 DiscussionOrchestrator 狀態機推進 | ✅ done |
| [T34-routing-rules-tuning](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T034-routing-rules-tuning.md) | Routing Rules Keywords 微調與其他分身同步引用 Registry | ✅ done |
| [T35-twin-route-cli-extensions](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T035-twin-route-cli-extensions.md) | twin route CLI 擴充 (--list-agents, --show-rules, --dry-run) | ✅ done |
| [T36-taskstore-unify](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T036-taskstore-unify.md) | common/tasks.py 任務存取層（消除 auto_develop 與 agent_registry 重複解析） | ✅ done |
| [T37-twin-doctor](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T037-twin-doctor.md) | twin doctor 全端自檢命令 | ✅ done |
| [T38-tasks-gitignore-artifacts](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T038-tasks-gitignore-artifacts.md) | tasks repo 產物清潔（.gitignore 與 routing.json 清理） | ✅ done |
| [T39-impl-providers-yaml](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T039-impl-providers-yaml.md) | 模型備援鏈 YAML 配置（impl_providers.yaml）＋順位重排（opencode CLI 第一） | ✅ done |
| [T40-models-yaml](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T040-models-yaml.md) | MODELS 模型清單改由 YAML 配置（.opencode/models.yaml） | ✅ done |
| [T41-openrouter-default-model](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T041-openrouter-default-model.md) | --model/Scheduler 預設不再硬編，整條鏈由 impl_providers.yaml 決定 | ✅ done |
| [T46-dynamic-project-paths](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T046-dynamic-project-paths.md) | PROJECT_PATHS 動態化：依 ~/tasks 未完成任務動態篩選專案＋.projects_ignore 排除 | ✅ done |
| [T47-taskstore-frontmatter-converge](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T047-taskstore-frontmatter-converge.md) | 任務檔 frontmatter 解析全面收斂至 TaskStore（消除 agent_versioning/doctor/incremental_index 平行實作） | ✅ done |
| [T48-taskstore-update-fields](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T048-taskstore-update-fields.md) | TaskStore 重寫積木統一（update_fields/force）——retry/supersede/blocked_review/_record_failure 遷移 | ✅ done |
| [T49-complete-flow-consistency](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T049-complete-flow-consistency.md) | 完成流程單軌化＋一致性檢查（/complete-task 同步 README；doctor 增 spec↔任務↔README validator） | ✅ done |
| [T50-git-module-converge](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T050-git-module-converge.md) | git 操作收斂 common/git.py——auto_develop 五處 subprocess 改用單一模組 | ✅ done |
| [T51-auto-develop-split](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T051-auto-develop-split.md) | auto_develop 拆分模組（scheduler/providers/diff）——消除 1925 行單一檔案 | ✅ done |
| [T52-auto-develop-observability](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T052-auto-develop-observability.md) | auto_develop 接入 common/observability（structlog）——107 個 print 收斂 | ✅ done |
| [T53-remove-config-validate](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T053-remove-config-validate.md) | 移除/重寫 config/validate.py 死碼（Pydantic 層無人引用、key 必填與離線測衝突、模型名過時） | 📋 pending |
| [T54-config-env-constants](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T054-config-env-constants.md) | URL/環境變數常數收斂至 config（embedding/telegram/REDIS──消除硬編碼與重複） | 📋 pending |
| [T55-twin-cli-help](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T055-twin-cli-help.md) | twin CLI 子命令 --help 可達（argparse 化或 --help 直通檢核） | 📋 pending |
| [T56-telegram-notify-events](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T056-telegram-notify-events.md) | Telegram 自動推播（auto 完成 / blocked / doctor 異常） | 📋 pending |
| [T57-breaker-timewindow-fix](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T057-breaker-timewindow-fix.md) | worker AIBreaker 熔斷時間窗語意修正（或改用 pybreaker 官方 async 語意） | 📋 pending |
| [T58-dotenv-single-load](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T058-dotenv-single-load.md) | dotenv 選用載入收斂（9 處重複 → config 單次） | 📋 pending |
| [T59-test-gap-fill](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T059-test-gap-fill.md) | 測試涵蓋缺口補齊（common/tasks、multi_ai_discuss、task_advisor、index_knowledge、auto_guardrail） | 📋 pending |
| [T60-auto-detect-project-from-pwd](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T060-auto-detect-project-from-pwd.md) | twin auto --list 自動從 $PWD 判斷當前專案 | ✅ done |
| [T61-all-done-friendly-message](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T061-all-done-friendly-message.md) | twin auto --list 顯示專案皆完成訊息 | ✅ done |
| [T62-test-verify-t060-t061](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T062-test-verify-t060-t061.md) | 測試與驗證 T060/T061 | ✅ done |

**✅ done: 51 | 🔧 in-progress: 0 | ⏭️ skip: 0 | 📋 pending: 7**

> 自動生成於 2026-08-11 03:21
