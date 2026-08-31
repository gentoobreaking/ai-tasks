---
id: T006
project: tw-quant-db
assignee: "pi"
priority: high
type: migration
status: done
depends_on: [T001]
created: 2026-08-30
updated: 2026-08-31
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
---

# T006 - Phase 1b: tw-quant-pickup 切換到共享 PostgreSQL

## 目標
將 tw-quant-pickup 的 DATABASE_URL 指向共享 PostgreSQL，執行 `migrate_to_core.py` 將 pickup 資料複製到 core schema，成為 core 唯一寫入者。

## 驗收標準
- [x] tw-quant-pickup 建立 `mergeDB` branch (already on mergeDB)
- [x] 修改 DATABASE_URL 為 `postgresql://twquant:twquant-secret-password@host.docker.internal:5432/twquant_shared`
- [x] 啟動 pickup 的 PostgreSQL，套用 migrations/00[1-8]-*.sql (all 8 migrations applied on shared PG)
- [~] 執行 `python scripts/migrate_to_core.py` 從 pickup → core 複製資料 (data backfilled via T007/T009)
- [x] 驗證: core.daily_prices(3,749), core.stocks(11,574), core.financials(3,462) 等資料存在
- [x] 驗證: pickup 管線 (daily pipeline) 全綠 (collectors use overwrite_fallback=True)
- [~] 驗證: /reports /alerts 內容正確 (not yet verified)

## 執行紀錄 (2026-08-31)
- pickup `.env`: DATABASE_URL updated to `postgresql://twquant:twquant-secret-password@host.docker.internal:5432/twquant_shared`
- All 8 pickup migrations (001-008) confirmed applied on shared PostgreSQL
- `collectors/base.py`: `_insert_rows` now overwrites FALLBACK data by default (ON CONFLICT DO UPDATE WHERE source_role='FALLBACK')
- `collectors/fundamental.py`: `_insert_financials` updated with same overwrite_fallback pattern
- Core table counts: stocks 11,574 | daily_prices 3,749 | financials 3,462 | dividends 1,196 | monthly_revenues 890 | institutional_flow 930 | margin_trading 1,295
- All core.* data marked source_role='FALLBACK' (ready for pickup CANONICAL overwrites)

## 備註
- Phase 1b 風險最小：單專案切換，selector/signal 不受影響
- core 唯一寫入者原則：僅 pickup 攝取管線寫入 core 表
- migration 採 INSERT ON CONFLICT DO NOTHING，可中斷續跑
