# 📅 Daily Dashboard - 2026-08-12

> 最後更新: 2026-08-12 03:29 · 自動生成

---

## 🆕 今日新增任務

| 專案 | 任務 | 標題 |
| -- | -- | -- |
| digital-twin | [T065-providers-prompt-hardcoded-fix](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T065-providers-prompt-hardcoded-fix.md) | providers build_implementation_prompt 改用實際任務參數（移除硬編碼） |
| digital-twin | [T066-diff-path-containment](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T066-diff-path-containment.md) | diff _normalize_path 加入路徑穿越 containment 檢查（防議外寫入） |
| digital-twin | [T067-dockerfile-tenacity-fix](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T067-dockerfile-tenacity-fix.md) | Dockerfile 依賴補 tenacity（container import discussion_orchestrator 崩潰） |
| digital-twin | [T068-process-task-exception-guard](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T068-process-task-exception-guard.md) | scheduler process_task 加入頂層例外防護（失敗記入 _record_failure 並繼續） |
| digital-twin | [T069-embedding-fallback-contract](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T069-embedding-fallback-contract.md) | embedding 降級契約修復（openai provider 缺 key 不再 raise） |
| digital-twin | [T070-webhook-secret-token-auth](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T070-webhook-secret-token-auth.md) | telegram webhook 加入 X-Telegram-Bot-Api-Secret-Token 驗證（防偽造更新） |
| digital-twin | [T071-breaker-wrapper-converge](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T071-breaker-wrapper-converge.md) | circuit breaker 兩套 wrapper 收斂（worker AIBreaker / resilience BreakerGuard） |
| digital-twin | [T072-knowledge-indexer-converge](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T072-knowledge-indexer-converge.md) | knowledge indexer 重複實作收斂（index_knowledge / incremental_index） |
| digital-twin | [T073-consensus-eval-reverse-dep](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T073-consensus-eval-reverse-dep.md) | consensus_eval 反向依賴修正（直連 discussion_orchestrator） |
| digital-twin | [T074-prometheus-registry-unify](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T074-prometheus-registry-unify.md) | Prometheus registry 統一（/metrics 缺 OTEL metrics） |
| digital-twin | [T075-worker-rag-to-thread](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T075-worker-rag-to-thread.md) | worker RAG 同步搜尋改 asyncio.to_thread（避免阻塞 event loop） |
| digital-twin | [T076-scheduler-lock-and-revert-safety](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T076-scheduler-lock-and-revert-safety.md) | scheduler 併跑鎖定與 git_revert_all 資料破壞防護 |
| digital-twin | [T077-pybreaker-pin-and-test-hardening](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T077-pybreaker-pin-and-test-hardening.md) | pybreaker 版本上限收緊 + 測試移除私有 API 操作 |
| digital-twin | [T078-tautological-tests-fix](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T078-tautological-tests-fix.md) | 收緊寬鬆/謬誤斷言測試（test_telegram_bot 等） |
| digital-twin | [T079-env-example-completeness](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T079-env-example-completeness.md) | .env.example 補齊未文件化環境變數 |
| digital-twin | [T080-unused-deps-cleanup](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T080-unused-deps-cleanup.md) | 移除未使用依賴（loguru/pydantic/langchain 等）並統一安裝來源 |
| digital-twin | [T081-hooks-deadcode-restage](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T081-hooks-deadcode-restage.md) | install_hooks 死碼清理與 pre-commit ruff --fix 後 restage |
| tw-quant-daybrain | [T025-cli-readable-output](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T025-cli-readable-output.md) | CLI 輸出人話化——模擬盤/回測輸出可讀性改造 |
| tw-quant-daybrain | [T026-deploy-stability](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T026-deploy-stability.md) | 部署穩定性——優雅關閉 + 交易日曆預載 |
| tw-quant-daybrain | [T027-readme-refactor](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T027-readme-refactor.md) | README 重構——CLI 優先 + 功能總覽 + 流程圖 + 應用情境 |
| tw-quant-daybrain | [T028-module-docs-license](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T028-module-docs-license.md) | 模組說明文件（盤前/簡報/評分/Priority Ranking）+ Apache-2.0 License 宣告 |

---

## ✅ 今日完成任務

