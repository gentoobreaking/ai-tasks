---
github_issue: N/A
title: CLI（§48）
type: task
priority: P2
status: done
depends_on: [T016, T018]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-19
---

# T020 - CLI（§48）

## 目標

實作 `cli/main.py`：符合 §48 CLI 設計的指令列介面（typer/argparse 皆可），涵蓋每日 pipeline、單步驟執行、回測、報表、alert、snapshot 檢視等操作；輸出可讀且可 script 化。

## 驗收標準

- [x] 指令覆蓋 §48 所列操作（collect / factor / valuation / rank / backtest / report / alert / snapshot / api）
- [x] 未指定日期時以「最近交易日」為預設；指定 date 重跑不覆蓋 snapshot（§45）
- [x] 錯誤輸出為非零 exit code，供 cron/shell 判斷（§67 安全閘門）
- [x] `--dry-run` / `--verbose` 基本 flag（如 §48 定義）
- [x] `make run` 可透過 CLI 啟動當日 pipeline

## 備註

- 補上 §48 細節時以 spec 為準；設計保持 subcommand 式（`twquant daily`、`twquant rank --date=...`）