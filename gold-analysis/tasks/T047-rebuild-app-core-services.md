---
id: T047
project: gold-analysis
source_project: gold-analysis-core
title: 重建 app.core + 缺失服務（price_service / decision_service / routes init 循環導入修復）
assignee: "pi with opencode/x-preview-f-free"
priority: high
type: feature
status: done
created: 2026-08-28
updated: 2026-08-28
estimate: 2天
depends_on:
  - T046
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
---

## 目標
重建完全缺失的 `app.core` 套件（`config` + `security`），補齊 `price_service` / `decision_service` 兩個被 `app.api.routes` 導入但不存在的服務，修復 `app.api.routes.__init__` 循環導入與缺失 `router`/`get_status` 導出。

## 驗收標準
- [x] `backend/app/core/config.py`：`CoreSettings`（JWT、Redis、`extra="ignore"`）
- [x] `backend/app/core/security.py`：`create_access_token`、`create_refresh_token`、`verify_token`、`get_password_hash`、`verify_password`（bcrypt + PyJWT）
- [x] `backend/app/core/__init__.py`：統一導出 7 個符號
- [x] `backend/app/services/price_service.py`：`PriceService`（`get_current_price`、`get_historical_prices`、`get_technical_indicators`，mock 實作）
- [x] `backend/app/services/decision_service.py`：`DecisionService`（`generate_recommendation`、`create_decision`、`execute_decision`、`get_decision_stats`，mock 實作）
- [x] `backend/app/api/routes/__init__.py`：內聯 `router` + `get_status`，移除不存在的 `community` 導入，避免循環導入
- [x] 新增依賴：`passlib[bcrypt]`、`pyjwt`、`pydantic[email]`、`slowapi`（已裝入 `backend/venv`）
- [x] `backend/tests/test_system_integration.py`：**24 passed**
- [x] `backend/tests/test_cleaners.py` + `test_data_pipeline.py`：**11 passed**
- [x] 根目錄子集 + 9 新測試：**42 passed** 總計

## 修改/新增檔案
- 新增：`backend/app/core/config.py`、`backend/app/core/security.py`、`backend/app/core/__init__.py`
- 新增：`backend/app/services/price_service.py`、`backend/app/services/decision_service.py`
- 修改：`backend/app/api/routes/__init__.py`（移除 `community`、內聯 `router`/`get_status`）
- 相關 commit：`bc57a7d`

## 備註
- `app.core.security` / `app.core.config` 為 auth routes/middleware 依賴，缺失導致 `test_system_integration.py` 4 項失敗
- `price_service` / `decision_service` 為 prices/decisions routes 依賴，缺失導致相同測試失敗
- `routes/__init__.py` 原導入同名模組 `app.api.routes.routes` 造成循環導入，改為內聯定義
- 所有服務採 mock 實作，供測試/開發環境使用；正式環境可替換為真實實作
- 相關 commit：`bc57a7d`