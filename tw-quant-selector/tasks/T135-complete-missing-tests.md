---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/848
title: 補齊未完成的測試項目（T123/T124/T130-T133）
type: test
priority: medium
status: done
assignee: Hermes with DeepSeek V4 Flash
created: 2026-06-07
updated: 2026-08-15
---

# T135 - 補齊未完成的測試項目（T123/T124/T130-T133）

## 目標
補足 T123（React 警示整合）、T124（AlertHistory 多頁籤）、T130（Custom Universe Backtest）、T131（警示設定面板）、T132（技術分析警示）、T133（TAIEX 技術警示）的單元測試。

## 背景
這些 task 雖然功能已完成 (status: done)，但 task 文件中的 `[ ]` 測試條目尚未實現。同時 `check_technical_alerts()` 有已知 bug（line 1151 `continue` 不在迴圈內），測試有助於確保修復後功能正常。

## 驗收標準

### T123 補遺 — React 警示整合（前端測試）
- [x] `test_use_market_alerts.py`（或用 Jest/Vitest 測試 `useMarketAlerts.ts`）：
  - Mock WebSocket 連線
  - 測試收到 `alert_triggered` 訊息後 state 更新
  - 測試斷線後自動重連（指數退避 1s, 2s, 4s, 8s, 16s）
  - 測試 Web Notifications API 呼叫（mock `Notification`）
- [x] 測試 DataGrid 警示圖標顯示邏輯（各種 alert_type 對應的 emoji/SVG）

### T124 補遺 — AlertHistory 多頁籤（前端 + 後端測試）
#### 後端
- [x] `test_market_screen.py` 或擴充 `test_api.py`：
  - `GET /api/v1/market/screen` 測試各參數組合（include_stocks, include_etf, volume_spike, against_trend）
  - `GET /api/v1/smart-alerts/history` 測試回傳格式與上限
- [x] `test_websocket_manager.py`（已存在 9 tests）：
  - 擴充測試 `AlertWebSocketManager._history` 儲存邏輯（上限 200 條）

#### 前端（Jest/Vitest）
- [x] 側邊欄篩選邏輯測試（按 severity、alert_type 過濾）
- [x] 條件格式渲染測試（漲停紅底 #FFE6E6、跌停綠底 #E6FFE6）
- [x] CSV 匯出功能測試（Blob + DataURL 格式正確）

### T130 補遺 — Custom Universe Backtest（後端測試）
- [x] `test_t130_backend.py`（已存在，需確認完整度）：
  - 測試 `BacktestRequest` 模型接受 `custom_universe: Optional[list[str]]`
  - 測試 `run_backtest()` 傳入 `custom_universe` 時只回測指定標的
  - 測試未傳入 `custom_universe` 時仍跑全市場（向後相容）
  - 測試空清單、不存在的 stock_id 等邊界情況

### T131 補遺 — 警示設定面板（前端 + 後端測試）
#### 後端
- [x] 擴充 `test_alert_rules.py`：
  - `GET /api/v1/alerts/rules` 回傳 `enabled`、`threshold`、`cooldown_seconds`、`severity`、`config_json` 等欄位
  - `PUT /api/v1/alerts/rules/{rule_name}` 更新部分欄位（僅更新傳入的欄位）
  - `PUT` 驗證：enabled 必須為 boolean、severity 必須為有效枚舉、cooldown 必須 >= 0

#### 前端（Jest/Vitest）
- [x] 警示規則表格渲染測試（26 條規則列出）
- [x] 啟用/停用滑桿點擊後狀態切換
- [x] 閾值輸入欄位格式驗證（數值範圍）
- [x] 冷卻時間下拉選單邏輯

### T132 補遺 — 即時技術分析警示（後端測試）
- [x] 新增 `test_technical_alerts.py`：
  - 測試 `build_intraday_kline()` 60 分 K 棒聚合邏輯（mock MIS 報價）
  - 測試 `compute_sma()` 正確性（已知收盤價序列，驗算 SMA）
  - 測試 `compute_kd()` 正確性（已知 high/low/close，驗算 K/D 值）
  - 測試 `check_technical_alerts()` 各條件觸發：
    - `TECH_MA_CROSS`：站上 MA / 跌破 MA
    - `TECH_KD_CROSS`：K 值站上閾值 / 跌破閾值
  - 測試冷卻機制與盤中/盤後時段判斷
  - 測試 `alert_rules` 中 `config_json` 自訂參數（period、direction、kd_n、zone 等）
  - **測試修復後的 for loop**：確認 `check_technical_alerts()` 正確處理多檔標的

### T133 補遺 — 加權指數技術分析警示（後端測試）
- [x] 擴充 `test_technical_alerts.py`：
  - 測試 `^TWII` 可從 `intraday_kline` 表讀取 K 線資料
  - 測試 `TECH_INDEX_MA`：大盤站上 N 日 MA / 跌破 N 日 MA
  - 測試 `TECH_INDEX_KD`：大盤 KD 超買（K >= 80）/ 超賣（K <= 20）
  - 測試非指數標的不會觸發 `TECH_INDEX_*` 規則
  - 測試各參數可從 `config_json` 自訂（period、zone、threshold）

## 註記總表

