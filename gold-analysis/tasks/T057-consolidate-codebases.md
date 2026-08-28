---
id: T057
github_issue: ""
title: 統一代碼庫：以 backend/app 為唯一來源
project: gold-analysis
type: refactor
priority: medium
status: pending
depends_on: []
assignee: "pi"
created: 2026-08-28
updated: 2026-08-28
---

# T057 - 統一代碼庫：以 backend/app 為唯一來源

## 目標
專案同時存在兩套平行程式碼：根目錄的 `agents/`、`data_adapters/`、`db/`、`schedulers/`、`scripts/gold_monitor.py`、`ml_train_test.py`、`backend_mvp/`，與規範化的 `backend/app/`。來源不明確會導致重複 bug、維護混亂。需確立 `backend/app` 為唯一規範來源，棄用或遷移根目錄 legacy 模組。

## 驗收標準
- [ ] 盤點根目錄 legacy 模組與 `backend/app` 的重複功能，產出對應表
- [ ] 將仍被使用且 `backend/app` 缺失的能力遷入 `backend/app`（或確認 `backend/app` 已涵蓋）
- [ ] 根目錄 legacy 重複模組標記 `@deprecated` 或移入 `legacy/` 並從啟動路徑移除
- [ ] CI/啟動只依賴 `backend/app`；移除啟動時對根目錄 legacy 的隱性 import
- [ ] 文件記錄「規範來源 = backend/app」

## 備註
- 風險：遷移可能破壞尚在使用的舊腳本（如 `scripts/gold_monitor.py`），需先確認呼叫方。
- 參考：`/Users/david/Projects/gold-analysis/agents/`、`data_adapters/`、`db/`、`schedulers/`、`scripts/`、`backend_mvp/`。
