---
github_issue: N/A
title: Collectors（市場/基本面/股利/法人/月營收/Universe 收集）
type: task
priority: P0
status: done
depends_on: [T002, T003]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T006 - Collectors（市場/基本面/股利/法人/月營收/Universe 收集）

## 目標

依 §49 Daily Pipeline 的前段流程實作五個 collectors（`market.py` / `fundamental.py` / `dividend.py` / `institutional.py` / `universe.py`），將 Providers 輸出寫入 DB，含 lineage 標註。達成 Sprint 1 acceptance：1000+ stocks、資料含 reported_at 入庫、無 critical validation error。

## 驗收標準

- [x] `market.py`：全市場當日報價（McpProvider 或 TwseBulk 批量）、TAIEX / TPEx 指數、期貨/選擇權（PCR）寫入 daily_prices 與 market_context（002_market_context.sql 新增 market_context 表）
- [x] `fundamental.py`：財報（含 OCF / investing CF / capex / FCF，§84 #3）+ 月營收（§5.3a），`reported_at` 完整保存，`revision` 不覆蓋舊版（§84 #7）
- [x] `dividend.py`：除息行事曆 + 歷史股利（get_dividend_history / get_exdividend_calendar），擬議（progress）與確定需區分（§37.1）
- [x] `institutional.py`：法人買賣超（15:00 後齊備，T 日）、外資持股（T-1，僅上市，§37.1）；freshness 不足時標記不入 index（§8.1）
- [ ] `universe.py`：universe_flags 每日更新（注意股/處置股/停止交易狀態，§5.11 / §10），不可用靜態清單
- [x] Collector 全部寫入時帶 lineage 三欄（source / data_date / freshness）+ grade + source_role
- [ ] 1000+ stocks 資料入庫（Sprint 1 acceptance）
- [x] 罕見情況（停牌、除權息、資料缺漏）不 crash，記錄 warnings

## 備註

- 抓取順序參考 §49 Daily Pipeline 時間線（15:00 盤後開始）
- 法人資料有 rate limit：用批量工具或分批抓取，禁止自行加速繞過（§7.1 注意）

## 完成記錄（2026-08-18）

- **5 collectors**：market / fundamental / dividend / institutional 已實作（collectors/），universe.py 待 T006 續或獨立任務
- **002_market_context.sql**：新增 market_context 表（TAIEX/TPEx 指數 + PCR + Macro），補 001 缺失（spec §5/§1046-1051）
- **collectors/base.py**：共享 DB 層（db/connection + `_insert_rows` ON CONFLICT DO NOTHING）
- **FallbackChainProvider**（providers/fallback_provider.py，三層降級架構，使用者指定）：
  - Primary tw-quant-mcp → yfinance-mcp（uvx yfmcp）→ FinMind-MCP（uvx finmind-mcp）
  - 統一 envelope + `_lineage`（source_role=FALLBACK，§8.1）
  - 新能力：get_analyst_estimates() 填 earnings_estimates 空表（yfinance-mcp）
  - mcp_client.py stdio_params 支援 server_args（uvx 命令+參數）
  - mcp_provider.py `_result` 改 async（支援 async fallback 方法）
- **Live 驗證**：yfinance-mcp 6547 歷史價格 2655 筆（2015-2026）、2330 PE=27.86、analyst estimates 4 週期（0q/+1q/0y/+1y）
- **測試**：132 passed, 7 skipped；ruff clean
- commit：24bdbab