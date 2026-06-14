---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/835
title: guru_scores 表初始化（Piotroski F-Score）
type: feature
priority: medium
status: done
assignee: coder1
created: 2026-06-02
updated: 2026-06-06
howto: |
  1. ✅ T102 migration 已创建 guru_scores 表（models.py:382-397, 001-init-schema.sql:340-354）
  2. ✅ 重写 scripts/seed_guru_scores.py（Piotroski F-Score, 3 类别 9 项评分）
  3. ✅ 实现 calculate_piotroski_f_score(stock_id, as_of_date, client) → (0-9, criteria_dict)
  4. ✅ 实现 calculate_all_guru_scores(as_of_date, client, db_session) → list[dict]
  5. ✅ 实现 save_guru_scores(rows, db_session) → ON CONFLICT DO UPDATE
  6. ✅ 更新 strategies/quality.py 加入 F-Score (fscore_weight=0.30)，新增 _guru_fscore() 查询
  7. ✅ 主入口 seed_guru_scores() + --date CLI 参数
  8. ✅ docker compose build app 通过
  9. ✅ 前端 Guru Score 页面（`/guru-scores`）+ `GET /api/v1/guru-scores` backend + Sidebar 导航
---

# T127 - guru_scores 表初始化（Piotroski F-Score）

## 目标
实现 Piotroski F-Score 计算逻辑，并初始化 `guru_scores` 表数据，作为 Quality 因子和 Value 因子的补充评分。

## 验收标准
- [x] 确认 `guru_scores` 表已在 T102 migration 中创建：
  - PK: (score_date, stock_id, guru)，另有 score(DECIMAL), pass_filter(BOOLEAN), criteria_detail(JSONB)
  - 索引：ix_guru_scores_guru, ix_guru_scores_date

- [x] 重写 `scripts/seed_guru_scores.py`：
  - `calculate_piotroski_f_score(stock_id, as_of_date, client)` → (0-9, dict)
  - 9 项评分（Profitability 4 + Funding 3 + Operating Efficiency 2）
  - 使用 FinMind API 获取源数据，从 `financials` + `balance_sheet` 计算
  - 回传 `component_scores` JSONB 结构符合 spec

- [x] `calculate_all_guru_scores(as_of_date, client, db_session)` → list[dict]
  - 遍历 `stocks` 表所有股票
  - 每支股票呼叫 `calculate_piotroski_f_score()`
  - 异常跳过（log.warning），不影响其他股票

- [x] `save_guru_scores(rows, db_session)`：
  - `INSERT ... ON CONFLICT (score_date, stock_id, guru) DO UPDATE`
  - criteria_detail 以 `::jsonb` 写入

- [x] 週度执行：
  - `seed_guru_scores()` 默认使用上周五作为 as_of_date
  - 支持 `--date YYYY-MM-DD` CLI 参数
  - 通过 scheduler 以 `python -m scripts.seed_guru_scores` 调用
  - 需要 FINMIND_TOKEN 环境变量

- [x] 更新 `strategies/quality.py`：
  - 新增 `_guru_fscore(sid, as_of_date, db)` 查询最新 F-Score
  - 新增 `fscore_weight=0.30`（默认），原权重成比例缩小（0.35/0.21/0.14）
  - F-Score 经 z-score 归一化后与 base quality score 加权合并，最终再归一化
  - `get_required_data()` 加入 `"guru_scores"`

- [x] Docker build 通过：`docker compose build app` (success)

- [x] 前端新增 Guru Score 页面（`/guru-scores`）：
  - 选择 B：独立页面（非嵌入 Signals），理由：F-Score 有 9 项布林 criteria 需要展开显示
  - 后端 `GET /api/v1/guru-scores`（支持 guru/date/min_score/pass_filter/limit/offset 参数）
  - 表格显示 F-Score (0-9) + 颜色徽章（红/黄/绿），9 项 criteria ✓/✗ 网格，pass_filter 标示
  - 筛选栏：最低 F-Score（≥0/5/7/9）、pass_filter 开关，匯出 CSV
  - Sidebar 加入 "Guru Score" 导航项
  - 建议展开：未来加入日期选择器、Altman Z-Score / Graham Number 等多 guru 支持

- [ ] 待补充：
  - 单元测试（需要 mock FinMind 或 DB 数据）
  - `.env` 配置 GURU_SCORES_ENABLED / GURU_SCORES_CRON（可选）
  - 排程器注册 cron job（可另开 task）

## 备注
- 参考 Streamlit.md §6.1 新增资料表清单（guru_scores）
- 参考 Piotroski (2000) 原始论文：*Value Investing: The Use of Historical Financial Statement Information to Separate Winners from Losers*
- F-Score = 9：最强（所有条件满足）
- F-Score = 0：最弱（所有条件不满足）
- 数据源：TWSE/TPEX 财务报表（从 `valuations` 表或 FinMind API 读取）
- ⚠️ **依赖 T102（Schema 迁移）**，需先完成 PostgreSQL schema 创建
- ⚠️ **依赖 T114（MIS API 即时报价）**，需先完成每日数据更新
