# 📅 Daily Dashboard - 2026-08-06

> 最後更新: 2026-08-06 23:44 · 自動生成

---

## 🆕 今日新增任務

| 專案 | 任務 | 標題 |
| -- | -- | -- |
| digital-twin | [T029-embedding-model-integration](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T029-embedding-model-integration.md) | RAG Embedding Model 整合 (LanceDB 向量搜尋) |
| digital-twin | [T030-lancedb-metadata-filtering](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T030-lancedb-metadata-filtering.md) | LanceDB Metadata Filtering (標籤、專案、作者過濾) |
| digital-twin | [T031-gitignore-lancedb](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T031-gitignore-lancedb.md) | .gitignore 新增 .lancedb/ 目錄忽略 |
| digital-twin | [T032-telegram-bot-deployment](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T032-telegram-bot-deployment.md) | Telegram Bot 生產部署文件與啟動腳本 |
| digital-twin | [T033-spec-auto-merge-state-machine](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T033-spec-auto-merge-state-machine.md) | spec_auto_merge.py 整合 DiscussionOrchestrator 狀態機推進 |
| digital-twin | [T034-routing-rules-tuning](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T034-routing-rules-tuning.md) | Routing Rules Keywords 微調與其他分身同步引用 Registry |
| digital-twin | [T035-twin-route-cli-extensions](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T035-twin-route-cli-extensions.md) | twin route CLI 擴充 (--list-agents, --show-rules, --dry-run) |

---

## ✅ 今日完成任務

| 專案 | 任務 | 標題 |
| -- | -- | -- |
| digital-twin | [T004-dockerfile-ci](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T004-dockerfile-ci.md) | 新增 Dockerfile + docker-compose.yml + GitHub Actions CI |
| digital-twin | [T005-structlog-otel](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T005-structlog-otel.md) | 新增 common/observability.py 統一結構化日誌與 OpenTelemetry |
| digital-twin | [T006-telegram-bot-webhook](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T006-telegram-bot-webhook.md) | Telegram Bot 重構為 aiogram 3.x Webhook + Redis Queue 非同步架構 |
| digital-twin | [T007-multi-ai-discuss-resilience](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T007-multi-ai-discuss-resilience.md) | multi_ai_discuss.py 重構為 DiscussionOrchestrator 狀態機 + 韌性層 |
| digital-twin | [T008-agent-registry](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T008-agent-registry.md) | 新增 agent_registry.yaml + agent_registry.py 動態路由 |
| digital-twin | [T009-lancedb-rag](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T009-lancedb-rag.md) | index_knowledge.py 引入 LanceDB 替換純 Python 向量搜尋 |
| digital-twin | [T013-revert-on-failure](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T013-revert-on-failure.md) | auto_develop 失敗路徑還原工作目錄 |
| digital-twin | [T014-auto-repair-loop](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T014-auto-repair-loop.md) | 測試失敗自動修復迴圈（錯誤回饋給模型） |
| digital-twin | [T015-docs-align-reality](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T015-docs-align-reality.md) | 文件與現況對齊（README/twin/currect_status 修正） |
| digital-twin | [T017-pyproject-fixes](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T017-pyproject-fixes.md) | pyproject 修正（pyright 路徑、structlog 依賴、tests 目錄） |

---

## 🔥 待處理高優先級

