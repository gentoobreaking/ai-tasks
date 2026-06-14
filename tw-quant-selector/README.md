# tw-quant-selector

## 已實作功能

| 功能 |
|------|
| 專案初始化與基礎架構 |
| 資料模型與 DuckDB Schema 實作 |
| 資料擷取 - FinMind 整合 |
| 資料擷取 - TWSE/TPEX 整合 |
| 除權息還原模組 |
| 選股宇宙（Universe）模組 |
| 基礎策略架構與 DataProvider 介面 |
| 動能策略與價值策略實作 |
| 品質策略與成長策略實作 |
| 策略合成器（Score Combiner） |
| 交易成本模型 |
| 持倉管理與再平衡模組 |
| 回測引擎（含倖存者偏差 / Look-ahead bias 防護） |
| 績效評估指標計算 |
| RESTful API（FastAPI） |
| 告警、監控與 Logging |
| Docker 化部署 |
| 測試框架與測試案例 |
| 前端專案初始化與設計系統 |
| 儀表板頁面 |
| 選股訊號與股票詳情頁面 |
| 回測分析頁面 |
| 策略設定與投組追蹤頁面 |
| 資料監控與錯誤/空/載入狀態 |
| 後端 API 前端強化 |
| 可複用 BaseTable 表格元件 |
| 格式化工具與 Tooltip 元件 |
| 響應式設計框架 |
| 無障礙設計 |
| 效能預算 |
| 匯出強化 |
| Docker Multi-stage Build（前端 + API 合一） |
| 多功能執行腳本 run.sh |
| README 完整文件更新 |
| 進階策略權重調整器（自動平衡與即時預覽） |
| 淨值曲線進階互動（Brush 縮放與詳細 Tooltip） |
| 選股表格鍵盤導航與焦點管理 |
| 資料匯出欄位選擇彈窗 |
| 完整空狀態診斷與原因提示 |
| 損益監控告警後端設定與 API |
| 損益告警觸發邏輯與 Telegram/Email 整合 |
| 前端告警與系統設定頁面 |
| 動態資料庫路徑配置與重新連線 |
| 個股損益門檻設定與視覺警示 |
| 個股損益告警觸發 API |
| Design Token Three-Tier Architecture |
| Animation & Motion System |
| Component State Matrix & Empty State Design |
| Skeleton Screen Design System |
| Number Format & Localization Utility |
| Chart Interaction Deep Spec |
| Backtest Comparison Mode |
| Data Density System |
| Color-Blind Friendly Design |
| Z-Index Stacking System |
| Keyboard Shortcuts System |
| URL Deep State Management |
| Error Boundary System |
| Print Styles |
| 四因子滑桿鎖定與權重聯動 |
| 策略預設組合與宇宙篩選強化 |
| 各策略進階參數展開調整 |
| 套用影響預覽與再平衡成本 |
| 大師策略庫 UI |
| 因子相關性矩陣 |
| 衍生財務欄位計算 |
| 大師策略篩選器模式（後端） |
| 大師策略評分因子（第五因子）+ 每日快照 |
| 策略設定歷史記錄 |
| Toast 通知系統接入各頁面 |
| MarketStatus 元件接入側欄 |
| Signals / Dashboard 表格改用 BaseTable 統一元件 |
| CSS State Classes 接入元件動態行為 |
| 後端 factor-history API 接上 StockDetail 頁面 |
| 後端 signals/calendar API 接上 Signals 日期選擇器 |
| BacktestDetail 頁面接上後端回測明細 API |
| 後端 data/status API 接上 Dashboard 資料狀態面板 |
| Tooltip 元件接入頁面互動提示 |
| 完成 Print Styles (T059) 與 Color-Blind 人工測試 (T054) |
| color.ts 工具函式導入頁面取代手寫顏色邏輯 |
| 整合 Ingestion Pipeline 與系統健康檢查 (Alerting) |
| 即時損益監控 (Live P/L Monitoring) |
| Tooltip Portal 改寫 + Z-index 堆疊管理 |
| 自訂 Dropdown 元件 + Portal 渲染 |
| 遷移前端投組管理至資料庫驅動架構 |
| 基於 SSE 的投組即時同步 |
| 即時價格 SSE 同步機制 |
| Portfolio 頁面新增圓餅圖（權重與總金額） |
| 修正篩選結果預估：新增後端 API 查詢實際數量 |
| 程式碼審查：找出潛在問題與硬編碼假資料 |
| 移除 Strategy 頁面大師策略庫硬編碼假資料 |
| 修改 Backtest 再平衡邏輯（改為每日檢查） |
| 重構 Decimal 與 np.isnan 混用問題 |
| 移除前端 any 型別濫用 |
| SQL f-string 加入白名單驗證 |
| 加入 API 請求參數驗證 |
| 程式碼品質提升（問題 11-15） |
| CORS 漏洞（allow_origins=["*"]） |
| 策略設定歷史分頁 + 批量刪除 |
| 敏感資訊透過 API 暴露 |
| PostgreSQL 环境建置（Docker 版本） |
| Schema 迁移规划与实作（DuckDB → PostgreSQL） |
| 数据迁移脚本实作（DuckDB → PostgreSQL） |
| Python 代码修改（DB 连接层 SQLAlchemy ORM 重构） |
| SQL 语法调整（DuckDB → PostgreSQL） |
| 整合测试与验证（迁移後） |
| 效能优化与监控（PostgreSQL） |
| 三大法人买卖超 Ingestion Pipeline 实作 |
| institutional_flows 资料表建立与週更新 |
| 基础警示系统实作（资料新鲜度 + 系统健康） |
| 法人相关警示规则实作 |
| 法人动向因子（第五因子）实作 |
| 策略设定 UI 新增法人因子 |
| MIS API 即时报价全市场轮询实作 |
| 盘中即时 PE/PB 计算实作 |
| WebSocket 即时推播整合 |
| 即时价格警示规则实作 |
| Streamlit 分析看板基础版实作 |
| Streamlit 完整版实作（pages 4-6） |
| 法人策略因子計算（Pandas 向量化重構） |
| 即时 PE/PB UI 整合（React） |
| 10 种智慧警示条件实作（Pandas 筛选） |
| React 前端警示整合（useMarketAlerts.ts） |
| AlertHistory 多頁籤擴充（原 Streamlit，已移植到 React） |
| 风控与效能优化（Rate Limiting + 向量化） |
| guru_scores 表初始化（Piotroski F-Score） |
| strategy_config_history 表初始化 |
| alert_rules 表初始化（默认规则写入） |
| ingestion 擴展現金流與資產負債表欄位（CFO / CurrentRatio） |
| Support Custom Universe in Backtesting |
| 智慧警示啟用及設定值面板 |
| 即時技術分析警示（60分K線 / MA / KD 指標） |
| 加權指數（TAIEX）技術分析警示 |
| Market Dashboard 集成 |

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
| [T134-alerting-module-split-refactor](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T134-alerting-module-split-refactor.md) | 拆分大型檔案 alerting.py（模組化重構） | |
| [T135-complete-missing-tests](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T135-complete-missing-tests.md) | 補齊未完成的測試項目（T123/T124/T130-T133） | |

