---
github_issue: ""
title: 引入台灣交易日曆（假日表＋盤後就緒時間）
type: feature
priority: medium
status: done
depends_on: ["T029-fix-trading-day-default.md"]
assignee: pi with opencode/x-preview-f-free
created: 2026-08-22
updated: 2026-08-22
---

# T031 - 引入台灣交易日曆（假日表＋盤後就緒時間）

## 目標
延續 T029 的簡易週末判斷，引入完整的台灣交易日曆機制：
1. **假日表整合**：`_get_latest_market_date()` 目前只跳過週末，遇到國定假日／颱風休市會誤判（如週一假日 → 誤跑上週五資料或當天空跑）。改為依據交易日曆回傳「真正的最近交易日」。
2. **盤後資料就緒時間**：目前任何時間執行都視為「當日資料已存在」。台股 13:30 收盤、資料實際就緒約在盤後（16:00 後，含結算與發布延遲）。收盤前執行 daily pipeline 應自動回推到前一個交易日，避免抓到不完整資料。
3. 日曆來源可選：`pandas_market_calendars`（XTAI）、TWSE 官方休市日 API/OpenAPI、或自訂 YAML 假日表（`config/holidays.yaml`），需可離線運作（有 fallback）。

## 驗收標準
- [x] 新增交易日曆模組 `universe/trading_calendar.py`，提供 `is_trading_day(d)` / `previous_trading_day(d)` / `latest_ready_market_date(now)` 介面
- [x] 假日表來源：TWSE 官方休市日曆（holidaySchedule API，`refresh_from_twse()`）＋自訂 YAML 假日表（`config/holidays.yaml`）離線 fallback
- [x] 假日表更新機制：`python -m universe.trading_calendar --update [--year YYYY]`（手動/排程）；年度換新過期警告（不含當年時 log 警告一次）
- [x] `_get_latest_market_date()`（`cli/main.py`、`scripts/auto_daily.py`）改用交易日曆：跳過週末＋國定假日＋臨時休市（兩處邏輯收斂至日曆模組）
- [x] 盤後就緒邏輯：13:30 收盤、預設 16:00 後才就緒；就緒前回傳前一交易日（`TRADING_DATA_READY_HOUR` env 可覆蓋）
- [x] `scripts/auto_daily.py` 整合：非就緒時間自動改跑前一交易日（log 說明原因）
- [x] 單元測試 22 例：週末、元旦/春節/颱風假樣本、跨年、13:30/16:00 邊界、env 覆蓋、YAML 損毀容錯、過期警告、TWSE 更新成功/失敗保留舊快取
- [x] 整合驗證：CLI 不帶 `--date` 於假日（實測週六）→ 正確回推週五；auto_daily 委派測試；既有 T029 測試同步擴充為日曆版（10 例）
- [x] 文件：`docs/trading_calendar.md`（假日表格式、更新流程、資料來源比較、env 覆蓋設定）

## 完成摘要（2026-08-22）
- 新增 `universe/trading_calendar.py`：TradingCalendar（YAML 快取載入/落盤、staleness 過期警告、latest_ready_market_date 盤後就緒回推、refresh_from_twse 官方休市日更新）、模組單例 + `python -m` 更新入口
- 新增 `config/holidays.yaml`：2026~2027 國定假日種子表（13 天，僅列平日休市）
- 整合：`cli/main.py` / `scripts/auto_daily.py` `_get_latest_market_date()` 改委派日曆；`pipeline_runner.run()` market_date fallback 也改用之
- env 覆蓋：`TRADING_DATA_READY_HOUR`（預設 16）
- 測試：`tests/unit/test_trading_calendar.py` 22 例 + 重寫 `test_trading_day_default.py` 10 例（凍結時鐘 fixture 注入日曆）
- 文件：`docs/trading_calendar.md`
- 人工驗證：本機實測週六 14:03 執行 → CLI 預設 = 2026-08-21（週五）；假日表正確載入
- 品質閘門：ruff 通過（僅存 tw-quant-mcp 既有問題）、pytest unit 全綠（667 passed）

## 備註
- 現況程式碼位置：`_get_latest_market_date()` 在 `cli/main.py:41`（回傳 str ISO）與 `scripts/auto_daily.py`（回傳 date）；兩處邏輯應收斂到單一日曆模組，避免重複實作
- 盤後就緒時間需考慮：MOPS/OpenAPI 資料發布延遲不同（價格 ~14:00、財報/月營收更晚）；可先統一 16:00，後續再細分 per-source 就緒時間
- 颱風假等臨時休市無法事先寫死於 YAML——依賴官方來源動態查詢；YAML 只作為離線保底（至少涵蓋國定假日）
- 風險：pandas_market_calendars 的 XTAI 日曆不一定包含臨時休市；TWSE 來源格式可能變動，需保留 fallback 鏈
- 相關檔案：`cli/main.py`、`scripts/auto_daily.py`、`config/`、`pipeline_runner.py`（market_date 預設）、`tests/unit/test_trading_day_default.py`（既有測試需同步擴充）
