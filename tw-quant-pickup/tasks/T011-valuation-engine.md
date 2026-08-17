---
github_issue: N/A
title: Valuation Engine（EPS 三層 → PE/PB/Dividend/DCF → FV → Buy Zones）
type: task
priority: P0
status: pending
depends_on: [T007, T008, T010]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T011 - Valuation Engine（EPS 三層 → PE/PB/Dividend/DCF → FV → Buy Zones）

## 目標

實作 `valuation/` 引擎（§12–§17、§27–§28）：EPS 三層模型（ACTUAL / NORMALIZED / MODEL_ESTIMATED，§84 #5）、PE（§13）、PB（§14）、Dividend（§15）、DCF（§16，用 OCF/capex/FCF，§84 #3）、historical percentile 自算，產出 Fair Value（Bear/Base/Bull）與 Buy Zones state（§29）。Sprint 3 acceptance：known test stocks pass expected ranges + estimate_method 完整記錄。

## 驗收標準

- [ ] EPS 三層：ACTUAL（已公告）、NORMALIZED（剔除一次性損益）、MODEL_ESTIMATED（模型估計）——`estimate_method` JSONB 完整記錄法（§5.7 / §13），未來 ANALYST_CONSENSUS 可擴充（§84 #5）
- [ ] PE Model：Model Estimated EPS × Normalized PE（§13）；DB 內無 forward EPS 語意歧義
- [ ] PB Model（§14）、Dividend Model（§15）依 spec
- [ ] DCF（§16）：使用 financials OCF / investing CF / capex / FCF，不用推估數字
- [ ] Historical PE/PB：引擎自算（close ÷ TTM EPS），reported_at 守門（T008），≥5Y 才有百分位
- [ ] Fair Value 三情境 Bear / Base / Bull（§27），Buy Zones（§28）sanity：bear < base < bull、zones 金額遞減（Sprint 3 acceptance）
- [ ] Buy Zone state machine（§29）：明確狀態、INVESTIGATE 最高優先（§84 #10）
- [ ] 無法估值標的標 `unavailable` 原因（缺財報/缺歷史），不得拼接猜測值
- [ ] known test stocks（≥10 檔，含上市/上櫃）落在 spec 預期範圍，手算對照（§77 Sprint 3）

## 備註

- 估值是排名原料：確定性、PIT、lineage 三要求同時滿足才過關（§83 ①②）