| 專案 | 任務 | 標題 | 優先 |
| -- | -- | -- | -- |
| digital-twin | [T010-agent-versioning](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T010-agent-versioning.md) | Agent System Prompt 強制 SemVer Front-matter + Canary Deploy + Rollback | high |
| digital-twin | [T016-spec-merge-no-fake-data](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T016-spec-merge-no-fake-data.md) | spec_auto_merge 移除假資料對照表 | high |
| digital-twin | [T027-pyright-venv-config](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T027-pyright-venv-config.md) | pyright 指向 .venv，消除 reportMissingImports 誤報 | high |
| tw-quant-daybrain | [T001-scaffold](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T001-scaffold.md) | 專案初始化與設定骨架 | high |
| tw-quant-daybrain | [T002-mcp-client](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T002-mcp-client.md) | MCP Client 連線層 | high |
| tw-quant-daybrain | [T003-freshness-gate](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T003-freshness-gate.md) | 資料新鮮度守門（Freshness Gate） | high |
| tw-quant-daybrain | [T004-event-logging](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T004-event-logging.md) | 事件日誌與回放讀取器 | high |
| tw-quant-daybrain | [T005-calendar-scheduler](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T005-calendar-scheduler.md) | 交易日曆與生命週期排程器 | high |
| tw-quant-daybrain | [T006-pre-market](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T006-pre-market.md) | 盤前流程（Phase 0 + Phase 1 選股） | high |
| tw-quant-daybrain | [T007-scoring](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T007-scoring.md) | 訊號模型 v2.0（Config-Driven 評分） | high |
| tw-quant-daybrain | [T008-risk-manager](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T008-risk-manager.md) | 風控系統與持倉狀態機 | high |
| tw-quant-daybrain | [T009-intraday-loop](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T009-intraday-loop.md) | 盤中監控循環（Phase 2 + Phase 3） | high |
| tw-quant-daybrain | [T013-testing](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T013-testing.md) | 測試策略與模擬盤（Mock MCP Server） | high |
| tw-quant-daybrain | [T016-bias-decision-tree](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T016-bias-decision-tree.md) | 盤前多空傾向鎖定（Bias Decision Tree） | high |
| tw-quant-daybrain | [T017-vwap-surge-long](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T017-vwap-surge-long.md) | 做多策略引擎（VWAP_SURGE_LONG） | high |
| tw-quant-daybrain | [T018-bull-trap-vwap-short](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T018-bull-trap-vwap-short.md) | 空方策略引擎（BULL_TRAP_VWAP_SHORT） | high |
| tw-quant-daybrain | [T019-briefing-generator](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T019-briefing-generator.md) | Tactical Briefing 產生器（盤前戰術報告） | high |
| tw-quant-daybrain | [T020-priority-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T020-priority-engine.md) | Priority Ranking Engine（優先權排序與資金分配） | high |
| tw-quant-daybrain | [T021-csv-data-loader](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T021-csv-data-loader.md) | 回測資料載入器（CsvDataLoader） | high |
| tw-quant-daybrain | [T022-backtest-simulator](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T022-backtest-simulator.md) | 事件驅動回測模擬器（DayBrainBacktestSimulator） | high |
| tw-quant-signal | [T020-data-provider-abstraction](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-signal/tasks/T020-data-provider-abstraction.md) | [Phase 4] DataProvider 抽象層設計 — 定義資料擷取統一介面 | high |
| tw-quant-signal | [T021-twse-mcp-migration](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-signal/tasks/T021-twse-mcp-migration.md) | [Phase 4] TWSE 盤後資料層遷移至 tw-quant-mcp | high |
| tw-quant-signal | [T022-mops-mcp-migration](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-signal/tasks/T022-mops-mcp-migration.md) | [Phase 4] MOPS/基本面資料層遷移至 tw-quant-mcp | high |
| tw-quant-signal | [T023-mcp-validation-fallback](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-signal/tasks/T023-mcp-validation-fallback.md) | [Phase 4] Pipeline 驗證 + mcp fallback — 確認端到端正確性 | high |

---

## 🔄 進行中

