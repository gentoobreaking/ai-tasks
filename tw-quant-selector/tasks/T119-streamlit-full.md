---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/828
title: Streamlit 完整版实作（pages 4-6）
type: feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-06-02
updated: 2026-06-02
howto: |
  1. 在 streamlit/pages/ 新增 4_回测工作台.py
  2. 新增 5_因子研究.py
  3. 新增 6_警示历史.py
  4. 实现各页面的完整功能（参考 Streamlit.md §4.3）
  5. 更新 requirements_streamlit.txt 新增依赖
---

# T119 - Streamlit 完整版实作（pages 4-6）

## 目标
完成 Streamlit 分析看板的全部 6 个页面，提供完整的量化研究能力。

## 验收标准
- [x] 实现页面 4「回测工作台」：
  - 使用者输入回测参数（侧边栏：st.sidebar + st.date_input + st.selectbox）
  - 直接调用 Python backtest 引擎（`run_backtest()`）
  - 可下载完整 CSV（`st.download_button`）
  - 参数敏感度分析：扫描单一参数（momentum_lookback / value_threshold / quality_min_score）
  - 输出：各参数对应 Sharpe / 年化报酬的折线图

- [x] 实现页面 5「因子研究」：
  - 因子 IC 分析（scipy.stats.pearsonr）
    - IC = 因子值与下期报酬的相关系数
    - IC > 0.05 视为有预测能力（判断标准展示）
    - 输出：各因子每月 IC 时序图（Plotly）
  - 因子分层报酬：
    - 将全市场按因子分数分为 5 组（pd.qcut）
    - 计算各组的 20 日平均报酬
    - 输出：5×N 长条图（N=策略数）
  - 因子相关性矩阵：
    - 输出：相关系数热力图（最新一期）
  - 法人因子验证：
    - 三大法人买卖超后 N 日的平均超额报酬
    - N = 1, 5, 10, 20 天（st.selectbox）

- [x] 实现页面 6「警示历史」：
  - 依等级（CRITICAL/HIGH/MEDIUM/LOW）筛选（st.multiselect）
  - 依规则名称筛选
  - 时间范围筛选（st.date_input）
  - 警示统计（每日/每周告警次数趋势，Plotly）
  - 未解决警示列表（resolved_at IS NULL）
  - 可点击「解决」按钮，输入解决备注

- [x] **新增：初始化 `alert_settings` 默认数据**：
  - 创建 `scripts/seed_alert_rules.py`
  - 写入所有警示规则的默认阈值和冷却时间（类别 A/B/C/D/E）
  - 使用 `INSERT INTO alert_settings`，已有记录跳过

- [x] **新增：初始化 `guru_scores` 表**：
  - 创建 `scripts/seed_guru_scores.py`
  - 写入初始 Guru 评分数据（所有股票，F-Score/Altman Z 设为 NULL）

- [x] **新增：初始化 `strategy_config_history` 表**：
  - 创建 `scripts/seed_default_strategy_config.py`
  - 写入默认六因子配置（momentum=0.20, value=0.15, quality=0.15, growth=0.10, guru=0.15, institutional=0.25）

- [x] 更新 `streamlit/requirements_streamlit.txt`：
  - 新增 `scipy`（IC 分析）
  - 新增 `scikit-learn`（量化分析工具链）
  - 新增 `numpy`

- [ ] 测试（手动启动 Streamlit 验证）：
  - `cd streamlit && streamlit run app.py`
  - 验证所有 6 个页面可正常载入
  - 验证回测工作台参数敏感度分析正确
  - 验证因子研究页面 IC 分析和分层报酬计算正确
  - 验证 `alert_rules`、`guru_scores`、`strategy_config_history` 数据正确写入

## 备注
- 参考 Streamlit.md §4.3 各页面规格
- ⚠️ **依赖 T118（Streamlit 基础版）**，需在 T118 完成後执行
- 页面 4 比 React 版本多的功能：
  - 可直接修改策略程式码後重跑（开发用途）
  - 参数敏感度分析
- 页面 5 是量化研究用途，不在 React 版本中
- 页面 6 需读取 `alert_history` 表（T110 已创建）
- **额外依赖**：
  - T108（法人 ingestion）才能完成页面 2 和页面 5 的法人因子验证
  - T114（MIS API）才能完成页面 3 的即时行情
  - T110（基础警示）和 T111（法人警示）才能完成页面 6 的警示历史
- ⚠️ 数据库已迁移至 PostgreSQL，所有查询均使用 SQLAlchemy engine
