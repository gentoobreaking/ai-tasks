---
id: T002
project: gold-analysis
source_project: gold-analysis-core
title: 建立數據源集成
assignee: "pi with opencode/x-preview-f-free"
priority: high
type: feature
status: done
created: 2026-04-07
updated: 2026-04-07
estimate: 3天
depends_on:
  - T001
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/198
---

## 目標
集成黃金價格、美元指數、利率、通脹等數據源，為每個數據源編寫 API 適配器。

## 驗收標準
- [ ] Alpha Vantage 適配器完成
- [ ] Yahoo Finance 適配器完成
- [ ] FRED 適配器完成
- [ ] 統一數據模型定義完成

## 產出
| 檔案 | 路徑 | 說明 |
|------|------|------|
| 基礎適配器 | `backend/app/services/data_sources/base.py` | 滑動窗口速率限制、重試、緩存、統一模型 |
| Alpha Vantage | `backend/app/services/data_sources/alpha_vantage_adapter.py` | 黃金/外匯/指數 |
| Yahoo Finance | `backend/app/services/data_sources/yahoo_finance_adapter.py` | 黃金現貨/ETF |
| FRED | `backend/app/services/data_sources/fred_adapter.py` | 經濟指標 |

## 子任務
- T002-1: 處理 API 限流機制（滑動窗口、5 calls/min）
- T002-2: 實現錯誤重試機制（指數退避、max_retries=3）
- T002-3: 實現數據緩存機制（記憶體 LRU、TTL 300s）

## 備註
Phase 1 數據層基礎。