# tw-quant

## 已實作功能

| 功能 |
|------|
| 台股篩選腳本 |
| 台股篩選腳本-ETF 專屬優化修改方案 |
| 台股篩選腳本-找買點 |
| pipeline_screener.py 管線骨架＋config_pipeline.json＋universe.csv schema |
| common/finmind.py — FinMind REST client 與 rate_limit 新通道 |
| Stage0-A/B — Top5 ETF 排名與成分股去重（F1/F2） |
| Stage0-C — MoneyDJ 族群標記輸出 data/universe.csv（F3） |
| 因子② EPS 預估上修評分（F5）——真實券商共識 |
| 因子①③ 基本面與籌碼評分（F4/F6）＋FinMind 備援串接 |
| 因子④⑤ 波段動能與低位階評分（F7/F8） |
| 評分加總器——100分量化表輸出 Top50→Top10（F9） |
| 硬淘汰規則引擎 H1–H5（F10） |
| 進場區/停損/目標價/風報比＋S/A/B 分級 → Top5（F11/F12） |
| e2e 全流程整合與 markdown/CSV 報表輸出（F14） |

## Skip 項目

| Task | 說明 |
|------|------|
| | |

## 開發中

| Task | 名稱 | 說明 |
|------|------|------|
| | | |

## 待實作

| Task | 名稱 | 說明 |
|------|------|------|
| | | |

## Task 列表

| # | 名稱 | 狀態 |
|---|------|------|
| [T1-tw-quant](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant/tasks/T001-tw-quant.md) | 台股篩選腳本 | ✅ done |
| [T2-tw-etf](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant/tasks/T002-tw-etf.md) | 台股篩選腳本-ETF 專屬優化修改方案 | ✅ done |
| [T3-tw-quant-buypoint](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant/tasks/T003-tw-quant-buypoint.md) | 台股篩選腳本-找買點 | ✅ done |
| [T4-pipeline-skeleton](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant/tasks/T004-pipeline-skeleton.md) | pipeline_screener.py 管線骨架＋config_pipeline.json＋universe.csv schema | ✅ done |
| [T5-finmind-client](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant/tasks/T005-finmind-client.md) | common/finmind.py — FinMind REST client 與 rate_limit 新通道 | ✅ done |
| [T6-etf-top5](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant/tasks/T006-etf-top5.md) | Stage0-A/B — Top5 ETF 排名與成分股去重（F1/F2） | ✅ done |
| [T7-moneydj-sector](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant/tasks/T007-moneydj-sector.md) | Stage0-C — MoneyDJ 族群標記輸出 data/universe.csv（F3） | ✅ done |
| [T8-factor2-eps-revision](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant/tasks/T008-factor2-eps-revision.md) | 因子② EPS 預估上修評分（F5）——真實券商共識 | ✅ done |
| [T9-factor13-fundamentals-chips](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant/tasks/T009-factor13-fundamentals-chips.md) | 因子①③ 基本面與籌碼評分（F4/F6）＋FinMind 備援串接 | ✅ done |
| [T10-factor45-momentum-position](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant/tasks/T010-factor45-momentum-position.md) | 因子④⑤ 波段動能與低位階評分（F7/F8） | ✅ done |
| [T11-scorer-top10](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant/tasks/T011-scorer-top10.md) | 評分加總器——100分量化表輸出 Top50→Top10（F9） | ✅ done |
| [T12-hard-reject](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant/tasks/T012-hard-reject.md) | 硬淘汰規則引擎 H1–H5（F10） | ✅ done |
| [T13-targets-grading](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant/tasks/T013-targets-grading.md) | 進場區/停損/目標價/風報比＋S/A/B 分級 → Top5（F11/F12） | ✅ done |
| [T14-e2e-report](https://github.com/gentoobreaking/ai-tasks/blob/main/tw-quant/tasks/T014-e2e-report.md) | e2e 全流程整合與 markdown/CSV 報表輸出（F14） | ✅ done |

**✅ done: 14 | 🔧 in-progress: 0 | ⏭️ skip: 0 | 📋 pending: 0**

> 自動生成於 2026-09-03 16:30
