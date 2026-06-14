---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/848
title: 拆分大型檔案 alerting.py（模組化重構）
type: refactor
priority: medium
status: pending
assignee: Hermes with DeepSeek V4 Flash
created: 2026-06-07
updated: 2026-06-07
---

# T134 - 拆分大型檔案 alerting.py（模組化重構）

## 目標
將 `src/tw_quant_selector/monitoring/alerting.py`（1,342 行）拆分為多個模組，降低耦合、提升可維護性。

## 背景
`alerting.py` 目前包含：
- 通知管道：`TelegramNotifier`、`EmailNotifier`
- 通知格式：`format_alert()`
- 設定讀取：`get_alert_config()`
- 舊版警報管理：`AlertManager`
- 10 個 Pandas 向量化檢查函式（`check_volume_spike`、`check_whale_move` 等）
- `AlertChecker` 類別（包含系統健康檢查、法人警示、即時價格警示、智慧警示、技術分析警示）
- **已知 bug**：`check_technical_alerts()` 的 line 1151-1160 使用了 `continue` 但沒有對應的 for loop，導致 SyntaxError

## 驗收標準

### 步驟 1：建立模組結構
- [ ] 將 `monitoring/` 從單一 `alerting.py` 改為套件：
  ```
  monitoring/
    __init__.py          # 匯出對外 API（check_all, AlertChecker）
    notifiers.py         # TelegramNotifier, EmailNotifier, format_alert, get_alert_config
    base_checker.py      # AlertChecker 共用輔助（_check_cooldown, _log_history, _format_alert_message）
    system_checker.py    # check_db_connection, check_data_freshness, check_system_health, check_signals_empty
    institutional_checker.py  # check_institutional_alerts 及輔助方法
    price_checker.py     # check_price_alerts 及輔助方法
    smart_checker.py     # 10 個 Pandas 向量化檢查函式 + check_all_smart_alerts
    technical_checker.py # check_technical_alerts（含 TAIEX 規則/MA/KD）
    legacy.py            # AlertManager（舊版，保留相容性）
  ```

### 步驟 2：修復已知 bug
- [ ] `check_technical_alerts()`：line 1151 `is_index = stock_id == '^TWII'` 中的 `stock_id` 未定義 — 缺少 `for stock_id in kline_stocks:` 迴圈
- [ ] 修復後確認 `check_technical_alerts` 能正確逐檔掃描有盤中 K 線資料的標的

### 步驟 3：保留對外 API 相容性
- [ ] `monitoring/__init__.py` 匯出所有原本在 `alerting.py` 中的公開符號（`AlertChecker`, `AlertManager`, `format_alert`, `get_alert_config`, `check_volume_spike`, `check_whale_move` 等）
- [ ] 確保 `from tw_quant_selector.monitoring.alerting import AlertChecker` 仍可運作（或更新所有 import 點）
- [ ] 更新所有內部 import（`app.py`, `scheduler.py`, 測試檔案等）

### 步驟 4：功能驗證
- [ ] 所有 unit tests 通過（含既有 26+ 個 alert 測試）
- [ ] `check_all()` 仍可正確依序執行所有檢查
- [ ] container 可正常啟動，WebSocket/REST API 不受影響

### 步驟 5：清理
- [ ] 刪除舊的 `alerting.py`（或保留為 deprecated 橋接檔，標注 `@deprecated`）

## 備註
- 拆分時不做邏輯改動，純粹搬移程式碼 + 修正已知 bug
- `notifiers.py` 不依賴 DB（純傳送邏輯），方便獨立測試
- 向量化檢查函式（`check_volume_spike` 等）保持在 `smart_checker.py` 中頂層函式，便於直接 import 測試
- ⚠️ T132/T133 的新增技術分析邏輯是 bug 的來源，拆分時需一起測試