| 專案 | 任務 | 標題 |
| -- | -- | -- |
| digital-twin | [T053-remove-config-validate](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T053-remove-config-validate.md) | 移除/重寫 config/validate.py 死碼（Pydantic 層無人引用、key 必填與離線測衝突、模型名過時） |
| digital-twin | [T054-config-env-constants](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T054-config-env-constants.md) | URL/環境變數常數收斂至 config（embedding/telegram/REDIS──消除硬編碼與重複） |
| digital-twin | [T055-twin-cli-help](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T055-twin-cli-help.md) | twin CLI 子命令 --help 可達（argparse 化或 --help 直通檢核） |
| digital-twin | [T056-telegram-notify-events](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T056-telegram-notify-events.md) | Telegram 自動推播（auto 完成 / blocked / doctor 異常） |
| digital-twin | [T057-breaker-timewindow-fix](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T057-breaker-timewindow-fix.md) | worker AIBreaker 熔斷時間窗語意修正（或改用 pybreaker 官方 async 語意） |
| digital-twin | [T058-dotenv-single-load](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T058-dotenv-single-load.md) | dotenv 選用載入收斂（9 處重複 → config 單次） |
| digital-twin | [T059-test-gap-fill](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T059-test-gap-fill.md) | 測試涵蓋缺口補齊（common/tasks、multi_ai_discuss、task_advisor、index_knowledge、auto_guardrail） |
| digital-twin | [T065-providers-prompt-hardcoded-fix](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T065-providers-prompt-hardcoded-fix.md) | providers build_implementation_prompt 改用實際任務參數（移除硬編碼） |
| digital-twin | [T066-diff-path-containment](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T066-diff-path-containment.md) | diff _normalize_path 加入路徑穿越 containment 檢查（防議外寫入） |
| digital-twin | [T067-dockerfile-tenacity-fix](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T067-dockerfile-tenacity-fix.md) | Dockerfile 依賴補 tenacity（container import discussion_orchestrator 崩潰） |
| digital-twin | [T068-process-task-exception-guard](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T068-process-task-exception-guard.md) | scheduler process_task 加入頂層例外防護（失敗記入 _record_failure 並繼續） |
| digital-twin | [T069-embedding-fallback-contract](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T069-embedding-fallback-contract.md) | embedding 降級契約修復（openai provider 缺 key 不再 raise） |
| tw-quant-daybrain | [T025-cli-readable-output](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T025-cli-readable-output.md) | CLI 輸出人話化——模擬盤/回測輸出可讀性改造 |
| tw-quant-daybrain | [T026-deploy-stability](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T026-deploy-stability.md) | 部署穩定性——優雅關閉 + 交易日曆預載 |
| tw-quant-daybrain | [T027-readme-refactor](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T027-readme-refactor.md) | README 重構——CLI 優先 + 功能總覽 + 流程圖 + 應用情境 |
| tw-quant-daybrain | [T028-module-docs-license](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T028-module-docs-license.md) | 模組說明文件（盤前/簡報/評分/Priority Ranking）+ Apache-2.0 License 宣告 |
| tw-quant-signal | [T020-data-provider-abstraction](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-signal/tasks/T020-data-provider-abstraction.md) | [Phase 4] DataProvider 抽象層設計 — 定義資料擷取統一介面 |

---

## 🔥 待處理高優先級

| 專案 | 任務 | 標題 | 優先 |
| -- | -- | -- | -- |
| digital-twin | [T070-webhook-secret-token-auth](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T070-webhook-secret-token-auth.md) | telegram webhook 加入 X-Telegram-Bot-Api-Secret-Token 驗證（防偽造更新） | high |
| tw-quant-signal | [T021-twse-mcp-migration](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-signal/tasks/T021-twse-mcp-migration.md) | [Phase 4] TWSE 盤後資料層遷移至 tw-quant-mcp | high |
| tw-quant-signal | [T022-mops-mcp-migration](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-signal/tasks/T022-mops-mcp-migration.md) | [Phase 4] MOPS/基本面資料層遷移至 tw-quant-mcp | high |
| tw-quant-signal | [T023-mcp-validation-fallback](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-signal/tasks/T023-mcp-validation-fallback.md) | [Phase 4] Pipeline 驗證 + mcp fallback — 確認端到端正確性 | high |

---

## 🔄 進行中

