---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/827
title: Streamlit 分析看板基础版实作
type: feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-06-02
updated: 2026-06-02
howto: |
  1. 创建 streamlit/ 目录结构
  2. 实现 app.py 主入口与侧边栏导航
  3. 实现页面 1：今日选股（互动式排行 + 因子分析）
  4. 实现页面 2：法人动向（资金流向分析）
  5. 实现页面 3：即时行情（盘中即时报价 + PE/PB）
  6. 实现 components/db.py SQLAlchemy 连线管理
  7. 创建 Dockerfile.streamlit 与更新 docker-compose.yml
---

# T118 - Streamlit 分析看板基础版实作

## 目标
实现 Streamlit 分析看板基础版（页面 1/2/3），提供快速分析能力（与 React UI 平行存在，各司其职）。

## 验收标准
- [x] 创建 `streamlit/` 目录结构：
  - `app.py`（主入口）
  - `pages/1_今日选股.py`
  - `pages/2_法人动向.py`
  - `pages/3_即时行情.py`
  - `components/db.py`（SQLAlchemy 连线管理）
  - `requirements_streamlit.txt`

- [x] 实现 `app.py`：
  - 侧边栏（st.sidebar）应用说明 + 版本
  - Streamlit 自动 multipage 导航

- [x] 实现页面 1「今日选股」：
  - 日期选择器（st.date_input）
  - 策略筛选（st.multiselect）
  - 选股排行表（st.dataframe，支援排序）
  - 选中股票後展开：雷达图（Plotly）、近 30 日分数趋势

- [x] 实现页面 2「法人动向」：
  - 今日市场总览（KPI：外資/投信/自营商买卖超金额）
  - 个股筛选器（日期范围、最低连续买卖超天数、最低买卖超金额）
  - 个股法人历史图表（Plotly 双轴图：法人买卖超长条图 + 股价折线图）

- [x] **新增页面 3「即时行情」**：
  - 盘中（09:00-13:30）：每 60 秒自动 rerun（time.sleep + st.rerun）
  - 盘後：不刷新，显示静态收盘数据
  - 主要內容：今日选股即时报价表（涨跌颜色标示）+ 日内走势图
  - 大盘概况（ETF 代理）

- [x] 实现 `components/db.py`：
  - `get_engine()` / `get_session()`：使用 SQLAlchemy engine（从 `DATABASE_URL` 读取）
  - `query(sql, params)`：执行查询回传 DataFrame
  - 使用 `@st.cache_resource` 确保整个应用只建立一个连线
  - PostgreSQL + SQLAlchemy（不使用 DuckDB）

- [x] 创建 `docker/Dockerfile.streamlit`：
  - 基于 python:3.12-slim
  - 暴露 port 8501
  - 安装 tw-quant-selector package + Streamlit 依赖
  - 使用 `DATABASE_URL` 环境变量连接 PostgreSQL

- [x] 更新 `docker-compose.yml`：
  - 新增 `streamlit` 服务
  - 依赖 `postgres` 服务
  - 重启策略：unless-stopped

- [ ] 测试（手动）：
  - 本地启动：`streamlit run streamlit/app.py`
  - Docker 启动：`docker-compose up streamlit`
  - 验证 PostgreSQL 连线正常

## 备注
- 参考 Streamlit.md §4 M3：Streamlit 分析看板
- ⚠️ **数据库已迁移至 PostgreSQL**，Streamlit 通过 SQLAlchemy engine 连线（不再直接读 DuckDB 档案）
- React UI vs Streamlit 分工：
  - React：日常使用、查看选股（使用者体验优先）
  - Streamlit：量化分析、临时探索（快速迭代优先）
- 基础版先实现 3 个页面（含新增的页面 3），完整版（T119）再实现剩余页面 4/5/6
- **依赖 T108**（法人 ingestion）和 **T114**（MIS API 即时报价）和 **T115**（盘中即时 PE/PB 计算）