| 專案 | 任務 | 標題 | 優先 |
| -- | -- | -- | -- |
| gold-analysis-advanced | [T001](https://github.com/gentoobreaking/ai-tasks/blob/main/gold-analysis-advanced/tasks/T001.md) | 機器學習模型開發 | low |

---

## 📋 所有待處理任務

| 專案 | 任務 | 標題 | 優先 |
| -- | -- | -- | -- |
| digital-twin | [T010-agent-versioning](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T010-agent-versioning.md) | Agent System Prompt 強制 SemVer Front-matter + Canary Deploy + Rollback | high |
| digital-twin | [T016-spec-merge-no-fake-data](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T016-spec-merge-no-fake-data.md) | spec_auto_merge 移除假資料對照表 | high |
| digital-twin | [T027-pyright-venv-config](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T027-pyright-venv-config.md) | pyright 指向 .venv，消除 reportMissingImports 誤報 | high |
| tw-quant-daybrain | [T001-scaffold](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T001-scaffold.md) | 專案初始化與設定骨架 | high |
| tw-quant-daybrain | [T002-mcp-client](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T002-mcp-client.md) | MCP Client 連線層 | high |
| tw-quant-daybrain | [T003-freshness-gate](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T003-freshness-gate.md) | 資料新鮮度守門（Freshness Gate） | high |
| tw-quant-daybrain | [T004-event-logging](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T004-event-logging.md) | 事件日誌與回放讀取器 | high |
| tw-quant-daybrain | [T005-calendar-scheduler](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T005-calendar-scheduler.md) | 交易日曆與生命週期排程器 | high |
| tw-quant-daybrain | [T006-pre-market](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T006-pre-market.md) | 盤前流程（Phase 0 + Phase 1 選股） | high |
| tw-quant-daybrain | [T007-scoring](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T007-scoring.md) | 訊號模型 v2.0（Config-Driven 評分） | high |
| tw-quant-daybrain | [T008-risk-manager](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T008-risk-manager.md) | 風控系統與持倉狀態機 | high |
| tw-quant-daybrain | [T009-intraday-loop](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T009-intraday-loop.md) | 盤中監控循環（Phase 2 + Phase 3） | high |
| tw-quant-daybrain | [T013-testing](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T013-testing.md) | 測試策略與模擬盤（Mock MCP Server） | high |
| tw-quant-daybrain | [T016-bias-decision-tree](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T016-bias-decision-tree.md) | 盤前多空傾向鎖定（Bias Decision Tree） | high |
| tw-quant-daybrain | [T017-vwap-surge-long](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T017-vwap-surge-long.md) | 做多策略引擎（VWAP_SURGE_LONG） | high |
| tw-quant-daybrain | [T018-bull-trap-vwap-short](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T018-bull-trap-vwap-short.md) | 空方策略引擎（BULL_TRAP_VWAP_SHORT） | high |
| tw-quant-daybrain | [T019-briefing-generator](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T019-briefing-generator.md) | Tactical Briefing 產生器（盤前戰術報告） | high |
| tw-quant-daybrain | [T020-priority-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T020-priority-engine.md) | Priority Ranking Engine（優先權排序與資金分配） | high |
| tw-quant-daybrain | [T021-csv-data-loader](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T021-csv-data-loader.md) | 回測資料載入器（CsvDataLoader） | high |
| tw-quant-daybrain | [T022-backtest-simulator](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T022-backtest-simulator.md) | 事件驅動回測模擬器（DayBrainBacktestSimulator） | high |
| tw-quant-signal | [T020-data-provider-abstraction](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-signal/tasks/T020-data-provider-abstraction.md) | [Phase 4] DataProvider 抽象層設計 — 定義資料擷取統一介面 | high |
| tw-quant-signal | [T021-twse-mcp-migration](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-signal/tasks/T021-twse-mcp-migration.md) | [Phase 4] TWSE 盤後資料層遷移至 tw-quant-mcp | high |
| tw-quant-signal | [T022-mops-mcp-migration](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-signal/tasks/T022-mops-mcp-migration.md) | [Phase 4] MOPS/基本面資料層遷移至 tw-quant-mcp | high |
| tw-quant-signal | [T023-mcp-validation-fallback](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-signal/tasks/T023-mcp-validation-fallback.md) | [Phase 4] Pipeline 驗證 + mcp fallback — 確認端到端正確性 | high |
| digital-twin | [T018-task-dependencies](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T018-task-dependencies.md) | 任務 frontmatter 增加 depends_on 依賴欄位 | medium |
| digital-twin | [T019-pr-summary-gate](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T019-pr-summary-gate.md) | auto_develop 完成後輸出 PR 摘要 + 大 diff 人工確認閘門 | medium |
| digital-twin | [T020-feedback-noop-fix](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T020-feedback-noop-fix.md) | apply_feedback mark_as_done no-op bug 修復 | medium |
| digital-twin | [T023-blocked-review](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T023-blocked-review.md) | blocked 任務自動產出 review 紀錄與拆分建議 | medium |
| digital-twin | [T025-ruff-debt-cleanup](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T025-ruff-debt-cleanup.md) | ruff 舊債清理（100 errors → 0） | medium |
| digital-twin | [T028-discuss-regression-test](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T028-discuss-regression-test.md) | DiscussionOrchestrator 回歸測試（T017 P0 防護） | medium |
| digital-twin | [T029-embedding-model-integration](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T029-embedding-model-integration.md) | RAG Embedding Model 整合 (LanceDB 向量搜尋) | medium |
| digital-twin | [T030-lancedb-metadata-filtering](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T030-lancedb-metadata-filtering.md) | LanceDB Metadata Filtering (標籤、專案、作者過濾) | medium |
| digital-twin | [T033-spec-auto-merge-state-machine](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T033-spec-auto-merge-state-machine.md) | spec_auto_merge.py 整合 DiscussionOrchestrator 狀態機推進 | medium |
| digital-twin | [T034-routing-rules-tuning](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T034-routing-rules-tuning.md) | Routing Rules Keywords 微調與其他分身同步引用 Registry | medium |
| tw-quant-daybrain | [T010-journal-metrics](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T010-journal-metrics.md) | 交易日誌與績效指標（Phase 4） | medium |
| tw-quant-daybrain | [T011-llm-report](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T011-llm-report.md) | LLM 檢討報告與防幻覺規範 | medium |
| tw-quant-daybrain | [T012-replay](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T012-replay.md) | 回放工具與滑價驗證 | medium |
| tw-quant-daybrain | [T014-ops](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T014-ops.md) | 部署、失敗處理與紙上交單 | medium |
| tw-quant-daybrain | [T015-release](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T015-release.md) | 壓測、參數實驗與 v2.0 發布 | medium |
| tw-quant-daybrain | [T023-grid-search](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T023-grid-search.md) | 參數網格搜尋（Grid Search） | medium |
| tw-quant-daybrain | [T024-wfo-optimizer](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T024-wfo-optimizer.md) | Walk-Forward Optimization（WFO 滾動驗證） | medium |
| tw-quant-selector | [T134-alerting-module-split-refactor](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-selector/tasks/T134-alerting-module-split-refactor.md) | 拆分大型檔案 alerting.py（模組化重構） | medium |
| tw-quant-selector | [T135-complete-missing-tests](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-selector/tasks/T135-complete-missing-tests.md) | 補齊未完成的測試項目（T123/T124/T130-T133） | medium |
| tw-quant-signal | [T018-stock-pool-expansion](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-signal/tasks/T018-stock-pool-expansion.md) | [Phase 3] 標的池擴充與管線效率優化 | medium |
| tw-quant-signal | [T019-performance-tracking-dashboard](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-signal/tasks/T019-performance-tracking-dashboard.md) | [Phase 3] 績效追蹤儀表板補完 — 訊號後 1/3/5 日表現 | medium |
| digital-twin | [T021-mermaid-consensus-fix](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T021-mermaid-consensus-fix.md) | gen_mermaid 真實掃描化 + consensus 中文分詞改善 | low |
| digital-twin | [T022-daemon-db-path](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T022-daemon-db-path.md) | setup_daemon 路徑驗證 + extract_feedback DB 路徑可設定 | low |
| digital-twin | [T031-gitignore-lancedb](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T031-gitignore-lancedb.md) | .gitignore 新增 .lancedb/ 目錄忽略 | low |
| digital-twin | [T032-telegram-bot-deployment](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T032-telegram-bot-deployment.md) | Telegram Bot 生產部署文件與啟動腳本 | low |
| digital-twin | [T035-twin-route-cli-extensions](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T035-twin-route-cli-extensions.md) | twin route CLI 擴充 (--list-agents, --show-rules, --dry-run) | low |
| gold-analysis-advanced | [T002](https://github.com/gentoobreaking/ai-tasks/blob/main/gold-analysis-advanced/tasks/T002.md) | ML 模型整合與優化 | low |
| gold-analysis-advanced | [T004](https://github.com/gentoobreaking/ai-tasks/blob/main/gold-analysis-advanced/tasks/T004.md) | 實盤交易對接 | low |
| md-viewer-app | [T027-預覽連結懸停](https://github.com/gentoobreaking/ai-tasks/blob/main/md-viewer-app/tasks/T027-預覽連結懸停.md) | [T027] 連結懸停預覽 | low |
| tw-quant-signal | [T010-stock-pool-signals](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-signal/tasks/T010-stock-pool-signals.md) | [Phase 3] 個股池訊號 — 精選觀察清單掃描 | low |

---

## 🔗 快速連結

- [完整專案視圖 → PROJECTS.md](https://github.com/gentoobreaking/ai-tasks/blob/main/PROJECTS.md)
- [每日儀表板 → DAILY.md](https://github.com/gentoobreaking/ai-tasks/blob/main/DAILY.md)
- [Tasks 根目錄](https://github.com/gentoobreaking/ai-tasks/tree/main)
- 腳本: `scripts/update_projects.py` · `scripts/update_daily.py`

---
_自動生成，請勿手動編輯_
