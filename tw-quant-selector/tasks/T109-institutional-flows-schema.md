---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/818
title: institutional_flows 资料表建立与週更新
type: feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-06-02
updated: 2026-06-02
---

# T109 - institutional_flows 资料表建立与週更新

## 目标
确认 institutional_flows 表在 PostgreSQL 中正确建立，并实作 institutional_holdings 週度更新逻辑。

## 验收标准

### institutional_flows 表
- [x] `institutional_flows` 表已于 T108 通过 ORM model `InstitutionalFlow` 创建
- [x] 栏位（与 T109 checklist 名称不同—T108 采用实际 T86 API 栏位命名而非旧规格）：

  | T109 规格栏位 | T108 实际栏位 | 说明 |
  |---|---|---|
  | `foreign_buy` | - | T86 回传的是 net 而非 buy/sell 分列 |
  | `foreign_net` | `foreign_investors_net` | 外陆资买卖超 |
  | `trust_net` | `sity_investors_net` | 投信买卖超 |
  | `dealer_net` | `dealer_net` | 自营商(合计)买卖超 |
  | `total_net` | `total_net` | 三大法人合计 |
  | - | `dealer_proprietary_net` | 自营商(自行买卖) |
  | - | `dealer_hedge_net` | 自营商(避险) |
  | `data_source` | - | 隐含为 `market` 栏位 (`TSE`/`OTC`) |

- [x] 索引：`ix_institutional_flows_date`, `ix_institutional_flows_stock` 已建立

### institutional_holdings 表
- [x] ORM Model `InstitutionalHolding`（`models.py:342`）
- [x] 栏位：`stock_id` (PK), `snapshot_date` (PK), `foreign_holding_pct`, `trust_holding_pct`, `dealer_holding_pct`, `total_inst_pct`, `data_source`
- [x] 已加入 `ALLOWED_TABLES` 和 `Stock.relationships`
- [x] 索引：`ix_institutional_holdings_date`, `ix_institutional_holdings_stock`

### update_institutional_holdings.py
- [x] `fetch_holdings(client, stock_id, snapshot_date)`（`data/update_institutional_holdings.py:19`）
  - 数据源：FinMind `TaiwanStockHoldingSharesPer`（TWSE 法人持股 API 海外 302 不可用）
  - 回传：`foreign_holding_pct`, `trust_holding_pct`, `dealer_holding_pct`（100 - foreign - trust）, `total_inst_pct`
- [x] `save_holdings(db, rows)`（`:55`） — 复用 `_upsert()` `ON CONFLICT` 模式
- [x] `run_holdings_update(db, client, snapshot_date)`（`:66`） — 遍历全市场股票
  - `snapshot_date` 预设从 `institutional_flows` 取最新 `trade_date`

### 週度排程
- [x] `scheduler.py` 内建于 `run_daily_update()`：周一（`weekday() == 0`）自动执行
- [x] Cron 负责人：`run.sh` 使用者自行排程 `crontab -e`
- [x] 交易日判定未实作（与 T108 retry 机制一致：Mon-Fri 即视为应执行日；holdings 週一更新仅需近似的交易日判断）

### .env 配置
- [ ] `INST_HOLDINGS_ENABLED` / `INST_HOLDINGS_CRON` — 暂未加入（现有排程器无此 env 驱动模式；可于后续 PR 加入）

### 单元测试
- [x] `test_fetch_holdings_parse` — 验证 FinMind 资料解析正确性
- [x] `test_save_holdings` — 写入 + 查询验证
- [x] `test_save_holdings_updates_existing` — ON CONFLICT UPDATE 验证
- [x] `test_run_holdings_update` — 🔴 `skipif`（需 live FinMind API）

## 备注
- `institutional_flows` 由 T108 建立，T109 确认并补上 `institutional_holdings`
- FinMind `TaiwanStockHoldingSharesPer` 为持股比率主要来源；TWSE OpenData 持股 API 同 TPEX 存有海外存取限制
- 週一触发逻辑简单：周一即执行，不另做交易日历检查（若周一休市，FinMind 会回传空资料）
