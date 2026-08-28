---
id: T053
github_issue: ""
title: 修復 ModelHealthChecker.health_check 未定義 `latest` 錯誤
project: gold-analysis
type: bug
priority: high
status: done
depends_on: []
assignee: "pi"
created: 2026-08-28
updated: 2026-08-28
---

# T053 - 修復 ModelHealthChecker.health_check 未定義 `latest` 錯誤

## 目標
`backend/app/ml/model_monitor.py` 中 `ModelHealthChecker.health_check()` 在第 98/99/112 行引用了 `latest["model_name"]` / `latest["version"]`，但 `latest` 只在私有方法 `_load_latest_model()` 內部定義，`health_check()` 中並未擷取。每次呼叫都會拋出 `NameError: name 'latest' is not defined`，導致整個模型健康/漂移監控迴圈完全失效（影響排程監控、T060 MLOps 監控回環）。

## 驗收標準
- [ ] `health_check()` 內正確取得 `latest = self.registry.get_latest()`（或讓 `_load_latest_model()` 回傳 `(model, latest)` 並於呼叫處解構）
- [ ] `ModelHealthChecker.health_check()` 在真實 registry 資料下不再拋 `NameError`
- [ ] 補充單元測試覆蓋 `health_check()` 正常路徑與 `latest` 為空（無模型）的邊界
- [ ] 執行 `ruff check app/ml/model_monitor.py` 無 F821 未定義名稱

## 備註
- 此為實際功能性 bug，優先級最高（P0）。
- `latest` 取不到時（registry 無模型）應回傳明確的 `UNKNOWN` / 跳過評估，而非崩潰。
- 相關：`app/ml/registry.py`（ModelRegistry）、`app/ml/feature_engineering.py`。
