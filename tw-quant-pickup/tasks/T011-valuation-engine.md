---
github_issue: N/A
title: Valuation Engine（EPS 三層 → PE/PB/Dividend/DCF → FV → Buy Zones）
type: task
priority: P0
status: done
depends_on: [T007, T008, T010]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T011 - Valuation Engine（EPS 三層 → PE/PB/Dividend/DCF → FV → Buy Zones）

## 目標

實作 `valuation/` 引擎（§12–§17、§27–§28）：EPS 三層模型（ACTUAL / NORMALIZED / MODEL_ESTIMATED，§84 #5）、PE（§13）、PB（§14）、Dividend（§15）、DCF（§16，用 OCF/capex/FCF，§84 #3）、historical percentile 自算，產出 Fair Value（Bear/Base/Bull）與 Buy Zones state（§29）。Sprint 3 acceptance：known test stocks pass expected ranges + estimate_method 完整記錄。

## 驗收標準

- [x] EPS 三層：ACTUAL（已公告）、NORMALIZED（剔除一次性損益）、MODEL_ESTIMATED（模型估計）——`estimate_method` JSONB 完整記錄法（§5.7 / §13），未來 ANALYST_CONSENSUS 可擴充（§84 #5）
- [x] PE Model：Model Estimated EPS × Normalized PE（§13）；DB 內無 forward EPS 語意歧義
- [x] PB Model（§14）、Dividend Model（§15）依 spec
- [x] DCF（§16）：使用 financials OCF / investing CF / capex / FCF，不用推估數字
- [x] Historical PE/PB：引擎自算（close ÷ TTM EPS），reported_at 守門（T008），≥5Y 才有百分位
- [x] Fair Value 三情境 Bear / Base / Bull（§27），Buy Zones（§28）sanity：bear < base < bull、zones 金額遞減（Sprint 3 acceptance）
- [x] Buy Zone state machine（§29）：明確狀態、INVESTIGATE 最高優先（§84 #10）
- [x] 無法估值標的標 `unavailable` 原因（缺財報/缺歷史），不得拼接猜測值
- [x] known test stocks（≥10 檔，含上市/上櫃）落在 spec 預期範圍，手算對照（§77 Sprint 3）

## 備註

- 估值是排名原料：確定性、PIT、lineage 三要求同時滿足才過關（§83 ①②）
## 完成記錄（2026-08-18）

- `valuation/eps.py`：EPS 三層模型（§13/§84 #5）——ACTUAL（reported_at 守門 4 季加總）/ NORMALIZED（>3σ 極端季剔除、低基期轉折防護）/ MODEL_ESTIMATED（conservative_growth = min(EPS CAGR, Rev CAGR)，下限 0）；estimate_method JSONB 完整記錄（INTERNAL_MODEL / HISTORICAL_EPS_CAGR / LOW）
- `valuation/models.py`：PE（Normalized PE 5Y median → 3Y median → sector → configured default，保存 fallback reason）/ PB（Forward BVPS × Normalized PB）/ Dividend（Expected Dividend / Target Yield × 安全係數 0.9）/ DCF（FCF = OCF − Capex 實際數字，資料不足不硬算，WACC 可配置）
- `valuation/fair_value.py`：FV 三情境（bear×0.85/base/bull×1.15）+ Buy Zones（.90/.80/.70，sanity 檢查違反阻擋排名）+ State Machine（INVESTIGATE 最高優先、五狀態互斥）+ §17 Sector Profiles（缺源權重重新正規化）
- `valuation/engine.py`：組合入口 + valuations 寫入列（§5.8，含 estimate_method JSONB）
- `config/valuation.yaml`：default_pe/default_pb/wacc/terminal_growth/forecast_years/tax_rate 等集中
- `tests/unit/test_valuation_engine.py`：45 tests（每模型手算對照、§28/§29 官方例、確定性、寫入 SQL、known stock 範圍）
- Full suite：381 passed, 7 skipped；ruff clean
- commits：bf6870d（實作）、1d047e5（README）
