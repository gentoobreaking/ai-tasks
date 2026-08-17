---
github_issue: N/A
title: Reports（§50–52：Markdown / HTML / CSV / JSON daily report）
type: task
priority: P1
status: pending
depends_on: [T014, T016]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T018 - Reports（§50–52：Markdown / HTML / CSV / JSON daily report）

## 目標

實作 `reports/`（daily / markdown / html / csv）：輸出每日報告，格式依 §50 Report Format 與 §76 Final Daily Report Example，標明 snapshot_id、ranking、score breakdown、warnings、AI 摘要。

## 驗收標準

- [ ] 每日報告含：日期、snapshot_id、model / parameter / data version（§51 / §53 meta 對齊）
- [ ] Markdown 報告結構與 §76 範例一致（title / snapshot / ranking Top 30 / ETF / warnings）
- [ ] HTML 與 CSV 匯出（§50：csv 供 spreadsheet 消費）
- [ ] JSON 版報告 = quant_result.json（與 snapshot 一致，§45）
- [ ] score_breakdown 於報告中可讀（§83 ② 可解釋）
- [ ] lineage 缺失警告（缺源清單）呈現在報告 warnings 區塊（§8.1）
- [ ] 手動重跑同一 date 產出相同報告（確定性）

## 備註

- 報告渲染不得重新計算任何分數——一律讀 snapshot 資料（重現性確保）