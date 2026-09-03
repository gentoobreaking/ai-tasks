---
github_issue: ""
title: "pickup: remove daily_prices backfill, delegate to tw-quant-db Go backfill"
type: refactor
priority: high
status: done
depends_on: ["tw-quant-db/T037"]
assignee: "pi"
created: "2026-09-02T03:49:41Z"
updated: "2026-09-02T03:49:41Z"
---

# T047 - pickup: remove daily_prices backfill, delegate to tw-quant-db Go backfill

## 目標
移除 Pickup 的 daily_prices 歷史回補與每日收集功能，將 core.daily_prices 寫入權完全移交給 tw-quant-db/backfill。Pickup 專注於指數/PCR/宏觀/籌碼/財報/股利/特徵運算/訊號生成。

## 驗收標準
- [x] 刪除 collectors/backfill.py (HistoricalBackfillCollector, McpKlineBackend, _ProgressFile, map_historical_row, is_quota_error)
- [x] 刪除 tests/unit/test_backfill.py
- [x] collectors/market.py:
  - 移除 collect_daily_quotes()、_normalize_quote_row()、_DAILY_PRICE_COLS
  - 保留 collect_indices()、collect_pcr()、collect_macro()、run() (僅指數/PCR/宏觀)
- [x] cli/main.py:
  - 移除 cmd_backfill_prices()、_split_symbols_by_market()
  - 移除 backfill-prices subcommand
  - 更新 CLI help docstring
- [x] Pipeline _run_collectors 仍呼叫 MarketCollector.run() (無 breaking change)
- [x] python3 -m py_compile collectors/market.py cli/main.py 通過
- [x] CLI help 不再顯示 backfill-prices
- [x] git commit: 28b6c06

## 備註
- 此任務依賴 tw-quant-db T037 (backfill 雙軌制 CANONICAL/FALLBACK)
- 架構變更後：每日排程需先跑 `./backfill -range 5Y` 再跑 `twquant daily`
- frontend/nginx.conf 變更 (proxy_pass host/port) 屬於獨立調整，未包含在本任務