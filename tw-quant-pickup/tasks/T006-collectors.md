---
github_issue: N/A
title: Collectors（市場/基本面/股利/法人/月營收/Universe 收集）
type: task
priority: P0
status: pending
depends_on: [T002, T003]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T006 - Collectors（市場/基本面/股利/法人/月營收/Universe 收集）

## 目標

依 §49 Daily Pipeline 的前段流程實作五個 collectors（`market.py` / `fundamental.py` / `dividend.py` / `institutional.py` / `universe.py`），將 Providers 輸出寫入 DB，含 lineage 標註。達成 Sprint 1 acceptance：1000+ stocks、資料含 reported_at 入庫、無 critical validation error。

## 驗收標準

- [ ] `market.py`：全市場當日報價（McpProvider 或 TwseBulk 批量）、TAIEX / TPEx 指數、期貨/選擇權（PCR）寫入 daily_prices 與 market_context
- [ ] `fundamental.py`：財報（含 OCF / investing CF / capex / FCF，§84 #3）+ 月營收（§5.3a），`reported_at` 完整保存，`revision` 不覆蓋舊版（§84 #7）
- [ ] `dividend.py`：除息行事曆 + 歷史股利（get_dividend_history / get_exdividend_calendar），擬議（progress）與確定需區分（§37.1）
- [ ] `institutional.py`：法人買賣超（15:00 後齊備，T 日）、外資持股（T-1，僅上市，§37.1）；freshness 不足時標記不入 index（§8.1）
- [ ] `universe.py`：universe_flags 每日更新（注意股/處置股/停止交易狀態，§5.11 / §10），不可用靜態清單
- [ ] Collector 全部寫入時帶 lineage 三欄（source / data_date / freshness）+ grade + source_role
- [ ] 1000+ stocks 資料入庫（Sprint 1 acceptance）
- [ ] 罕見情況（停牌、除權息、資料缺漏）不 crash，記錄 warnings

## 備註

- 抓取順序參考 §49 Daily Pipeline 時間線（15:00 盤後開始）
- 法人資料有 rate limit：用批量工具或分批抓取，禁止自行加速繞過（§7.1 注意）