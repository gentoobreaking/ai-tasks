# gold-monitor-pro

## 已實作功能

| 功能 |
|------|
| 分離監控物件（存摺 vs 國際分開） |
| 重寫 gold_local 監控邏輯 |
| 重寫國際報價監控邏輯 |
| 交叉驗證機制（台銀 vs 玉山銀行） |
| config.json schema + 閾值設定 |
| 銀/鉑金的 BOTAdapter 移除 |
| 快取管理 + 基準取得失敗 alert |
| 整合測試（比對官網報價） |
| 將實現程式碼移入專案目錄 |
| README task 表格的 GitHub 連結 |
| 完成 T008 剩餘整合測試案例 |
| 黃金/白銀/鉑金價格歷史圖表 API |
| Health check endpoint + 結構化 JSON 日誌 |
| 多管道通知支援 (Discord / Telegram / Email) |
| 人類可視化網頁儀表板（價格+走勢+健康） |
| macOS launchd 自動排程安裝 |
| README 同步到現狀 |
| 即時價格與強化健康 API |
| 人類易讀的 alert 訊息 |
| 監控器 CLI 進入點與排程器接線 |
| 所有入口點的 e2e 煙霧測試 |

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
| [T1-separate-monitor-objects-local-vs-intl](https://github.com/gentoobreaking/ai-tasks/blob/main/gold-monitor-pro/tasks/T001-separate-monitor-objects-local-vs-intl.md) | 分離監控物件（存摺 vs 國際分開） | ✅ done |
| [T2-rewrite-gold-local-monitoring-logic](https://github.com/gentoobreaking/ai-tasks/blob/main/gold-monitor-pro/tasks/T002-rewrite-gold-local-monitoring-logic.md) | 重寫 gold_local 監控邏輯 | ✅ done |
| [T3-rewrite-international-price-monitoring-logic](https://github.com/gentoobreaking/ai-tasks/blob/main/gold-monitor-pro/tasks/T003-rewrite-international-price-monitoring-logic.md) | 重寫國際報價監控邏輯 | ✅ done |
| [T4-cross-validation-taiwan-vs-esun-bank](https://github.com/gentoobreaking/ai-tasks/blob/main/gold-monitor-pro/tasks/T004-cross-validation-taiwan-vs-esun-bank.md) | 交叉驗證機制（台銀 vs 玉山銀行） | ✅ done |
| [T5-update-config-schema-and-thresholds](https://github.com/gentoobreaking/ai-tasks/blob/main/gold-monitor-pro/tasks/T005-update-config-schema-and-thresholds.md) | 更新 config.json schema + 閾值設定 | ✅ done |
| [T6-remove-botadapter-for-silver-platinum](https://github.com/gentoobreaking/ai-tasks/blob/main/gold-monitor-pro/tasks/T006-remove-botadapter-for-silver-platinum.md) | 銀/鉑金的 BOTAdapter 移除 | ✅ done |
| [T7-cache-management-and-baseline-failure-alert](https://github.com/gentoobreaking/ai-tasks/blob/main/gold-monitor-pro/tasks/T007-cache-management-and-baseline-failure-alert.md) | 快取管理 + 基準取得失敗 alert | ✅ done |
| [T8-integration-test-against-official-quotes](https://github.com/gentoobreaking/ai-tasks/blob/main/gold-monitor-pro/tasks/T008-integration-test-against-official-quotes.md) | 整合測試（比對官網報價） | ✅ done |
| [T9-bring-source-code-into-project](https://github.com/gentoobreaking/ai-tasks/blob/main/gold-monitor-pro/tasks/T009-bring-source-code-into-project.md) | 將實現程式碼移入專案目錄 | ✅ done |
| [T10-fix-readme-task-links](https://github.com/gentoobreaking/ai-tasks/blob/main/gold-monitor-pro/tasks/T010-fix-readme-task-links.md) | 更新 README task 表格的 GitHub 連結 | ✅ done |
| [T11-complete-t008-integration-tests](https://github.com/gentoobreaking/ai-tasks/blob/main/gold-monitor-pro/tasks/T011-complete-t008-integration-tests.md) | 完成 T008 剩餘整合測試案例 | ✅ done |
| [T12-price-history-chart-api](https://github.com/gentoobreaking/ai-tasks/blob/main/gold-monitor-pro/tasks/T012-price-history-chart-api.md) | 新增黃金/白銀/鉑金價格歷史圖表 API | ✅ done |
| [T13-health-check-endpoint](https://github.com/gentoobreaking/ai-tasks/blob/main/gold-monitor-pro/tasks/T013-health-check-endpoint.md) | 新增 Health check endpoint + 結構化 JSON 日誌 | ✅ done |
| [T14-multi-channel-notifications](https://github.com/gentoobreaking/ai-tasks/blob/main/gold-monitor-pro/tasks/T014-multi-channel-notifications.md) | 新增多管道通知支援 (Discord / Telegram / Email) | ✅ done |
| [T15-web-dashboard](https://github.com/gentoobreaking/ai-tasks/blob/main/gold-monitor-pro/tasks/T015-web-dashboard.md) | 人類可視化網頁儀表板（價格+走勢+健康） | ✅ done |
| [T16-auto-scheduling-launchd](https://github.com/gentoobreaking/ai-tasks/blob/main/gold-monitor-pro/tasks/T016-auto-scheduling-launchd.md) | macOS launchd 自動排程安裝 | ✅ done |
| [T17-readme-sync](https://github.com/gentoobreaking/ai-tasks/blob/main/gold-monitor-pro/tasks/T017-readme-sync.md) | README 同步到現狀 | ✅ done |
| [T18-live-price-health-api](https://github.com/gentoobreaking/ai-tasks/blob/main/gold-monitor-pro/tasks/T018-live-price-health-api.md) | 即時價格與強化健康 API | ✅ done |
| [T19-human-readable-alerts](https://github.com/gentoobreaking/ai-tasks/blob/main/gold-monitor-pro/tasks/T019-human-readable-alerts.md) | 人類易讀的 alert 訊息 | ✅ done |
| [T20-monitor-cli-entrypoints-and-scheduler-wiring](https://github.com/gentoobreaking/ai-tasks/blob/main/gold-monitor-pro/tasks/T020-monitor-cli-entrypoints-and-scheduler-wiring.md) | 監控器 CLI 進入點與排程器接線 | ✅ done |
| [T21-all-entrypoint-e2e-tests](https://github.com/gentoobreaking/ai-tasks/blob/main/gold-monitor-pro/tasks/T021-all-entrypoint-e2e-tests.md) | 所有入口點的 e2e 煙霧測試 | ✅ done |

**✅ done: 21 | 🔧 in-progress: 0 | ⏭️ skip: 0 | 📋 pending: 0**

> 自動生成於 2026-08-30 16:07
