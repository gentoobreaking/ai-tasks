---
id: T055
github_issue: ""
title: 新增全域交易開關 (kill-switch) 與 pre-trade 風險閘門
project: gold-analysis
type: feature
priority: high
status: done
depends_on: []
assignee: "pi"
created: 2026-08-28
updated: 2026-08-28
---

# T055 - 新增全域交易開關 (kill-switch) 與 pre-trade 風險閘門

## 目標
目前風險規則存在（`trading/risk_rules.py`），但**決策→下單路徑上沒有全域主開關**。唯一保護是 `AlpacaExchange` 的 `ALPACA_PAPER` 環境變數與 `is_demo=True` 預設。一旦環境變數被切到 live，沒有任何集中式 `TRADING_ENABLED=false` / `--dry-run` 主開關在 `execution.execute_decision()` 下單前攔截，斷路器（DailyLossLimitRule）也未接入執行路徑。需補上硬式 kill-switch 與下單前風險閘門。

## 驗收標準
- [ ] 在 `core/config.py` 新增 `TRADING_ENABLED`（預設 False）與 `DRY_RUN` 設定
- [ ] `trading/execution.execute_decision()` 在最前方檢查：關閉或未 dry-run 時拒絕真實下單，僅 log/模擬
- [ ] 將 `DailyLossLimitRule` / `TradingFrequencyRule` 等斷路器整合進 `execute_decision` 的 pre-trade 檢查（BLOCK 即中斷）
- [ ] 提供啟用交易的明確雙重確認機制（如 env + 啟動 flag），避免誤開 live
- [ ] 補測試：關閉開關時不呼叫任何 exchange 下單；斷路器觸發時中斷

## 備註
- 這是資金安全的最高優先級項目（P0）。
- 參考：`backend/app/trading/execution.py`、`backend/app/trading/risk_rules.py`、`backend/app/core/config.py`。
- 即使 Alpaca 預設 paper，仍要防止「誤翻 env 直接 live」的災難場景。
