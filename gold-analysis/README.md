# gold-analysis

六個子專案（core / advanced / extend / improve / merge / platform）的任務書已統一合併至此目錄。每張任務書保留 `source_project` 欄位標註原始來源，`depends_on` 已重對映為前綴化 ID（如 `core-T011`）。

**合併任務總數：56**

## gold-analysis-core  (前綴 `core-`)

| 新 ID | 原 ID | 標題 | 狀態 |
|-------|-------|------|------|
| core-T001.md | T001.md | 搭建開發環境 | done |
| core-T002-1.md | T002-1.md | 處理 API 限流機制 | done |
| core-T002-2.md | T002-2.md | 實現錯誤重試機制 | done |
| core-T002-3.md | T002-3.md | 實現數據緩存機制 | done |
| core-T002.md | T002.md | 建立數據源集成 | done |
| core-T003-A.md | T003-A.md | 修復數據庫依賴問題 | done |
| core-T003-B.md | T003-B.md | 完善數據庫遷移腳本 | done |
| core-T003-C.md | T003-C.md | 數據庫模組測試 | skip |
| core-T003.md | T003.md | 建立數據庫架構 | done |
| core-T004-A.md | T004-A.md | A - 實現驗證模組 | done |
| core-T004-B.md | T004-B.md | B - 實現清洗模組 | done |
| core-T004-C.md | T004-C.md | C - 實現報告模組與整合測試 | done |
| core-T004-D.md | T004-D.md | D - 修復異常檢測測試 | done |
| core-T004.md | T004.md | 實現數據驗證和清洗 | done |
| core-T005.md | T005.md | 集成 OpenClaw 框架 | done |
| core-T006-1.md | T006-1.md | 處理 API 限流問題 | done |
| core-T006-2.md | T006-2.md | 處理網絡超時問題 | done |
| core-T006-3.md | T006-3.md | 處理數據格式不一致問題 | done |
| core-T006.md | T006.md | 開發數據收集 Agent | done |
| core-T007.md | T007.md | 開發技術分析 Agent | done |
| core-T008.md | T008.md | 建立技術分析測試框架 | done |
| core-T009.md | T009.md | 開發基本面分析 Agent | done |
| core-T010.md | T010.md | 開發風險評估 Agent | done |
| core-T011.md | T011.md | 開發決策推薦 Agent | done |
| core-T012.md | T012.md | Agent 協作測試 | done |
| core-T013.md | T013.md | 前端架構設計 | done |
| core-T014.md | T014.md | 開發核心頁面 | done |
| core-T015.md | T015.md | 實現實時數據推送 | done |
| core-T016.md | T016.md | 系統集成測試 | done |

## gold-analysis-advanced  (前綴 `adv-`)

| 新 ID | 原 ID | 標題 | 狀態 |
|-------|-------|------|------|
| adv-T001.md | T001.md | 機器學習模型開發 | done |
| adv-T002.md | T002.md | ML 模型整合與優化 | done |
| adv-T003.md | T003.md | 實盤交易接口設計 | done |
| adv-T004.md | T004.md | 實盤交易對接 | done |
| adv-T005.md | T005.md | 生產環境接線（監控/重訓/A-B/交易執行） | pending |

## gold-analysis-extend  (前綴 `ext-`)

| 新 ID | 原 ID | 標題 | 狀態 |
|-------|-------|------|------|
| ext-T001.md | T001.md | 投資組合管理模塊 | done |
| ext-T002.md | T002.md | 告警通知系統 | done |
| ext-T003.md | T003.md | 決策回測系統 | done |
| ext-T004.md | T004.md | 報告生成系統 | done |
| ext-T005.md | T005.md | 多語言支持 | done |
| ext-T006.md | T006.md | 文檔撰寫與知識庫整合 | done |

## gold-analysis-improve  (前綴 `imp-`)

| 新 ID | 原 ID | 標題 | 狀態 |
|-------|-------|------|------|
| imp-T001.md | T001.md | 修正 gold-analysis 單位錯誤 | done |
| imp-T002.md | T002.md | TradingView 概要分頁 | done |
| imp-T003.md | T003.md | TradingView 新聞分頁 | done |
| imp-T004.md | T004.md | TradingView 技術分析分頁 | done |
| imp-T005.md | T005.md | TradingView 遠期曲線分頁 | done |
| imp-T006.md | T006.md | TradingView 季節性分頁 | done |
| imp-T007.md | T007.md | TradingView 合約分頁 | done |
| imp-T008.md | T008.md | "接 Yahoo Finance 歷史黃金報價，補足技術分析所需數據" | done |
| imp-T009.md | T009.md | "統一 SQLite 資料來源 + 台灣銀行 1 年歷史數據" | done |
| imp-T010.md | T010.md | "gold_bot_history.py 重構：DB自動建立 + gap-filling" | done |
| imp-T011.md | T011.md |  | done |
| imp-T012.md | T012.md | "gold_monitor_pro 架構重構：移除 SQLite 寫入，改用 tmp file 即時檢查" | done |

## gold-analysis-merge  (前綴 `mrg-`)

| 新 ID | 原 ID | 標題 | 狀態 |
|-------|-------|------|------|
| mrg-T001.md | T001.md | 合併 ~/gold-analysis 與 ~/Projects/gold-analysis 兩份本地副本 | done |

## gold-analysis-platform  (前綴 `plt-`)

| 新 ID | 原 ID | 標題 | 狀態 |
|-------|-------|------|------|
| plt-T001.md | T001.md | API 開發和文檔 | done |
| plt-T002.md | T002.md | 社區功能 | done |
| plt-T003.md | T003.md | 移動端應用（React Native） | done |