## Task 列表

| # | 名稱 | 狀態 |
|---|------|------|
| [T1-project-init](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T001-project-init.md) | 專案初始化與基礎架構 | ✅ done |
| [T2-db-schema](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T002-db-schema.md) | 資料模型與 DuckDB Schema 實作 | ✅ done |
| [T3-data-finmind](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T003-data-finmind.md) | 資料擷取 - FinMind 整合 | ✅ done |
| [T4-data-twse-tpex](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T004-data-twse-tpex.md) | 資料擷取 - TWSE/TPEX 整合 | ✅ done |
| [T5-dividend-adjustment](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T005-dividend-adjustment.md) | 除權息還原模組 | ✅ done |
| [T6-universe-module](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T006-universe-module.md) | 選股宇宙（Universe）模組 | ✅ done |
| [T7-strategy-base](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T007-strategy-base.md) | 基礎策略架構與 DataProvider 介面 | ✅ done |
| [T8-strategy-momentum-value](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T008-strategy-momentum-value.md) | 動能策略與價值策略實作 | ✅ done |
| [T9-strategy-quality-growth](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T009-strategy-quality-growth.md) | 品質策略與成長策略實作 | ✅ done |
| [T10-score-combiner](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T010-score-combiner.md) | 策略合成器（Score Combiner） | ✅ done |
| [T11-transaction-cost](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T011-transaction-cost.md) | 交易成本模型 | ✅ done |
| [T12-portfolio-rebalance](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T012-portfolio-rebalance.md) | 持倉管理與再平衡模組 | ✅ done |
| [T13-backtest-engine](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T013-backtest-engine.md) | 回測引擎（含倖存者偏差 / Look-ahead bias 防護） | ✅ done |
| [T14-performance-metrics](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T014-performance-metrics.md) | 績效評估指標計算 | ✅ done |
| [T15-rest-api](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T015-rest-api.md) | RESTful API（FastAPI） | ✅ done |
| [T16-monitoring-alerting](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T016-monitoring-alerting.md) | 告警、監控與 Logging | ✅ done |
| [T17-docker](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T017-docker.md) | Docker 化部署 | ✅ done |
| [T18-testing](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T018-testing.md) | 測試框架與測試案例 | ✅ done |
| [T19-frontend-scaffold-design-system](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T019-frontend-scaffold-design-system.md) | 前端專案初始化與設計系統 | ✅ done |
| [T20-dashboard-page](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T020-dashboard-page.md) | 儀表板頁面 | ✅ done |
| [T21-signal-stock-detail-pages](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T021-signal-stock-detail-pages.md) | 選股訊號與股票詳情頁面 | ✅ done |
| [T22-backtest-page](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T022-backtest-page.md) | 回測分析頁面 | ✅ done |
| [T23-strategy-portfolio-pages](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T023-strategy-portfolio-pages.md) | 策略設定與投組追蹤頁面 | ✅ done |
| [T24-data-monitor-error-states](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T024-data-monitor-error-states.md) | 資料監控與錯誤/空/載入狀態 | ✅ done |
| [T25-backend-api-enhancement](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T025-backend-api-enhancement.md) | 後端 API 前端強化 | ✅ done |
| [T26-base-table-component](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T026-base-table-component.md) | 可複用 BaseTable 表格元件 | ✅ done |
| [T27-formatting-utilities-tooltip](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T027-formatting-utilities-tooltip.md) | 格式化工具與 Tooltip 元件 | ✅ done |
| [T28-responsive-design](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T028-responsive-design.md) | 響應式設計框架 | ✅ done |
| [T29-accessibility](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T029-accessibility.md) | 無障礙設計 | ✅ done |
| [T30-performance-budgets](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T030-performance-budgets.md) | 效能預算 | ✅ done |
| [T31-export-enhancement](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T031-export-enhancement.md) | 匯出強化 | ✅ done |
| [T32-docker-multistage](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T032-docker-multistage.md) | Docker Multi-stage Build（前端 + API 合一） | ✅ done |
| [T33-run-script](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T033-run-script.md) | 多功能執行腳本 run.sh | ✅ done |
| [T34-readme-update](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T034-readme-update.md) | README 完整文件更新 | ✅ done |
| [T35-advanced-weight-config](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T035-advanced-weight-config.md) | 進階策略權重調整器（自動平衡與即時預覽） | ✅ done |
| [T36-equity-curve-interaction](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T036-equity-curve-interaction.md) | 淨值曲線進階互動（Brush 縮放與詳細 Tooltip） | ✅ done |
| [T37-table-keyboard-nav](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T037-table-keyboard-nav.md) | 選股表格鍵盤導航與焦點管理 | ✅ done |
| [T38-export-config-modal](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T038-export-config-modal.md) | 資料匯出欄位選擇彈窗 | ✅ done |
| [T39-empty-state-diagnostics](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T039-empty-state-diagnostics.md) | 完整空狀態診斷與原因提示 | ✅ done |
| [T40-alert-config-backend](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T040-alert-config-backend.md) | 損益監控告警後端設定與 API | ✅ done |
| [T41-alert-trigger-integration](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T041-alert-trigger-integration.md) | 損益告警觸發邏輯與 Telegram/Email 整合 | ✅ done |
| [T42-alert-settings-ui](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T042-alert-settings-ui.md) | 前端告警與系統設定頁面 | ✅ done |
| [T43-dynamic-db-path](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T043-dynamic-db-path.md) | 動態資料庫路徑配置與重新連線 | ✅ done |
| [T44-per-stock-alert-config](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T044-per-stock-alert-config.md) | 個股損益門檻設定與視覺警示 | ✅ done |
| [T45-per-stock-alert-trigger](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T045-per-stock-alert-trigger.md) | 個股損益告警觸發 API | ✅ done |
| [T46-design-token-three-tier](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T046-design-token-three-tier.md) | Design Token Three-Tier Architecture | ✅ done |
| [T47-animation-motion-system](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T047-animation-motion-system.md) | Animation & Motion System | ✅ done |
| [T48-component-state-matrix](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T048-component-state-matrix.md) | Component State Matrix & Empty State Design | ✅ done |
| [T49-skeleton-screen-system](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T049-skeleton-screen-system.md) | Skeleton Screen Design System | ✅ done |
| [T50-number-format-localization](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T050-number-format-localization.md) | Number Format & Localization Utility | ✅ done |
| [T51-chart-interaction-deep-spec](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T051-chart-interaction-deep-spec.md) | Chart Interaction Deep Spec | ✅ done |
| [T52-backtest-comparison-mode](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T052-backtest-comparison-mode.md) | Backtest Comparison Mode | ✅ done |
| [T53-data-density-system](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T053-data-density-system.md) | Data Density System | ✅ done |
| [T54-color-blind-friendly](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T054-color-blind-friendly.md) | Color-Blind Friendly Design | ✅ done |
| [T55-z-index-stacking-system](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T055-z-index-stacking-system.md) | Z-Index Stacking System | ✅ done |
| [T56-keyboard-shortcuts-system](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T056-keyboard-shortcuts-system.md) | Keyboard Shortcuts System | ✅ done |
| [T57-url-deep-state-management](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T057-url-deep-state-management.md) | URL Deep State Management | ✅ done |
| [T58-error-boundary-system](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T058-error-boundary-system.md) | Error Boundary System | ✅ done |
| [T59-print-styles](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T059-print-styles.md) | Print Styles | ✅ done |
| [T60-slider-lock-weight-linkage](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T060-slider-lock-weight-linkage.md) | 四因子滑桿鎖定與權重聯動 | ✅ done |
| [T61-quick-preset-universe-filter](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T061-quick-preset-universe-filter.md) | 策略預設組合與宇宙篩選強化 | ✅ done |
| [T62-advanced-params-expand](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T062-advanced-params-expand.md) | 各策略進階參數展開調整 | ✅ done |
| [T63-impact-preview-rebalance-cost](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T063-impact-preview-rebalance-cost.md) | 套用影響預覽與再平衡成本 | ✅ done |
| [T64-guru-strategy-ui](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T064-guru-strategy-ui.md) | 大師策略庫 UI | ✅ done |
| [T65-factor-correlation-matrix](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T065-factor-correlation-matrix.md) | 因子相關性矩陣 | ✅ done |
| [T66-derived-financial-fields](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T066-derived-financial-fields.md) | 衍生財務欄位計算 | ✅ done |
| [T67-guru-filter-mode](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T067-guru-filter-mode.md) | 大師策略篩選器模式（後端） | ✅ done |
| [T68-guru-scoring-fifth-factor](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T068-guru-scoring-fifth-factor.md) | 大師策略評分因子（第五因子）+ 每日快照 | ✅ done |
| [T69-strategy-config-history](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T069-strategy-config-history.md) | 策略設定歷史記錄 | ✅ done |
| [T70-toast-notification-system](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T070-toast-notification-system.md) | Toast 通知系統接入各頁面 | ✅ done |
| [T71-marketstatus-sidebar-integration](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T071-marketstatus-sidebar-integration.md) | MarketStatus 元件接入側欄 | ✅ done |
| [T72-basetable-component-unification](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T072-basetable-component-unification.md) | Signals / Dashboard 表格改用 BaseTable 統一元件 | ✅ done |
| [T73-css-state-classes-wiring](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T073-css-state-classes-wiring.md) | CSS State Classes 接入元件動態行為 | ✅ done |
| [T74-factor-history-api-stockdetail](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T074-factor-history-api-stockdetail.md) | 後端 factor-history API 接上 StockDetail 頁面 | ✅ done |
| [T75-signals-calendar-date-picker](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T075-signals-calendar-date-picker.md) | 後端 signals/calendar API 接上 Signals 日期選擇器 | ✅ done |
| [T76-backtest-detail-page](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T076-backtest-detail-page.md) | BacktestDetail 頁面接上後端回測明細 API | ✅ done |
| [T77-dashboard-data-status-panel](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T077-dashboard-data-status-panel.md) | 後端 data/status API 接上 Dashboard 資料狀態面板 | ✅ done |
| [T78-tooltip-component-integration](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T078-tooltip-component-integration.md) | Tooltip 元件接入頁面互動提示 | ✅ done |
| [T79-print-styles-colorblind-testing](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T079-print-styles-colorblind-testing.md) | 完成 Print Styles (T059) 與 Color-Blind 人工測試 (T054) | ✅ done |
| [T80-color-utility-integration](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T080-color-utility-integration.md) | color.ts 工具函式導入頁面取代手寫顏色邏輯 | ✅ done |
| [T81-pipeline-health-check](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T081-pipeline-health-check.md) | 整合 Ingestion Pipeline 與系統健康檢查 (Alerting) | ✅ done |
| [T82-live-pl-monitoring](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T082-live-pl-monitoring.md) | 實作即時損益監控 (Live P/L Monitoring) | ✅ done |
| [T83-tooltip-portal-stacking](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T083-tooltip-portal-stacking.md) | Tooltip Portal 改寫 + Z-index 堆疊管理 | ✅ done |
| [T84-custom-dropdown-portal](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T084-custom-dropdown-portal.md) | 自訂 Dropdown 元件 + Portal 渲染 | ✅ done |
| [T85-frontend-db-integration](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T085-frontend-db-integration.md) | 遷移前端投組管理至資料庫驅動架構 | ✅ done |
| [T86-real-time-sse-sync](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T086-real-time-sse-sync.md) | 實作基於 SSE 的投組即時同步 | ✅ done |
| [T87-realtime-price-sse-sync](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T087-realtime-price-sse-sync.md) | 實作即時價格 SSE 同步機制 | ✅ done |
| [T88-portfolio-pie-charts](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T088-portfolio-pie-charts.md) | Portfolio 頁面新增圓餅圖（權重與總金額） | ✅ done |
| [T89-universe-count-api](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T089-universe-count-api.md) | 修正篩選結果預估：新增後端 API 查詢實際數量 | ✅ done |
| [T90-code-review-hardcoded-data](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T090-code-review-hardcoded-data.md) | 程式碼審查：找出潛在問題與硬編碼假資料 | ✅ done |
| [T91-remove-guru-passcount-hardcoded](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T091-remove-guru-passcount-hardcoded.md) | 移除 Strategy 頁面大師策略庫硬編碼假資料 | ✅ done |
| [T92-backtest-daily-rebalance](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T092-backtest-daily-rebalance.md) | 修改 Backtest 再平衡邏輯（改為每日檢查） | ✅ done |
| [T93-refactor-decimal-nan-mixing](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T093-refactor-decimal-nan-mixing.md) | 重構 Decimal 與 np.isnan 混用問題 | ✅ done |
| [T94-remove-any-type-abuse](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T094-remove-any-type-abuse.md) | 移除前端 any 型別濫用 | ✅ done |
| [T95-sql-fstring-whitelist](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T095-sql-fstring-whitelist.md) | SQL f-string 加入白名單驗證 | ✅ done |
| [T96-api-parameter-validation](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T096-api-parameter-validation.md) | 加入 API 請求參數驗證 | ✅ done |
| [T97-code-quality-improvement](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T097-code-quality-improvement.md) | 程式碼品質提升（問題 11-15） | ✅ done |
| [T98-fix-cors-vulnerability](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T098-fix-cors-vulnerability.md) | 修復 CORS 漏洞（allow_origins=["*"]） | ✅ done |
| [T99-strategy-config-history-pagination-batch-delete](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T099-strategy-config-history-pagination-batch-delete.md) | 策略設定歷史分頁 + 批量刪除 | ✅ done |
| [T100-fix-sensitive-info-exposure](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T100-fix-sensitive-info-exposure.md) | 修復敏感資訊透過 API 暴露 | ✅ done |
| [T101-postgresql-docker-setup](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T101-postgresql-docker-setup.md) | PostgreSQL 环境建置（Docker 版本） | ✅ done |
| [T102-schema-migration](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T102-schema-migration.md) | Schema 迁移规划与实作（DuckDB → PostgreSQL） | ✅ done |
| [T103-data-migration](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T103-data-migration.md) | 数据迁移脚本实作（DuckDB → PostgreSQL） | ✅ done |
| [T104-python-db-connection](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T104-python-db-connection.md) | Python 代码修改（DB 连接层 SQLAlchemy ORM 重构） | ✅ done |
| [T105-sql-syntax-adjustment](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T105-sql-syntax-adjustment.md) | SQL 语法调整（DuckDB → PostgreSQL） | ✅ done |
| [T106-postgresql-migration-verification](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T106-postgresql-migration-verification.md) | 整合测试与验证（迁移後） | ✅ done |
| [T107-performance-monitoring](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T107-performance-monitoring.md) | 效能优化与监控（PostgreSQL） | ✅ done |
| [T108-institutional-ingestion-pipeline](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T108-institutional-ingestion-pipeline.md) | 三大法人买卖超 Ingestion Pipeline 实作 | ✅ done |
| [T109-institutional-flows-schema](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T109-institutional-flows-schema.md) | institutional_flows 资料表建立与週更新 | ✅ done |
| [T110-basic-alert-system](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T110-basic-alert-system.md) | 基础警示系统实作（资料新鲜度 + 系统健康） | ✅ done |
| [T111-institutional-alerts](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T111-institutional-alerts.md) | 法人相关警示规则实作 | ✅ done |
| [T112-institutional-factor](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T112-institutional-factor.md) | 法人动向因子（第五因子）实作 | ✅ done |
| [T113-strategy-ui-institutional](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T113-strategy-ui-institutional.md) | 策略设定 UI 新增法人因子 | ✅ done |
| [T114-mis-realtime-quotes](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T114-mis-realtime-quotes.md) | MIS API 即时报价全市场轮询实作 | ✅ done |
| [T115-realtime-pe-pb](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T115-realtime-pe-pb.md) | 盘中即时 PE/PB 计算实作 | ✅ done |
| [T116-websocket-push](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T116-websocket-push.md) | WebSocket 即时推播整合 | ✅ done |
| [T117-realtime-price-alerts](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T117-realtime-price-alerts.md) | 即时价格警示规则实作 | ✅ done |
| [T118-streamlit-basic](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T118-streamlit-basic.md) | Streamlit 分析看板基础版实作 | ✅ done |
| [T119-streamlit-full](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T119-streamlit-full.md) | Streamlit 完整版实作（pages 4-6） | ✅ done |
| [T120-institutional-strategy-factors](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T120-institutional-strategy-factors.md) | 法人策略因子計算（Pandas 向量化重構） | ✅ done |
| [T121-realtime-pe-pb-ui](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T121-realtime-pe-pb-ui.md) | 即时 PE/PB UI 整合（React） | ✅ done |
| [T122-smart-alerts](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T122-smart-alerts.md) | 10 种智慧警示条件实作（Pandas 筛选） | ✅ done |
| [T123-react-alerts-integration](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T123-react-alerts-integration.md) | React 前端警示整合（useMarketAlerts.ts） | ✅ done |
| [T124-streamlit-alerts-ui](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T124-streamlit-alerts-ui.md) | AlertHistory 多頁籤擴充（原 Streamlit，已移植到 React） | ✅ done |
| [T125-performance-optimization](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T125-performance-optimization.md) | 风控与效能优化（Rate Limiting + 向量化） | ✅ done |
| [T126-guru-scores-init](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T126-guru-scores-init.md) | guru_scores 表初始化（Piotroski F-Score） | ✅ done |
| [T127-strategy-config-history-init](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T127-strategy-config-history-init.md) | strategy_config_history 表初始化 | ✅ done |
| [T128-alert-rules-init](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T128-alert-rules-init.md) | alert_rules 表初始化（默认规则写入） | ✅ done |
| [T129-ingestion-cfo-bs-enhance](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T129-ingestion-cfo-bs-enhance.md) | ingestion 擴展現金流與資產負債表欄位（CFO / CurrentRatio） | ✅ done |
| [T130-custom-universe-backtest](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T130-custom-universe-backtest.md) | Support Custom Universe in Backtesting | ✅ done |
| [T131-smart-alert-rules-config-panel](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T131-smart-alert-rules-config-panel.md) | 智慧警示啟用及設定值面板 | ✅ done |
| [T132-intraday-kline-kd-ma-alert](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T132-intraday-kline-kd-ma-alert.md) | 即時技術分析警示（60分K線 / MA / KD 指標） | ✅ done |
| [T133-taiex-index-technical-alert](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T133-taiex-index-technical-alert.md) | 加權指數（TAIEX）技術分析警示 | ✅ done |
| [T134-alerting-module-split-refactor](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T134-alerting-module-split-refactor.md) | 拆分大型檔案 alerting.py（模組化重構） | 📋 pending |
| [T135-complete-missing-tests](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T135-complete-missing-tests.md) | 補齊未完成的測試項目（T123/T124/T130-T133） | 📋 pending |
| [T136-market-dashboard-integration](https://github.com/openclawchen8-lgtm/openclaw-tasks/blob/main/tw-quant-selector/tasks/T136-market-dashboard-integration.md) | Market Dashboard 集成 | ✅ done |

**✅ done: 134 | 🔧 in-progress: 0 | ⏭️ skip: 0 | 📋 pending: 2**

> 自動生成於 2026-06-12 04:32
