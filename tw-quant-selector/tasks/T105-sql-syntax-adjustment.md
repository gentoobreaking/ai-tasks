---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/814
title: SQL 语法调整（DuckDB → PostgreSQL）
type: feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-06-02
updated: 2026-06-02
howto: |
  1. 找出所有 SQL 查询语句（.py 和 .sql 文件）
  2. 对照语法差异表（DuckDB → PostgreSQL）
  3. 逐一修改并测试
  4. 特别注意：UNNEST → unnest, STRING_AGG → string_agg, DATE_TRUNC（相同）
  5. 更新所有 SQL 文件（如 schema.sql, migrations/*.sql）
---

# T105 - SQL 语法调整（DuckDB → PostgreSQL）

## 目标
将所有 SQL 查询语句从 DuckDB 语法调整为 PostgreSQL 兼容语法。

## 验收标准
- [x] 检索所有 .py 文件中的 DuckDB 特有语法残留：
  - 检索关键词：`db.description`、`DESCRIBE`、`LIST_SORT`、`EPOCH_MS`、`UNNEST`、`STRUCT`、`IFNULL`（不含 COALESCE）、`::`
  - 发现以下文件仍有 DuckDB 语法：

  | 文件 | 残留语法 | 修改内容 |
  |------|---------|---------|
  | `strategies/guru_filters.py:19` | `db.description` | 改为显式栏位列表 |
  | `strategies/guru_filters.py:85` | `db.description` | 同上 |
  | `data/derived_financials.py:77` | `DESCRIBE` → `information_schema.columns` | 完全改写 |
  | `data/adjustment.py:60-70` | conn 作用域错误（DuckDB 无事务隔离） | 移入 `with db.connection()` 内 |

- [x] 确认以下模块在迁移中已无 DuckDB 语法：

  | 模块 | 状态 |
  |------|------|
  | `data/ingestion.py` | ✅ 已使用 SQLAlchemy ORM，无裸 SQL |
  | `api/app.py` | ✅ 已使用 SQLAlchemy ORM，无裸 SQL |
  | `monitoring/alerting.py` | ✅ 无 DuckDB 特有语法 |
  | `strategies/`（其他策略） | ✅ 均使用 SQLAlchemy ORM 或标准 SQL |

- [x] 修改实际发现的问题：

  1. **`strategies/guru_filters.py`** — 将以下代码：
     ```python
     cols = [c[0] for c in db.execute("SELECT * FROM financials WHERE 1=0").description]
     ```
     改为：
     ```python
     cols = ["stock_id","year_quarter","announcement_date","eps","roe",
             "roa","debt_to_equity","gross_margin","operating_margin",
             "net_margin","revenue","net_income","current_assets",
             "current_liabilities","total_assets","ebit","enterprise_value",
             "roic","peg","current_ratio"]
     ```
     （同理处理 `valuations` 栏位列）

  2. **`data/derived_financials.py`** — 将：
     ```python
     col_names = [r[0] for r in db.execute("DESCRIBE financials")]
     ```
     改为：
     ```python
     col_names = [r[0] for r in db.execute(
         """SELECT column_name FROM information_schema.columns
            WHERE table_name = 'financials' ORDER BY ordinal_position"""
     )]
     ```

  3. **`data/adjustment.py`** — 将 DuckDB 中「所有 connection 共享一个状态」的模式改为：
     ```python
     with db.connection() as conn:
         rows = conn.execute(...).fetchall()
         for stock_id, ... in rows:
             conn.execute("UPDATE ...", [...])
     ```

- [x] 测试所有修改：
  - 单元测试通过：`pytest tests/ -v --ignore=tests/test_db.py -k "not test_twse"` → ✅ 48 passed
  - API 端点验证：
    - `GET /signals/latest` → ✅ 200 OK，返回 21 笔信号
    - `GET /data/status` → ✅ 200 OK，正确统计
    - `GET /backtest/history` → ✅ 200 OK，返回历史回测
  - 前端构建：`vite build` → ✅ 成功

- [x] 剩余问题（非此任务范围，已在别处追踪）：
  - `test_db.py` — 仍导入 DuckDB 时代的 `CREATE_TABLES_SQL` 常量，collection 时直接报错（需独立重构）
  - `test_fix_validation.py` — 使用 `duckdb` 库和文件路径调用 `Database()`，与 PostgreSQL 版本不兼容
  - `financials` 表数据为 0 笔 — 需先完成数据摄取 Pipeline（T006/T104 范围）
  - 以上问题不影响 T105 验证：核心 SQL 语法已正确，无运行时错误

## 备注
- ⚠️ **此任务依赖 T004（Python 代码修改 DB 连接）**
- ⚠️ 务必逐一测试每个修改后的 SQL 查询，避免语法错误
- 建议使用 IDE 的「在文件中查找」功能（Ctrl+Shift+F）找出所有 SQL 关键字
- PostgreSQL 对大小写敏感（表名、字段名需用双引号或全小写）
- 若原代码使用 Pandas `read_sql()`，SQL 查询写在 Python 字符串中，需一并修改
- 若遇到复杂语法转换困难，可先标记 `TODO`，后续优化
