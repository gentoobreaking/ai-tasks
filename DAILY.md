# 📅 Daily Dashboard - 2026-08-14

> 最後更新: 2026-08-14 22:25 · 自動生成

---

## 🆕 今日新增任務

_無_

---

## ✅ 今日完成任務

| 專案 | 任務 | 標題 |
| -- | -- | -- |
| digital-twin | [T072-knowledge-indexer-converge](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T072-knowledge-indexer-converge.md) | knowledge indexer 重複實作收斂（index_knowledge / incremental_index） |
| digital-twin | [T073-consensus-eval-reverse-dep](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T073-consensus-eval-reverse-dep.md) | consensus_eval 反向依賴修正（直通 discussion_orchestrator） |
| digital-twin | [T074-prometheus-registry-unify](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T074-prometheus-registry-unify.md) | Prometheus registry 統一（/metrics 缺 OTEL metrics） |
| digital-twin | [T075-worker-rag-to-thread](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T075-worker-rag-to-thread.md) | worker RAG 同步搜尋改 asyncio.to_thread（避免阻塞 event loop） |
| local-ai-controlpanel | [T018-evidence-bundle](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T018-evidence-bundle.md) | Evidence model + Evidence Bundle + Shaping（Phase 3） |
| local-ai-controlpanel | [T019-evidence-gate](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T019-evidence-gate.md) | Evidence Gate（Phase 3）：兩階段評估 + 降級政策 + 卡死防護 |
| local-ai-controlpanel | [T020-reflection-retry](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T020-reflection-retry.md) | Reflection + Retry（Phase 4）：失敗分類器 + 重試政策 |
| local-ai-controlpanel | [T021-pi-worker](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T021-pi-worker.md) | Worker Interface + Pi Worker + llama.cpp 串接（Phase 1） |
| local-ai-controlpanel | [T022-worker-registry](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T022-worker-registry.md) | Worker Registry / Router（Phase 1）：註冊與選派 |

---

## 🔥 待處理高優先級

| 專案 | 任務 | 標題 | 優先 |
| -- | -- | -- | -- |
| local-ai-controlpanel | [T023-e2e-test](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T023-e2e-test.md) | 第一個 E2E Test（Phase 4 收尾）：Python repo + 有/無 Research 對照（§40） | high |
| local-ai-controlpanel | [T024-benchmark](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T024-benchmark.md) | Benchmark harness（Phase 5）：50 tasks + Baseline A–F + CP Gain | high |
| tw-quant-mcp | [T033-financial-ajax-fix](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T033-financial-ajax-fix.md) | P0 財報 AJAX 接線（季報三表修復 + PE/ROE + 健康評分連帶修復） | high |
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
| local-ai-controlpanel | [T023-e2e-test](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T023-e2e-test.md) | 第一個 E2E Test（Phase 4 收尾）：Python repo + 有/無 Research 對照（§40） | high |
| local-ai-controlpanel | [T024-benchmark](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T024-benchmark.md) | Benchmark harness（Phase 5）：50 tasks + Baseline A–F + CP Gain | high |
| tw-quant-mcp | [T033-financial-ajax-fix](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T033-financial-ajax-fix.md) | P0 財報 AJAX 接線（季報三表修復 + PE/ROE + 健康評分連帶修復） | high |
| tw-quant-signal | [T023-mcp-validation-fallback](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-signal/tasks/T023-mcp-validation-fallback.md) | [Phase 4] Pipeline 驗證 + mcp fallback — 確認端到端正確性 | high |
| digital-twin | [T076-scheduler-lock-and-revert-safety](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T076-scheduler-lock-and-revert-safety.md) | scheduler 併跑鎖定與 git_revert_all 資料破壞防護 | medium |
| digital-twin | [T077-pybreaker-pin-and-test-hardening](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T077-pybreaker-pin-and-test-hardening.md) | pybreaker 版本上限收緊 + 測試移除私有 API 操作 | medium |
| digital-twin | [T078-tautological-tests-fix](https://github.com/gentoobreaking/ai-tasks/blob/main/digital-twin/tasks/T078-tautological-tests-fix.md) | 收緊寬鬆/謬誤斷言測試（test_telegram_bot 等） | medium |
| local-ai-controlpanel | [T025-ui-sandbox-integration](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T025-ui-sandbox-integration.md) | UI-5：sandbox 整合顯示 + approve 流程（§45.6） | medium |
| local-ai-controlpanel | [T026-ui-packaging](https://github.com/gentoobreaking/ai-tasks/blob/main/local-ai-controlpanel/tasks/T026-ui-packaging.md) | UI-6：打包 + Control Plane 自動啟動/附著（§45.6） | medium |
| tw-quant-mcp | [T032-etf-index-support](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T032-etf-index-support.md) | ETF（0050）與加權指數資料支援（A+B 合併） | medium |
| tw-quant-mcp | [T034-dividend-exdate](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-mcp/tasks/T034-dividend-exdate.md) | P1 股利 ex_date（TWT48U 併入 dividend history + 評估歷史查詢） | medium |
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
