---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/819
title: 基础警示系统实作（资料新鲜度 + 系统健康）
type: feature
priority: high
status: done
assignee: gemini-3-flash-preview
created: 2026-06-02
updated: 2026-06-02
howto: |
  1. 扩展现有 monitoring/alerting.py 中的 AlertChecker 类别 (Done)
  2. 新增资料新鲜度警示 (DATA_PRICE_DELAY, DATA_INSTITUTIONAL_DELAY 等) (Done)
  3. 新增系统健康警示 (SYS_DB_UNREACHABLE, SYS_DISK_SPACE 等) (Done)
  4. 实现去重与冷却机制（使用 alert_cooldowns 表） (Done)
  5. 使用现有 TelegramNotifier 发送通知 (Done)
---

# T110 - 基础警示系统实作（资料新鲜度 + 系统健康）

## 目标
扩展现有警示系统，新增资料新鲜度监控和系统健康监控规则。

## 验收标准
- [x] 扩展现有 `monitoring/alerting.py` 中的 `AlertChecker` 类别：
  - 新增 `check_data_freshness()` 方法（检查股价和法人资料更新）
  - 新增 `check_system_health()` 方法（检查 DB 连线、排程器、磁碟空间）
  - 在 `check_all()` 中呼叫上述新方法
- [x] 新增以下警示规则：
  - `DATA_PRICE_DELAY`：交易日 19:00 後日 K 线资料仍未更新（HIGH, 冷却 1h）
  - `DATA_INSTITUTIONAL_DELAY`：交易日 18:30 後三大法人资料未更新（HIGH, 冷却 1h）
  - `DATA_PRICE_MISSING`：连续 3 个交易日日 K 线缺失（CRITICAL, 冷却 1d）
  - `SYS_DB_UNREACHABLE`：PostgreSQL 无法连线（CRITICAL, 冷却 5min）
  - `SYS_SCHEDULER_STOPPED`：排程器上次执行 > 25 小时前（CRITICAL, 冷却 1h）
  - `SYS_DISK_SPACE`：磁碟可用空间 < 10%（HIGH, 冷却 6h）
- [x] 实现去重与冷却机制：
  - 创建 `alert_cooldowns` 表（若不存在）：
    - 栏位：rule_name (VARCHAR PK), last_alert_time (TIMESTAMP), cooldown_seconds (INTEGER)
  - 在 `AlertChecker` 中新增 `_check_cooldown(rule_name)` 方法
  - 同一条警示在冷却期内不重复发送
- [x] 使用现有 `TelegramNotifier` 发送通知：
  - 无需重写，直接呼叫 `AlertManager.send_notification()`
  - 通知格式符合 Streamlit.md §5.3 规范（包含等级图示、建议行动）
- [x] 实现警示历史记录：
  - 创建 `alert_history` 表（若不存在）
  - 记录每次警示触发时间、等级、context 快照
- [x] 单元测试：
  - 测试冷却机制（模拟时间）
  - 测试去重逻辑
  - 测试各警示规则的触发条件

## 实施详情
- **核心逻辑**: 已在 `src/tw_quant_selector/monitoring/alerting.py` 中完整实作 `AlertChecker` 类别。
- **资料库**: 已在 `src/tw_quant_selector/data/models.py` 定义 `AlertHistory`, `AlertCooldown`, `AlertLog` 等 SQLAlchemy 模型，并迁移至 PostgreSQL。
- **冷却系统**: 使用 `alert_cooldowns` 表持久化记录，支持跨进程重启。
- **即时监控**: `scripts/check_live_alerts.py` 已整合 P/L 警示与 TWSE 即時行情 API。
- **单元测试**: 已建立 `tests/test_alerting.py`，涵盖冷却机制、警示格式化、DB 连线异常处理等测试，且已通过验证。


## 备注
- ⚠️ **本任务扩展现有代码**，而非重写：
  - 现有 `monitoring/alerting.py` 已实作 `AlertChecker.check_db_connection()`, `check_price_updates()`, `check_signals_empty()`
  - 需扩展 `AlertChecker`，新增本任务验收标准中的警示规则
  - 现有 `TelegramNotifier` 已实作（使用 httpx），无需重写
- 参考 Streamlit.md §5 智慧警示系统
- 通知格式：🚨 CRITICAL / ⚠️ HIGH / 📌 MEDIUM / 📊 LOW
- 需先完成 T108（法人 ingestion）才能让 T111（法人相关警示）正常运作
- 现有 T016 已实作部分警示，本任务需扩展并补全缺失的规则
- ⚠️ 数据库已迁移至 PostgreSQL，`SYS_DB_UNREACHABLE` 应检查 PostgreSQL 连线
