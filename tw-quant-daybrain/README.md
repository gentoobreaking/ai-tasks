# tw-quant-daybrain

## 已實作功能

| 功能 |
|------|
| 專案初始化與設定骨架 |
| MCP Client 連線層 |
| 資料新鮮度守門（Freshness Gate） |
| 事件日誌與回放讀取器 |
| 交易日曆與生命週期排程器 |
| 盤前流程（Phase 0 + Phase 1 選股） |
| 訊號模型 v2.0（Config-Driven 評分） |
| 風控系統與持倉狀態機 |
| 盤中監控循環（Phase 2 + Phase 3） |
| 交易日誌與績效指標（Phase 4） |
| LLM 檢討報告與防幻覺規範 |
| 回放工具與滑價驗證 |
| 測試策略與模擬盤（Mock MCP Server） |
| 部署、失敗處理與紙上交單 |
| 壓測、參數實驗與 v2.0 發布 |
| 盤前多空傾向鎖定（Bias Decision Tree） |
| 做多策略引擎（VWAP_SURGE_LONG） |
| 空方策略引擎（BULL_TRAP_VWAP_SHORT） |
| Tactical Briefing 產生器（盤前戰術報告） |
| Priority Ranking Engine（優先權排序與資金分配） |
| 回測資料載入器（CsvDataLoader） |
| 事件驅動回測模擬器（DayBrainBacktestSimulator） |
| 參數網格搜尋（Grid Search） |
| Walk-Forward Optimization（WFO 滾動驗證） |
| CLI 輸出人話化——模擬盤/回測輸出可讀性改造 |
| 部署穩定性——優雅關閉 + 交易日曆預載 |
| README 重構——CLI 優先 + 功能總覽 + 流程圖 + 應用情境 |
| 模組說明文件（盤前/簡報/評分/Priority Ranking）+ Apache-2.0 License 宣告 |

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
| | | |

## Task 列表

| # | 名稱 | 狀態 |
|---|------|------|
| [T1-scaffold](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T001-scaffold.md) | 專案初始化與設定骨架 | ✅ done |
| [T2-mcp-client](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T002-mcp-client.md) | MCP Client 連線層 | ✅ done |
| [T3-freshness-gate](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T003-freshness-gate.md) | 資料新鮮度守門（Freshness Gate） | ✅ done |
| [T4-event-logging](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T004-event-logging.md) | 事件日誌與回放讀取器 | ✅ done |
| [T5-calendar-scheduler](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T005-calendar-scheduler.md) | 交易日曆與生命週期排程器 | ✅ done |
| [T6-pre-market](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T006-pre-market.md) | 盤前流程（Phase 0 + Phase 1 選股） | ✅ done |
| [T7-scoring](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T007-scoring.md) | 訊號模型 v2.0（Config-Driven 評分） | ✅ done |
| [T8-risk-manager](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T008-risk-manager.md) | 風控系統與持倉狀態機 | ✅ done |
| [T9-intraday-loop](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T009-intraday-loop.md) | 盤中監控循環（Phase 2 + Phase 3） | ✅ done |
| [T10-journal-metrics](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T010-journal-metrics.md) | 交易日誌與績效指標（Phase 4） | ✅ done |
| [T11-llm-report](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T011-llm-report.md) | LLM 檢討報告與防幻覺規範 | ✅ done |
| [T12-replay](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T012-replay.md) | 回放工具與滑價驗證 | ✅ done |
| [T13-testing](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T013-testing.md) | 測試策略與模擬盤（Mock MCP Server） | ✅ done |
| [T14-ops](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T014-ops.md) | 部署、失敗處理與紙上交單 | ✅ done |
| [T15-release](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T015-release.md) | 壓測、參數實驗與 v2.0 發布 | ✅ done |
| [T16-bias-decision-tree](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T016-bias-decision-tree.md) | 盤前多空傾向鎖定（Bias Decision Tree） | ✅ done |
| [T17-vwap-surge-long](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T017-vwap-surge-long.md) | 做多策略引擎（VWAP_SURGE_LONG） | ✅ done |
| [T18-bull-trap-vwap-short](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T018-bull-trap-vwap-short.md) | 空方策略引擎（BULL_TRAP_VWAP_SHORT） | ✅ done |
| [T19-briefing-generator](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T019-briefing-generator.md) | Tactical Briefing 產生器（盤前戰術報告） | ✅ done |
| [T20-priority-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T020-priority-engine.md) | Priority Ranking Engine（優先權排序與資金分配） | ✅ done |
| [T21-csv-data-loader](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T021-csv-data-loader.md) | 回測資料載入器（CsvDataLoader） | ✅ done |
| [T22-backtest-simulator](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T022-backtest-simulator.md) | 事件驅動回測模擬器（DayBrainBacktestSimulator） | ✅ done |
| [T23-grid-search](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T023-grid-search.md) | 參數網格搜尋（Grid Search） | ✅ done |
| [T24-wfo-optimizer](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T024-wfo-optimizer.md) | Walk-Forward Optimization（WFO 滾動驗證） | ✅ done |
| [T25-cli-readable-output](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T025-cli-readable-output.md) | CLI 輸出人話化——模擬盤/回測輸出可讀性改造 | ✅ done |
| [T26-deploy-stability](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T026-deploy-stability.md) | 部署穩定性——優雅關閉 + 交易日曆預載 | ✅ done |
| [T27-readme-refactor](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T027-readme-refactor.md) | README 重構——CLI 優先 + 功能總覽 + 流程圖 + 應用情境 | ✅ done |
| [T28-module-docs-license](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant-daybrain/tasks/T028-module-docs-license.md) | 模組說明文件（盤前/簡報/評分/Priority Ranking）+ Apache-2.0 License 宣告 | ✅ done |

**✅ done: 28 | 🔧 in-progress: 0 | ⏭️ skip: 0 | 📋 pending: 0**

> 自動生成於 2026-08-22 06:12
