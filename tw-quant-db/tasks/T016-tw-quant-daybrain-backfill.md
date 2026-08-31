---
id: T016
project: tw-quant-db
assignee: "pi"
priority: low
type: migration
status: done
depends_on: [T017]
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
created: 2026-08-30
updated: 2026-08-31
---

# T016 - Backfill from tw-quant-daybrain cache.db 

## 目標
回補 tw-quant-daybrain cache.db 的資料 (32 cache_entries) 到 core schema。

## 現況
- **tw-quant-daybrain**: `data/cache.db` 有 **32 cache_entries**，datasets:
  - calendar: 6, financials: 14, daily_kline: 5, taifex_history: 1
  - dividend: 1, esg: 1, institutional: 1, monthly_revenue: 1, valuation: 2

## 資料格式
- Table: `cache_entries` (key, dataset, data_date, value BLOB, created_at, expires_at, updated_at)
- value 為 base64-encoded JSON

## 驗收標準
- [ ] 從 tw-quant-daybrain/cache.db 匯入 calendar + financials 到 core
- [ ] 驗證: 回補資料 lineage 標 source_role='FALLBACK'
- [ ] 驗證: INSERT ON CONFLICT DO NOTHING — 不覆蓋 T017 的資料

## 備註
- T017 (tw-quant-mcp) 為主力回補 (4,818 rows); T016 為補充 (32 rows)
- 32 rows 規模小, 可與 T017 backfill_from_mcp.py 合併執行
- tw-quant-daybrain cache_entries schema 與 tw-quant-mcp 相同
