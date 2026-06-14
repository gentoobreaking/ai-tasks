---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/823
title: MIS API 即时报价全市场轮询实作
type: feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-06-02
updated: 2026-06-04
howto: |
  1. 创建 data/realtime_quotes.py
  2. 实现 MISApiClient 类别（批次请求、限速 1 秒）
  3. 实现 fetch_batch() 和 fetch_all() 方法
  4. 实现盘中轮询排程（09:00-13:30，每 5 分钟）
  5. 创建 realtime_quotes 和 intraday_snapshots 资料表
---

# T114 - MIS API 即时报价全市场轮询实作

## 目标
实现 TWSE MIS API 的即时报价轮询机制，批次获取全市场股票报价并计算盘中 PE/PB。

## 验收标准
- [x] 创建 `data/realtime_quotes.py`
- [x] 实现 `MISApiClient` 类别：
  - `BATCH_SIZE = 50`（MIS API 限制）
  - `INTERVAL_SEC = 1.0`（请求间隔）
  - `MARKET_OPEN = time(9, 0)`
  - `MARKET_CLOSE = time(13, 30)`
- [x] 实现 `fetch_batch(stock_ids)` 方法：
  - URL: `https://mis.twse.com.tw/stock/api/getStockInfo.jsp`
  - 参数：ex_ch=tse_{stock_id}.tw（多档用 | 分隔）
  - 回传：z（成交价）、v（成交量）、b（买进）、a（卖出）
  - 回传格式：`RealtimeQuote` 物件（stock_id, price, volume, bid, ask, change, change_pct, timestamp）
- [x] 实现 `fetch_all(stock_ids)` 方法：
  - 分批请求（每批 50 档）
  - 自动限速（每批间隔 1 秒）
  - 全市场 ~1,100 档需要约 22 次请求，耗时 ~22 秒
- [x] 实现盘中轮询排程：
  - 09:00-13:30 期间执行
  - 每 5 分钟全市场扫描一次
  - 今日选股 20 档：每分钟更新（高优先级）
  - 使用 `asyncio` 实现异步请求
- [x] 创建 `realtime_quotes` 资料表（参考 Streamlit.md §3.4）：
  - 主键：(stock_id, quote_time)
  - 栏位：price, volume, bid, ask, change_amt, change_pct, pe_realtime, pb_realtime, yield_realtime, is_close
- [x] 创建 `intraday_snapshots` 资料表：
  - 每 5 分钟保留一次快照
  - 保留最近 5 个交易日，之後自动清理
- [x] 实现盘后处理：
  - 13:30 收盘後，以收盘价覆写 `is_close = TRUE`
  - 14:00 更新 valuations 表（正式收盘估值）
- [x] 单元测试：
  - 测试批次请求逻辑
  - 测试限速机制（请求间隔 >= 1 秒）
  - 测试盘中/盘後判断逻辑

## 备注
- 参考 Streamlit.md §3 M2：即时报价与盘中指标计算
- ⚠️ MIS API 非官方，需注意行为可能改变
- ⚠️ 即时报价有 15-20 秒延迟，不做高频交易决策
- 需实现错误处理：API 失败时重试 3 次，仍失败则触发告警 `PRICE_MIS_UNAVAILABLE`
- 全市场扫描耗时 ~22 秒，需考虑效能优化（可考虑多执行绪）
- **本任务为 Phase 2c 核心功能，需优先完成**
