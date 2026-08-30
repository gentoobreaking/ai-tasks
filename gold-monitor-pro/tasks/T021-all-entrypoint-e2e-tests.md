---
github_issue: ""
title: 所有入口點的 e2e 煙霧測試
type: test
priority: high
status: done
depends_on:
  - T002
  - T003
  - T012
  - T013
assignee: "pi with opencode"
created: 2026-08-30
updated: 2026-08-30
---

## 目標

專案有三個真實執行入口，但所有測試皆為元件級（直接呼叫內部方法、mock 外部依賴），缺少從真實入口啟動、走完完整鏈路並斷言可觀察副作用的 e2e 煙霧測試。本任務補齊三大入口的入口級測試：

1. **gold_local_monitor.py --check**：台銀黃金存摺監控
2. **gold_intl_monitor.py --check**：國際金屬（金/銀/鉑）監控
3. **history_api.py**：HTTP API Server（/health, /api/v1/latest, /api/v1/history）

## 驗收標準

### 共同要求
- [x] 測試可在 CI/無頭環境執行（不依賴外部網路，僅讀取既有快取檔 `/tmp/gold_monitor_*.json`）
- [x] 測試使用 `subprocess.Popen` 啟動真實進程，驗證 exit code 與副作用
- [x] `make test` 能自動跑到所有 e2e 測試並通過

### 入口 1：gold_local_monitor.py --check
- [x] 新增測試檔 `tests/test_e2e_local_monitor.py`
- [x] 執行前確保 `/tmp/gold_monitor_local_baseline.json` 存在（或由測試建立 mock cache）
- [x] 執行 `python3 src/gold_local_monitor.py --check`，斷言：
  - 進程 exit code = 0
  - stdout 含 `台銀黃金存摺` 或 `📊` 關鍵字
  - `/tmp/gold_monitor_local_baseline.json` 被更新（內容符合 LocalGoldPrice 結構）

### 入口 2：gold_intl_monitor.py --check
- [x] 新增測試檔 `tests/test_e2e_intl_monitor.py`
- [x] 執行前確保 `/tmp/gold_monitor_intl_*.json` 存在（或由測試建立 mock cache）
- [x] 執行 `python3 src/gold_intl_monitor.py --check`，斷言：
  - 進程 exit code = 0
  - stdout 含 `國際黃金現貨`、`國際白銀現貨`、`國際鉑金現貨` 或 `🌐` 關鍵字
  - `/tmp/gold_monitor_intl_gold.json`、`_silver.json`、`_platinum.json` 至少有一個被更新

### 入口 3：history_api.py (HTTP Server)
- [x] 新增測試檔 `tests/test_e2e_api_server.py`
- [x] 測試啟動 `python3 src/history_api.py` 背景行程，等待 port 8080 就緒
- [x] 發送 `GET http://localhost:8080/health`，斷言：
  - HTTP 200
  - JSON `{"status": "ok", "metals": {...}, "sources": {...}}`，`metals` 至少包含 `gold_local`、`gold_intl`、`silver_intl`、`platinum_intl`
- [x] 發送 `GET http://localhost:8080/api/v1/latest`，斷言回應結構含各金屬最新價格
- [x] 發送 `GET http://localhost:8080/api/v1/history/gold_local?days=1`，斷言回應為陣列且每筆含 `timestamp`、`buy`、`sell`
- [x] 測試結束正確終止背景行程（`terminate()` + `wait()`）

## 執行紀錄
- 2026-08-30 完成三個 e2e 測試檔實作並驗證通過
- 測試檔位置：
  - `tests/test_e2e_local_monitor.py` (5117 bytes)
  - `tests/test_e2e_intl_monitor.py` (4560 bytes)
  - `tests/test_e2e_api_server.py` (9060 bytes)
- 所有測試使用 mock cache，不依賴外部網路，可在 CI/無頭環境執行
- 符合 Step 2.5-D 入口級煙霧測試規則：從真實入口啟動 → 走完完整鏈路 → 斷言可觀察副作用