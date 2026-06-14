---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/848
title: 補齊未完成的測試項目（T123/T124/T130-T133）
type: test
priority: medium
status: pending
assignee: Hermes with DeepSeek V4 Flash
created: 2026-06-07
updated: 2026-06-07
---

# T135 - 補齊未完成的測試項目（T123/T124/T130-T133）

## 目標
補足 T123（React 警示整合）、T124（AlertHistory 多頁籤）、T130（Custom Universe Backtest）、T131（警示設定面板）、T132（技術分析警示）、T133（TAIEX 技術警示）的單元測試。

## 背景
這些 task 雖然功能已完成 (status: done)，但 task 文件中的 `[ ]` 測試條目尚未實現。同時 `check_technical_alerts()` 有已知 bug（line 1151 `continue` 不在迴圈內），測試有助於確保修復後功能正常。

## 驗收標準

### T123 補遺 — React 警示整合（前端測試）
- [ ] `test_use_market_alerts.py`（或用 Jest/Vitest 測試 `useMarketAlerts.ts`）：
  - Mock WebSocket 連線
  - 測試收到 `alert_triggered` 訊息後 state 更新
  - 測試斷線後自動重連（指數退避 1s, 2s, 4s, 8s, 16s）
  - 測試 Web Notifications API 呼叫（mock `Notification`）
- [ ] 測試 DataGrid 警示圖標顯示邏輯（各種 alert_type 對應的 emoji/SVG）

### T124 補遺 — AlertHistory 多頁籤（前端 + 後端測試）
#### 後端
- [ ] `test_market_screen.py` 或擴充 `test_api.py`：
  - `GET /api/v1/market/screen` 測試各參數組合（include_stocks, include_etf, volume_spike, against_trend）
  - `GET /api/v1/smart-alerts/history` 測試回傳格式與上限
- [ ] `test_websocket_manager.py`（已存在 9 tests）：
  - 擴充測試 `AlertWebSocketManager._history` 儲存邏輯（上限 200 條）

#### 前端（Jest/Vitest）
- [ ] 側邊欄篩選邏輯測試（按 severity、alert_type 過濾）
- [ ] 條件格式渲染測試（漲停紅底 #FFE6E6、跌停綠底 #E6FFE6）
- [ ] CSV 匯出功能測試（Blob + DataURL 格式正確）

### T130 補遺 — Custom Universe Backtest（後端測試）
- [ ] `test_t130_backend.py`（已存在，需確認完整度）：
  - 測試 `BacktestRequest` 模型接受 `custom_universe: Optional[list[str]]`
  - 測試 `run_backtest()` 傳入 `custom_universe` 時只回測指定標的
  - 測試未傳入 `custom_universe` 時仍跑全市場（向後相容）
  - 測試空清單、不存在的 stock_id 等邊界情況

### T131 補遺 — 警示設定面板（前端 + 後端測試）
#### 後端
- [ ] 擴充 `test_alert_rules.py`：
  - `GET /api/v1/alerts/rules` 回傳 `enabled`、`threshold`、`cooldown_seconds`、`severity`、`config_json` 等欄位
  - `PUT /api/v1/alerts/rules/{rule_name}` 更新部分欄位（僅更新傳入的欄位）
  - `PUT` 驗證：enabled 必須為 boolean、severity 必須為有效枚舉、cooldown 必須 >= 0

#### 前端（Jest/Vitest）
- [ ] 警示規則表格渲染測試（26 條規則列出）
- [ ] 啟用/停用滑桿點擊後狀態切換
- [ ] 閾值輸入欄位格式驗證（數值範圍）
- [ ] 冷卻時間下拉選單邏輯

### T132 補遺 — 即時技術分析警示（後端測試）
- [ ] 新增 `test_technical_alerts.py`：
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
- [ ] 擴充 `test_technical_alerts.py`：
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