---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/820
title: 法人相关警示规则实作
type: feature
priority: medium
assignee: OpenCode DeepSeek V4 Flash
status: done
created: 2026-06-02
updated: 2026-06-04
howto: |
  1. 扩展 monitoring/alerting.py 中的 AlertChecker 类别
  2. 新增法人动向相关警示（INST_HEAVY_BUY, INST_HEAVY_SELL 等）
  3. 实现警示触发逻辑（依赖 institutional_flows 表）
  4. 更新 alert_rules 表新增法人相关规则
---

# T111 - 法人相关警示规则实作

## 目标
实现三大法人买卖超相关的警示规则，扩展智慧警示系统（M4）。

## 验收标准
- [x] 扩展 `AlertChecker`，新增以下法人相关警示规则（参考 Streamlit.md §5.2）：
  - `INST_HEAVY_BUY`：今日选股中有股票外資買超 > 流通股数 0.5%（LOW, 冷却 1d）
  - `INST_HEAVY_SELL`：持倉股票外資连续賣超 >= 5 天（MEDIUM, 冷却 1d）
  - `INST_DIVERGENCE`：选股分数高但外資连续賣超 >= 3 天（讯号衝突）（MEDIUM, 冷却 1d）
  - `INST_CONSEC_BUY`：任一股票三大连续買超 >= 10 天（LOW, 冷却 3d）
  - `INST_QUARTER_END`：距本季结束 <= 5 个交易日（投信作帐提醒）（LOW, 冷却 1週）
- [x] 实现警示触发逻辑：
  - 读取 PostgreSQL `institutional_flows` 表计算连续买卖超天数
  - 读取 `signals` 表获取今日选股和持倉
  - 计算外資買超股数 / 流通在外股数
- [x] 更新 `alert_rules` 表：
  - 插入法人相关警示规则的默认配置
  - 设置默认阈值和冷却时间
- [x] 实现 `INST_DIVERGENCE` 衝突检测逻辑：
  - 选股分数 > 1.0（Z-score）
  - 外資连续賣超 >= 3 天
  - 触发时包含衝突说明和建议行动
- [x] 单元测试：
  - 测试各警示规则的触发条件
  - 测试连续买卖超天数计算
  - 测试衝突检测逻辑

## 备注
- 参考 Streamlit.md §5.2 完整警示条件清单（类别 C：法人动向）
- ⚠️ **依赖 T108（institutional ingestion pipeline）和 T109（institutional_flows schema）**
- 警示讯息格式应符合 §5.3 规范（包含等级图示、建议行动）
- `INST_QUARTER_END` 需在季底前 5 个交易日触发（3/25, 6/25, 9/25, 12/25）
- 需在 T110（基础警示系统）完成後实作
- ⚠️ 数据库已迁移至 PostgreSQL，所有查询均使用 SQLAlchemy engine
