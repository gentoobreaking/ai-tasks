---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/817
title: 三大法人买卖超 Ingestion Pipeline 实作
type: feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-06-02
updated: 2026-06-02
---

# T108 - 三大法人买卖超 Ingestion Pipeline 实作

## 目标
实现三大法人买卖超资料 ingestion pipeline，从 TWSE/TPEX OpenData 抓取资料并写入 PostgreSQL。

## 验收标准
- [x] 新增 `institutional_flows` 表：
  - ORM Model: `InstitutionalFlow`（`models.py:320-346`）
  - 栏位：`stock_id`, `trade_date`, `market`, `foreign_investors_net`, `sity_investors_net`, `dealer_net`, `dealer_proprietary_net`, `dealer_hedge_net`, `total_net`
  - PK: `(stock_id, trade_date)`
  - 已加入 `ALLOWED_TABLES`（`database.py`）和 `Stock` 的 relationship

- [x] 实作 `fetch_twse_institutional_all(trade_date)`（`twstock_client.py:294`）：
  - URL: `https://www.twse.com.tw/rwd/zh/fund/T86`（注意：此为 TWSE RWD 端点，非 OpenAPI）
  - 参数：`date=YYYYMMDD`, `selectType=ALLBUT0999`
  - 解析 19 栏阵列，映射到 6 个法人净买卖超栏位
  - 日期格式处理：T86 格式 `20260601`（AD）而非 ROC
  - 已验证：成功抓取 1320 笔上市股票资料

- [x] 实作 `fetch_tpex_institutional_all(trade_date)`（`twstock_client.py:361`）：
  - URL: `https://www.tpex.org.tw/openapi/v1/tpex_3d_investorsInfo_daily`
  - 解析 JSON 阵列，映射 `foreignBuySellDiff` / `sityBuySellDiff` / `dealerBuySellDiff`
  - ⚠️ API 在海外回传 302，设计为优雅降级（空阵列 + warning log）

- [x] 实作 ingestor 函式（`ingestion.py`）：
  - `update_institutional_flows_from_twse(db, trade_date)` — TWSE 主要来源
  - `update_institutional_flows_from_tpex(db, trade_date)` — TPEX 补充来源
  - 复用既有 `_upsert(conn, "institutional_flows", rows, ["stock_id", "trade_date"])` 模式（DELETE+INSERT）

- [x] 串入排程器（`scheduler.py`）：
  - `DATASETS` 新增 `"institutional"`，`DATASET_REQUESTS` 新增 `"institutional": 0`
  - `run_daily_update()` 在步骤 `[7/7]` 执行 TWSE + TPEX 法人资料抓取
  - `ingestion_tracker` 独立更新 institutional 状态（不影响其他 dataset 的 ok/failed 判定）

- [x] Integration test（`tests/test_institutional.py`）：
  - `test_institutional_twse_parse` — mock TWSE T86 API，验证解析逻辑
  - `test_institutional_tpex_parse` — mock TPEX API，验证解析逻辑
  - `test_institutional_tpex_graceful_fail` — mock API 连线失败，验证优雅降级
  - `test_institutional_twse_fetch_and_upsert` — 🔴 标注为 `skipif`（需 live API + PostgreSQL）

## 备注
- **无 `BaseIngestor`**：本专案沿用函式式 ingestor 模式（`ingestion.py`），非类别继承，故未建立 `InstitutionalIngestor` 类别
- **TPEX API 限制**：`tpex_3d_investorsInfo_daily` 仅限台湾境内存取；海外会 302 → `www.tpex.org.tw/`。程式设计为优雅降级（warning log + 回传空阵列）
- **重试机制** — `fetch_with_retry(fn, date, max_retries=3, retry_delay_seconds=1800)` 位于 `twstock_client.py:305`，支援函式式呼叫。`ingestion.py` 的 `update_institutional_flows_from_twse/tpex` 新增 `retry=True` 参数开启重试 + 交易日检查
- **交易日判断** — `is_trading_day(date)` 位于 `twstock_client.py:289`，六日直接回传 False；Mon-Fri 先用 T86 API 验证，若无资料则视为交易日（资料尚未发布，由 retry 处理）
- ⚠️ 启用 `retry=True` 时，若六日则直接跳过（不回传错误）；Mon-Fri 即便 T86 暂无资料也会进入 retry 循环
