---
github_issue: N/A
title: Universe Filter（§10）
type: task
priority: P0
status: pending
depends_on: [T006, T008]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T009 - Universe Filter（§10）

## 目標

實作可計算之 Universe（股票池）：上市 + 上櫃、非 ETF/ETN/權證/特別股、非處置/全額交割/長期停牌、財務資料充足，並依 config 流動性門檻過濾。每天以 universe_flags 動態更新。

## 驗收標準

- [ ] 納入條件：`market IN {TWSE, TPEx}`、`active = true`、`security_type = STOCK`（§10）
- [ ] 預設排除：ETF、ETN、權證、特別股、處置股、全額交割股、長期停止交易、財務資料不足（§10）
- [ ] 注意股/處置股/停止交易狀態取自 `universe_flags`（每日更新），不可用靜態排除清單（§10 / §5.11）
- [ ] `min_market_cap` 與 `min_avg_turnover_20d` 自 `config/universe.yaml` 讀取，不硬編碼（§10）
- [ ] 每日 universe_snapshot 記錄當日池子（含數量與組成），供報表與 ranking 追溯（§5.11）
- [ ] unit test：過濾條件各項正確（含處置股動態更新案例）

## 備註

- 處置股每日變化大，測試需 mock universe_flags 變更情境