---
github_issue: ""
title: "backfill: add CANONICAL/FALLBACK dual-write with signal handling"
type: feature
priority: high
status: done
depends_on: []
assignee: "pi"
created: "2026-09-02T03:49:41Z"
updated: "2026-09-02T03:49:41Z"
---

# T037 - backfill: add CANONICAL/FALLBACK dual-write with signal handling

## 目標
將 tw-quant-db/backfill 升級為 core.daily_prices 的統一寫入者，支援雙軌制寫入：
- CANONICAL：TWSE 官方來源（twse-mcp 即時、local-mcp 本地快取），PIT 語意
- FALLBACK：備援來源（FinMind、Yahoo），補漏用
並加入 graceful shutdown、periodic checkpoint、MCP call timeout 機制。

## 驗收標準
- [x] SourceResult 新增 isCanonical 欄位
- [x] canonicalSources map 定義 twse-mcp、local-mcp 為 CANONICAL
- [x] Fallback chain 重新排序：TWSEMCPSource → LocalMCPSource → FinMind → Yahoo
- [x] upsertPrices(isCanonical) 實作雙策略：
  - CANONICAL: source_role='CANONICAL', ON CONFLICT DO UPDATE WHERE source_role='FALLBACK'
  - FALLBACK: source_role='FALLBACK', ON CONFLICT DO UPDATE WHERE source_role='FALLBACK'
- [x] Signal handling (SIGINT/SIGTERM) 於退出前存 checkpoint
- [x] Periodic checkpoint 每 30 秒 + 每 batch 更新進度
- [x] MCP call timeout 90 秒 (context.WithTimeout)
- [x] 成功完成時清除 checkpoint 檔案
- [x] T009/T017 遷移腳本歸檔至 migrations/ (T009-backfill-from-signal.py, T017-backfill-from-mcp.py)
- [x] 程式碼編譯通過 `go build -o backfill .`
- [x] git commit: 4647a96

## 備註
- 此任務配合 tw-quant-pickup T047 移除 daily_prices 回補功能
- Pickup 現在專注指數/PCR/宏觀/籌碼/財報/股利/特徵運算
- 每日排程建議：先跑 backfill 再跑 pickup daily