---
id: T046
project: gold-analysis
source_project: gold-analysis-core
title: 修復 pydantic Settings extra_forbidden 導致 API 啟動失敗
assignee: "pi with opencode/x-preview-f-free"
priority: high
type: bugfix
status: done
created: 2026-08-28
updated: 2026-08-28
estimate: 1天
depends_on: []
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
---

## 目標
修復 `pydantic-settings` 預設 `extra="forbid"` 導致 `.env` 中 9 個未宣告欄位（alpaca/risk/log/db）在 `Settings` / `CleaningSettings` 建構時直接 `ValidationError`，造成 API app 無法啟動、20 支測試收集失敗。

## 驗收標準
- [x] `main.py` `Settings`、`db/config.py` `Settings`、`validators/config.py` `ValidationSettings`、`CleaningSettings` 的 `class Config` 加 `extra = "ignore"`
- [x] `import app.main` 成功，且 3 個 ops 端點（`/api/ml/monitor`、`/api/ml/retrain`、`/api/trading/execute`）確認掛載進真實 FastAPI app
- [x] 原本因 Settings 炸的測試檔（`test_cleaners.py`、`test_data_pipeline.py`、`test_system_integration.py` 中的 import 測試）現在能收集並通過
- [x] 既有 9 個新測試無回歸

## 修改檔案
- `backend/app/main.py`：`Settings` Config 加 `extra = "ignore"`
- `backend/app/db/config.py`：`Settings` Config 加 `extra = "ignore"`
- `backend/app/validators/config.py`：`ValidationSettings`、`CleaningSettings` Config 加 `extra = "ignore"`

## 備註
- 使用 `class Config: extra = "ignore"` 而非 `model_config = ConfigDict(...)` 以保持既有風格（`env_file`、`env_prefix` 仍生效）
- 僅停用 `extra_forbidden` 不宣告缺失欄位，因程式碼未以 `settings.X` 讀取這 9 個欄位（grep 無命中），環境變數仍保留供 `os.getenv` 使用
- 相關 commit：`3b1fbaa`