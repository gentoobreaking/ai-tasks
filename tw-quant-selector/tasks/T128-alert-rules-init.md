---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/837
title: alert_rules 表初始化（默认规则写入）
type: feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Pro
created: 2026-06-02
updated: 2026-06-07
howto: |
  1. 创建 migrations/003-alert-rules.sql（T102 未建此表）
  2. 新增 models.py AlertRule 模型
  3. 重写 scripts/seed_alert_rules.py（26→27条规则，含 --force）
  4. 新增 API: GET /api/v1/alerts/rules, PUT /api/v1/alerts/rules/{rule_name}
  5. docker-compose.yml: app.depends_on.postgres 加入健康检查条件
---

# T128 - alert_rules 表初始化（默认规则写入）

## 验收状态：✅ 已完成 (2026-06-07)

## 目标
初始化 `alert_rules` 表，写入所有警示规则的默认阈值和冷却时间，供警示引擎读取。

## 验收标准
- [x] 确认 `alert_rules` 表：通过 migration `003-alert-rules.sql` 创建（T102 未创建此表，因此新建 migration）
  - 栏位：rule_name (VARCHAR, PK)
  - 栏位：enabled (BOOLEAN, DEFAULT TRUE)
  - 栏位：threshold (FLOAT)
  - 栏位：cooldown_seconds (INTEGER)
  - 栏位：severity (VARCHAR: 'LOW'/'MEDIUM'/'HIGH'/'CRITICAL')
  - 栏位：updated_at (TIMESTAMP)

- [x] 创建 `scripts/seed_alert_rules.py` ✅（重写）
  - [x] `get_default_rules()` → 27 条默认规则（5 类别）
  - [x] `upsert_alert_rules(rules)` → INSERT ON CONFLICT DO UPDATE
  - [x] `run_seed(force=False)` → upsert 不覆盖阈值
  - [x] `--force` CLI 参数：DELETE + REINSERT 全量覆写

- [x] 实现週度快照排程 ✅（script 已内建 scheduler 整合）

- [x] 实现策略配置变更自动记录 ✅

- [x] 新增 API 端点 ✅
  - [x] `GET /api/v1/alerts/rules`：读取所有规则（支援 ?enabled=true 过滤）
  - [x] `PUT /api/v1/alerts/rules/{rule_name}`：更新单条规则

- [x] 新增 `.env` 配置 ✅

- [x] 单元测试 ✅（14 tests pass）：规则格式、upsert 逻辑、force 覆写、API 查询/更新/校验

- [x] Docker 依赖 ✅：`docker-compose.yml` 加入 `app.depends_on.postgres: condition: service_healthy`

## 备注
- 参考 Streamlit.md §5.2 完整警示条件清单
- 参考 realtime-1.txt Section 4 智慧警示条件
- 阈值说明：
  - `threshold=None`：不适用（如 SYS_DB_UNREACHABLE）
  - `threshold=10.0`：10%（VOLUME_SPIKE 倍数）
  - `threshold=0.005`：0.5%（INST_HEAVY_BUY 流通股数比例）
- 冷却时间单位：秒（s）
- ⚠️ **本任务应在 T110/T111/T117/T122 之前执行**
- ⚠️ **依赖 T102（Schema 迁移）**，需先完成 PostgreSQL schema 创建
