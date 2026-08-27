---
id: T006
project: gold-analysis
source_project: gold-analysis-core
title: 開發數據收集 Agent
assignee: 碼農 1 號
priority: high
type: feature
status: done
created: 2026-04-07
updated: 2026-04-08
estimate: 3天
depends_on: [T005]
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/212
---

## 目標
開發自動化數據收集 Agent，負責定時從各數據源獲取黃金價格、美元指數等市場數據。

## 驗收標準
- [ ] 數據收集 Agent 核心邏輯完成
- [ ] 多數據源輪詢機制實現
- [ ] 數據存儲到 PostgreSQL + InfluxDB
- [ ] 錯誤重試和降級機制
- [ ] 21/21 單元測試通過
- [ ] 代碼推送 GitHub

## 產出
| 檔案 | 路徑 | 說明 |
|------|------|------|
| 數據收集 Agent | `agents/data_collector.py` | 核心收集邏輯 |
| Agent 基礎類 | `backend/app/agents/base.py` | 重構後基礎類 |
| Agent 協調器 | `backend/app/agents/coordinator.py` | 協作調度 |
| 價格排程器 | `schedulers/price_scheduler.py` | 定時觸發 |
| API 路由 | `backend/app/api/routes.py` | REST API 端點 |
| 主應用 | `backend/app/main.py` | FastAPI 入口 |
| 數據工具 | `backend/app/tools/data_tools.py` | 數據處理工具 |
| 分析工具 | `backend/app/tools/analysis_tools.py` | 分析輔助工具 |
| 數據收集測試 | `tests/test_data_collector.py` | 21/21 測試通過 |

## 子任務
- T006-1: 處理 API 限流問題（滑動窗口、Alpha Vantage 5 calls/min）
- T006-2: 處理網絡超時問題（httpx timeout=30s）
- T006-3: 處理數據格式不一致問題（MarketData/HistoricalData dataclass 統一）

## 備註
Phase 2 數據收集層。首次實戰驗證：2026-04-08 09:00 成功觸發黃金價格告警（+158元）。