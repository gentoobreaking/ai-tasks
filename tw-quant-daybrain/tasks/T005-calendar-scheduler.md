---
github_issue: N/A
title: 交易日曆與生命週期排程器
type: infrastructure
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31
---

# T005 - 交易日曆與生命週期排程器

## 目標
實作 §4 生命週期與 §11.2 排程：交易日判定（依 `get_trading_calendar`）、Phase 0–4 觸發、非交易日休眠、事件時點綁定。

## 驗收標準
- [ ] 交易日判定：呼叫 `get_trading_calendar`（T002）快取於本機；非交易日休眠（不執行任何 Phase）
- [ ] 排程表（§11.2 為真值）：08:15 Phase 0、08:30 Phase 1、09:00–12:30 Phase 2（tick 10s）、12:30/13:00/13:15/13:20 Phase 3、14:30 Phase 4
- [ ] 各 Phase 觸發/結束皆寫入事件日誌（`phase_start|phase_end`）
- [ ] 排程參數由 `config/scheduler.yaml` + 環境變數覆寫（`NO_ENTRY_AFTER`、`FORCE_CLOSE_AT` 等 §10.1）
- [ ] Phase 跨越/重疊保護：單一 Phase 不可重入，Phase 2 tick 循環與 Phase 3 觸發點互斥
- [ ] 單元測試：非交易日不排程、各 Phase 時點正確、環境變數覆寫生效

## 備註
- 排程器為長駐進程，需支援 ctx cancel 優雅關閉
- 時區一律 Asia/Taipei（T001 工具函式）
