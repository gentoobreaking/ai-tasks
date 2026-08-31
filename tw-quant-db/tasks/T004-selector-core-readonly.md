---
id: T004
project: tw-quant-db
assignee: "pi"
priority: medium
type: migration
status: done
depends_on: [T068]
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
---

## 目標
tw-quant-selector 在 `mergeDB` branch 上修改業務表遷入 selector schema，
並改用 core.* 表讀取行情/財報資料（唯讀消費者）。

## 驗收標準
- [ ] selector schema 建立：portfolio, lots, backtest_*, guru_scores, alert_*,
      realtime_quotes, ingestion_tracker, strategy_config_history, operation_logs
- [ ] 修改 selector 查詢：daily_prices/financials/monthly_revenue/stocks
      改從 core.* 表或 `core.v_*_stock` views 讀取
- [ ] 歷史資料 ETL 時 lineage 一律標 `FALLBACK`
- [ ] selector 的 stock_id → symbol 對應，程式碼分批改用 `symbol`
- [ ] 驗證：selector 可讀取 core.daily_prices，回測結果一致
- [ ] 平行驗證一週後，準備關閉 selector 自有重複攝取

## 備註
- selector 端先建 view 相容層（stock_id → symbol），程式碼分批改完再拆 view
- 此階段 selector 不寫入 core，只讀
- signal 可同期並行移植（T070）
