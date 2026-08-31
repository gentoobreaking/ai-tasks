---
id: T005
project: tw-quant-db
assignee: "pi"
priority: medium
type: migration
status: done
depends_on: [T069, T070, T071]
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
---

## 目標
建立 tw-quant-db/docker-compose.yml 共享 PostgreSQL 叢集，
並執行 Phase 3（收斂與優化）：拆除 view 相容層、建立分區索引、權限收斂、
備份監控。

## 驗收標準
- [ ] `docker-compose.yml` 建立共享 PostgreSQL 16，5 schemas: core, pickup, signal, audit
- [ ] init script 自動建立 schema + core DDL
- [ ] Phase 3: 拆除 `core.v_*_stock` views（selector 程式碼已全面改用 symbol）
- [ ] `daily_prices` range partition (monthly) + BRIN 索引
- [ ] 權限收斂：各 service account 僅具備所需 schema 權限
- [ ] 備份設定：每日 `pg_dump` + 異地備份
- [ ] 文件化：ERD、data dictionary、migration SOP

## 備註
- 原則：core 表唯一寫入者為 pickup 攝取管線
- core schema 變更須觸發三專案測試套件 CI job
