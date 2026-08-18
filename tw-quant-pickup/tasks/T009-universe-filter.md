---
github_issue: N/A
title: Universe Filter（§10）
type: task
priority: P0
status: done
depends_on: [T006, T008]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T009 - Universe Filter（§10）

## 目標

實作可計算之 Universe（股票池）：上市 + 上櫃、非 ETF/ETN/權證/特別股、非處置/全額交割/長期停牌、財務資料充足，並依 config 流動性門檻過濾。每天以 universe_flags 動態更新。

## 驗收標準

- [x] 納入條件：`market IN {TWSE, TPEx}`、`active = true`、`security_type = STOCK`（§10）
- [x] 預設排除：ETF、ETN、權證、特別股、處置股、全額交割股、長期停止交易、財務資料不足（§10）
- [x] 注意股/處置股/停止交易狀態取自 `universe_flags`（每日更新），不可用靜態排除清單（§10 / §5.11）
- [x] `min_market_cap` 與 `min_avg_turnover_20d` 自 `config/universe.yaml` 讀取，不硬編碼（§10）
- [x] 每日 universe_snapshot 記錄當日池子（含數量與組成），供報表與 ranking 追溯（§5.11）
- [x] unit test：過濾條件各項正確（含處置股動態更新案例）

## 備註

- 處置股每日變化大，測試需 mock universe_flags 變更情境

## 完成記錄（2026-08-18）

- `universe/filter.py`（~280 行）：純計算層 UniverseFilter
  - `evaluate_symbol()`：依優先序回傳第一個排除原因
  - `build_universe()`：批次判定（flags / financials / closes / shares /
    turnovers_20d 注入）
  - `UniverseConfig.from_mapping()`：讀 config/universe.yaml
  - `snapshot_rows()`：universe_snapshot 寫入列（§5.11 追溯）
- 台灣代號規則：ETF = 00 開頭（0050 上市 4 碼）、ETN = 02 開頭、
  權證 = 6 碼英數（07888X）、特別股 = 5 碼英數（2880A）
  ——以 startswith 判斷，非僅 6 碼（0050 是 4 碼）。
- `config/universe.yaml`：補 `min_avg_turnover_20d: 50000000`（spec
  §10 明確要求 configurable，原檔缺此欄位）。
- 動態 flags：處置解除 → 重新納入（e2e 案例）；注意股（attention）
  不排除（§10 只排除處置）。
- 測試：unit 34 + integration 2（fixture → DB → build → snapshot 端到
  端；處置股動態日變），全套件 278 passed, 7 skipped，ruff clean。
- commit：`3c4c20c`（實作）、`29750f0`（README）。