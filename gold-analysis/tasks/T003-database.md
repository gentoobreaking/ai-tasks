---
id: T003
project: gold-analysis
source_project: gold-analysis-core
title: 建立數據庫架構
assignee: "pi with opencode/x-preview-f-free"
priority: high
type: feature
status: done
created: 2026-04-07
updated: 2026-04-07
estimate: 3天
depends_on:
  - T001
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/202
---

## 目標
設計並實現完整的資料庫架構，包括 PostgreSQL 關聯式資料庫和 InfluxDB 時序資料庫。

## 驗收標準
- [ ] PostgreSQL 資料庫設計完成
- [ ] InfluxDB 資料庫設計完成
- [ ] SQLAlchemy ORM 模型建立
- [ ] Alembic 遷移腳本建立
- [ ] 資料庫連接配置完成
- [ ] Redis 快取配置完成

## 產出
| 檔案 | 路徑 | 說明 |
|------|------|------|
| 資料庫文檔 | `docs/DATABASE.md` | 完整資料庫架構說明 |
| PostgreSQL 配置 | `backend/app/db/postgres.py` | PostgreSQL 連接 |
| InfluxDB 配置 | `backend/app/db/influxdb.py` | InfluxDB 連接 |
| Redis 配置 | `backend/app/db/redis_client.py` | Redis 快取連接 |
| 資料庫模型 | `backend/app/models/*.py` | User, Portfolio, MarketData 等 |
| 遷移腳本 | `db/database.py` | Alembic 遷移 |
| 模型測試 | `backend/tests/test_db_models.py` | ORM 模型測試 |
| Postgres 測試 | `backend/tests/test_postgres.py` | 連接測試 |

## 子任務
- T003-A: 修復數據庫依賴問題（SQLAlchemy async、asyncpg、influxdb-client、redis、pydantic-settings）
- T003-B: 完善數據庫遷移腳本（PostgreSQL 表、索引、外鍵、InfluxDB bucket）
- T003-C: 數據庫模組測試（skip）

## 備註
Phase 1 資料層基礎。已拆分為 T003-A/B/C 子任務執行。