| 專案 | 任務 | 標題 | 優先 |
| -- | -- | -- | -- |
| gold-analysis-advanced | [T001](https://github.com/gentoobreaking/ai-tasks/blob/main/gold-analysis-advanced/tasks/T001.md) | 機器學習模型開發 | low |
| tw-quant-selector | [T080-color-utility-integration](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-selector/tasks/T080-color-utility-integration.md) | color.ts 工具函式導入頁面取代手寫顏色邏輯 | low |

---

## 📋 所有待處理任務

| 專案 | 任務 | 標題 | 優先 |
| -- | -- | -- | -- |
| digital-twin | [T070-webhook-secret-token-auth](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T070-webhook-secret-token-auth.md) | telegram webhook 加入 X-Telegram-Bot-Api-Secret-Token 驗證（防偽造更新） | high |
| tw-quant-signal | [T021-twse-mcp-migration](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-signal/tasks/T021-twse-mcp-migration.md) | [Phase 4] TWSE 盤後資料層遷移至 tw-quant-mcp | high |
| tw-quant-signal | [T022-mops-mcp-migration](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-signal/tasks/T022-mops-mcp-migration.md) | [Phase 4] MOPS/基本面資料層遷移至 tw-quant-mcp | high |
| tw-quant-signal | [T023-mcp-validation-fallback](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-signal/tasks/T023-mcp-validation-fallback.md) | [Phase 4] Pipeline 驗證 + mcp fallback — 確認端到端正確性 | high |
| digital-twin | [T071-breaker-wrapper-converge](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T071-breaker-wrapper-converge.md) | circuit breaker 兩套 wrapper 收斂（worker AIBreaker / resilience BreakerGuard） | medium |
| digital-twin | [T072-knowledge-indexer-converge](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T072-knowledge-indexer-converge.md) | knowledge indexer 重複實作收斂（index_knowledge / incremental_index） | medium |
| digital-twin | [T073-consensus-eval-reverse-dep](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T073-consensus-eval-reverse-dep.md) | consensus_eval 反向依賴修正（直連 discussion_orchestrator） | medium |
| digital-twin | [T074-prometheus-registry-unify](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T074-prometheus-registry-unify.md) | Prometheus registry 統一（/metrics 缺 OTEL metrics） | medium |
| digital-twin | [T075-worker-rag-to-thread](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T075-worker-rag-to-thread.md) | worker RAG 同步搜尋改 asyncio.to_thread（避免阻塞 event loop） | medium |
| digital-twin | [T076-scheduler-lock-and-revert-safety](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T076-scheduler-lock-and-revert-safety.md) | scheduler 併跑鎖定與 git_revert_all 資料破壞防護 | medium |
| digital-twin | [T077-pybreaker-pin-and-test-hardening](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T077-pybreaker-pin-and-test-hardening.md) | pybreaker 版本上限收緊 + 測試移除私有 API 操作 | medium |
| digital-twin | [T078-tautological-tests-fix](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T078-tautological-tests-fix.md) | 收緊寬鬆/謬誤斷言測試（test_telegram_bot 等） | medium |
| tw-quant-selector | [T134-alerting-module-split-refactor](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-selector/tasks/T134-alerting-module-split-refactor.md) | 拆分大型檔案 alerting.py（模組化重構） | medium |
| tw-quant-selector | [T135-complete-missing-tests](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-selector/tasks/T135-complete-missing-tests.md) | 補齊未完成的測試項目（T123/T124/T130-T133） | medium |
| tw-quant-signal | [T018-stock-pool-expansion](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-signal/tasks/T018-stock-pool-expansion.md) | [Phase 3] 標的池擴充與管線效率優化 | medium |
| tw-quant-signal | [T019-performance-tracking-dashboard](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-signal/tasks/T019-performance-tracking-dashboard.md) | [Phase 3] 績效追蹤儀表板補完 — 訊號後 1/3/5 日表現 | medium |
| digital-twin | [T079-env-example-completeness](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T079-env-example-completeness.md) | .env.example 補齊未文件化環境變數 | low |
| digital-twin | [T080-unused-deps-cleanup](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T080-unused-deps-cleanup.md) | 移除未使用依賴（loguru/pydantic/langchain 等）並統一安裝來源 | low |
| digital-twin | [T081-hooks-deadcode-restage](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T081-hooks-deadcode-restage.md) | install_hooks 死碼清理與 pre-commit ruff --fix 後 restage | low |
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
