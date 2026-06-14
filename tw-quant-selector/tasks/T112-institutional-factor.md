---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/821
title: 法人动向因子（第五因子）实作
type: feature
priority: high
assignee: OpenCode DeepSeek V4 Flash
status: done
created: 2026-06-02
updated: 2026-06-04
howto: |
  1. 创建 strategies/institutional_factor.py
  2. 实现 InstitutionalFactor 类别（继承 StrategyBase）
  3. 实现 compute_score() 方法：
     - foreign_flow_20d (权重 50%)
     - trust_flow_20d (权重 30%，季底折扣)
     - consec_days (权重 20%)
  4. 新增 Section 2.2 公式：
     - 法人同买因子（Institutional Concurrence）
     - 投信锁码占比（SITCA Share Ownership Ratio）
  5. 更新 strategies/__init__.py 导入新因子
  6. 更新 strategizer/combiner.py 整合六因子
---

# T112 - 法人动向因子（第五因子）实作

## 目标
实现三大法人动向因子（第五因子），整合外資、投信、自营商的买卖超讯号，并新增 Section 2.2 的策略因子计算。

## 验收标准
- [x] 创建 `strategies/institutional_factor.py`
- [x] 实现 `InstitutionalFactor(StrategyBase)` 类别：
  - 实现 `compute_score(universe, as_of_date)` 方法
  - 计算 foreign_flow_20d：近 20 日外資累积买卖超股数 / 流通在外股数（权重 50%）
  - 计算 trust_flow_20d：近 20 日投信累积买卖超（季底权重折扣至 0.3）（权重 30%）
  - 计算 consec_days：连续买卖超天数（正=连买，负=连卖，最大 ±20）（权重 20%）
  - 合成原始分数：raw = foreign_flow_20d × 0.5 + trust_flow_20d × 0.3 + normalize(consec_days) × 0.2
  - Z-score 正规化

- [x] **新增 Section 2.2 法人策略因子计算**：
  - 实现 `calc_institutional_concurrence(institutional_flows_df)` 函数：
    - 逻辑：外資淨買張數 > 0 AND 投信淨買張數 > 0
    - 输出：布林值（True = 外资与投信同时买超）
    - 应用：捕捉内外資同时锁码的强势波段股
  
  - 实现 `calc_sitca_share_ratio(institutional_flows_df, shares_outstanding_df)` 函数：
    - 公式：投信单日淨買張數 / 该股发行张数
    - 输出：浮点数（0.0 ~ 1.0）
    - 应用：投信受限于单一基金持股 10% 限制，此因子可提早发现投信刚开始建仓的「中小型黑马股」

- [x] 实现 `get_quarter_weight(trade_date)` 函数：
  - 距离季底 <= 3 个交易日时，权重 = 0.3
  - 其余时间权重 = 1.0

- [x] 实现 `calc_consecutive_days(total_net_list)` 函数：
  - 输入：近 20 日 total_net 列表
  - 输出：连续买卖超天数（正=连买，负=连卖）

- [x] 更新 `strategies/__init__.py` 导入 `InstitutionalFactor`

- [x] 更新 `strategizer/combiner.py`：
  - 新增第六因子 `institutional`（默认权重 0.20）→ 改为 0.25
  - 更新 `WEIGHTS` 配置：momentum=0.20, value=0.15, quality=0.15, growth=0.10, guru=0.15, institutional=0.25

- [x] 单元测试：
  - 测试季底权重折扣逻辑
  - 测试连续买卖超天数计算
  - 测试因子分数计算正确性
  - **新增**：测试法人同买因子逻辑
  - **新增**：测试投信锁码占比计算

## 备注
- 参考 Streamlit.md §2.5 策略因子设计
- 参考 realtime-1.txt Section 2.2 法人策略因子计算公式
- 外資是最重要的法人，具有较强价格预测能力
- 投信在季底有作帐效应，需以时间权重降低偏差
- 三大连续买卖超 N 天是强力的正讯号
- ⚠️ **需先完成 T122（institutional ingestion pipeline）才能实作此任务**
- **新增功能**：法人同买因子与投信锁码占比将提升选股品质，捕捉投信建仓信号
