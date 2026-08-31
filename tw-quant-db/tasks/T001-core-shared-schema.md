---
id: T001
project: tw-quant-db
assignee: "pi"
priority: high
type: migration
status: done
depends_on: []
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
---

## 目標
依據方案 C（core 共享 + 各專案獨立 schema），建立 tw-quant-db 專案下的 `core` schema，
並撰寫遷移腳本將 tw-quant-pickup 的 fact/raw tables 複製到 core schema。

## 驗收標準
- [ ] `core/schema.sql` 以 pickup 的 001_init_schema.sql 為基礎，保留 lineage 三欄（source/data_date/freshness） + source_role constraint
- [ ] `scripts/migrate_to_core.py` 可執行，建立 core schema + view 相容層（stock_id → symbol）
- [ ] 資料驗證：core.{stocks, daily_prices, financials, monthly_revenues, dividends, institutional_flow, market_context, universe_flags} 資料列數與 pickup 表一致
- [ ] 建立 `core.v_*_stock` views 供 selector 向後相容
- [ ] 所有 DDL/IDEMPOTENT 操作

## 備註
- pickup schema 保持原表格不動，僅新增 core schema
- migration 採 INSERT ON CONFLICT DO NOTHING（可中斷續跑）
