---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/836
title: strategy_config_history 表初始化
type: feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Pro
created: 2026-06-02
updated: 2026-06-07
howto: |
  1. 确认 T102 migration 已创建 strategy_config_history 表
  2. 创建 scripts/seed_default_strategy_config.py
  3. 实现 load_default_config() 读取默认六因子配置
  4. 实现 save_config_snapshot() 写入 PostgreSQL strategy_config_history 表
  5. 实现週度快照排程（每周一 08:00 执行）
---

# T127 - strategy_config_history 表初始化

## 目标
初始化 `strategy_config_history` 表，记录每次策略配置变更的快照，支援策略回滚和版本比对。

## 验收状态：✅ 已完成 (2026-06-07)

> 注意：实际 T102 schema 栏位为 weights/advanced_params/guru_config/universe_config/changed_by/note，
> 与原始 spec 稍有出入（config_json → 拆分为 4 个 JSONB 栏位），实现已适配实际 schema。

## 验收标准
- [x] 确认 `strategy_config_history` 表已在 T102 migration 中创建 ✅（实际 schema：config_id/weights/advanced_params/guru_config/universe_config）

- [x] 创建 `scripts/seed_default_strategy_config.py` ✅
  - [x] 实现 `load_default_config()` → 读取 YAML
  - [x] 实现 `save_config_snapshot(config_dict, as_of_date)` → 写入 DB + 同日去重
  - [x] 实现 `run_seed()` → 写入今日默认配置快照

- [x] 实现週度快照排程 ✅
  - [x] `scripts/snapshot_strategy_config.sh`（周一 08:00，周末跳过）

- [x] 实现策略配置变更自动记录 ✅
  - [x] `PUT /api/v1/strategy/config`：先快照旧配置再写 YAML
  - [x] `GET /api/v1/strategy/config`：从 YAML 读取当前配置
  - [x] `GET /api/v1/strategy/config/history`：查询 DB 变更历史

- [x] 新增 `.env` 配置 ✅（STRATEGY_CONFIG_HISTORY_ENABLED / CRON）

- [x] 单元测试 ✅（10 tests pass）：YAML 加载、DB 写入/去重、週度触发、API 校验

## 备注
- 参考 Streamlit.md §6.1 新增资料表清单（strategy_config_history）
- 用途：
  1. 策略配置版本控制（可回滚至任一历史版本）
  2. 策略绩效回溯测试（使用历史配置）
  3. 策略配置变更审计（谁在什么时候改了什么）
- 快照频率：每周一次（每周一），加上每次手动变更时自动记录
- ⚠️ **依赖 T102（Schema 迁移）**，需先完成 PostgreSQL schema 创建
- ⚠️ **依赖 T113（策略设定 UI 新增法人因子）**，需先完成 API 端点 `PUT /api/v1/strategy/config`
