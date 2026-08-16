# T030 blocked review

- 任務: T030-baseline-abef
- 產生時間: 2026-08-17 00:51:49
- 目前狀態: blocked
- fail_count: 3
- 標記/摘要: 連續失敗 3 次: 未預期錯誤: TypeError: AutoDevelopScheduler._vprint() takes 2 positional arguments but 3 were given

## 原始需求

## 目標

完成 Spec §34 定義的 Baseline Groups A–E 全部跑分，建立完整的對照實驗數據，支撐 CP Gain、Research ROI、Intelligence Efficiency 等核心 KPI 的統計分析。

目前僅 Baseline F（Full CP）已驗證；Baseline A（Raw 9B）經 stub 驗證；B–E 尚未完整跑分。

| Group | Research | Policy | Verification | 說明 |
|-------|:--------:|:------:|:------------:|------|
| **A** | ❌ | ❌ | ❌ | Raw 9B baseline |
| **B** | ✅ | ❌ | ❌ | Research Only |
| **C** | ❌ | ✅ | ❌ | Policy Only |
| **D** | ❌ | ❌ | ✅ | Verification Only |
| **E** | ✅ | ❌ | ✅ | Research + Verification |
| **F** | ✅ | ✅ | ✅ | Full CP（已驗證） |

## 驗收標準（9 項）

- [ ] Baseline A（Raw 9B）：research=off, policy=off, verification=off → stub/llama 模式可跑通
- [ ] Baseline B（Research Only）：research=on, policy=off, verification=off → 可驗證 research 對成功率的獨立貢獻
- [ ] Baseline C（Policy Only）：research=off, policy=on, verification=off → 驗證 policy 對成功率的獨立貢獻（需實作 3-retry ASK_USER 流程）
- [ ] Baseline D（Verification Only）：research=off, policy=off, verification=on → 驗證 verification 獨立貢獻
- [ ] Baseline E（Research + Verification）：research=on, policy=off, verification=on → 驗證 research+verification 組合效果
- [ ] Baseline F（Full CP）：已完成，作為基準線
- [ ] 所有 Baseline 在 Python 10 tasks（T023–T032）上完整跑分
- [ ] 產出 Baseline A–F 對照表：success rate、first attempt success、avg attempts、evidence count、CP Gain
- [ ] 結果保存至 `results-keep/t030_baseline_abef/`，含完整 event log、e2e.db、patch_evidence_join.csv

## 失敗歷史

- `2026-08-17T00:40:21` 第 1 次失敗: 未預期錯誤: TypeError: AutoDevelopScheduler._vprint() takes 2 positional arguments but 3 were given
- `2026-08-17T00:48:07` 第 2 次失敗: 未預期錯誤: TypeError: AutoDevelopScheduler._vprint() takes 2 positional arguments but 3 were given
- `2026-08-17T00:51:49` 第 3 次失敗: 未預期錯誤: TypeError: AutoDevelopScheduler._vprint() takes 2 positional arguments but 3 were given

## 最近一次失敗的輸出摘要

（無 repair/pr 輸出紀錄）

## 建議行動

拆分為子任務：範圍過大，建議依驗收標準拆成可獨立驗收的子任務
  - baseline-abef-SUB1: Baseline A（Raw 9B）：research=off, policy=off, verification=off → stub/llama 模式可跑通
  - baseline-abef-SUB2: Baseline B（Research Only）：research=on, policy=off, verification=off → 可驗證 research 對成功率的獨立貢獻
  - baseline-abef-SUB3: Baseline C（Policy Only）：research=off, policy=on, verification=off → 驗證 policy 對成功率的獨立貢獻（需實作 3-retry ASK_USER 流程）
  - baseline-abef-SUB4: Baseline D（Verification Only）：research=off, policy=off, verification=on → 驗證 verification 獨立貢獻
  - baseline-abef-SUB5: Baseline E（Research + Verification）：research=on, policy=off, verification=on → 驗證 research+verification 組合效果
  - baseline-abef-SUB6: Baseline F（Full CP）：已完成，作為基準線
  - baseline-abef-SUB7: 所有 Baseline 在 Python 10 tasks（T023–T032）上完整跑分
  - baseline-abef-SUB8: 產出 Baseline A–F 對照表：success rate、first attempt success、avg attempts、evidence count、CP Gain
  - baseline-abef-SUB9: 結果保存至 `results-keep/t030_baseline_abef/`，含完整 event log、e2e.db、patch_evidence_join.csv
可能原因分析：連續失敗（未預期錯誤: TypeError: AutoDevelopScheduler._vprint() takes 2 positional arguments but 3 were given；未預期錯誤: TypeError: AutoDevelopScheduler._vprint() takes 2 positional arguments but 3 were given；未預期錯誤: TypeError: AutoDevelopScheduler._vprint() takes 2 positional arguments but 3 were given）

