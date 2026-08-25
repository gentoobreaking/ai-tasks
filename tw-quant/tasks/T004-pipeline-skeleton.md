---
github_issue: N/A
title: pipeline_screener.py 管線骨架＋config_pipeline.json＋universe.csv schema
type: feat
priority: high
status: done
depends_on: []
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-25
updated: 2026-08-25
---

# T004 - 管線骨架與設定檔

## 目標
建立 `pipeline_screener.py` 進入點與 `config_pipeline.json`，定義 data/universe.csv schema。
不實作任何因子邏輯——只搭 stage 骨架與 CLI。

## 驗收標準
- [x] `pipeline_screener.py` 可執行：`--rebuild-universe`、`--top N`、`--dry-run` 參數存在
- [x] stage 函式骨架：`stage0_universe()` / `stage1_scoring()` / `stage2_grading()`，
      各回傳 DataFrame，主流程串接並可 print 形狀
- [x] `config_pipeline.json` 含鍵：`etf_candidates`（9 檔初值見 algs/stage0-universe.md §StepA）、
      `universe_ttl_days: 7`、`min_pool_size: 50`、`rr_thresholds: {s:2.0, a:1.5}`、
      `rate_limit: {moneydj:{delay:2.0,jitter:0.5}, finmind:{delay:0.7,jitter:0.3}}`
- [x] universe.csv schema 常數定義於程式：欄位 ticker,name,sector,etf_sources,count
      （逗號分隔，UTF-8）
- [x] 重用 `common/cache.py` SQLite 快取；新增 key 字首 `pipeline_`
- [x] `./venv/bin/python pipeline_screener.py --dry-run` 不發任何網路請求即正常結束（exit 0）

## 備註
對應 spec.md 功能 F14 的骨架部分。日誌沿用 common/logger.py，logger 名稱 `pipeline`。