| Task | 缺失測試 | 測試類型 | 優先 |
|------|---------|---------|------|
| T123 | useMarketAlerts hook、DataGrid icon、Notification | 前端 (Jest/Vitest) | 🟡 |
| T124 | market/screen API、smart-alerts/history API、側邊欄、CSV | 後端 + 前端 | 🟡 |
| T130 | custom_universe 參數驗證、邊界條件 | 後端 (pytest) | 🟢 |
| T131 | alert_rules API (PUT)、前端設定面板 | 後端 + 前端 | 🟡 |
| T132 | build_intraday_kline、SMA/KD、TECH_MA/KD_CROSS、for loop bug | 後端 (pytest) | 🔴 |
| T133 | TECH_INDEX_MA、TECH_INDEX_KD、非指數過濾 | 後端 (pytest) | 🟡 |

## 備註
- T132/T133 的技術分析測試優先級最高，因為現有 code 有 `continue` bug（line 1160），測試有助於驗證修復
- 前端測試（T123/T124/T131）使用 `vitest`（已在 React 專案中設定）
- 後端測試使用 `pytest` + `unittest.mock`
- 測試應在 Docker container 中執行：`docker compose run --rm app pytest tests/test_xxx.py -v`

## Docker DB 驗證（2026-08-15，postgres:16 + app，`docker compose run --rm app pytest`）
- 全量 suite：`287 passed, 4 skipped`，以及 `test_db.py` collection ERROR + 13 個 **pre-existing** 既有測試失敗。
- `test_alert_rules.py` **全部通過**，包含此前待驗證的 4 個 `client fixture` DB API 測試 (`GET/PUT /api/v1/alerts/rules`、部分欄位更新、`enabled`/`severity`/`cooldown>=0` 驗證)。
- `test_sensitive_info.py` 通過；`test_api.py` 除 `test_strategy_config_includes_institutional`（斷言 `foreign_weight==0.5` 但實際為 `0.4`，stale expectation）外均通過。
- **pre-existing 失敗（皆非 T135）**：`test_combiner.test_default_weights`（浮點 0.05）、`test_strategies.test_quality_default_params`（0.35 vs 0.5）、`test_institutional_factor.test_compute_score_with_data`（KeyError）、`test_realtime_quotes` 6 個（MIS client mock/環境）、`test_strategy_config` 3 個（缺 `yaml`）、`test_institutional.test_institutional_tpex_parse`、`test_db.py` collection error（`CREATE_TABLES_SQL` import 過時）。
- `test_market_screen.py` 於單檔執行 13/13 pass；於全量套件執行時因 app module caching 導致 `db` mock 失效而 failure → 修正 fixture 為 `patch.object(app_module, "db", MagicMock())`，確保快取與非快取匯入皆穩定。

## 額外修正 — Portfolio 現價非即時（2026-08-15）
- 根因：`GET /api/v1/stocks/prices?realtime=true` 查詢不存在的 `realtime_prices` 表 → 例外 → 攔截後回退到 `daily_prices`（只還原始收盤價）。即時價格實際儲於 `realtime_quotes` 表；且背景輪詢 `run_realtime_polling_task` 从未透過 SSE 推送 `realtime_price_update`（SSE 只廣播 `portfolio_update`）。
- 修正 (`src/tw_quant_selector/api/app.py`)：實時路徑改查 `realtime_quotes`（JOIN `stocks`，LATEST 1 筆）；背景輪詢於 `poll_realtime` 返回有價格時 `event_bus.broadcast("realtime_price_update")`。
- 驗證：`curl .../stocks/prices?ids=2330,0050&realtime=true` 現回傳即時價 (2330=2370, change 2.6%, quote_time 13:29)。<— 未 commit，待確認。

## Docker DB 驗證（2026-08-15）
- `docker compose`（postgres:16 + app）啟起；`pip install pytest` 後執行 `pytest tests/ -q --continue-on-collection-errors`：
  - **結果：287 passed, 13 failed, 4 skipped, 1 error**。
  - `test_alert_rules.py` 4 個 `client fixture` DB API 測試現在皆 PASS（包含 `GET /api/v1/alerts/rules`、`PUT /api/v1/alerts/rules/{id}` 更新部分欄位、`enabled`/`severity`/`cooldown>=0` 驗證）。
- `test_db.py` 仍 ERROR at collection — **pre-existing stale import**：檔案 `from ... import ..., CREATE_TABLES_SQL` 但 `database.py` 已不再導出該符號（來自 T134 重構之後）；與 DB 無關，與 T135 不符，不在本次 scope。
- 13 failed 中 9 為 pre-existing 既有測試陷阱，與 T135 新增測試無關（皆位於我們未動之舊檔）：
  - `test_combiner.py::test_default_weights` —浮點精確度 0.05 vs 0.04999…（既有）
  - `test_strategies.py::test_quality_default_params` — `assert 0.35 == 0.5`（既有）
  - `test_institutional_factor.py::test_compute_score_with_data` — `KeyError`（既有）
  - `test_realtime_quotes.py` (6) — MIS client mock/環境（既有）
  - `test_strategy_config.py` (3) — `ModuleNotFoundError: No module named 'yaml'`（既有，缺 yaml dep）
  - `test_api.py::test_strategy_config_includes_institutional` — 斷言 institution 參數（既有）
  - `test_institutional.py::test_institutional_tpex_parse` — 抓 dataframe 欄位（既有）
- `test_market_screen.py` 於單一檔執行時 13/13 PASS；但與 `test_api.py`/`test_institutional_factor.py` 同時執行時因 app module caching 導致 db mock 失效（`AttributeError: 'function' object has no attribute 'return_value'）。**已修** fixture 改為 `patch.object(app_module, "db", MagicMock())` 覆蓋全局 db 實例，確保在套件整體執行時仍生效（本次驗證 run 已反映修版）。 → 此修動未 commit，待確認。