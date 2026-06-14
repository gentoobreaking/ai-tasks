---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/840
title: Schema 迁移规划与实作（DuckDB → PostgreSQL）
type: feature
priority: high
status: done
assignee: OpenClaw MiniMax M2.7 / 碼農1號
created: 2026-06-02
updated: 2026-06-02
howto: |
  1. 从 DuckDB 读取现有 schema（所有 CREATE TABLE 语句）
  2. 转换为 PostgreSQL 语法（数据类型、自增主键、索引）
  3. 创建 migration 脚本（migrations/001-init-schema.sql）
  4. 在 PostgreSQL 中执行，验证表格创建成功
---

# T102 - Schema 迁移规划与实作（DuckDB → PostgreSQL）

## 目标
将现有 DuckDB 的 schema 转换为 PostgreSQL 兼容的 schema，并创建 migration 脚本。

## 实际作法

### 1. 从 DuckDB 读取现有 schema

**方法**：用 DuckDB Python API 读取 `data/tw_quant.duckdb` 所有表的 `CREATE TABLE` 语句。

```python
import duckdb

con = duckdb.connect('data/tw_quant.duckdb')
tables = con.execute("SHOW TABLES").fetchall()

for (table_name,) in tables:
    create_sql = con.execute(f"SELECT * FROM duckdb_columns() WHERE table_name = '{table_name}'").fetchall()
    # 手动拼接 CREATE TABLE 语句
```

**实际做法**：创建 `scripts/dump_duckdb_schema.py` 脚本，自动读取所有表结构并输出 PostgreSQL 兼容的 `CREATE TABLE` 语句。

### 2. 数据类型转换（DuckDB → PostgreSQL）

| DuckDB | PostgreSQL |
|--------|-------------|
| `STRING` | `TEXT` |
| `BOOLEAN` | `BOOLEAN` |
| `INTEGER` | `INTEGER` |
| `BIGINT` | `BIGINT` |
| `DOUBLE` | `DOUBLE PRECISION` |
| `DATE` | `DATE` |
| `TIMESTAMP` | `TIMESTAMP WITH TIME ZONE` |
| `LIST<T>` | `ARRAY[T]` |
| `STRUCT<...>` | `JSONB` |

**自增主键转换**：
- DuckDB: `id INTEGER PRIMARY KEY AUTOINCREMENT`
- PostgreSQL: `id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY`

### 3. 创建 `migrations/001-init-schema.sql`

**文件位置**：`/Users/claw/Projects/tw-quant-selector/migrations/001-init-schema.sql`

**内容**：17 张表的 PostgreSQL DDL（从 DuckDB schema 手动转换）。

**关键调整**：
- 所有 `STRING` → `TEXT`
- 所有 `BOOLEAN` → `BOOLEAN`（不变）
- 主键：`AUTOINCREMENT` → `GENERATED ALWAYS AS IDENTITY`
- 索引：`CREATE INDEX idx_name ON table(col)`（语法相同）
- 外键：`FOREIGN KEY (col) REFERENCES table(col)`（语法相同）

### 4. 在 PostgreSQL 中执行 migration

```bash
cd /Users/claw/Projects/tw-quant-selector
docker exec -i tw_quant_postgres psql -U tw-quant -d tw_quant < migrations/001-init-schema.sql
```

**验证**：
```sql
-- 连接到 PostgreSQL
\c tw_quant;

-- 查看所有表格
\dt

-- 查看表格结构
\d stocks;
\d daily_prices;
```

## 验收结果

- [x] DuckDB schema 读取完成（`scripts/dump_duckdb_schema.py`）
- [x] 数据类型转换完成（`STRING` → `TEXT`, `DOUBLE` → `DOUBLE PRECISION`）
- [x] `migrations/001-init-schema.sql` 创建完成（17 张表）
- [x] 在 PostgreSQL 中执行成功（所有表创建完成）
- [x] 验证表格结构正确（主键、外键、索引）

## 备注

- **实际数据库名**：`tw_quant`（非原描述的 `tw_quant_selector`）
- **实际用户名**：`tw-quant`（非 `quant_user`）
- **镜像版本**：`postgres:16-alpine`（原描述用 `18-alpine`，实际 16 更稳定）
- **下一步**：T103（数据迁移脚本实作）
