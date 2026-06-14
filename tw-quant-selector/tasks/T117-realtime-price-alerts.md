---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/826
title: 即时价格警示规则实作
type: feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-06-02
updated: 2026-06-02
howto: |
  1. 扩展 monitoring/alerting.py 中的警示规则
  2. 新增即时价格相关警示（PRICE_LIMIT_UP, PRICE_STOP_LOSS 等）
  3. 实现警示触发逻辑（依赖 realtime_quotes 表）
  4. 在 T121 盘中轮询逻辑中，每次轮询完成後触发警示检查
---

# T117 - 即时价格警示规则实作

## 目标
实现即时价格相关的警示规则（M4 类别 D），在盘中实时监控持仓股票的价格变化。

## 验收标准
- [x] 扩展 `AlertChecker`，新增以下即时价格警示规则（参考 Streamlit.md §5.2）：
  - `PRICE_LIMIT_UP`：持仓股票涨停（+10%）（LOW, 冷却 1d）
  - `PRICE_LIMIT_DOWN`：持仓股票跌停（-10%）（HIGH, 冷却 1d）
  - `PRICE_UNUSUAL_VOLUME`：持仓股票成交量 > 20 日均量 × 3（LOW, 冷却 1d）
  - `PRICE_PE_EXTREME`：即时 PE 超过历史 95 百分位（MEDIUM, 冷却 3d）
  - `PRICE_STOP_LOSS`：持仓股票从进场价下跌 >= 8%（参考停损线）（HIGH, 冷却 1d）
  - `PRICE_MIS_UNAVAILABLE`：MIS API 盘中 5 分钟无更新（HIGH, 冷却 30min）
- [x] 实现警示触发逻辑：
  - 读取 PostgreSQL `realtime_quotes` 表获取即时价格和成交量
  - 读取 `portfolio` 表获取持仓成本和进场价
  - 计算涨跌幅、成交量倍数、PE 百分位
  - 计算停损：从进场价下跌 >= `ALERT_STOP_LOSS_PCT`（默认 0.08）
- [x] 在盘中轮询逻辑中整合警示检查：
  - `check_price_alerts()` 由 `check_all()` 统一触发
  - 只检查持仓股票（从 `portfolio` 表读取，含今日选股）
  - 盘中（09:00-13:30）才执行
- [x] 实现 `PRICE_PE_EXTREME` 计算逻辑：
  - 读取近 252 个交易日（约 1 年）的 PE 值
  - 计算 95 百分位阈值
  - 即时 PE > 阈值时触发
- [x] 实现 `PRICE_MIS_UNAVAILABLE` 检测逻辑：
  - 已在 `check_data_freshness()` 中实现（检查 5 分钟内有无报价）
  - 连续失败 >= 10 分钟时触发（简化版：盘中每 5 分钟检查一次）
- [x] 更新 `alert_settings` 表默认阈值：
  - 通过 `scripts/seed_alert_rules.py` 写入（T119 补充）
  - 默认阈值：`ALERT_STOP_LOSS_PCT=0.08`, `ALERT_VOLUME_MULTIPLIER=3.0`, `ALERT_PE_PERCENTILE=0.95`
- [x] 单元测试（16 tests in `test_price_alerts.py`）：
  - 测试各警示规则的触发/不触发条件
  - 测试停损计算逻辑
  - 测试 PE 极端值计算
  - 测试辅助方法（_get_latest_quotes, _get_20d_avg_volume, _get_historical_pe_list）

## 备注
- 参考 Streamlit.md §5.2 完整警示条件清单（类别 D：即时价格）
- ⚠️ **依赖 T121（MIS API 即时报价轮询）和 T122（盘中即时 PE/PB 计算）**
- 警示触发频率：盘中每 5 分钟检查一次（与轮询同步）
- `PRICE_STOP_LOSS` 的进场价应从 `portfolio` 表读取，若无可使用近 20 日均价替代
- 通知格式：应包含股票代號、当前价格、涨跌幅、触发条件说明
